// This filter displaces SourceGraphic: the live page behind the navigation.
// The PNG contains only displacement coordinates and is never painted on the page.
export function attachBackdropRefraction(dock, surfaces) {
  const chromium = /(?:Chrome|Chromium|Edg|SamsungBrowser)\//.test(navigator.userAgent) &&
    !/(?:CriOS|EdgiOS|OPiOS)/.test(navigator.userAgent);
  if (!chromium || !CSS.supports('backdrop-filter', 'url("#dock-filter")')) return;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.classList.add('dock-filters');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const defs = document.createElementNS(ns, 'defs');
  svg.appendChild(defs);
  dock.prepend(svg);

  surfaces.forEach((surface, index) => {
    const id = `spokojnie-dock-filter-${index}`;
    const filter = document.createElementNS(ns, 'filter');
    filter.id = id;
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    const soften = document.createElementNS(ns, 'feGaussianBlur');
    soften.setAttribute('in', 'SourceGraphic');
    soften.setAttribute('stdDeviation', '1.5');
    soften.setAttribute('result', 'live-backdrop');
    const field = document.createElementNS(ns, 'feImage');
    field.setAttribute('result', 'refraction-field');
    field.setAttribute('preserveAspectRatio', 'none');
    const refract = document.createElementNS(ns, 'feDisplacementMap');
    refract.setAttribute('in', 'live-backdrop');
    refract.setAttribute('in2', 'refraction-field');
    refract.setAttribute('scale', '24');
    refract.setAttribute('xChannelSelector', 'R');
    refract.setAttribute('yChannelSelector', 'G');
    filter.append(soften, field, refract);
    defs.appendChild(filter);
    let currentSize = '';

    const observer = new ResizeObserver(async ([entry]) => {
      const width = Math.round(entry.borderBoxSize?.[0]?.inlineSize || surface.offsetWidth);
      const height = Math.round(entry.borderBoxSize?.[0]?.blockSize || surface.offsetHeight);
      const key = `${width}x${height}`;
      if (!width || !height || key === currentSize) return;
      currentSize = key;
      const padding = 16;
      const canvas = document.createElement('canvas');
      canvas.width = width + 2*padding;
      canvas.height = height + 2*padding;
      const context = canvas.getContext('2d');
      if (!context) return;
      const pixels = context.createImageData(canvas.width, canvas.height);
      const radius = height/2;
      const bevel = Math.min(12, radius*.7);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const dx = x-padding+.5-width/2;
          const dy = y-padding+.5-height/2;
          const qx = Math.abs(dx)-width/2+radius;
          const qy = Math.abs(dy)-height/2+radius;
          const distance = Math.hypot(Math.max(qx,0),Math.max(qy,0)) + Math.min(Math.max(qx,qy),0)-radius;
          let shiftX = 0;
          let shiftY = 0;
          if (distance <= 0) {
            let nx = qx > qy ? Math.sign(dx) : 0;
            let ny = qx > qy ? 0 : Math.sign(dy);
            if (qx > 0 && qy > 0) {
              const length = Math.hypot(qx,qy);
              nx = qx/length*Math.sign(dx);
              ny = qy/length*Math.sign(dy);
            }
            const bend = 8*Math.pow(Math.max(0,1+distance/bevel),1.6);
            const magnification = index === 1 ? .055 : .018;
            shiftX = nx*bend-dx*magnification;
            shiftY = ny*bend-dy*magnification;
          }
          const offset = (y*canvas.width+x)*4;
          pixels.data[offset] = Math.round(127.5+shiftX/24*255);
          pixels.data[offset+1] = Math.round(127.5+shiftY/24*255);
          pixels.data[offset+2] = 128;
          pixels.data[offset+3] = 255;
        }
      }
      context.putImageData(pixels,0,0);
      const url = canvas.toDataURL('image/png');
      const image = new Image();
      image.src = url;
      try { await image.decode(); } catch { return; }
      if (currentSize !== key) return;
      for (const target of [filter, field]) {
        target.setAttribute('x', String(-padding));
        target.setAttribute('y', String(-padding));
        target.setAttribute('width', String(canvas.width));
        target.setAttribute('height', String(canvas.height));
      }
      field.setAttribute('href', url);
      surface.style.setProperty('--dock-filter', `url("#${id}")`);
      dock.dataset.refraction = 'backdrop';
    });
    observer.observe(surface);
  });
}
