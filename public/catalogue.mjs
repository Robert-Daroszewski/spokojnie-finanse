import {validateClassification} from './classification.mjs';
// A purchase row and a remembered product have separate identities.
export const productKey=p=>[p.name.trim().normalize('NFC').replace(/\s+/g,' ').toLocaleLowerCase('pl'),p.unit||'szt.',p.kind||'product'].join('|');
export function productCatalogue(s){
 const products=(s.products||[]).map(p=>({...p})),byId=new Map(products.map(p=>[p.id,p])),byKey=new Map(products.map(p=>[productKey(p),p]));
 for(const t of [...s.transactions].sort((a,b)=>a.date.localeCompare(b.date)))for(const i of t.items||[]){
  let p=byId.get(i.productId)||byKey.get(productKey(i));
  if(!p){p={id:'legacy:'+productKey(i),name:i.name,unit:i.unit,kind:i.kind||'product',category:i.category};products.push(p);byId.set(p.id,p);byKey.set(productKey(p),p);}
  if(!p.lastDate||t.date>=p.lastDate){p.lastDate=t.date;p.category=i.category;p.subcategory=i.subcategory;}
 }
 return products.sort((a,b)=>(b.lastDate||'').localeCompare(a.lastDate||'')||a.name.localeCompare(b.name,'pl'));
}
export function rememberProducts(s,makeId){
 const products=s.products||=[],byId=new Map(products.map(p=>[p.id,p])),byKey=new Map(products.map(p=>[productKey(p),p]));
 for(const t of [...s.transactions].sort((a,b)=>a.date.localeCompare(b.date)))for(const i of t.items||[]){
  let p=byId.get(i.productId)||byKey.get(productKey(i));
  if(!p){p={id:makeId(),name:i.name.trim(),unit:i.unit,kind:i.kind||'product',category:i.category};products.push(p);byId.set(p.id,p);byKey.set(productKey(p),p);}
  p.category=i.category;if(i.subcategory)p.subcategory=i.subcategory;else delete p.subcategory;
  i.productId=p.id;i.kind=p.kind;
 }
}
export function validateCatalogue(s,categoryIds){
 const list=s.products||[];
 if(!Array.isArray(list)||list.length>10000||new Set(list.map(p=>p?.id)).size!==list.length)throw Error('Nieprawidłowy katalog produktów.');
 for(const p of list)if(!p||typeof p.id!=='string'||!p.id||p.id.length>1000||typeof p.name!=='string'||!p.name.trim()||p.name.length>160||typeof p.unit!=='string'||!p.unit||p.unit.length>20||!['product','service'].includes(p.kind)||!categoryIds.includes(p.category))throw Error('Sprawdź zapisane produkty i usługi.');
 for(const p of list)validateClassification(p);
 const ids=new Set(list.map(p=>p.id));
 for(const t of s.transactions)for(const i of t.items||[])if(i.productId!==undefined&&!ids.has(i.productId))throw Error('Produkt nie istnieje w katalogu.');
}
export function productTotals(s,month='',query=''){
 const catalog=productCatalogue(s),byId=new Map(catalog.map(p=>[p.id,p])),byKey=new Map(catalog.map(p=>[productKey(p),p])),map=new Map();
 for(const t of s.transactions){if(!['expense','refund'].includes(t.type)||(month&&!t.date.startsWith(month)))continue;
  for(const i of t.items||[]){const p=byId.get(i.productId)||byKey.get(productKey(i)),v=map.get(p.id)||{...p,amount:0,spent:0,refunded:0,quantity:0,boughtQuantity:0,purchases:0,refunds:0,history:[]},refund=t.type==='refund';
   v.amount+=(refund?-1:1)*i.amount;v.quantity+=(refund?-1:1)*i.quantity;
   if(refund){v.refunded+=i.amount;v.refunds++;}else{v.spent+=i.amount;v.boughtQuantity+=i.quantity;v.purchases++;}
   v.history.push({date:t.date,description:t.description,transactionId:t.id,amount:i.amount,quantity:i.quantity,refund});map.set(p.id,v);
  }
 }
 // Remembered items stay selectable even after the last purchase was removed.
 for(const p of catalog)if(!map.has(p.id))map.set(p.id,{...p,amount:0,spent:0,refunded:0,quantity:0,boughtQuantity:0,purchases:0,refunds:0,history:[]});
 return [...map.values()].filter(p=>p.name.toLocaleLowerCase('pl').includes(query.trim().toLocaleLowerCase('pl'))).sort((a,b)=>b.amount-a.amount||a.name.localeCompare(b.name,'pl'));
}
