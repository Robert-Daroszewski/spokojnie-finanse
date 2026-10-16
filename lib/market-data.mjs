import {currencyUnit,validSymbol} from '../public/investing.mjs';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateValid=s=>{try{return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}catch{return false;}};
export function validateMarketRequest(symbol,from){if(!validSymbol(symbol)||!dateValid(from)||from<'1900-01-01'||from>today())throw Error('Nieprawidłowy symbol lub data zakupu.');}
async function readJSON(url,ttl=900,empty404=false){
 const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Spokojnie/1.0 personal portfolio'},signal:AbortSignal.timeout(15000),next:{revalidate:ttl}});
 if(empty404&&response.status===404)return null;
 if(!response.ok)throw Error(response.status===429?'Źródło cen ograniczyło liczbę zapytań. Spróbuj później.':'Źródło notowań jest chwilowo niedostępne.');
 const text=await response.text();if(text.length>2_000_000)throw Error('Historia instrumentu jest zbyt duża.');
 try{return JSON.parse(text);}catch{throw Error('Źródło zwróciło nieprawidłowe dane.');}
}
export async function searchInstruments(query){
 query=query.trim();if(query.length<2||query.length>80||/[\x00-\x1f]/.test(query))throw Error('Wpisz od 2 do 80 znaków.');
 if(/^[A-Z0-9.\-]+\.US$/i.test(query))query=query.slice(0,-3);
 const url=new URL('https://query1.finance.yahoo.com/v1/finance/search');url.search=new URLSearchParams({q:query,quotesCount:'10',newsCount:'0',enableFuzzyQuery:'false'}).toString();
 const result=await readJSON(url,600);
 return(result.quotes||[]).filter(r=>['EQUITY','ETF'].includes(r.quoteType)&&validSymbol(r.symbol)).slice(0,10).map(r=>({symbol:r.symbol,name:String(r.longname||r.shortname||r.symbol).slice(0,180),exchange:String(r.exchDisp||r.exchange||'').slice(0,80),type:r.quoteType}));
}
export function parseChart(payload,symbol,from){
 const r=payload.chart?.result?.[0],m=r?.meta;
 if(!m||m.symbol?.toUpperCase()!==symbol||!['EQUITY','ETF'].includes(m.instrumentType)||!Number.isFinite(m.regularMarketPrice)||m.regularMarketPrice<=0||!Number.isFinite(m.regularMarketTime))throw Error('Nie znaleziono prawidłowego notowania akcji lub ETF-u.');
 const unit=currencyUnit(m.currency),bars=r.indicators?.quote?.[0]||{},closes=bars.close||[],zone=m.exchangeTimezoneName||'UTC';
 const marketDay=t=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t*1000));}catch{return new Date(t*1000).toISOString().slice(0,10);}};
 const history=(r.timestamp||[]).map((t,i)=>({date:marketDay(t),close:closes[i],...Object.fromEntries(['open','high','low','volume'].filter(k=>Number.isFinite(bars[k]?.[i])&&bars[k][i]>=0).map(k=>[k,bars[k][i]]))})).filter(p=>dateValid(p.date)&&Number.isFinite(p.close)&&p.close>0&&p.date<=today()).sort((a,b)=>a.date.localeCompare(b.date));
 const unique=[...new Map(history.map(p=>[p.date,p])).values()];if(unique.length>16000)throw Error('Historia jest zbyt długa.');
 const splits=Object.values(r.events?.splits||{}).map(s=>({date:marketDay(s.date),ratio:Number(s.numerator)/Number(s.denominator)})).filter(s=>dateValid(s.date)&&Number.isFinite(s.ratio)&&s.ratio>0);
 return{symbol,name:String(m.longName||m.shortName||symbol).slice(0,180),exchange:String(m.fullExchangeName||m.exchangeName||'').slice(0,80),type:m.instrumentType,from,history:unique,splits,quote:{symbol,marketDate:marketDay(m.regularMarketTime),price:m.regularMarketPrice,quoteCurrency:m.currency,...unit,quotedAt:new Date(m.regularMarketTime*1000).toISOString(),fetchedAt:new Date().toISOString()},delayMinutes:Number.isFinite(m.exchangeDataDelayedBy)?m.exchangeDataDelayedBy:null};
}
export function fxQuarters(from,to){
 const start=new Date((from<'2002-01-02'?'2002-01-02':from)+'T12:00:00Z'),out=[];
 let year=start.getUTCFullYear(),month=Math.floor(start.getUTCMonth()/3)*3;
 while(true){const a=new Date(Date.UTC(year,month,1,12)).toISOString().slice(0,10);if(a>to)break;const b=new Date(Date.UTC(year,month+3,0,12)).toISOString().slice(0,10);out.push([a<'2002-01-02'?'2002-01-02':a,b>to?to:b]);month+=3;if(month>=12){year++;month=0;}}
 return out;
}
async function parallelMap(values,fn,concurrency=4){const result=new Array(values.length);let cursor=0;await Promise.all(Array.from({length:Math.min(concurrency,values.length)},async()=>{while(cursor<values.length){const i=cursor++;result[i]=await fn(values[i]);}}));return result;}
const fxPending=new Map();
async function loadFX(currency,from){
 if(currency==='PLN')return{latest:{rate:1,date:today()},history:[]};
 const key=currency+'|'+from+'|'+today();if(fxPending.has(key))return fxPending.get(key);
 const task=(async()=>{
  const latest=await readJSON(`https://api.nbp.pl/api/exchangerates/rates/a/${currency.toLowerCase()}/last/1/?format=json`,3600);
  const last=latest?.rates?.at(-1);if(!Number.isFinite(last?.mid)||last.mid<=0||!dateValid(last.effectiveDate))throw Error('Brak kursu tej waluty w tabeli A NBP.');
  const quarters=fxQuarters(from,today());let history=[],historyWarning='';
  try{const parts=await parallelMap(quarters,async([a,b])=>{const v=await readJSON(`https://api.nbp.pl/api/exchangerates/rates/a/${currency.toLowerCase()}/${a}/${b}/?format=json`,b<today()?86400*30:3600,true);return(v?.rates||[]).filter(r=>Number.isFinite(r.mid)&&r.mid>0&&dateValid(r.effectiveDate)).map(r=>({date:r.effectiveDate,rate:r.mid}));});history=parts.flat().sort((a,b)=>a.date.localeCompare(b.date));}
  catch{historyWarning='Nie udało się pobrać pełnej historii kursów walut. Wykres PLN może mieć luki.';}
  return{latest:{rate:last.mid,date:last.effectiveDate},history,historyWarning};
 })();fxPending.set(key,task);try{return await task;}finally{fxPending.delete(key);}
}
export async function loadInstrument(symbol,from){
 validateMarketRequest(symbol,from);
 const padded=new Date(Date.parse(from+'T00:00:00Z')-10*86400000).toISOString().slice(0,10);
 const period1=Math.floor(Date.parse(padded+'T00:00:00Z')/1000),period2=Math.floor(Date.parse(today()+'T00:00:00Z')/1000)+86400;
 const url=new URL('https://query1.finance.yahoo.com/v8/finance/chart/'+encodeURIComponent(symbol));url.search=new URLSearchParams({period1:String(period1),period2:String(period2),interval:'1d',events:'splits',includeAdjustedClose:'false'}).toString();
 const data=parseChart(await readJSON(url),symbol,from),fx=await loadFX(data.quote.currency,padded);
 data.quote.fxRate=fx.latest.rate;data.quote.fxDate=fx.latest.date;data.fxHistory=fx.history;data.historyWarning=fx.historyWarning||'';
 return data;
}
