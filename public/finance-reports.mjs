import {categories,balances} from './core.mjs';
export function shiftMonth(month,offset){const d=new Date(month+'-15T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+offset);return d.toISOString().slice(0,7);}
export const daysInMonth=month=>new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate();
function period(s,month,day,today){const end=month+'-'+String(Math.min(day,daysInMonth(month))).padStart(2,'0'),tx=s.transactions.filter(t=>t.date.startsWith(month)&&t.date<=end&&t.date<=today),spending=Object.fromEntries(categories.map(c=>[c.id,0]));let spent=0,refunded=0,income=0;
 for(const t of tx){if(t.type==='income')income+=t.amount;if(['expense','refund'].includes(t.type)){if(t.type==='expense')spent+=t.amount;else refunded+=t.amount;for(const i of t.items?.length?t.items:[t])spending[i.category]+=(t.type==='refund'?-1:1)*i.amount;}}
 return{month,end,tx,spending,spent,refunded,expenses:spent-refunded,income,result:income-spent+refunded};
}
export function monthlyReport(s,month,today){const partial=month===today.slice(0,7),day=partial?Number(today.slice(-2)):31,current=period(s,month,day,today),previous=period(s,shiftMonth(month,-1),day,today),change=current.expenses-previous.expenses;
 return{...current,previous,partial,change,changePercent:previous.expenses>0?change/previous.expenses*100:null,largest:categories.map(c=>({...c,amount:current.spending[c.id]})).sort((a,b)=>b.amount-a.amount)[0],trend:Array.from({length:6},(_,i)=>period(s,shiftMonth(month,i-5),31,today)),days:Array.from({length:daysInMonth(month)},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0'),tx=current.tx.filter(t=>t.date===date),amount=tx.reduce((v,t)=>v+(t.type==='expense'?t.amount:t.type==='refund'?-t.amount:0),0);return{date,amount,count:tx.length,future:date>today};})};
}
export function transactionMatches(t,{month='',all=false,query='',type='',account='',category='',date=''}={}){
 const q=query.trim().toLocaleLowerCase('pl'),items=t.items||[];
 return(all||!month||t.date.startsWith(month))&&(!q||[t.description,...items.map(i=>i.name)].some(v=>v.toLocaleLowerCase('pl').includes(q)))&&(!type||t.type===type)&&(!account||t.account===account||t.to===account)&&(!date||t.date===date)&&(!category||(['expense','refund'].includes(t.type)&&(items.length?items.some(i=>i.category===category):t.category===category)));
}
export function filteredTotals(tx,category=''){const total={income:0,spent:0,refunded:0};for(const t of tx){const amount=category&&t.items?.length?t.items.filter(i=>i.category===category).reduce((s,i)=>s+i.amount,0):t.amount;if(t.type==='income')total.income+=amount;if(t.type==='expense')total.spent+=amount;if(t.type==='refund')total.refunded+=amount;}return{...total,netExpenses:total.spent-total.refunded};}
export function reconciliation(s,account,date,actual){const recorded=balances(s,date)[account];if(!Number.isSafeInteger(actual)||!Number.isSafeInteger(recorded))throw Error('Podaj poprawne saldo.');return{account,date,actual,recorded,difference:actual-recorded};}
