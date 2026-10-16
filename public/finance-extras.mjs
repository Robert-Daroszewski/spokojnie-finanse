export function templateCandidates(transactions,selectedId,limit=300){const sorted=transactions.filter(t=>t.type==='expense').sort((a,b)=>b.date.localeCompare(a.date)),choices=sorted.slice(0,limit),selected=sorted.find(t=>t.id===selectedId);if(selected&&!choices.some(t=>t.id===selected.id))choices.unshift(selected);return{sorted,choices};}
export function validateFinanceExtras(s,today,validateTransaction){
 const templates=s.templates||[],checks=s.reconciliations||[],cash=n=>Number.isSafeInteger(n)&&Math.abs(n)<=1e12,str=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 const validDate=d=>{try{return /^\d{4}-\d{2}-\d{2}$/.test(d)&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;}catch{return false;}};
 if(!Array.isArray(templates)||templates.length>100||new Set(templates.map(t=>t?.id)).size!==templates.length)throw Error('Nieprawidłowe szablony.');
 for(const t of templates){if(!t||!str(t.id,1000)||!str(t.name,100)||t.type!=='expense')throw Error('Nieprawidłowy szablon wydatku.');validateTransaction({...t,date:today},s);for(const i of t.items||[])if(i.productId&&!s.products?.some(p=>p.id===i.productId))throw Error('Produkt szablonu nie istnieje.');}
 if(!Array.isArray(checks)||checks.length>1000||new Set(checks.map(c=>c?.id)).size!==checks.length||new Set(checks.map(c=>c.account+'|'+c.date)).size!==checks.length)throw Error('Nieprawidłowe sprawdzenia sald.');
 for(const c of checks){const a=s.accounts.find(a=>a.id===c?.account);if(!c||!str(c.id,1000)||!a||!validDate(c.date)||c.date<a.start||c.date>today||!cash(c.actual)||!cash(c.recorded)||typeof c.checkedAt!=='string'||!Number.isFinite(Date.parse(c.checkedAt)))throw Error('Nieprawidłowe saldo lub data sprawdzenia.');}
}
