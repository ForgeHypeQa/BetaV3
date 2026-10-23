/* ForgeHype · main.js
   1 hero scrub   2 nav + menu   3 reveals + living elements   4 theme mixer (dark ↔ light by scroll)
   5 problem grid glow   6 the stack   7 service image cycling   8 about (words, marquee, clock)
   9 qatar video   10 phone stage   11 hold to forge   12 stories carousel   13 why rotator
   14 form → Web3Forms + WhatsApp   15 embers   16 reduced motion, live in both directions */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const FINE = matchMedia('(pointer: fine)');
  const COARSE = matchMedia('(pointer: coarse)');
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
    el, a: +el.dataset.a, b: +el.dataset.b, ramp: el.dataset.ramp ? +el.dataset.ramp : null, op: -1, k: -1, kl: -1, live: false
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
      const op = 1; // the single band stays on; its children step in on --k
      const k = clamp((p - b.a) / (b.ramp || (b.b - b.a)), 0, 1);
      if (op !== b.op) { b.op = op; b.el.style.opacity = '1'; }
      if (Math.abs(k - b.k) > 0.004 || (k === 1 && b.k !== 1) || (k === 0 && b.k !== 0)) { b.k = k; b.el.style.setProperty('--k', k.toFixed(3)); }
      if (Math.abs(loadK - b.kl) > 0.008 || (loadK === 1 && b.kl !== 1)) { b.kl = loadK; b.el.style.setProperty('--kl', loadK.toFixed(3)); }
      if (!b.live) { b.live = true; b.el.classList.add('live'); }
    }
    const settled = p > 0.9;
    if (settled !== stage.classList.contains('settled')) stage.classList.toggle('settled', settled);
    if (hudAlt && now !== undefined && now - lastAltAt > 100) {
      const txt = 'DESCENT ' + String(Math.round(p * 100)).padStart(2, '0') + '%';
      if (txt !== lastAlt) { lastAlt = txt; lastAltAt = now; hudAlt.textContent = txt; }
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
    bands.forEach(b => { b.op = -1; b.k = -1; b.kl = -1; });
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
  GATES.map(q => matchMedia(q)).forEach(m => m.addEventListener('change', applyHeroMode));
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
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));

  const liveIO = new IntersectionObserver(entries => entries.forEach(e => {
    e.target.classList.toggle('in', e.isIntersecting);
    e.target.classList.toggle('live-off', !e.isIntersecting);
  }), { threshold: 0 });
  $$('[data-live]').forEach(el => liveIO.observe(el));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
  // marquees: tap toggles pause (hover and focus pause in CSS)
  $$('.marquee, .flipline').forEach(m => {
    m.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') m.classList.toggle('paused'); });
    m.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); m.classList.toggle('paused'); } });
  });

  /* ================= 4. THEME MIXER: body colour follows the sections ================= */
  const root = document.documentElement;
  const DARK = { canvas: [11, 9, 8], t1: [244, 239, 233], t2: [168, 159, 150], t3: [125, 117, 109], lineC: [255, 255, 255], line: .08, lineS: .18, glass: .045, glass2: .07, panel: [20, 17, 16], panel2: [28, 24, 21] };
  const LIGHT = { canvas: [255, 246, 239], t1: [20, 17, 15], t2: [107, 100, 94], t3: [138, 130, 123], lineC: [20, 17, 15], line: .1, lineS: .2, glass: .7, glass2: .95, panel: [255, 255, 255], panel2: [255, 255, 255] };
  const themed = $$('[data-theme]');
  let bounds = [], lastMix = -1, themeTick = false;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgb = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
  function measureTheme() {
    bounds = []; let prev = null;
    themed.forEach(el => {
      if (!el.offsetParent && getComputedStyle(el).display === 'none') return;
      const t = el.dataset.theme;
      if (prev !== null && t !== prev) bounds.push({ y: el.getBoundingClientRect().top + scrollY, to: t === 'light' ? 1 : 0 });
      prev = t;
    });
    lastMix = -1; applyTheme();
  }
  function mixAt(y) {
    const vh = innerHeight; let m = 0;
    for (const b of bounds) {
      // rel: 0 = the boundary sits at the viewport bottom, 1 = at the top.
      // light sections keep their own dark text, so the canvas must be light whenever their content shows:
      // fade to light early (before the boundary scrolls in), fade back to dark late (once it nears the top)
      const rel = (y + vh - b.y) / vh;
      const t = b.to === 1 ? smoothstep(rel, -0.25, 0.08) : smoothstep(rel, 0.68, 0.98);
      m = lerp(m, b.to, t);
    }
    return m;
  }
  function applyTheme() {
    const m = mixAt(scrollY);
    if (Math.abs(m - lastMix) < 0.002 && !(m === 0 && lastMix !== 0) && !(m === 1 && lastMix !== 1)) return;
    lastMix = m;
    const tx = smoothstep(m, 0.42, 0.58); // text flips faster than the background so both stay readable
    const s = root.style;
    const c = rgb(DARK.canvas, LIGHT.canvas, m);
    s.setProperty('--mix', m.toFixed(3));
    s.setProperty('--canvas', `rgb(${c.join(',')})`); s.setProperty('--canvas-rgb', c.join(','));
    s.setProperty('--panel', `rgb(${rgb(DARK.panel, LIGHT.panel, m).join(',')})`);
    s.setProperty('--panel-2', `rgb(${rgb(DARK.panel2, LIGHT.panel2, m).join(',')})`);
    s.setProperty('--text-primary', `rgb(${rgb(DARK.t1, LIGHT.t1, tx).join(',')})`);
    s.setProperty('--text-secondary', `rgb(${rgb(DARK.t2, LIGHT.t2, tx).join(',')})`);
    s.setProperty('--text-tertiary', `rgb(${rgb(DARK.t3, LIGHT.t3, tx).join(',')})`);
    const lc = rgb(DARK.lineC, LIGHT.lineC, tx);
    s.setProperty('--line', `rgba(${lc.join(',')},${lerp(DARK.line, LIGHT.line, tx).toFixed(3)})`);
    s.setProperty('--line-strong', `rgba(${lc.join(',')},${lerp(DARK.lineS, LIGHT.lineS, tx).toFixed(3)})`);
    s.setProperty('--glass', `rgba(255,255,255,${lerp(DARK.glass, LIGHT.glass, m).toFixed(3)})`);
    s.setProperty('--glass-2', `rgba(255,255,255,${lerp(DARK.glass2, LIGHT.glass2, m).toFixed(3)})`);
  }
  function onThemeScroll() { if (themeTick) return; themeTick = true; requestAnimationFrame(() => { themeTick = false; applyTheme(); }); }
  addEventListener('scroll', onThemeScroll, { passive: true });
  addEventListener('resize', measureTheme);
  addEventListener('load', measureTheme);
  if ('ResizeObserver' in window) { let roT = null; new ResizeObserver(() => { clearTimeout(roT); roT = setTimeout(measureTheme, 120); }).observe(document.body); }
  measureTheme();

  /* ================= 5. PROBLEM GRID ================= */
  const tiles = $$('#pgrid .tile');
  if (tiles.length) {
    // the fix cards are sticky, so an anchor jump lands on the stuck position; scroll to the card's natural spot instead
    tiles.forEach(t => t.addEventListener('click', e => {
      const card = $(t.getAttribute('href')); if (!card) return;
      e.preventDefault();
      const stack = card.parentElement, cards = [...stack.children], cs = getComputedStyle(stack);
      const gap = parseFloat(cs.rowGap) || 0, navH = parseFloat(cs.getPropertyValue('--nav-h')) || 88, step = parseFloat(cs.getPropertyValue('--step')) || 14;
      let top = stack.getBoundingClientRect().top + scrollY;
      for (const c of cards) { if (c === card) break; top += c.offsetHeight + gap; }
      scrollTo({ top: Math.round(top - navH - cards.indexOf(card) * step), behavior: RM.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', t.getAttribute('href'));
    }));
  }

  /* ================= 6. THE STACK ================= */
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

  /* ================= 7. SERVICE IMAGE CYCLING ================= */
  const svcRows = $$('.svc-card').map(row => ({
    row, imgs: $$('.thumb img', row), labels: (row.dataset.labels || '').split('|'), now: $('.now', row), i: 0, vis: false
  }));
  let cycleTimer = null, cyclePos = 0;
  function showRowImage(r, idx) {
    r.i = idx % r.imgs.length;
    r.imgs.forEach((im, k) => im.classList.toggle('on', k === r.i));
    if (r.now) r.now.textContent = r.labels[r.i] || '';
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

  /* ================= 8. ABOUT: statement words, clock ================= */
  const statement = $('#statement');
  let words = [];
  if (statement) {
    const parts = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    parts.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w; s.style.setProperty('--w', (i / parts.length).toFixed(3));
      statement.appendChild(s); if (i < parts.length - 1) statement.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  }
  let stP = -1;
  function statementUpdate() {
    if (!statement || RM.matches) return;
    const r = statement.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.55), 0, 1);
    if (Math.abs(p - stP) > 0.004 || (p === 1 && stP !== 1) || (p === 0 && stP !== 0)) { stP = p; statement.style.setProperty('--p', p.toFixed(3)); }
  }
  const clock = $('#dohaClock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Qatar', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tickClock = () => { if (!document.hidden) clock.textContent = 'DOH ' + fmt.format(new Date()); };
    tickClock(); setInterval(tickClock, 1000);
  }
  // one line, flipping through everything we do
  const flipline = $('#flipline'), flipWord = $('#flipWord');
  if (flipline && flipWord) {
    const items = (flipline.dataset.items || '').split('|').map(t => t.replace(/&amp;/g, '&'));
    let fi = 0;
    flipWord.addEventListener('animationiteration', () => { fi = (fi + 1) % items.length; flipWord.textContent = items[fi]; });
    new IntersectionObserver(([e]) => flipline.classList.toggle('in', e.isIntersecting), { threshold: 0 }).observe(flipline);
  }

  /* ================= 8b. THE REEL IN THE PHONE ================= */
  const reel = $('#reel'), reelToggle = $('#reelToggle'), reelStage = $('#reelStage');
  if (reel) {
    const slides = $$('.reel-slide', reel), bars = $$('.reel-bars span', reel), cap = $('#reelCaption');
    let ri = 0, rTimer = 0, playing = !RM.matches, rVisible = false, hover = false;
    const paint = () => {
      slides.forEach((sl, j) => sl.classList.toggle('is-active', j === ri));
      bars.forEach((b, j) => { b.classList.toggle('is-done', j < ri); b.classList.toggle('is-active', j === ri && playing && !hover); });
      if (cap) cap.innerHTML = slides[ri].getAttribute('data-caption');
      reelStage.classList.toggle('reel-paused', !playing || hover);
    };
    const tick = () => { clearTimeout(rTimer); if (playing && rVisible && !hover && !document.hidden) rTimer = setTimeout(() => { ri = (ri + 1) % slides.length; paint(); tick(); }, 4200); };
    const setPlaying = v => { playing = v; reelToggle.textContent = playing ? 'Pause reel' : 'Play reel'; reelToggle.setAttribute('aria-pressed', String(!playing)); paint(); tick(); };
    reelToggle.addEventListener('click', () => setPlaying(!playing));
    reel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; paint(); tick(); } });
    reel.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; paint(); tick(); } });
    reel.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setPlaying(!playing); });
    new IntersectionObserver(([e]) => { rVisible = e.isIntersecting; tick(); }, { threshold: 0.2 }).observe(reel);
    document.addEventListener('visibilitychange', tick);
    if (RM.matches) reelToggle.textContent = 'Play reel';
    paint(); tick();
  }

  /* ================= 9. QATAR VIDEO: scroll scale + lazy play ================= */
  const qatarMedia = $('#qatarMedia');
  let qP = -1;
  function qatarUpdate() {
    if (!qatarMedia || RM.matches) return;
    const r = qatarMedia.getBoundingClientRect();
    const p = clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.5), 0, 1);
    if (Math.abs(p - qP) > 0.004 || (p === 1 && qP !== 1) || (p === 0 && qP !== 0)) { qP = p; qatarMedia.style.setProperty('--p', p.toFixed(3)); }
  }
  // videos below the fold: load and play only when near, pause when away
  $$('video.qvid, video.pvid').forEach(v => {
    v.addEventListener('error', () => v.classList.add('no-src'), true);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); }
      else v.pause();
    }, { rootMargin: '200px 0px' }).observe(v);
  });

  /* ================= 10. PHONE STAGE (reveal) ================= */
  const phoneStage = $('#phoneStage');
  if (phoneStage) new IntersectionObserver(([e]) => { if (e.isIntersecting) phoneStage.classList.add('in'); }, { threshold: 0.35 }).observe(phoneStage);

  /* ambient scroll drives (statement, qatar) */
  let ambientTick = false;
  function ambient() {
    if (ambientTick || pinned) return; ambientTick = true;
    requestAnimationFrame(() => { ambientTick = false; statementUpdate(); qatarUpdate(); });
  }
  addEventListener('scroll', ambient, { passive: true });
  addEventListener('resize', ambient);
  ambient();

  /* ================= 11. THE ORBIT: HOLD TO FORGE ================= */
  const orbit = $('#orbit'), orbitCore = $('#orbitCore'), orbitSection = $('#orbitSection');
  const coreHint = $('#coreHint'), coreStep = $('#coreStep');
  const onodes = orbit ? $$('.node', orbit) : [], olabels = orbit ? $$('.lbl', orbit) : [];
  const STEPS = ['We build.', 'We guide.', 'We stay. Until your team owns it.'];
  let heat = 0, holding = false, autoFill = false, fRaf = null, fLast = 0, forged = false, litCount = -1, stepIdx = -1;
  function setHint() { if (coreHint) coreHint.textContent = COARSE.matches ? 'Tap & hold' : 'Click & hold'; }
  function setLit(n) {
    if (n === litCount) return;
    if (n > litCount && litCount >= 0 && holding && navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    litCount = n;
    onodes.forEach((el, i) => el.classList.toggle('lit', i < n));
    olabels.forEach((el, i) => el.classList.toggle('lit', i < n));
  }
  function setStep(h) {
    const i = h <= 0 ? -1 : h < 0.34 ? 0 : h < 0.67 ? 1 : 2;
    if (i === stepIdx) return; stepIdx = i;
    if (coreStep) coreStep.textContent = i < 0 ? '' : STEPS[i];
  }
  function forgeTick(now) {
    const dt = Math.min(100, now - (fLast || now)); fLast = now;
    const filling = holding || autoFill;
    heat = clamp(heat + (filling ? dt / (autoFill ? 1600 : 3000) : -dt / 1200), 0, 1);
    orbit.style.setProperty('--heat', heat.toFixed(3));
    setLit(heat > 0.02 ? Math.min(5, Math.floor(heat * 5) + 1) : 0);
    setStep(heat);
    if (heat >= 1 && !forged) completeForge();
    const keepGoing = (filling && heat < 1) || (!filling && heat > 0 && !forged);
    if (!filling && heat > 0 && !forged) orbit.classList.add('cooling'); else orbit.classList.remove('cooling');
    if (keepGoing) fRaf = requestAnimationFrame(forgeTick); else { fRaf = null; fLast = 0; }
  }
  function completeForge() {
    forged = true; holding = false; autoFill = false; heat = 1;
    orbit.style.setProperty('--heat', '1'); setLit(5);
    orbit.classList.add('forged'); orbit.classList.remove('holding', 'cooling'); orbitSection.classList.add('forged');
    orbitCore.setAttribute('aria-pressed', 'true');
    orbitCore.setAttribute('aria-label', 'Forged. Crafted to last. Seen to shine.');
    if (navigator.vibrate && holding) { try { navigator.vibrate([20, 40, 60]); } catch (e) {} }
  }
  function holdStart(e) { if (forged) return; if (e.type === 'pointerdown' && e.button !== 0) return; if (e.type === 'pointerdown') { e.preventDefault(); try { orbitCore.setPointerCapture(e.pointerId); } catch (x) {} } holding = true; orbit.classList.add('holding'); if (fRaf === null) fRaf = requestAnimationFrame(forgeTick); }
  function holdEnd() { if (!holding) return; holding = false; orbit.classList.remove('holding'); if (fRaf === null && heat > 0) fRaf = requestAnimationFrame(forgeTick); }
  if (orbit && orbitCore) {
    setHint(); COARSE.addEventListener('change', setHint);
    if (RM.matches) completeForge();
    orbitCore.addEventListener('pointerdown', holdStart);
    orbitCore.addEventListener('pointerup', holdEnd);
    orbitCore.addEventListener('pointercancel', holdEnd);
    orbitCore.addEventListener('contextmenu', e => e.preventDefault());
    orbitCore.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); holdStart(e); } });
    orbitCore.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') holdEnd(); });
  }

  /* ================= 12. STORIES CAROUSEL ================= */
  const car = $('#carousel'), carTrack = $('#carTrack');
  if (car && carTrack && !RM.matches) {
    const items = $$('li', carTrack), n = items.length;
    items.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); carTrack.appendChild(c); });
    let idx = 0, step = 0, x = 0, timer = 0, hover = false, pressed = false, tapPaused = false, vis = false;
    let sx = 0, sy = 0, lx = 0, moved = 0, dragging = false;
    const measure = () => { step = items[1].offsetLeft - items[0].offsetLeft; };
    const setX = (v, ease) => { x = v; carTrack.classList.toggle('ease', ease); carTrack.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)'; };
    const goTo = (i, ease = true) => { idx = i; setX(-idx * step, ease); };
    // the clones let the last card slide into the first without a jump: once the eased move lands on a clone, reset silently
    carTrack.addEventListener('transitionend', e => {
      if (e.target !== carTrack || e.propertyName !== 'transform') return;
      if (idx >= n) goTo(idx - n, false);
    });
    const next = () => goTo(idx + 1);
    const prev = () => { if (idx <= 0) { goTo(n, false); void carTrack.offsetWidth; } goTo(idx - 1); };
    const arm = () => { clearInterval(timer); timer = setInterval(() => { if (vis && !hover && !pressed && !tapPaused && !document.hidden) next(); }, 3000); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) measure(); }, { threshold: 0 }).observe(car);
    addEventListener('resize', () => { measure(); goTo(idx, false); });
    $$('img', carTrack).forEach(i => i.addEventListener('load', measure, { once: true }));
    measure(); setTimeout(measure, 600); arm();
    car.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    car.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    car.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      pressed = true; dragging = false; moved = 0; sx = lx = e.clientX; sy = e.clientY;
      car.setPointerCapture(e.pointerId);
    });
    car.addEventListener('pointermove', e => {
      if (!pressed) return;
      const dx = e.clientX - lx; lx = e.clientX;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      if (!dragging && Math.abs(e.clientX - sx) > 6 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) dragging = true;
      if (dragging) { setX(x + dx, false); car.classList.add('dragging'); }
    });
    const release = e => {
      if (!pressed) return; pressed = false; car.classList.remove('dragging');
      if (dragging) {
        const d = e.clientX - sx;
        if (d < -step * 0.18) next(); else if (d > step * 0.18) prev(); else goTo(idx);
        arm();
      } else if (e.pointerType !== 'mouse' && moved < 6) { tapPaused = !tapPaused; car.classList.toggle('paused', tapPaused); }
      dragging = false;
    };
    car.addEventListener('pointerup', release);
    car.addEventListener('pointercancel', release);
    car.addEventListener('click', e => { if (moved > 6) e.preventDefault(); });
    $('#carPrev').addEventListener('click', () => { prev(); arm(); });
    $('#carNext').addEventListener('click', () => { next(); arm(); });
    car.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); arm(); } if (e.key === 'ArrowRight') { e.preventDefault(); next(); arm(); } if (e.key === ' ') { e.preventDefault(); tapPaused = !tapPaused; car.classList.toggle('paused', tapPaused); } });
    car.addEventListener('focusin', () => { hover = true; });
    car.addEventListener('focusout', () => { hover = false; });
  }

  /* ================= 13. WHY ROTATOR ================= */
  const cmp = $('#cmp');
  if (cmp && !RM.matches) {
    const pairs = $$('.pair', cmp);
    let ci = 0, timer = null, paused = false, hover = false, vis = false, outT = null;
    const show = n => {
      const old = ci; ci = (n + pairs.length) % pairs.length;
      if (old === ci) return;
      pairs[old].classList.remove('is-on'); pairs[old].classList.add('is-out');
      clearTimeout(outT); outT = setTimeout(() => pairs[old].classList.remove('is-out'), 700);
      pairs[ci].classList.add('is-on');
    };
    const arm = () => { clearInterval(timer); timer = setInterval(() => { if (vis && !paused && !hover && !document.hidden) show(ci + 1); }, 3000); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.2 }).observe(cmp);
    arm();
    cmp.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    cmp.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    let sx = 0, sy = 0, swiped = false;
    cmp.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; swiped = false; });
    cmp.addEventListener('pointerup', e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; show(dx < 0 ? ci + 1 : ci - 1); arm(); }
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { paused = !paused; cmp.classList.toggle('paused', paused); }
    });
    cmp.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(ci - 1); arm(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(ci + 1); arm(); }
      if (e.key === ' ') { e.preventDefault(); paused = !paused; cmp.classList.toggle('paused', paused); }
    });
    cmp.addEventListener('focusin', () => { hover = true; });
    cmp.addEventListener('focusout', () => { hover = false; });
  }

  /* ================= 14. FORM → WEB3FORMS + WHATSAPP ================= */
  const form = $('#bookForm');
  $$('[data-interest]').forEach(a => a.addEventListener('click', () => {
    const want = a.dataset.interest;
    const box = $$('#bookForm input[name="interest"]').find(b => b.value === want);
    if (box) box.checked = true;
  }));
  if (form) {
    const fType = $('#f-type'), fWa = $('#f-wa'), fEmail = $('#f-email');
    const mark = (el, bad) => el.closest('.field').classList.toggle('invalid', bad);
    const validate = () => {
      const badType = !fType.value;
      const badWa = fWa.value.replace(/\D/g, '').length < 6;
      const badEmail = fEmail.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.value.trim());
      mark(fType, badType); mark(fWa, badWa); mark(fEmail, badEmail);
      return !(badType || badWa || badEmail);
    };
    [fType, fWa, fEmail].forEach(el => el.addEventListener('input', () => mark(el, false)));
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate()) { const bad = $('.field.invalid .input', form); if (bad) bad.focus(); return; }
      const d = new FormData(form);
      const interests = d.getAll('interest');
      const wa = d.get('cc') + ' ' + String(d.get('whatsapp')).trim();
      const lines = ['Hi ForgeHype, I would like a free consultation.',
        'Business type: ' + d.get('type'),
        interests.length ? 'Interested in: ' + interests.join(', ') : null,
        'WhatsApp: ' + wa,
        d.get('email') ? 'Email: ' + d.get('email') : null,
        d.get('message') ? 'Notes: ' + d.get('message') : null].filter(Boolean);
      const text = lines.join('\n');
      $('#mailFallback').href = 'mailto:info@forgehype.qa?subject=' + encodeURIComponent('Free consultation request') + '&body=' + encodeURIComponent(text);
      // Web3Forms emails the lead once the hidden access_key is filled in; the WhatsApp hand-off below runs either way.
      const key = String(d.get('access_key') || '').trim();
      if (key && !d.get('botcheck')) {
        fetch('https://api.web3forms.com/submit', {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key, subject: 'Free consultation request: ' + d.get('type'), from_name: 'ForgeHype website',
            replyto: d.get('email') || undefined, business_type: d.get('type'), interests: interests.join(', ') || '-',
            whatsapp: wa, email: d.get('email') || '-', message: d.get('message') || '-', summary: text
          })
        }).catch(() => {});
      }
      const win = window.open('https://wa.me/97455879325?text=' + encodeURIComponent(text), '_blank', 'noopener');
      form.classList.add('sent');
      if (!win) $('#mailFallback').focus();
    });
  }
  const waFloat = $('#waFloat'), bookSec = $('#book');
  if (waFloat && bookSec) new IntersectionObserver(([e]) => waFloat.classList.toggle('hidden', e.isIntersecting), { threshold: 0.1 }).observe(bookSec);

  /* ================= 15. EMBERS (whisper level) ================= */
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

  /* ================= 16. REDUCED MOTION, LIVE IN BOTH DIRECTIONS ================= */
  function pinToFinalStates() {
    pinned = true;
    $$('.reveal').forEach(el => { el.classList.add('in'); io.unobserve(el); });
    if (phoneStage) phoneStage.classList.add('in');
    if (orbit && !forged) completeForge();
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    stackCards.forEach(c => { c._p = 0; c.style.setProperty('--p', '0'); });
    if (statement) statement.style.setProperty('--p', '1');
    if (qatarMedia) qatarMedia.style.setProperty('--p', '1');
    if (carTrack) { carTrack.style.transform = ''; carTrack.classList.remove('ease'); }
    if (embers) embers.stop();
    measureTheme();
  }
  function unpinFinalStates() {
    if (!pinned) return; pinned = false;
    ambient(); stackUpdate();
    if (svcRows.length && !cycleTimer) cycleTimer = setInterval(cycleTick, 1400);
    if (embers) embers.resume(); else startEmbers();
    measureTheme();
  }
  RM.addEventListener('change', e => { if (e.matches) pinToFinalStates(); else applyHeroMode(); });
  if (RM.matches) pinToFinalStates();
})();
