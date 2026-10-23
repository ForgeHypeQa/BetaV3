/* ForgeHype · main.js
   1 hero scrub (blob fetch, lerp, gated seeks, bands, five live gates)
   2 nav + menu   3 reveals + living elements   4 glass tilt + heat edge
   5 pain rail    6 pinned work rail            7 counters + process line
   8 hold to forge 9 form + WhatsApp            10 embers + reduced motion */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const FINE = matchMedia('(pointer: fine)');
  let pinned = false; // reduced-motion pin state, shared by the hero gate and the ambient drives
  const showPage = () => document.body.classList.add('ready');
  requestAnimationFrame(() => requestAnimationFrame(showPage));
  setTimeout(showPage, 400); // belt and braces: never leave the page hidden

  /* ================= 1. HERO SCRUB ================= */
  const hero = $('#hero'), stage = $('#stage'), video = $('#heroVideo');
  const posterLayer = $('.poster', stage), ring = $('.ring', stage), hudAlt = $('#hudAlt');
  const VIDEO_URL = 'assets/video/hero-scrub.mp4';
  const VIDEO_BYTES = 5625736; // real byte size of assets/video/hero-scrub.mp4, the fallback when Content-Length is missing
  const bands = $$('[data-band]', stage).map(el => ({
    el, a: +el.dataset.a, b: +el.dataset.b, ramp: el.dataset.ramp ? +el.dataset.ramp : null, op: -1, k: -1, live: false
  }));
  let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;
  let seekBusy = false, pendingTime = null, scrubOn = false, heroInit = false, videoDone = false;
  let loadK = 0, loadStart = 0, lastAlt = '', lastAltAt = 0;

  const heroProgress = () => {
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
  };
  function requestSeek(t) {
    if (!video.duration || !isFinite(t)) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true; video.currentTime = t;
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
  });
  video.addEventListener('error', () => { seekBusy = false; pendingTime = null; failVideo(); });

  function updateCaptions(p, now) {
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      const f = Math.min(0.02, (b.b - b.a) / 3);
      let op = (i === 0 ? 1 : smoothstep(p, b.a, b.a + f)) * (i === bands.length - 1 ? 1 : 1 - smoothstep(p, b.b - f, b.b));
      if (i === 0 && p > b.b) op = 0;
      if (i === bands.length - 1 && p < b.a) op = 0;
      let k = clamp((p - b.a) / (b.ramp || Math.min(0.025, (b.b - b.a) * 0.35)), 0, 1);
      if (i === 0) k = Math.max(k, loadK);
      if (Math.abs(op - b.op) > 0.004 || (op === 0 && b.op !== 0) || (op === 1 && b.op !== 1)) { b.op = op; b.el.style.opacity = op.toFixed(3); }
      if (Math.abs(k - b.k) > 0.008 || (k === 1 && b.k !== 1) || (k === 0 && b.k !== 0)) { b.k = k; b.el.style.setProperty('--k', k.toFixed(3)); }
      const live = op > 0.5;
      if (live !== b.live) { b.live = live; b.el.classList.toggle('live', live); }
    }
    const settled = p > 0.9;
    if (settled !== stage.classList.contains('settled')) stage.classList.toggle('settled', settled);
    if (hudAlt && now !== undefined) {
      if (now - lastAltAt > 100) {
        const txt = 'DESCENT ' + String(Math.round(p * 100)).padStart(2, '0') + '%';
        if (txt !== lastAlt) { lastAlt = txt; lastAltAt = now; hudAlt.textContent = txt; }
      }
    }
  }
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now)); lastTick = now;
    if (loadK < 1) { if (!loadStart) loadStart = now; loadK = Math.min(1, easeOut(clamp((now - loadStart) / 1400, 0, 1))); }
    const kf = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - kf, dt / 16.667));
    const converged = Math.abs(target - shown) < 0.0005 && loadK >= 1;
    if (converged) { shown = target; rafId = null; lastTick = 0; } else rafId = requestAnimationFrame(tick);
    if (video.duration) requestSeek(shown * video.duration);
    updateCaptions(shown, now);
  }
  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
  }
  function failVideo() {
    if (videoDone) return; videoDone = true;
    stage.classList.add('video-failed');
    if (ring) ring.style.opacity = 0;
  }
  function makeHeroInit() {
    if (heroInit) return; heroInit = true;
    posterLayer.style.backgroundImage = "url('assets/img/hero-poster.jpg')";
    let started = false;
    const start = () => { if (started) return; started = true; loadHeroBlob().catch(failVideo); };
    const img = new Image(); img.onload = start; img.onerror = start; img.src = 'assets/img/hero-poster.jpg';
    setTimeout(start, 4000);
  }
  async function loadHeroBlob() {
    if (location.protocol === 'file:') throw new Error('file protocol');
    const ctrl = new AbortController();
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error('video fetch failed');
    const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
    const reader = res.body.getReader(); const chunks = []; let got = 0, lastRing = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog); watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value); got += value.length;
      const frac = Math.min(1, got / total), now = performance.now();
      if (now - lastRing > 100 || frac === 1) { lastRing = now; ring.style.setProperty('--ld', Math.round(126 * (1 - frac))); }
    }
    clearTimeout(watchdog);
    ring.style.setProperty('--ld', 0);
    video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    video.load();
    video.addEventListener('canplay', () => {
      requestSeek(heroProgress() * video.duration);
      stage.classList.add('video-ready');
      videoDone = true;
    }, { once: true });
  }
  const GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  function enableScrub() {
    if (scrubOn) return; scrubOn = true;
    makeHeroInit();
    addEventListener('scroll', onScroll, { passive: true });
    bands.forEach(b => { b.op = -1; b.k = -1; });
    unpinFinalStates();
    updateCaptions(heroProgress(), performance.now());
    onScroll();
  }
  function disableScrub() {
    if (!scrubOn) return; scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function applyHeroMode() {
    if (GATES.some(q => matchMedia(q).matches)) disableScrub(); else enableScrub();
  }
  const MQLS = GATES.map(q => matchMedia(q));
  MQLS.forEach(m => m.addEventListener('change', applyHeroMode));
  new IntersectionObserver(([e]) => {
    heroOnScreen = e.isIntersecting;
    if (heroOnScreen && scrubOn) onScroll();
  }, { threshold: 0 }).observe(hero);
  applyHeroMode();

  /* ================= 2. NAV + MENU ================= */
  const nav = $('#nav'), menu = $('#menu'), toggle = $('.nav-toggle');
  let lastY = scrollY, navTick = false;
  addEventListener('scroll', () => {
    if (navTick) return; navTick = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      nav.classList.toggle('scrolled', y > 40);
      const hide = y > lastY + 6 && y > innerHeight * 0.6 && !document.body.classList.contains('menu-open');
      if (hide !== nav.classList.contains('hide')) nav.classList.toggle('hide', hide);
      if (Math.abs(y - lastY) > 6) lastY = y;
      navTick = false;
    });
  }, { passive: true });
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

  /* ================= 3. REVEALS + LIVING ELEMENTS ================= */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
      e.target.addEventListener('transitionend', () => e.target.classList.add('settled'), { once: true });
      setTimeout(() => e.target.classList.add('settled'), 1800);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));

  const liveIO = new IntersectionObserver(entries => entries.forEach(e => {
    e.target.classList.toggle('in', e.isIntersecting);
    e.target.classList.toggle('live-off', !e.isIntersecting);
  }), { threshold: 0 });
  $$('[data-live]').forEach(el => liveIO.observe(el));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  /* ================= 4. GLASS TILT + HEAT EDGE ================= */
  function initTilt() {
    if (!FINE.matches || RM.matches) return;
    $$('.tilt').forEach(card => {
      let raf = null, rx = 0, ry = 0, mx = 50, my = 50;
      const max = card.classList.contains('work-card') ? 5 : 8;
      card.addEventListener('pointerenter', () => card.classList.add('tilting'));
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        mx = px * 100; my = py * 100;
        ry = (px - 0.5) * 2 * max; rx = -(py - 0.5) * 2 * max;
        if (raf === null) raf = requestAnimationFrame(() => {
          raf = null;
          card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
          card.style.setProperty('--mx', mx.toFixed(1) + '%');
          card.style.setProperty('--my', my.toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  }
  initTilt();

  /* ================= 5. THE STACK + SERVICE INDEX ================= */
  const stackCards = $$('.stack-card');
  let stackTick = false;
  function stackUpdate() {
    if (stackTick) return; stackTick = true;
    requestAnimationFrame(() => {
      stackTick = false;
      if (RM.matches) return;
      for (let i = 0; i < stackCards.length - 1; i++) {
        const card = stackCards[i], next = stackCards[i + 1];
        const r = card.getBoundingClientRect(), nr = next.getBoundingClientRect();
        const p = clamp(1 - (nr.top - r.top) / Math.max(1, r.height), 0, 1);
        if (Math.abs(p - (card._p || 0)) > 0.004 || (p === 0 && card._p) || (p === 1 && card._p !== 1)) {
          card._p = p; card.style.setProperty('--p', p.toFixed(3));
        }
      }
    });
  }
  if (stackCards.length) {
    addEventListener('scroll', stackUpdate, { passive: true });
    addEventListener('resize', stackUpdate);
    stackUpdate();
  }

  const svcList = $('#svcList'), svcPreview = $('#svcPreview'), svcLabel = $('#svcPreviewLabel');
  const svcRows = svcList ? $$('.svc-row', svcList).map(row => ({
    row, imgs: $$('.thumb img', row), labels: (row.dataset.labels || '').split('|'), now: $('.now', row), i: 0, vis: false
  })) : [];
  let activeRow = null, cycleTimer = null, cyclePos = 0;
  function showRowImage(r, idx) {
    r.i = idx % r.imgs.length;
    r.imgs.forEach((im, k) => im.classList.toggle('on', k === r.i));
    if (r.now) r.now.textContent = r.labels[r.i] || '';
    if (activeRow === r) showPreview(r);
  }
  function showPreview(r) {
    if (!svcPreview) return;
    const layers = $$('img', svcPreview), cur = layers.find(l => l.classList.contains('on')) || layers[0], next = layers.find(l => l !== cur);
    const src = r.imgs[r.i].getAttribute('src');
    if (cur.getAttribute('src') === src && cur.classList.contains('on')) return;
    next.src = src; next.classList.add('on'); cur.classList.remove('on');
    if (svcLabel) svcLabel.textContent = r.labels[r.i] || '';
  }
  function cycleTick() {
    if (RM.matches || document.hidden) return;
    const visible = svcRows.filter(r => r.vis);
    if (!visible.length) return;
    const r = visible[cyclePos % visible.length]; cyclePos++;
    showRowImage(r, r.i + 1);
  }
  if (svcRows.length) {
    const rowIO = new IntersectionObserver(es => es.forEach(e => { const r = svcRows.find(x => x.row === e.target); if (r) r.vis = e.isIntersecting; }), { threshold: 0.2 });
    svcRows.forEach(r => rowIO.observe(r.row));
    if (!RM.matches) cycleTimer = setInterval(cycleTick, 1400);
  }
  if (svcList && svcPreview && FINE.matches && !RM.matches) {
    let px = 0, py = 0, tx = 0, ty = 0, vx = 0, pRaf = null, on = false;
    const w = () => svcPreview.offsetWidth, h = () => svcPreview.offsetHeight;
    const loop = () => {
      px += (tx - px) * 0.14; py += (ty - py) * 0.14;
      const rot = clamp((tx - px) * 0.04, -6, 6); vx += (rot - vx) * 0.2;
      svcPreview.style.setProperty('--x', px.toFixed(1) + 'px');
      svcPreview.style.setProperty('--y', py.toFixed(1) + 'px');
      svcPreview.style.setProperty('--r', vx.toFixed(2) + 'deg');
      if (on || Math.abs(tx - px) > 0.5 || Math.abs(ty - py) > 0.5) pRaf = requestAnimationFrame(loop); else pRaf = null;
    };
    svcList.addEventListener('pointermove', e => {
      tx = e.clientX - w() * 0.5 + 40; ty = e.clientY - h() * 0.5;
      if (pRaf === null) { px = tx; py = ty; pRaf = requestAnimationFrame(loop); }
    });
    svcRows.forEach(r => {
      r.row.addEventListener('pointerenter', () => {
        svcRows.forEach(x => x.row.classList.remove('active'));
        r.row.classList.add('active'); activeRow = r; showPreview(r);
        on = true; svcPreview.classList.add('on');
        if (pRaf === null) pRaf = requestAnimationFrame(loop);
      });
    });
    svcList.addEventListener('pointerleave', () => { on = false; activeRow = null; svcPreview.classList.remove('on'); svcRows.forEach(x => x.row.classList.remove('active')); });
  }

  /* ================= 6. PINNED WORK RAIL ================= */
  const workPin = $('#workPin'), workTrack = $('#workTrack'), workProgress = $('#workProgress');
  const WORK_STATIC = ['(max-width: 720px)', '(pointer: coarse) and (max-width: 1024px)', '(prefers-reduced-motion: reduce)'];
  let workOn = false, wTarget = 0, wShown = 0, wRaf = null, wLast = 0, wMax = 0, wLastP = -1;
  function layoutWork() {
    if (!workPin) return;
    const staticMode = WORK_STATIC.some(q => matchMedia(q).matches);
    if (staticMode) { workOn = false; workPin.style.height = ''; workTrack.style.transform = ''; return; }
    workOn = true;
    const pad = parseFloat(getComputedStyle(workTrack).paddingLeft) || 0;
    wMax = Math.max(0, workTrack.scrollWidth - innerWidth + pad);
    workPin.style.height = (innerHeight + wMax) + 'px';
    onWorkScroll();
  }
  function wTick(now) {
    const dt = Math.min(100, now - (wLast || now)); wLast = now;
    wShown += (wTarget - wShown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
    if (Math.abs(wTarget - wShown) < 0.3) { wShown = wTarget; wRaf = null; wLast = 0; } else wRaf = requestAnimationFrame(wTick);
    workTrack.style.transform = 'translate3d(' + (-wShown).toFixed(1) + 'px,0,0)';
    const p = wMax ? wShown / wMax : 0;
    if (Math.abs(p - wLastP) > 0.004) { wLastP = p; workProgress.style.setProperty('--p', p.toFixed(3)); }
  }
  function onWorkScroll() {
    if (!workOn) return;
    const r = workPin.getBoundingClientRect();
    wTarget = clamp(-r.top, 0, wMax);
    if (wRaf === null) wRaf = requestAnimationFrame(wTick);
  }
  if (workPin) {
    addEventListener('scroll', onWorkScroll, { passive: true });
    addEventListener('resize', layoutWork);
    WORK_STATIC.map(q => matchMedia(q)).forEach(m => m.addEventListener('change', layoutWork));
    $$('img', workTrack).forEach(i => i.addEventListener('load', layoutWork, { once: true }));
    layoutWork();
    setTimeout(layoutWork, 600);
  }

  /* ================= 7. COUNTERS + PROCESS LINE + PARALLAX ================= */
  function runCounter(el) {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    if (RM.matches) { el.textContent = end.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1600;
    let last = '';
    const frame = now => {
      const t = clamp((now - t0) / dur, 0, 1);
      const v = (end * easeOut(t)).toFixed(dec);
      if (v !== last) { last = v; el.textContent = v; }
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  const countIO = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); countIO.unobserve(e.target); } }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  const whyFrame = $('#whyFrame'), whyImg = whyFrame && $('img', whyFrame);
  let lastDraw = -1, lastPy = -1, ambientTick = false;
  function ambient() {
    if (ambientTick || pinned) return; ambientTick = true;
    requestAnimationFrame(() => {
      ambientTick = false;
      if (whyImg && !RM.matches) {
        const r = whyFrame.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const py = ((r.top + r.height / 2) - innerHeight / 2) / innerHeight * -40;
          if (Math.abs(py - lastPy) > 0.4) { lastPy = py; whyImg.style.setProperty('--py', py.toFixed(1) + 'px'); }
        }
      }
    });
  }
  addEventListener('scroll', ambient, { passive: true });
  ambient();

  /* ================= 8. THE ORBIT: HOLD TO FORGE ================= */
  const orbit = $('#orbit'), orbitCore = $('#orbitCore'), orbitSection = $('#orbitSection');
  const onodes = orbit ? $$('.node', orbit) : [], olabels = orbit ? $$('.lbl', orbit) : [], osteps = $$('.ostep');
  let heat = 0, holding = false, fRaf = null, fLast = 0, forged = false, litCount = -1;
  function setLit(n) {
    if (n === litCount) return; litCount = n;
    onodes.forEach((el, i) => el.classList.toggle('lit', i < n));
    olabels.forEach((el, i) => el.classList.toggle('lit', i < n));
    osteps.forEach((el, i) => el.classList.toggle('lit', i < n));
  }
  function forgeTick(now) {
    const dt = Math.min(100, now - (fLast || now)); fLast = now;
    heat = clamp(heat + (holding ? dt / 3400 : -dt / 1200), 0, 1);
    orbit.style.setProperty('--heat', heat.toFixed(3));
    setLit(Math.min(5, Math.floor(heat * 5 + 0.02)));
    if (heat >= 1 && !forged) completeForge();
    if ((holding && heat < 1) || (!holding && heat > 0 && !forged)) fRaf = requestAnimationFrame(forgeTick); else { fRaf = null; fLast = 0; }
  }
  function completeForge() {
    forged = true; holding = false; heat = 1;
    orbit.style.setProperty('--heat', '1'); setLit(5);
    orbit.classList.add('forged'); orbit.classList.remove('holding'); orbitSection.classList.add('forged');
    orbitCore.setAttribute('aria-pressed', 'true');
    orbitCore.setAttribute('aria-label', 'Forged. Crafted to last. Seen to shine.');
  }
  function holdStart(e) { if (forged) return; if (e.type === 'pointerdown' && e.button !== 0) return; if (e.type === 'pointerdown') e.preventDefault(); holding = true; orbit.classList.add('holding'); if (fRaf === null) fRaf = requestAnimationFrame(forgeTick); }
  function holdEnd() { if (!holding) return; holding = false; orbit.classList.remove('holding'); if (fRaf === null && heat > 0) fRaf = requestAnimationFrame(forgeTick); }
  if (orbit && orbitCore) {
    if (RM.matches) completeForge();
    orbitCore.addEventListener('pointerdown', holdStart);
    orbitCore.addEventListener('pointerup', holdEnd);
    orbitCore.addEventListener('pointerleave', holdEnd);
    orbitCore.addEventListener('pointercancel', holdEnd);
    orbitCore.addEventListener('contextmenu', e => e.preventDefault());
    orbitCore.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); holdStart(e); } });
    orbitCore.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') holdEnd(); });
  }

  /* ================= 9. FORM → WHATSAPP ================= */
  const form = $('#bookForm');
  $$('[data-need]').forEach(a => a.addEventListener('click', () => {
    const sel = $('#f-need'); if (!sel) return;
    const want = a.dataset.need.replace(/&amp;/g, '&');
    [...sel.options].forEach(o => { if (o.text === want) sel.value = o.value; });
  }));
  if (form) {
    const fields = { name: $('#f-name'), email: $('#f-email') };
    const validate = () => {
      let ok = true;
      Object.entries(fields).forEach(([k, el]) => {
        const bad = k === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) : !el.value.trim();
        el.closest('.field').classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      return ok;
    };
    Object.values(fields).forEach(el => el.addEventListener('input', () => el.closest('.field').classList.remove('invalid')));
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate()) { $('.field.invalid .input', form).focus(); return; }
      const d = new FormData(form);
      const lines = ['Hi ForgeHype, I would like a free audit.',
        'Name: ' + d.get('name'), 'Email: ' + d.get('email'),
        d.get('phone') ? 'Phone: ' + d.get('phone') : null,
        'Need: ' + d.get('need'), d.get('message') ? 'Notes: ' + d.get('message') : null].filter(Boolean);
      const text = lines.join('\n');
      $('#mailFallback').href = 'mailto:info@forgehype.qa?subject=' + encodeURIComponent('Free audit request') + '&body=' + encodeURIComponent(text);
      const win = window.open('https://wa.me/97455879325?text=' + encodeURIComponent(text), '_blank', 'noopener');
      form.classList.add('sent');
      if (!win) $('#mailFallback').focus();
    });
  }
  const waFloat = $('#waFloat'), bookSec = $('#book');
  if (waFloat && bookSec) new IntersectionObserver(([e]) => waFloat.classList.toggle('hidden', e.isIntersecting), { threshold: 0.2 }).observe(bookSec);

  /* ================= 10. EMBERS (whisper level) ================= */
  const canvas = $('#embers');
  let embers = null, eRaf = null, eVisible = !document.hidden;
  function startEmbers() {
    if (RM.matches || !canvas || embers) return;
    const ctx = canvas.getContext('2d'); let w, h, dpr;
    const N = 42, pts = [];
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr; };
    const spawn = (p, fresh) => { p.x = Math.random() * w; p.y = fresh ? Math.random() * h : h + 10; p.r = (0.6 + Math.random() * 1.6) * dpr; p.v = (0.08 + Math.random() * 0.22) * dpr; p.a = 0.12 + Math.random() * 0.3; p.s = Math.random() * Math.PI * 2; p.d = 0.2 + Math.random() * 0.5; };
    size(); for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); pts.push(p); }
    addEventListener('resize', size);
    let last = 0;
    const frame = now => {
      eRaf = null;
      if (!eVisible || document.hidden) return;
      const dt = Math.min(50, now - (last || now)); last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y -= p.v * dt / 16.667; p.s += 0.004 * dt / 16.667; p.x += Math.sin(p.s) * p.d * dpr * 0.3;
        if (p.y < -10) spawn(p, false);
        const a = p.a * (0.6 + 0.4 * Math.sin(p.s * 2));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,140,60,' + a.toFixed(3) + ')'; ctx.fill();
      }
      eRaf = requestAnimationFrame(frame);
    };
    embers = { resume() { if (eRaf === null) { last = 0; eRaf = requestAnimationFrame(frame); } }, stop() { if (eRaf !== null) cancelAnimationFrame(eRaf); eRaf = null; ctx.clearRect(0, 0, w, h); } };
    embers.resume();
  }
  startEmbers();
  document.addEventListener('visibilitychange', () => { eVisible = !document.hidden; if (embers) (eVisible ? embers.resume() : embers.stop()); });

  /* ================= REDUCED MOTION, LIVE IN BOTH DIRECTIONS ================= */
  function pinToFinalStates() {
    pinned = true;
    $$('[data-count]').forEach(el => { el.textContent = parseFloat(el.dataset.count).toFixed(+(el.dataset.decimals || 0)); countIO.unobserve(el); });
    $$('.reveal').forEach(el => { el.classList.add('in', 'settled'); io.unobserve(el); });
    if (orbit && !forged) completeForge();
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    stackCards.forEach(c => { c._p = 0; c.style.setProperty('--p', '0'); });
    if (embers) embers.stop();
    layoutWork();
  }
  function unpinFinalStates() {
    if (!pinned) return; pinned = false;
    lastDraw = -1; ambient(); stackUpdate();
    if (svcRows.length && !cycleTimer) cycleTimer = setInterval(cycleTick, 1400);
    if (embers) embers.resume(); else startEmbers();
    layoutWork();
  }
  RM.addEventListener('change', e => { if (e.matches) pinToFinalStates(); else applyHeroMode(); });
  if (RM.matches) pinToFinalStates();
})();
