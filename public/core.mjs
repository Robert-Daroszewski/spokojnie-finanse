import { recurringByCategory, recurringMonthlyAverage, validateRule } from './planning.mjs';
export const TODAY = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const uid = () => globalThis.crypto.randomUUID();
export const categories = [
 {id:'fixed',name:'Opłaty cykliczne',icon:'↻',color:'#5975b6',essential:true},
 {id:'once',name:'Bieżące i jednorazowe',icon:'◇',color:'#c78c5c'},
 {id:'food',name:'Jedzenie',icon:'◒',color:'#7b9a65',essential:true},
 {id:'transport',name:'Transport',icon:'↗',color:'#638f9d',essential:true},
 {id:'health',name:'Zdrowie',icon:'+',color:'#be7984',essential:true},
 {id:'fun',name:'Przyjemności',icon:'☆',color:'#aa87ad'},
 {id:'learning',name:'Rozwój',icon:'▤',color:'#ad9b58'},
 {id:'debt',name:'Raty i spłaty',icon:'↓',color:'#9f7970',essential:true},
 {id:'other',name:'Pozostałe',icon:'···',color:'#889194'}
];
export function moneyInput(v){
 const s=String(v??'').trim().replace(/\s|PLN|zł/gi,'').replace(/−/g,'-');
 if(!s)return NaN;
 let x=s;
 if(x.includes(',')&&x.includes('.'))x=x.lastIndexOf(',')>x.lastIndexOf('.')?x.replace(/\./g,'').replace(',','.'):x.replace(/,/g,'');
 else x=x.replace(',','.');
 if(!/^[+-]?\d+(\.\d{1,2})?$/.test(x))return NaN;
 const n=Math.round(Number(x)*100);return Number.isSafeInteger(n)&&Math.abs(n)<=1e12?n:NaN;
}
export function dateInput(s){
 s=String(s??'').trim().split(/[T ]/)[0];let m;
 if((m=s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/)))s=`${m[3]}-${m[2]}-${m[1]}`;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return null;
 const d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s?s:null;
}
export function initialState(){
 const month=TODAY().slice(0,7),start=month+'-01';
 return {version:1,accounts:[
  {id:'bnp',name:'BNP Paribas · bieżące',kind:'bank',opening:0,start},
  {id:'bnp-save',name:'BNP Paribas · oszczędności',kind:'bank',opening:0,start},
  {id:'mill',name:'Millennium · bieżące',kind:'bank',opening:0,start},
  {id:'mill-save',name:'Millennium · oszczędności',kind:'bank',opening:0,start},
  {id:'xtb',name:'XTB · wolna gotówka',kind:'broker',opening:0,start}],
  transactions:[],holdings:[],recurring:[],receipts:[],goals:[{id:'irregular',name:'Większe, nieregularne wydatki',target:100000,saved:0,due:''}],
  budgets:{[month]:Object.fromEntries(categories.map(c=>[c.id,0]))},
  settings:{income:0,essential:0,months:6,reserve:0,irregular:0,debt:0,expensiveDebt:0,verified:false},updatedAt:null,backupAt:null};
}
export function budgetFor(s,month){const keys=Object.keys(s.budgets).filter(k=>k<=month).sort();return s.budgets[month]||s.budgets[keys.at(-1)]||Object.fromEntries(categories.map(c=>[c.id,0]));}
export function signed(t,account){
 if(t.type==='transfer')return t.account===account?-t.amount:t.to===account?t.amount:0;
 if(t.account!==account)return 0;
 return ['expense','buy'].includes(t.type)?-t.amount:t.amount;
}
export function balances(s,today=TODAY()){return Object.fromEntries(s.accounts.map(a=>[a.id,a.opening+s.transactions.filter(t=>t.date>=a.start&&t.date<=today).reduce((v,t)=>v+signed(t,a.id),0)]));}
export function monthStats(s,month){
 const tx=s.transactions.filter(t=>t.date.startsWith(month)&&t.date<=TODAY());
 const spending=Object.fromEntries(categories.map(c=>[c.id,0]));
 for(const t of tx)if(t.type==='expense'||t.type==='refund'){const sign=t.type==='refund'?-1:1;for(const item of t.items?.length?t.items:[{category:t.category,amount:t.amount}])spending[item.category]=(spending[item.category]||0)+sign*item.amount;}
 return {tx,spending,income:tx.filter(t=>t.type==='income').reduce((v,t)=>v+t.amount,0),expenses:Object.values(spending).reduce((a,b)=>a+b,0)};
}
export function overview(s){
 const bs=balances(s),b=budgetFor(s,TODAY().slice(0,7)),st=monthStats(s,TODAY().slice(0,7));
 const bank=s.accounts.filter(a=>a.kind==='bank').reduce((v,a)=>v+bs[a.id],0);
 const broker=s.accounts.filter(a=>a.kind==='broker').reduce((v,a)=>v+bs[a.id],0);
 const portfolio=s.holdings.reduce((v,h)=>v+h.value,0),cost=s.holdings.reduce((v,h)=>v+h.cost,0);
 const unpaid=recurringByCategory(s,TODAY().slice(0,7),TODAY());
 const remaining=categories.reduce((v,c)=>v+Math.max(0,(b[c.id]||0)-(st.spending[c.id]||0),unpaid[c.id]||0),0);
 const target=Math.max(s.settings.essential,recurringMonthlyAverage(s,categories.filter(c=>c.essential).map(c=>c.id)),categories.filter(c=>c.essential).reduce((v,c)=>v+(b[c.id]||0),0))*s.settings.months;
 const allocated=s.goals.reduce((v,g)=>v+g.saved,0);
 const protectedCash=Math.max(0,bank-remaining-allocated);
 const reserveCovered=Math.min(target,protectedCash);
 const available=Math.max(0,bank-remaining-allocated-target);
 const allowed=s.settings.verified&&target>0&&!s.settings.expensiveDebt;
 return {bs,bank,broker,portfolio,cost,remaining,target,allocated,reserveCovered,available:allowed?available:0,allowed,net:bank+broker+portfolio-s.settings.debt};
}
export function fingerprint(t){return [t.account,t.date,t.type,t.amount,t.to||'',t.description.trim().toLocaleLowerCase('pl')].join('|');}
export function validateTransaction(t,s){
 if(!Number.isSafeInteger(t.amount)||t.amount<=0||t.amount>1e12)throw Error('Podaj kwotę większą od zera, maksymalnie z dwoma miejscami po przecinku.');
 if(!['income','expense','refund','transfer','buy','sell'].includes(t.type))throw Error('Nieprawidłowy rodzaj operacji.');
 const a=s.accounts.find(a=>a.id===t.account);
 if(!a||!dateInput(t.date)||t.date>TODAY()||t.date<a.start)throw Error('Data musi przypadać od daty salda początkowego konta do dzisiaj. Przyszłe wydatki uwzględnij w budżecie.');
 if(!String(t.description||'').trim())throw Error('Dodaj krótki opis.');
 if(['expense','refund'].includes(t.type)&&!categories.some(c=>c.id===t.category))throw Error('Wybierz kategorię.');
 if(t.type==='transfer'){
  const dest=s.accounts.find(a=>a.id===t.to);
  if(!dest||dest.id===a.id||t.date<dest.start)throw Error('Wybierz inne konto docelowe i datę od jego salda początkowego.');
 }
 if(['buy','sell'].includes(t.type)&&a.kind!=='broker')throw Error('Zakup i sprzedaż inwestycji zapisuj na koncie XTB.');
 if(t.items!==undefined){
  if(!Array.isArray(t.items)||t.items.length>500||(!['expense','refund'].includes(t.type)&&t.items.length))throw Error('Produkty są dostępne tylko dla wydatku i zwrotu.');
  const ids=new Set();for(const item of t.items){if(!item||typeof item.id!=='string'||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>160||!Number.isFinite(item.quantity)||item.quantity<=0||item.quantity>100000||typeof item.unit!=='string'||item.unit.length>20||!Number.isSafeInteger(item.amount)||item.amount<=0||!categories.some(c=>c.id===item.category))throw Error('Sprawdź nazwy, ilości, kategorie i kwoty produktów.');ids.add(item.id);}
  if(t.items.length&&t.items.reduce((v,i)=>v+i.amount,0)!==t.amount)throw Error('Suma końcowych kwot produktów musi zgadzać się z kwotą zakupu.');
 }
 if(t.recurringId!==undefined&&(typeof t.recurringId!=='string'||!dateInput(t.scheduledDate)||t.type!=='expense'))throw Error('Nieprawidłowe powiązanie płatności cyklicznej.');
 if(t.receiptId!==undefined&&typeof t.receiptId!=='string')throw Error('Nieprawidłowe powiązanie paragonu.');

 return true;
}
export function parseCSV(text,delimiter){
 text=text.replace(/^\uFEFF/,'');
 if(!delimiter){const line=text.split(/\r?\n/)[0];delimiter=[';','\t',','].sort((a,b)=>line.split(b).length-line.split(a).length)[0];}
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===delimiter&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw Error('Niedomknięty cudzysłów w CSV.');
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 if(rows.length<2)throw Error('Plik powinien zawierać nagłówki i co najmniej jedną transakcję.');
 if(rows.length>5001)throw Error('Zaimportuj maksymalnie 5000 wierszy naraz.');
 return {headers:rows[0],rows:rows.slice(1)};
}
export function validateState(s){
 const fail=()=>{throw Error('Nieprawidłowa kopia zapasowa. Obecne dane nie zostały zmienione.');};
 const cash=n=>Number.isSafeInteger(n)&&Math.abs(n)<=1e12;
 const positive=n=>cash(n)&&n>=0;
 const str=v=>typeof v==='string'&&v.length<=1000;
 if(!s||s.version!==1||!Array.isArray(s.accounts)||!s.accounts.length||s.accounts.length>50||!Array.isArray(s.transactions)||s.transactions.length>100000||!Array.isArray(s.holdings)||!Array.isArray(s.goals)||!s.budgets||typeof s.budgets!=='object'||!s.settings)fail();
 if(new Set(s.accounts.map(a=>a.id)).size!==s.accounts.length)fail();
 for(const a of s.accounts)if(!str(a.id)||!str(a.name)||!a.name.trim()||!cash(a.opening)||!dateInput(a.start)||a.start>TODAY()||!['bank','broker'].includes(a.kind))fail();
 const occurrences=new Set();for(const t of s.transactions)if(t.recurringId){const key=t.recurringId+'|'+t.scheduledDate;if(occurrences.has(key))fail();occurrences.add(key);}
 const ids=new Set();for(const t of s.transactions){if(!str(t.id)||ids.has(t.id)||!str(t.description))fail();ids.add(t.id);try{validateTransaction(t,s);}catch{fail();}}
 if(s.recurring!==undefined){if(!Array.isArray(s.recurring)||s.recurring.length>500||new Set(s.recurring.map(r=>r.id)).size!==s.recurring.length)fail();for(const r of s.recurring)try{validateRule(r,s,categories);}catch{fail();}}
 if(s.receipts!==undefined){if(!Array.isArray(s.receipts)||s.receipts.length>5000||new Set(s.receipts.map(r=>r.id)).size!==s.receipts.length)fail();for(const r of s.receipts)if(!str(r.id)||!str(r.fileName)||!['image/jpeg','image/png','image/webp','application/pdf','application/json'].includes(r.type)||!Number.isSafeInteger(r.size)||r.size<1||r.size>3000000||typeof r.sha256!=='string'||!/^([a-f0-9]{64})$/.test(r.sha256))fail();}
 for(const h of s.holdings)if(!str(h.id)||!str(h.name)||!str(h.ticker)||!positive(h.cost)||!positive(h.value)||!dateInput(h.date)||h.date>TODAY())fail();
 for(const g of s.goals)if(!str(g.id)||!str(g.name)||!positive(g.target)||g.target===0||!positive(g.saved)||(!dateInput(g.due)&&g.due!==''))fail();
 for(const [k,v]of Object.entries(s.budgets)){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(k)||!v||typeof v!=='object')fail();for(const [c,n]of Object.entries(v))if(!categories.some(x=>x.id===c)||!positive(n))fail();}
 for(const key of ['income','essential','reserve','irregular','debt','expensiveDebt'])if(!positive(s.settings[key]))fail();
 if(!Number.isInteger(s.settings.months)||s.settings.months<1||s.settings.months>24||s.settings.expensiveDebt>s.settings.debt||typeof s.settings.verified!=='boolean')fail();
 return true;
}
