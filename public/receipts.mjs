import { moneyInput, uid } from './core.mjs';
export function findArrays(value,path='',depth=0,result=[]){
 if(depth>8||result.length>30)return result;
 if(Array.isArray(value)&&value.length&&value.every(v=>v&&typeof v==='object'&&!Array.isArray(v)))result.push({path:path||'(lista główna)',rows:value});
 if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))if(v&&typeof v==='object')findArrays(v,path?path+'.'+k:k,depth+1,result);
 return result;
}
export function flattenFields(obj,prefix='',out={}){for(const [k,v]of Object.entries(obj||{})){const key=prefix?prefix+'.'+k:k;if(v&&typeof v==='object'&&!Array.isArray(v))flattenFields(v,key,out);else if(typeof v==='string'||typeof v==='number')out[key]=v;}return out;}
export function inferMapping(rows){const fields=[...new Set(rows.slice(0,20).flatMap(r=>Object.keys(flattenFields(r))))];const choose=regex=>fields.find(k=>regex.test(k.split('.').at(-1)))||'';return {fields,name:choose(/^(name|nazwa|productName|itemName|description|nazwaTowaru)$/i),quantity:choose(/^(quantity|qty|ilosc|ilość|amountQuantity)$/i),amount:choose(/^(lineTotal|totalPrice|total|wartosc|wartość|grossValue|value|amount|price|cena)$/i)};}
export function mapReceiptRows(rows,mapping){
 if(rows.length>500)throw Error('Maksymalnie 500 produktów na paragonie.');
 return rows.map((row,i)=>{
  const flat=flattenFields(row),name=String(flat[mapping.name]||'').trim();
  const quantity=mapping.quantity?Number(String(flat[mapping.quantity]??1).replace(',','.')):1;
  let amount=mapping.grosze?Number(flat[mapping.amount]):moneyInput(flat[mapping.amount]);
  if(mapping.unitPrice)amount=Math.round(amount*quantity);
  if(!name||name.length>160||!Number.isFinite(quantity)||quantity<=0||quantity>100000||!Number.isSafeInteger(amount)||amount<=0)throw Error(`Produkt ${i+1}: sprawdź nazwę, ilość i końcową kwotę po rabatach. Ujemne rabaty rozdziel na produkty przed zapisem.`);
  return {id:uid(),name,quantity,unit:'szt.',amount,category:'food'};
 });
}
export function productSummary(s,month){
 const map=new Map();for(const t of s.transactions)if(t.date.startsWith(month)&&['expense','refund'].includes(t.type))for(const item of t.items||[]){const key=item.name.trim().toLocaleLowerCase('pl')+'|'+(item.unit||'szt.');const v=map.get(key)||{name:item.name,unit:item.unit||'szt.',quantity:0,amount:0,purchases:0};const sign=t.type==='refund'?-1:1;v.quantity+=sign*item.quantity;v.amount+=sign*item.amount;v.purchases++;map.set(key,v);}return [...map.values()].sort((a,b)=>b.amount-a.amount);
}
