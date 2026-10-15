const dayMs=86400000;
const validDate=s=>{try{return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;}catch{return false;}};
const monthDate=(year,month,day)=>`${year}-${String(month+1).padStart(2,'0')}-${String(Math.min(day,new Date(Date.UTC(year,month+1,0)).getUTCDate())).padStart(2,'0')}`;
export function validateRule(r,s,categories){
 if(!r||typeof r.id!=='string'||!r.id||typeof r.name!=='string'||!r.name.trim()||r.name.length>160||!Number.isSafeInteger(r.amount)||r.amount<=0||r.amount>1e12||!validDate(r.start)||!['monthly','yearly','weekly'].includes(r.cadence)||typeof r.active!=='boolean'||!categories.some(c=>c.id===r.category)||!s.accounts.some(a=>a.id===r.account&&a.kind==='bank'))throw Error('Sprawdź nazwę, kwotę, datę, kategorię i konto płatności cyklicznej.');
 if(r.settledDates!==undefined&&(!Array.isArray(r.settledDates)||r.settledDates.length>1000||new Set(r.settledDates).size!==r.settledDates.length||r.settledDates.some(d=>!validDate(d))))throw Error('Nieprawidłowe terminy opłacone wcześniej.');
}
export function recurringOccurrences(s,month,today){
 const y=Number(month.slice(0,4)),m=Number(month.slice(5,7))-1,end=monthDate(y,m,31),start=month+'-01',result=[];
 for(const r of s.recurring||[]){
  if(!r.active||r.start>end)continue;
  const dates=[];
  if(r.cadence==='monthly'){const d=monthDate(y,m,Number(r.start.slice(-2)));if(d>=r.start)dates.push(d);}
  if(r.cadence==='yearly'&&Number(r.start.slice(5,7))-1===m){const d=monthDate(y,m,Number(r.start.slice(-2)));if(d>=r.start)dates.push(d);}
  if(r.cadence==='weekly'){
   const anchor=Date.parse(r.start+'T12:00:00Z'),first=Date.parse(start+'T12:00:00Z'),last=Date.parse(end+'T12:00:00Z');
   for(let t=anchor+Math.max(0,Math.ceil((first-anchor)/(7*dayMs)))*7*dayMs;t<=last;t+=7*dayMs)dates.push(new Date(t).toISOString().slice(0,10));
  }
  for(const date of dates){const paid=s.transactions.find(t=>t.recurringId===r.id&&t.scheduledDate===date),paidPreviously=!paid&&Boolean(r.settledDates?.includes(date));result.push({...r,date,key:r.id+'|'+date,paid:paid?.id||(paidPreviously?'earlier':null),paidPreviously,overdue:!paid&&!paidPreviously&&date<today});}
 }
 return result.sort((a,b)=>a.date.localeCompare(b.date)||a.name.localeCompare(b.name));
}
export function setMonthSettled(rule,month,settled){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Nieprawidłowy miesiąc rozliczenia.');
 const dates=recurringOccurrences({recurring:[{...rule,active:true}],transactions:[]},month,month+'-01').map(r=>r.date);
 if(settled&&!dates.length)throw Error('W tym miesiącu nie ma terminów tej płatności. Sprawdź pierwszy termin.');
 return {...rule,settledDates:[...new Set([...(rule.settledDates||[]).filter(d=>!d.startsWith(month)),...(settled?dates:[])])].sort()};
}
export function recurringByCategory(s,month,today){const amounts={};for(const r of recurringOccurrences(s,month,today))if(!r.paid)amounts[r.category]=(amounts[r.category]||0)+r.amount;return amounts;}
export function recurringMonthlyAverage(s,categoryIds){return (s.recurring||[]).filter(r=>r.active&&categoryIds.includes(r.category)).reduce((v,r)=>v+Math.round(r.amount*(r.cadence==='weekly'?52/12:r.cadence==='yearly'?1/12:1)),0);}
