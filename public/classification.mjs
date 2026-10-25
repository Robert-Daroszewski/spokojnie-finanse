// Optional detail beneath the stable budget categories. Old snapshots stay valid.
export const subcategories = {
 food: [
  ['groceries','Zakupy spożywcze do domu'],
  ['ready','Gotowe posiłki ze sklepu'],
  ['energy','Energetyki'],
  ['snacks','Przekąski i słodycze'],
  ['dining','Jedzenie na mieście / na wynos']
 ],
 transport: [
  ['intercity','Kolej międzymiastowa (PKP)'],
  ['skm','SKM / PKM (Trójmiasto)'],
  ['city','Tramwaje i autobusy miejskie'],
  ['mixed','Mieszane: SKM + tramwaj'],
  ['taxi','Taxi i przejazdy na aplikację'],
  ['car','Samochód · paliwo i parking']
 ],
 once: [['home','Dom i codzienne sprawy'],['electronics','Elektronika i akcesoria'],['gifts','Prezenty'],['clothing','Ubrania'],['fines','Mandaty i opłaty dodatkowe']],
 fixed: [['housing','Mieszkanie i rachunki'],['internet','Internet i telefon'],['subscriptions','Subskrypcje']],
 health: [['medicines','Leki i apteka'],['supplements','Suplementy'],['care','Wizyty i badania']],
 fun: [['outings','Wyjścia i rozrywka'],['alcohol','Alkohol'],['hobbies','Hobby']],
 learning: [['books','Książki'],['courses','Kursy i nauka']],
 debt: [['instalments','Raty'],['repayment','Spłaty zadłużenia']],
 other: []
};
export const subcategoryName = (category,id) => (subcategories[category]||[]).find(([key])=>key===id)?.[1] || 'Bez podkategorii';
export function validateClassification(value,{pati=false}={}) {
 if(value.subcategory!==undefined && (typeof value.subcategory!=='string' || (value.subcategory!=='' && !(subcategories[value.category]||[]).some(([id])=>id===value.subcategory)))) throw Error('Wybierz podkategorię pasującą do kategorii.');
 if(pati && value.relatedToPati!==undefined && typeof value.relatedToPati!=='boolean') throw Error('Oznaczenie związku z Pati musi być zaznaczone albo wyłączone.');
}
export function matchingItems(t,category='',subcategory='') {
 if(!['expense','refund'].includes(t.type))return [];
 return (t.items?.length?t.items:[t]).filter(i=>(!category||i.category===category)&&(!subcategory||(subcategory==='none'?!i.subcategory:i.subcategory===subcategory)));
}
export function classificationTotals(transactions){
 const groups=new Map();let patiSpent=0,patiRefunded=0,patiCount=0;
 for(const t of transactions){
  if(!['expense','refund'].includes(t.type))continue;
  const sign=t.type==='refund'?-1:1;
  if(t.relatedToPati===true){patiCount++;if(sign===1)patiSpent+=t.amount;else patiRefunded+=t.amount;}
  for(const i of t.items?.length?t.items:[t]){
   const id=i.category+':'+(i.subcategory||'');const row=groups.get(id)||{category:i.category,subcategory:i.subcategory||'',spent:0,refunded:0,amount:0};
   if(sign===1)row.spent+=i.amount;else row.refunded+=i.amount;row.amount+=sign*i.amount;groups.set(id,row);
  }
 }
 return {groups:[...groups.values()],pati:{spent:patiSpent,refunded:patiRefunded,amount:patiSpent-patiRefunded,count:patiCount}};
}
