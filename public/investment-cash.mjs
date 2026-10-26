import {balances,validateState,validateTransaction,TODAY,uid} from './core.mjs';

export function purchaseFor(s,h){return h.purchaseTransactionId?s.transactions.find(t=>t.id===h.purchaseTransactionId):null;}
export function unlinkedPurchases(s,holdingId){
 const used=new Set(s.holdings.filter(h=>h.id!==holdingId).map(h=>h.purchaseTransactionId).filter(Boolean));
 return s.transactions.filter(t=>t.type==='buy'&&!used.has(t.id)&&s.accounts.some(a=>a.id===t.account&&a.kind==='broker'));
}
export function validateInvestmentCash(s){
 const used=new Set();
 for(const h of s.holdings){
  if(h.cashAlreadyIncluded!==undefined&&typeof h.cashAlreadyIncluded!=='boolean')throw Error('Nieprawidłowe rozliczenie gotówki pozycji.');
  if(h.purchaseTransactionId===undefined)continue;
  const t=purchaseFor(s,h);
  if(typeof h.purchaseTransactionId!=='string'||!t||t.type!=='buy'||used.has(t.id)||h.cashAlreadyIncluded||t.amount!==h.cost||(h.mode==='auto'&&t.date!==h.purchaseDate)||!s.accounts.some(a=>a.id===t.account&&a.kind==='broker'))throw Error('Sprawdź powiązanie pozycji z zakupem w XTB.');
  used.add(t.id);
 }
}

// The caller commits this together with the holding, through the existing CAS save.
// Work on a clone so a failed validation cannot leave a partial purchase behind.
export function saveInvestment(s,holding,booking,{makeId=uid,today=TODAY()}={}){
 const next=structuredClone(s),old=next.holdings.find(h=>h.id===holding.id),h=structuredClone(holding),linked=old&&purchaseFor(next,old);
 delete h.purchaseTransactionId;delete h.cashAlreadyIncluded;
 if(linked){
  if(booking.mode!=='book')throw Error('Ta pozycja ma już zapisany zakup. Edytuj go zamiast ponownie odejmować gotówkę.');
  if(!Number.isSafeInteger(h.cost)||h.cost<=0)throw Error('Koszt zaksięgowanego zakupu musi być większy od zera.');
  const previousAmount=linked.amount,previousAccount=linked.account;
  Object.assign(linked,{amount:h.cost,date:h.mode==='auto'?h.purchaseDate:booking.date,account:booking.account});
  validateTransaction(linked,next);h.purchaseTransactionId=linked.id;
  if((h.cost>previousAmount||previousAccount!==linked.account)&&balances(next,today)[linked.account]<0)throw Error('Brakuje gotówki na korektę zakupu. Sprawdź wpłaty i saldo XTB.');
 }else if(booking.mode==='book'){
  const t={id:makeId(),type:'buy',description:('Zakup '+h.name).slice(0,160),amount:h.cost,date:h.mode==='auto'?h.purchaseDate:booking.date,account:booking.account,category:'other'};
  validateTransaction(t,next);
  const already=unlinkedPurchases(next,h.id).filter(x=>x.account===t.account&&x.date===t.date&&x.amount===t.amount);
  if(already.length&&booking.separatePurchase!==true)throw Error('Istnieje zakup z tą datą i kwotą. Powiąż go albo potwierdź w formularzu, że dodajesz osobny zakup.');
  if(balances(next,today)[t.account]<t.amount)throw Error('Brakuje wolnej gotówki na ten zakup. Sprawdź saldo początkowe lub zapisz wpłatę jako przelew do XTB. Jeśli zakup jest już ujęty w saldzie, wybierz pozycję historyczną.');
  next.transactions.push(t);h.purchaseTransactionId=t.id;
 }else if(booking.mode==='existing'){
  const t=unlinkedPurchases(next,h.id).find(t=>t.id===booking.transactionId);
  if(!t||t.amount!==h.cost||(h.mode==='auto'&&t.date!==h.purchaseDate))throw Error('Wybierz niepowiązany zakup z tą samą kwotą i datą co partia.');
  h.purchaseTransactionId=t.id;
 }else if(booking.mode==='included')h.cashAlreadyIncluded=true;
 else if(booking.mode!=='unresolved'||!old)throw Error('Wybierz sposób rozliczenia zakupu.');
 if(old)next.holdings[next.holdings.findIndex(x=>x.id===h.id)]=h;else next.holdings.push(h);
 validateState(next);
 s.holdings=next.holdings;s.transactions=next.transactions;
 return h;
}

export function syncLinkedPurchase(s,t){
 for(const h of s.holdings.filter(h=>h.purchaseTransactionId===t.id)){
  if(t.type!=='buy')throw Error('To zakup powiązany z pozycją. Zachowaj rodzaj „Zakup inwestycji” lub edytuj pozycję w Inwestycjach.');
  h.cost=t.amount;
  if(h.mode==='auto'){h.purchaseDate=t.date;if(h.quantityAsOf&&h.quantityAsOf<t.date)h.quantityAsOf=TODAY();}
 }
}

export function detachPurchase(s,transactionId){
 const holdingIds=[];for(const h of s.holdings)if(h.purchaseTransactionId===transactionId){holdingIds.push(h.id);delete h.purchaseTransactionId;}
 return holdingIds;
}
export function restorePurchaseLinks(s,t,holdingIds=[]){
 for(const id of holdingIds){const h=s.holdings.find(h=>h.id===id);if(h&&!h.purchaseTransactionId&&!h.cashAlreadyIncluded&&h.cost===t.amount&&(h.mode!=='auto'||h.purchaseDate===t.date))h.purchaseTransactionId=t.id;}
}
