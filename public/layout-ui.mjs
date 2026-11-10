import {sections} from './workspace-ui.mjs';

const groups=[
 ['Na co dzień',['home','transactions','reports']],
 ['Planowanie',['budget','recurring','goals']],
 ['Portfel',['invest']],
 ['Biblioteka',['products','receipts','templates']],
 ['Narzędzia',['checks','connections','settings','guide']]
];

export function sectionTitle(id){return id==='home'?'Przegląd':sections.find(([key])=>key===id)?.[1]||'Spokojnie';}

export function sidebar({page,icon,esc,demo}){
 const button=id=>{const label=sectionTitle(id);return `<button type="button" data-page="${id}" aria-label="${esc(label)}" title="${esc(label)}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${icon(id)}<span class="nav-caption">${esc(label)}</span>${id==='recurring'?'<span class="nav-compact-caption" aria-hidden="true">Płatności</span>':''}</button>`;};
 return `<aside class="sidebar" data-lens="navigation" data-glass="navigation"><div class="brand"><div class="brandmark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 21c8 0 4-13 12-13s4 13 12 13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg></div><span>spokojnie.</span></div><div class="tagline">Mniej chaosu. Więcej spokoju.</div><nav class="nav" aria-label="Nawigacja główna">${groups.map(([label,ids])=>`<span class="nav-group-label">${label}</span>${ids.map(button).join('')}`).join('')}<button type="button" class="mobile-menu-button" data-action="menu" aria-label="Wszystkie sekcje" aria-haspopup="dialog" aria-controls="modal">${icon('menu')}<span>Więcej</span></button></nav><div class="sidefoot"><strong>${icon('shield')} Prywatna przestrzeń</strong><div class="sidefoot-actions"><button type="button" class="text-link" data-action="backup">Kopia danych ${icon('download')}</button><button type="button" class="text-link" data-action="demo">${demo?'Twoje dane':'Przykład'}</button></div></div></aside>`;
}
