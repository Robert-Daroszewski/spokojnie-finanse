export function createDock({icon, onNavigate, onMenu, onSearch}) {
  const root = document.documentElement;
  const primary = ['home', 'transactions', 'invest'];
  const element = document.createElement('nav');
  element.className = 'mobile-dock';
  element.setAttribute('aria-label', 'Nawigacja telefonu');
  element.innerHTML = `
    <div class="dock-tabs" data-lens="navigation">
      <span class="dock-indicator" data-lens="selection" aria-hidden="true"></span>
      <button type="button" class="dock-tab" data-page="home" aria-label="Przegląd">${icon('home')}<span>Przegląd</span></button>
      <button type="button" class="dock-tab" data-page="transactions" aria-label="Transakcje">${icon('transactions')}<span>Transakcje</span></button>
      <button type="button" class="dock-tab" data-page="invest" aria-label="Inwestycje">${icon('invest')}<span>Portfel</span></button>
      <button type="button" class="dock-tab" data-action="menu" aria-label="Wszystkie sekcje" aria-haspopup="dialog" aria-controls="modal"><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>Więcej</span></button>
    </div>
    <button type="button" class="dock-search" data-lens="control" aria-label="Szukaj transakcji"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.7"/><path d="m15.5 15.5 5 5"/></svg></button>`;
  const tabs = element.querySelector('.dock-tabs');
  const indicator = element.querySelector('.dock-indicator');
  const buttons = [...element.querySelectorAll('.dock-tab')];
  let selected = 0;
  let preview = 0;
  let slot = 0;
  let x = 0;
  let velocity = 0;
  let scale = 1;
  let frame = 0;
  let lastTime = 0;
  let initialized = false;
  let gesture = null;
  let suppressClickUntil = 0;

  const moving = () => root.dataset.motion === 'on' && !document.hidden;
  function paint() {
    indicator.style.transform = `translate3d(${x}px,0,0) scale(${scale},${1 / Math.sqrt(scale)})`;
    window.SpokojnieOptics?.invalidate();
  }

  function tick(now) {
    frame = 0;
    if (!element.isConnected || !slot) return;
    const dt = Math.min((now - lastTime) / 1000 || 1 / 60, .032);
    lastTime = now;
    const target = gesture ? gesture.target : preview * slot;
    velocity += ((target - x) * 480 - velocity * 28) * dt;
    x += velocity * dt;
    const stretch = 1 + Math.min(Math.abs(velocity) / 5500, .18) + (gesture ? .035 : 0);
    scale += (stretch - scale) * Math.min(1, dt * 18);
    paint();
    if (Math.abs(target - x) > .08 || Math.abs(velocity) > .4 || Math.abs(scale - 1) > .002) {
      // A held finger keeps the shape stretched until release.
      if (!gesture || Math.abs(target - x) > .08 || Math.abs(velocity) > .4) frame = requestAnimationFrame(tick);
    } else {
      x = target;
      velocity = 0;
      scale = 1;
      paint();
    }
  }

  function settle() {
    cancelAnimationFrame(frame);
    frame = 0;
    velocity = 0;
    scale = 1;
    x = gesture ? gesture.target : preview * slot;
    paint();
  }

  function animate() {
    if (!moving()) { settle(); return; }
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  function measure() {
    const width = buttons[0].getBoundingClientRect().width;
    if (!width) return;
    const changed = slot !== width;
    slot = width;
    indicator.style.width = `${slot}px`;
    if (!initialized || changed) {
      initialized = true;
      settle();
    }
  }

  function showPreview(index) {
    preview = index;
    buttons.forEach((button, i) => button.toggleAttribute('data-preview', i === index && Boolean(gesture)));
    animate();
  }

  function activate(index) {
    if (moving()) {
      const glyph = buttons[index].querySelector('.icon');
      glyph.getAnimations().forEach(animation => animation.cancel());
      glyph.animate([
        {transform: 'translateY(0) scale(1)'},
        {transform: 'translateY(-3px) scale(1.12)', offset: .32},
        {transform: 'translateY(1px) scale(.97)', offset: .7},
        {transform: 'translateY(0) scale(1)'},
      ], {duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)'});
    }
    if (index === 3) {
      buttons[3].setAttribute('aria-expanded', 'true');
      onMenu();
    }
    else onNavigate(primary[index]);
  }

  function resetGesture() {
    gesture = null;
    delete tabs.dataset.tracking;
    showPreview(selected);
  }

  tabs.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    const button = event.target.closest('.dock-tab');
    if (!button) return;
    gesture = {id: event.pointerId, x: event.clientX, y: event.clientY, target: buttons.indexOf(button) * slot};
    tabs.setPointerCapture(event.pointerId);
    tabs.dataset.tracking = '';
    showPreview(buttons.indexOf(button));
  });

  tabs.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = Math.abs(event.clientX - gesture.x);
    const dy = Math.abs(event.clientY - gesture.y);
    if (dy > 12 && dy > dx) { resetGesture(); return; }
    if (dx < 5) return;
    const box = tabs.getBoundingClientRect();
    gesture.target = Math.max(0, Math.min(3 * slot, event.clientX - box.left - 5 - slot / 2));
    showPreview(Math.max(0, Math.min(3, Math.floor((event.clientX - box.left - 5) / slot))));
  });

  tabs.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const index = preview;
    suppressClickUntil = performance.now() + 500;
    if (tabs.hasPointerCapture(event.pointerId)) tabs.releasePointerCapture(event.pointerId);
    resetGesture();
    activate(index);
  });
  tabs.addEventListener('pointercancel', resetGesture);
  tabs.addEventListener('lostpointercapture', () => { if (gesture) resetGesture(); });

  element.addEventListener('click', event => {
    event.stopPropagation();
    const button = event.target.closest('button');
    if (!button) return;
    if (button.classList.contains('dock-search')) { onSearch(); return; }
    if (event.detail !== 0 && performance.now() < suppressClickUntil) return;
    activate(buttons.indexOf(button));
  });

  new ResizeObserver(measure).observe(tabs);
  new MutationObserver(() => {
    if (!moving()) {
      for (const button of buttons) button.querySelector('.icon').getAnimations().forEach(animation => animation.cancel());
      resetGesture();
    }
  }).observe(root, {attributes: true, attributeFilter: ['data-motion']});
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetGesture(); });
  document.querySelector('#modal').addEventListener('close', () => buttons[3].setAttribute('aria-expanded', 'false'));
  element.addEventListener('focusin', () => { if (!gesture) showPreview(selected); });

  return {
    mount(parent, page) {
      // Keep pointer capture and keyboard focus during background updates.
      if (element.parentNode !== parent) parent.appendChild(element);
      selected = primary.includes(page) ? primary.indexOf(page) : 3;
      buttons.forEach((button, index) => {
        if (index === selected) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      measure();
      if (!gesture) showPreview(selected);
    },
  };
}
