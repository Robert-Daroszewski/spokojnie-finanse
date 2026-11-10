/* Apply device preferences before the page is painted. No financial state here. */
(function(){
 if(window.SpokojnieAppearance)return;
 var root=document.documentElement,dark=matchMedia('(prefers-color-scheme: dark)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function read(key){try{return localStorage.getItem(key);}catch{return null;}}
 function write(key,value){try{localStorage.setItem(key,value);}catch{}}
 function validTheme(value){return value==='dark'||value==='light'?value:null;}
 var choice=validTheme(read('spokojnie:theme')),motion=read('spokojnie:motion')!=='off';
 function apply(){
  var theme=choice||(dark.matches?'dark':'light'),moving=motion&&!reduced.matches;
  root.dataset.theme=theme;root.dataset.motion=moving?'on':'off';root.dataset.awake=document.hidden?'no':'yes';
  var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#121c1a':'#f5f6f2';
  document.querySelectorAll('[data-appearance="theme"]').forEach(function(button){var label=theme==='dark'?'Włącz motyw jasny':'Włącz motyw nocny';button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(theme==='dark'));button.title=label;});
  document.querySelectorAll('[data-appearance="motion"]').forEach(function(button){var label=reduced.matches?'Animacje wyłączone przez ustawienia urządzenia':moving?'Wstrzymaj animacje tła':'Włącz animacje tła';button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(moving));button.title=label;button.disabled=reduced.matches;});
 }
 window.SpokojnieAppearance={sync:apply};
 document.addEventListener('click',function(event){if(!(event.target instanceof Element))return;var button=event.target.closest('[data-appearance]');if(!button||button.disabled)return;if(button.dataset.appearance==='theme'){choice=root.dataset.theme==='dark'?'light':'dark';write('spokojnie:theme',choice);}else if(button.dataset.appearance==='motion'&&!reduced.matches){motion=!motion;write('spokojnie:motion',motion?'on':'off');}apply();});
 dark.addEventListener('change',apply);reduced.addEventListener('change',apply);
 addEventListener('storage',function(event){if(event.key===null){choice=validTheme(read('spokojnie:theme'));motion=read('spokojnie:motion')!=='off';}else{if(event.key==='spokojnie:theme')choice=validTheme(event.newValue);if(event.key==='spokojnie:motion')motion=event.newValue!=='off';}apply();});
 document.addEventListener('visibilitychange',apply);document.addEventListener('DOMContentLoaded',apply);apply();
})();
