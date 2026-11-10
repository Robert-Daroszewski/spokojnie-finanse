/* One delegated, frame-limited reflection. No financial or persisted state. */
(function(){
 if(window.SpokojnieGlass)return;
 var root=document.documentElement,fine=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),opaque=matchMedia('(prefers-reduced-transparency: reduce)'),forced=matchMedia('(forced-colors: active)');
 var active=null,pending=null,frame=0;
 function clear(){if(frame)cancelAnimationFrame(frame);frame=0;pending=null;if(active){active.style.removeProperty('--light-x');active.style.removeProperty('--light-y');active.style.removeProperty('--light-angle');active.removeAttribute('data-reflecting');active=null;}}
 function enabled(){return fine.matches&&!reduced.matches&&!opaque.matches&&!forced.matches&&!document.hidden&&root.dataset.motion==='on';}
 function paint(){frame=0;if(!pending||!enabled()){clear();return;}var next=pending;pending=null;if(!next.el.isConnected){clear();return;}if(active!==next.el){clear();active=next.el;}var box=active.getBoundingClientRect();if(!box.width||!box.height){clear();return;}var x=Math.max(0,Math.min(1,(next.x-box.left)/box.width)),y=Math.max(0,Math.min(1,(next.y-box.top)/box.height));active.style.setProperty('--light-x',Math.round(x*100)+'%');active.style.setProperty('--light-y',Math.round(y*100)+'%');active.style.setProperty('--light-angle',Math.round(Math.atan2(y-.5,x-.5)*180/Math.PI+90)+'deg');active.setAttribute('data-reflecting','');}
 document.addEventListener('pointermove',function(event){if(event.pointerType!=='mouse'||!enabled()||!(event.target instanceof Element)){clear();return;}var el=event.target.closest('[data-glass],.button,.appearance-button,.sound-button,.entry-submit');if(!el){clear();return;}pending={el:el,x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(paint);},{passive:true});
 document.addEventListener('pointerout',function(event){if(!event.relatedTarget)clear();},{passive:true});
 document.addEventListener('pointerdown',clear,{passive:true});
 document.addEventListener('visibilitychange',clear);addEventListener('blur',clear);addEventListener('scroll',clear,{passive:true});
 [fine,reduced,opaque,forced].forEach(function(media){media.addEventListener('change',clear);});
 new MutationObserver(function(){if(!enabled())clear();}).observe(root,{attributes:true,attributeFilter:['data-motion','data-theme']});
 window.SpokojnieGlass={reset:clear};
})();
