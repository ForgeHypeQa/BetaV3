/* Forge hero (homepage): a particle hologram that shapes itself into what ForgeHype builds —
   globe → reels (play) → website (browser) → e-commerce (bag) → AI (chip) → growth (chart) → globe.
   Canvas 2D, no libraries: about 1,100 particles on phones, 1,800 on desktop, brand orange on black.
   Pauses when off screen or the tab is hidden; a single still frame with reduced motion.
   Tune: HOLD / MORPH (ms), the shape list, and place() for where the object sits. */
(() => {
  const cv = document.getElementById('forge'); if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => innerWidth < 721;
  const N = phone() ? 1300 : innerWidth >= 1600 ? 2800 : 2100;
  const HOLD = 2600, MORPH = 1300, SPIN = .00055;      // ms per shape, ms per change, rad per ms
  const ACC = '217,104,46', LIT = '255,158,96', HOT = '255,238,224';

  /* ---------- shapes drawn in unit space (-1..1, y down), then sampled into points ---------- */
  const rr = (c, x, y, w, h, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  const CAPS = ['', 'Websites that convert', 'Media production', 'Web portal & app', 'E-commerce', 'AI integration', 'Business growth'];
  const DRAW = [
    null,                                                     // 0: globe (computed, not drawn)
    c => {                                                    // 1: websites — browser window
      c.lineWidth = .07; rr(c, -1, -.72, 2, 1.44, .14); c.stroke();
      c.beginPath(); c.moveTo(-1, -.4); c.lineTo(1, -.4); c.stroke();
      [-.8, -.64, -.48].forEach(x => dot(c, x, -.56, .05));
      c.lineWidth = .065;
      c.beginPath(); c.moveTo(-.72, -.1); c.lineTo(.2, -.1); c.stroke();
      c.beginPath(); c.moveTo(-.72, .12); c.lineTo(-.12, .12); c.stroke();
      rr(c, -.72, .32, .52, .2, .1); c.fill();
      c.save(); c.translate(.38, .02); c.scale(.62, .62);     // cursor
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, .78); c.lineTo(.2, .6); c.lineTo(.34, .9); c.lineTo(.47, .84); c.lineTo(.34, .55); c.lineTo(.58, .55); c.closePath(); c.fill(); c.restore();
    },
    c => {                                                    // 2: media production — play
      c.lineWidth = .08; c.beginPath(); c.arc(0, 0, .9, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(-.28, -.46); c.lineTo(-.28, .46); c.lineTo(.52, 0); c.closePath(); c.fill();
    },
    c => {                                                    // 3: web portal & app — phone with app grid
      c.lineWidth = .07; rr(c, -.52, -.98, 1.04, 1.96, .18); c.stroke();
      c.lineWidth = .06; c.beginPath(); c.moveTo(-.16, -.8); c.lineTo(.16, -.8); c.stroke();
      [[-.36, -.5], [.04, -.5], [-.36, -.1], [.04, -.1]].forEach(p => { rr(c, p[0], p[1], .32, .32, .08); c.fill(); });
      c.lineWidth = .065; c.beginPath(); c.moveTo(-.34, .42); c.lineTo(.34, .42); c.moveTo(-.34, .62); c.lineTo(.1, .62); c.stroke();
    },
    c => {                                                    // 4: e-commerce — shopping bag
      c.lineWidth = .07; rr(c, -.72, -.22, 1.44, 1.12, .14); c.stroke();
      c.beginPath(); c.arc(0, -.22, .4, Math.PI, 0); c.stroke();
      c.lineWidth = .065; c.beginPath(); c.moveTo(-.2, .28); c.lineTo(-.04, .46); c.lineTo(.26, .1); c.stroke();
    },
    c => {                                                    // 5: AI integration — chip with a spark
      c.lineWidth = .07; rr(c, -.55, -.55, 1.1, 1.1, .12); c.stroke();
      c.lineWidth = .065;
      [-.3, 0, .3].forEach(t => {
        c.beginPath(); c.moveTo(t, -.55); c.lineTo(t, -.86); c.moveTo(t, .55); c.lineTo(t, .86);
        c.moveTo(-.55, t); c.lineTo(-.86, t); c.moveTo(.55, t); c.lineTo(.86, t); c.stroke();
      });
      c.beginPath(); c.moveTo(0, -.34); c.quadraticCurveTo(0, 0, .34, 0); c.quadraticCurveTo(0, 0, 0, .34);
      c.quadraticCurveTo(0, 0, -.34, 0); c.quadraticCurveTo(0, 0, 0, -.34); c.fill();
    },
    c => {                                                    // 6: business growth — rising chart with arrow
      c.lineWidth = .08; c.beginPath(); c.moveTo(-.95, .62); c.lineTo(-.45, .25); c.lineTo(-.05, .44); c.lineTo(.4, -.2); c.lineTo(.78, -.58); c.stroke();
      c.beginPath(); c.moveTo(.47, -.53); c.lineTo(.78, -.58); c.lineTo(.73, -.27); c.stroke();
      [[-.95, .62], [-.45, .25], [-.05, .44], [.4, -.2]].forEach(p => dot(c, p[0], p[1], .085));
      c.lineWidth = .05; c.beginPath(); c.moveTo(-.95, .92); c.lineTo(.95, .92); c.stroke();
    }
  ];
  const byAngle = (a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x);
  const sample = draw => {
    const S = 320, m = S / 2.3, oc = document.createElement('canvas'); oc.width = oc.height = S;
    const c = oc.getContext('2d', { willReadFrequently: true });
    c.translate(S / 2, S / 2); c.scale(m, m); c.lineCap = c.lineJoin = 'round'; c.fillStyle = c.strokeStyle = '#fff';
    draw(c);
    const d = c.getImageData(0, 0, S, S).data, pts = [];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 90) pts.push([(x + .5 - S / 2) / m, (y + .5 - S / 2) / m]);
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
    const out = [];
    for (let i = 0; i < N; i++) { const p = pts[i % pts.length]; out.push({ x: p[0] + (Math.random() - .5) * .006, y: p[1] + (Math.random() - .5) * .006, z: (Math.random() - .5) * .05 }); }
    return out.sort(byAngle);
  };
  const globe = [], GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = GA * i; const j = .965 + Math.random() * .07; globe.push({ x: Math.cos(t) * r * .92 * j, y: y * .92 * j, z: Math.sin(t) * r * .92 * j }); }
  globe.sort(byAngle);
  const SHAPES = DRAW.map(d => (d ? sample(d) : globe));

  /* ---------- particles ---------- */
  const sprite = (rgb, size) => {
    const s = document.createElement('canvas'); s.width = s.height = size; const c = s.getContext('2d');
    const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(' + rgb + ',1)'); g.addColorStop(.16, 'rgba(' + rgb + ',.95)'); g.addColorStop(.34, 'rgba(' + rgb + ',.25)'); g.addColorStop(.7, 'rgba(' + rgb + ',.04)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(0, 0, size, size); return s;
  };
  const SPR = [sprite(ACC, 64), sprite(LIT, 64), sprite(HOT, 64)];
  const P = [];
  for (let i = 0; i < N; i++) {
    const r = Math.random();
    P.push({ k: r < .8 ? 0 : r < .96 ? 1 : 2, s: .8 + Math.random() * .5, ph: Math.random() * 6.28, d: i / N, x: 0, y: 0, z: 0 });
  }
  const EMB = []; for (let i = 0; i < (phone() ? 12 : 22); i++) EMB.push({ x: 0, y: 0, v: 1, a: 0, t: 1, s: 2, w: 0 });
  const ember = e => { e.v = 3200 + Math.random() * 3200; e.x = cx + (Math.random() - .5) * R * 2.6; e.y = floorY + R * .1; e.s = 1.5 + Math.random() * 1.8; e.a = .15 + Math.random() * .3; e.w = Math.random() * 6.28; };

  /* ---------- layout ---------- */
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, R = 0, floorY = 0, lx = 0, ly = 0, LS = 0;
  const layer = document.createElement('canvas'), lc = layer.getContext('2d');
  const refl = document.createElement('canvas'), rc = refl.getContext('2d');
  const place = () => {
    const host = cv.parentElement, sec = host.parentElement; W = host.clientWidth; H = host.clientHeight;
    DPR = Math.min(devicePixelRatio || 1, phone() ? 1.5 : 2);   // soft sprites: 1.5x is plenty on phones
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (phone() || innerHeight > innerWidth) {               // phones and portrait tablets: centred between the navbar and the kicker
      const k = sec.querySelector('.kicker'), top = 104, bottom = (k ? k.offsetTop : H * .54) - 10;
      R = Math.max(40, Math.min(W * .34, (bottom - top) / 2.75)); cx = W / 2; cy = top + R * 1.02;
    } else { cx = W * .72; cy = H * .44; R = Math.min(H * .30, W * .17); }   // desktop: right of the headline
    floorY = cy + R * 1.14; LS = Math.ceil(R * 3.2); lx = cx - LS / 2; ly = cy - LS / 2;
    cap.style.left = cx + 'px'; cap.style.top = (floorY + R * .22) + 'px'; cap.style.fontSize = Math.max(15, Math.min(26, R * .11)) + 'px';
    layer.width = refl.width = Math.round(LS * DPR); layer.height = refl.height = Math.round(LS * DPR);
  };

  /* ---------- caption: one line per shape, letters forge in with the shape ---------- */
  const cap = document.createElement('p'); cap.className = 'forge-cap'; cap.setAttribute('aria-hidden', 'true'); cv.parentElement.appendChild(cap);
  let capShown = -1;
  const showCap = i => {
    if (capShown === i) return; capShown = i;
    cap.textContent = ''; cap.classList.remove('out');
    [...CAPS[i]].forEach((ch, n) => { const sp = document.createElement('span'); sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.setProperty('--i', n); cap.appendChild(sp); });
  };
  const hideCap = () => { cap.classList.add('out'); capShown = -1; };

  /* ---------- animation state ---------- */
  const q0 = /[?&]forge=(\d)/.exec(location.search);
  let idx = q0 ? Math.min(+q0[1], DRAW.length - 1) : 0, nxt = 0, morphing = false, t = 0, hold = HOLD, last = 0, mx = 0, my = 0, tx = 0, ty = 0, inView = true, raf = 0;
  const ease = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const tmp = { x: 0, y: 0, z: 0 };
  const at = (shape, i, time, o) => {
    const p = SHAPES[shape][i];
    if (shape === 0) { const a = time * SPIN, ca = Math.cos(a), sa = Math.sin(a); o.x = p.x * ca + p.z * sa; o.y = p.y; o.z = -p.x * sa + p.z * ca; }
    else { o.x = p.x; o.y = p.y; o.z = p.z; }
  };

  const frame = now => {
    const dt = Math.min(50, now - (last || now)); last = now;
    if (!RM) {
      if (morphing) { t += dt / MORPH; if (t >= .5 && capShown !== nxt) showCap(nxt); if (t >= 1) { t = 1; morphing = false; idx = nxt; hold = HOLD; } }
      else { hold -= dt; if (hold <= 0) { nxt = (idx + 1) % SHAPES.length; morphing = true; t = 0; hideCap(); } }
    }
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    const yaw = (RM ? 0 : Math.sin(now * .00045) * .3) + mx * .5, pitch = .14 + my * .3;
    const cy1 = Math.cos(yaw), sy1 = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), F = 2.6;
    const base = Math.max(5.5, R * .044);

    /* particles → layer (additive) */
    lc.setTransform(DPR, 0, 0, DPR, 0, 0); lc.clearRect(0, 0, LS, LS); lc.globalCompositeOperation = 'lighter';
    const ox = LS / 2, oy = LS / 2;
    for (let i = 0; i < N; i++) {
      const q = P[i];
      if (morphing) {
        const k = ease(Math.max(0, Math.min(1, (t - q.d * .42) / .58)));
        at(idx, i, now, tmp); const x0 = tmp.x, y0 = tmp.y, z0 = tmp.z; at(nxt, i, now, tmp);
        q.x = x0 + (tmp.x - x0) * k; q.y = y0 + (tmp.y - y0) * k; q.z = z0 + (tmp.z - z0) * k;
      } else { at(idx, i, now, tmp); q.x = tmp.x; q.y = tmp.y; q.z = tmp.z; }
      let x = q.x * cy1 + q.z * sy1, z = -q.x * sy1 + q.z * cy1, y = q.y;      // yaw
      const y2 = y * cp - z * sp; z = y * sp + z * cp; y = y2;                 // pitch
      const s = F / (F - z), sz = base * q.s * Math.pow(s, 1.4);
      const tw = .55 + .45 * Math.sin(now * .003 + q.ph);
      const lit = .42 + .58 * Math.max(0, (-x * .32 - y * .62 + z * .72));       // key light: top-left-front
      lc.globalAlpha = Math.min(1, (.3 + .7 * lit) * (q.k === 2 ? tw : .8 + .2 * tw));
      lc.drawImage(SPR[q.k], ox + x * R * s - sz / 2, oy + y * R * s - sz / 2, sz, sz);
    }
    lc.globalAlpha = 1;

    /* reflection = layer flipped and faded */
    rc.setTransform(DPR, 0, 0, DPR, 0, 0); rc.clearRect(0, 0, LS, LS); rc.globalCompositeOperation = 'source-over';
    rc.save(); rc.translate(0, LS); rc.scale(1, -1); rc.drawImage(layer, 0, 0, LS, LS); rc.restore();
    rc.globalCompositeOperation = 'destination-in';
    const fr = LS - (floorY - ly);           // the floor line, in flipped-layer rows
    const g = rc.createLinearGradient(0, fr - 2, 0, fr + R * .55);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.01, 'rgba(0,0,0,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    rc.fillStyle = g; rc.fillRect(0, 0, LS, LS);

    /* compose */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    const glow = ctx.createRadialGradient(cx, cy + R * .15, 0, cx, cy + R * .15, R * 1.75);
    glow.addColorStop(0, 'rgba(' + ACC + ',.24)'); glow.addColorStop(.45, 'rgba(' + ACC + ',.07)'); glow.addColorStop(1, 'rgba(' + ACC + ',0)');
    ctx.fillStyle = glow; ctx.fillRect(cx - R * 1.8, cy - R * 1.7, R * 3.6, R * 3.6);
    ctx.save(); ctx.translate(cx, floorY); ctx.scale(1, .11);
    const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.35);
    pool.addColorStop(0, 'rgba(' + ACC + ',.34)'); pool.addColorStop(1, 'rgba(' + ACC + ',0)');
    ctx.fillStyle = pool; ctx.fillRect(-R * 1.4, -R * 1.4, R * 2.8, R * 2.8); ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(layer, lx, ly, LS, LS);
    ctx.drawImage(refl, lx, ly + 2 * (floorY - ly) - LS, LS, LS);

    /* embers rising from the floor */
    if (!RM) for (const e of EMB) {
      e.t += dt / e.v;
      if (e.t >= 1) { e.t = 0; ember(e); }
      const y = e.y - e.t * R * 1.5, x = e.x + Math.sin(e.t * 4 + e.w) * R * .06;
      ctx.globalAlpha = e.a * Math.sin(e.t * Math.PI);
      ctx.drawImage(SPR[1], x - e.s * 1.5, y - e.s * 1.5, e.s * 3, e.s * 3);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    raf = (!RM && inView && !document.hidden) ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { if (!raf && !RM) { last = 0; raf = requestAnimationFrame(frame); } };

  place(); EMB.forEach(e => { ember(e); e.t = Math.random(); }); if (idx) showCap(idx); frame(performance.now());
  if ('ResizeObserver' in window) new ResizeObserver(() => { place(); if (RM) frame(performance.now()); }).observe(cv.parentElement);
  else addEventListener('resize', () => { place(); if (RM) frame(performance.now()); });
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) kick(); }, { threshold: .05 }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || phone()) return; tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
})();
