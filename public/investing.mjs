// Amounts in portfolio accounting are integer grosze; market unit prices are decimals.
const validDate=s=>{try{return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}catch{return false;}};
export const validSymbol=s=>typeof s==='string'&&/^[A-Z0-9][A-Z0-9.\^=\-]{0,39}$/.test(s);
export function decimalInput(value){const s=String(value??'').trim().replace(/\s/g,'').replace(',','.');if(!/^\d+(\.\d{1,8})?$/.test(s))return NaN;const n=Number(s);return Number.isFinite(n)&&n>0&&n<=1e9?n:NaN;}
export function currencyUnit(raw){if(raw==='GBp'||raw==='GBX')return{currency:'GBP',unitScale:.01};if(raw==='ZAc')return{currency:'ZAR',unitScale:.01};if(typeof raw!=='string'||!/^[A-Z]{3}$/.test(raw))throw Error('Nieobsługiwana waluta notowania.');return{currency:raw,unitScale:1};}
export function quoteValue(quantity,quote){
 if(!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(quote?.price)||quote.price<=0||!Number.isFinite(quote.fxRate)||quote.fxRate<=0||![1,.01].includes(quote.unitScale))throw Error('Brak poprawnej ceny lub kursu waluty.');
 const value=Math.round(quantity*quote.price*quote.unitScale*quote.fxRate*100);
 if(!Number.isSafeInteger(value)||value<0||value>1e12)throw Error('Wycena przekracza obsługiwany zakres.');return value;
}
export function validateAutoHolding(h,today){
 if(h.mode!==undefined&&!['auto','manual'].includes(h.mode))throw Error('Nieprawidłowy sposób wyceny.');
 if(h.mode!=='auto')return;
 if(!validSymbol(h.symbol)||!Number.isFinite(h.quantity)||h.quantity<=0||h.quantity>1e9||!validDate(h.purchaseDate)||h.purchaseDate>today)throw Error('Wybierz instrument, liczbę jednostek i datę zakupu.');
 if(h.quantityAsOf!==undefined&&(!validDate(h.quantityAsOf)||h.quantityAsOf>today||h.quantityAsOf<h.purchaseDate))throw Error('Nieprawidłowa data potwierdzenia jednostek.');
 if(h.quote!==undefined){const q=h.quote;
  if(!q||q.symbol!==h.symbol||typeof q.currency!=='string'||!/^[A-Z]{3}$/.test(q.currency)||typeof q.quoteCurrency!=='string'||q.quoteCurrency.length>5||!validDate(q.fxDate)||q.fxDate>today||!Number.isFinite(Date.parse(q.quotedAt))||!Number.isFinite(Date.parse(q.fetchedAt)))throw Error('Nieprawidłowe dane notowania.');
  const unit=currencyUnit(q.quoteCurrency);if(q.currency!==unit.currency||q.unitScale!==unit.unitScale)throw Error('Nieprawidłowa jednostka waluty.');
  quoteValue(h.quantity,q);
 }
}
export function investmentSummary(holdings){const value=holdings.reduce((a,h)=>a+h.value,0),cost=holdings.reduce((a,h)=>a+h.cost,0);return{value,cost,profit:value-cost,percent:cost>0?(value-cost)/cost*100:null,automatic:holdings.filter(h=>h.mode==='auto').length,count:holdings.length};}
export function rateOnOrBefore(rates,date){let low=0,high=rates.length-1,answer=null;while(low<=high){const mid=(low+high)>>1;if(rates[mid].date<=date){answer=rates[mid];low=mid+1;}else high=mid-1;}return answer;}
export function pendingSplit(h,data,today){return Boolean(data?.splits?.some(s=>s.date>(h.quantityAsOf||h.purchaseDate)&&s.date<=today));}
export function positionHistory(h,data){
 if(h.mode!=='auto'||!data)return[];
 const history=(data.history||[]).filter(p=>p.date>=h.purchaseDate).map(p=>({date:p.date,value:p.close}));
 const day=data.quote?.quotedAt?.slice(0,10);if(day&&day>=h.purchaseDate){const point={date:day,value:data.quote.price};const index=history.findIndex(p=>p.date===day);if(index>=0)history[index]=point;else history.push(point);}
 return history.sort((a,b)=>a.date.localeCompare(b.date));
}
export function portfolioHistory(holdings,market,today){
 const automatic=holdings.filter(h=>h.mode==='auto'),dates=new Set();
 for(const h of automatic){dates.add(h.purchaseDate);for(const p of market[h.symbol]?.history||[])if(p.date>=h.purchaseDate&&p.date<=today)dates.add(p.date);}
 if(automatic.length)dates.add(today);
 return [...dates].filter(d=>d<=today).sort().map(date=>{
  let value=0,cost=0,complete=true;
  for(const h of automatic){if(h.purchaseDate>date)continue;cost+=h.cost;const data=market[h.symbol],p=rateOnOrBefore(data?.history||[],date),fx=data?.quote?.currency==='PLN'?{rate:1}:rateOnOrBefore(data?.fxHistory||[],date);
   if(pendingSplit(h,data,today)){complete=false;continue;}
   if(!p||!fx||(Date.parse(date)-Date.parse(p.date))/86400000>14||(fx.date&&(Date.parse(date)-Date.parse(fx.date))/86400000>14)){complete=false;continue;}
   value+=Math.round(h.quantity*p.close*(data.quote?.unitScale||1)*fx.rate*100);
  }
  // Use the timestamped current quote only for the current end point.
  if(date===today){value=0;complete=true;for(const h of automatic){const data=market[h.symbol];if(!data?.quote||pendingSplit(h,data,today)||(Date.parse(today)-Date.parse(data.quote.quotedAt.slice(0,10)))/86400000>14){complete=false;continue;}value+=quoteValue(h.quantity,data.quote);}}
  return{date,value:complete?value:null,cost,percent:complete&&cost>0?(value-cost)/cost*100:null};
 });
}
export function periodPoints(points,range,today){if(range==='all'||!points.length)return points;const days={month:31,quarter:93,year:366}[range];if(!days)return points;const cutoff=new Date(Date.parse(today+'T12:00:00Z')-days*86400000).toISOString().slice(0,10);return points.filter(p=>p.date>=cutoff);}
