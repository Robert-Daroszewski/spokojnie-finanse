import {subcategories} from './classification.mjs';
export function subcategoryOptions(category,selected='',empty='Bez podkategorii'){
 return `<option value="">${empty}</option>`+(subcategories[category]||[]).map(([id,name])=>`<option value="${id}" ${selected===id?'selected':''}>${name}</option>`).join('');
}
export function bindSubcategory(parent,child){
 const update=()=>{child.innerHTML=subcategoryOptions(parent.value);child.disabled=parent.disabled;};
 parent.addEventListener('change',update);
 return update;
}
