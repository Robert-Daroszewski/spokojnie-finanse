(() => {
  const root = document.documentElement;
  const canvas = document.querySelector('.optical-scene');
  if (!canvas) return;

  const opaque = matchMedia('(prefers-reduced-transparency: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const touch = matchMedia('(pointer: coarse)');
  const lensTypes = {
    balance: [38, 48, 1],
    accounts: [24, 27, 0],
    navigation: [22, 25, 0],
    toolbar: [18, 25, 0],
    access: [29, 31, 0],
    portfolio: [29, 35, 0],
  };
  const rects = new Float32Array(20);
  const materials = new Float32Array(20);
  const pointer = [-2000, -2000];
  let frame = 0;
  let previousFrame = -Infinity;
  let time = 0;
  let dirty = true;
  let elements = [];
  let pipeline;
  let loading = false;
  let lost = false;
  let unavailable = false;
  let images;

  const fragment = `
    precision highp float;
    uniform sampler2D uDay, uNight;
    uniform vec2 uPixels, uViewport, uPointer;
    uniform float uTime, uDark;
    uniform vec4 uRects[5], uMaterials[5];

    vec2 cover(vec2 p) {
      float ratio = uViewport.x / uViewport.y / 1.7768;
      vec2 crop = vec2(min(ratio, 1.0), min(1.0 / ratio, 1.0));
      vec2 drift = vec2(sin(uTime * .25) * 7.0, sin(uTime * .32) * 5.0);
      return (p + drift) / uViewport * crop + (1.0 - crop) * vec2(.59, .5);
    }

    vec3 scene(vec2 p) {
      vec2 uv = cover(p);
      float lower = smoothstep(.52, 1.0, p.y / uViewport.y);
      if (uDark > .5) {
        return mix(texture2D(uNight, uv).rgb, vec3(.035,.05,.09), .13 + lower * .34);
      }
      return mix(texture2D(uDay, uv).rgb, vec3(.84,.89,.96), .14 + lower * .18);
    }

    vec3 throughLens(vec2 p, vec4 rect, float hero) {
      if (hero < .5) return scene(p);
      vec2 local = (p - rect.xy) / rect.zw;
      vec2 uv = vec2(.14,.20) + local * vec2(.85,.74);
      uv += vec2(sin(uTime*.36)*.012, cos(uTime*.24)*.009);
      vec3 glass = texture2D(uNight, uv).rgb;
      float shade = .32 + smoothstep(.19,.92,local.x)*.46;
      return mix(vec3(.032,.060,.135), glass, shade);
    }

    void main() {
      vec2 p = vec2(gl_FragCoord.x, uPixels.y-gl_FragCoord.y) / uPixels * uViewport;
      vec3 color = scene(p);
      for (int i = 0; i < 5; i++) {
        vec4 rect = uRects[i];
        if (rect.z < 1.0 || any(lessThan(p,rect.xy-2.0)) || any(greaterThan(p,rect.xy+rect.zw+2.0))) continue;
        vec4 material = uMaterials[i];
        vec2 rel = p - rect.xy - rect.zw*.5;
        vec2 q = abs(rel) - rect.zw*.5 + material.x;
        float distanceToEdge = length(max(q,0.0)) + min(max(q.x,q.y),0.0) - material.x;
        if (distanceToEdge > 1.5) continue;
        vec2 normal = q.x > q.y ? vec2(sign(rel.x),0.0) : vec2(0.0,sign(rel.y));
        if (q.x > 0.0 && q.y > 0.0) normal = normalize(q) * sign(rel);
        float depth = max(-distanceToEdge, 0.0);
        float bevel = 1.0 - smoothstep(0.0, material.y, depth);
        float bend = material.z * pow(bevel,1.8);
        vec2 samplePoint = p - normal * bend + rel*.016;
        vec3 green = throughLens(samplePoint, rect, material.w);
        float split = bevel * bevel * (1.4 + material.w*1.5);
        vec3 chroma = vec3(throughLens(samplePoint-normal*split,rect,material.w).r,
                           green.g, throughLens(samplePoint+normal*split,rect,material.w).b);
        vec3 lens = mix(green, chroma, bevel);
        if (material.w < .5) {
          vec3 tint = uDark > .5 ? vec3(.058,.079,.135) : vec3(.89,.93,.99);
          lens = mix(lens,tint,.43 - bevel*.2);
        }
        float facing = max(0.0, dot(normal,normalize(vec2(-.5,-.84))));
        float rim = exp(-abs(depth-1.65)*.77) * (.09 + facing*.28);
        float innerRim = exp(-abs(depth-6.0)*.32) * bevel * .045;
        float cursor = exp(-length(p-uPointer)*.014) * bevel * .34;
        float moving = (.5+.5*sin(p.x*.014+p.y*.02-uTime*.58)) * .045 * bevel;
        lens += vec3(.68,.82,1.0)*(rim+innerRim+cursor+moving);
        lens -= vec3(.035,.029,.018) * bevel * max(0.0,normal.y);
        color = mix(color, lens, 1.0-smoothstep(-.8,1.0,distanceToEdge));
      }
      gl_FragColor = vec4(clamp(color,0.0,1.0),1.0);
    }`;

  function loadImage(path) {
    const image = new Image();
    image.src = path;
    return image.decode().then(() => image);
  }

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function createPipeline(gl, assets) {
    const vertex = compile(gl, gl.VERTEX_SHADER, 'attribute vec2 aVertex;void main(){gl_Position=vec4(aVertex,0.,1.);}');
    const pixel = compile(gl, gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, pixel);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(pixel);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aVertex');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = name => gl.getUniformLocation(program, name);
    for (const [index, asset] of assets.entries()) {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asset);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(uniform(index === 0 ? 'uDay' : 'uNight'), index);
    }
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const software = debug && /swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
    return {
      gl, software,
      pixels: uniform('uPixels'), viewport: uniform('uViewport'), pointer: uniform('uPointer'),
      time: uniform('uTime'), dark: uniform('uDark'), rects: uniform('uRects[0]'), materials: uniform('uMaterials[0]'),
    };
  }

  function usable() {
    return !opaque.matches && !forced.matches && !lost && !unavailable;
  }

  function schedule() {
    if (!frame && pipeline && usable() && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function invalidate() {
    dirty = true;
    schedule();
  }

  const resize = new ResizeObserver(invalidate);
  function measure() {
    const current = [...document.querySelectorAll('[data-lens]')].filter(element => Object.hasOwn(lensTypes, element.dataset.lens));
    // The mobile dock is above the scrolling content.
    current.sort((a, b) => Number(a.dataset.lens === 'navigation') - Number(b.dataset.lens === 'navigation'));
    if (current.length !== elements.length || current.some((element, i) => element !== elements[i])) {
      for (const element of elements) resize.unobserve(element);
      elements = current;
      for (const element of elements) resize.observe(element);
    }
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const density = Math.min(devicePixelRatio || 1, touch.matches ? 1.4 : 1.85,
      Math.sqrt((pipeline.software ? 900000 : 4200000) / (width * height)));
    const pixelWidth = Math.max(1, Math.round(width * density));
    const pixelHeight = Math.max(1, Math.round(height * density));
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    const { gl } = pipeline;
    gl.viewport(0, 0, pixelWidth, pixelHeight);
    gl.uniform2f(pipeline.pixels, pixelWidth, pixelHeight);
    gl.uniform2f(pipeline.viewport, width, height);

    rects.fill(0);
    let index = 0;
    for (const element of elements) {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height || box.bottom <= 0 || box.top >= height) continue;
      const [bevel, refraction, hero] = lensTypes[element.dataset.lens];
      const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius);
      rects.set([box.left, box.top, box.width, box.height], index * 4);
      materials.set([Math.min(radius || 0, box.width / 2, box.height / 2), Math.min(bevel, box.height / 2), refraction, hero], index * 4);
      if (++index === 5) break;
    }
    gl.uniform4fv(pipeline.rects, rects);
    gl.uniform4fv(pipeline.materials, materials);
    dirty = false;
  }

  function draw(now) {
    frame = 0;
    if (!usable()) {
      delete root.dataset.optics;
      return;
    }
    if (document.hidden) return;
    const animated = root.dataset.motion === 'on';
    const delta = now - previousFrame;
    if (!dirty && animated && delta < (pipeline.software ? 32 : 15)) {
      schedule();
      return;
    }
    if (dirty) measure();
    if (animated && Number.isFinite(delta)) time += Math.min(delta, 50) / 1000;
    previousFrame = now;
    const { gl } = pipeline;
    gl.uniform1f(pipeline.time, time);
    gl.uniform1f(pipeline.dark, root.dataset.theme === 'dark' ? 1 : 0);
    gl.uniform2fv(pipeline.pointer, animated && !touch.matches ? pointer : [-2000, -2000]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (root.dataset.optics !== 'active') root.dataset.optics = 'active';
    if (animated) schedule();
  }

  async function start() {
    if (!usable() || loading || pipeline) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });
    if (!gl) { unavailable = true; return; }
    loading = true;
    try {
      images ||= await Promise.all([loadImage('/glass-day.webp'), loadImage('/glass-night.webp')]);
      if (usable()) pipeline = createPipeline(gl, images);
    } catch (error) {
      if (!lost) unavailable = true;
      console.warn('Optical glass fallback', error);
    } finally {
      loading = false;
      invalidate();
    }
  }

  function sync() {
    if (!usable()) {
      delete root.dataset.optics;
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    invalidate();
    void start();
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    pipeline = undefined;
    sync();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    unavailable = false;
    sync();
  });
  window.addEventListener('resize', invalidate, { passive: true });
  document.addEventListener('scroll', invalidate, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => {
    previousFrame = -Infinity;
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else invalidate();
  });
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse') {
      pointer[0] = event.clientX;
      pointer[1] = event.clientY;
    }
  }, { passive: true });
  for (const preference of [opaque, forced, touch]) preference.addEventListener('change', sync);
  new MutationObserver(invalidate).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] });
  new MutationObserver(records => {
    if (records.some(({ target, addedNodes, removedNodes }) => target.id === 'app' || target.id === 'view' ||
      [...addedNodes, ...removedNodes].some(node => node.nodeType === 1 &&
        (node.matches('[data-lens]') || node.querySelector('[data-lens]'))))) invalidate();
  }).observe(document.body, { childList: true, subtree: true });
  resize.observe(document.body);
  sync();
})();
