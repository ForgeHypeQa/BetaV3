/* ForgeHype · page.js: the small script for service pages and the FAQ page
   nav + menu, reveals, hero image cycling, pause on hidden tab */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const showPage = () => document.body.classList.add('ready');
  requestAnimationFrame(() => requestAnimationFrame(showPage));
  setTimeout(showPage, 400);

  const nav = $('#nav'), menu = $('#menu'), toggle = $('.nav-toggle');
  /* navbar: shows while scrolling or after a tap, hides after 2 s of no movement;
     always shown at the top and the bottom of the page, while the menu is open, or while hovered/focused */
  let navTick = false, navTimer = 0, navHover = false;
  const navEdge = () => scrollY < 40 || scrollY + innerHeight >= document.documentElement.scrollHeight - 40;
  const navKeep = () => navEdge() || navHover || document.body.classList.contains('menu-open') || nav.contains(document.activeElement);
  const navWake = () => {
    nav.classList.remove('hide');
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { if (!navKeep()) nav.classList.add('hide'); }, 2000);
  };
  nav.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { navHover = true; nav.classList.remove('hide'); } });
  nav.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { navHover = false; navWake(); } });
  addEventListener('pointerdown', navWake, { passive: true });
  addEventListener('keydown', navWake);
  addEventListener('scroll', () => {
    if (navTick) return; navTick = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', scrollY > 40);
      navWake();
      navTick = false;
    });
  }, { passive: true });
  navWake();
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

  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));
  if (RM.matches) $$('.reveal').forEach(el => el.classList.add('in'));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  const media = $('#pageMedia');
  if (media && !RM.matches) {
    const imgs = $$('img', media), labels = (media.dataset.labels || '').split('|'), now = $('.now', media);
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % imgs.length;
      imgs.forEach((im, k) => im.classList.toggle('on', k === i));
      if (now) now.textContent = labels[i] || '';
    }, 4200);
  }
})();

/* video sound toggle: muted by default, tap to hear */
(() => {
  document.querySelectorAll('.sound-toggle').forEach(b => {
    const v = b.parentElement.querySelector('video');
    if (!v) return;
    b.addEventListener('click', () => {
      v.muted = !v.muted;
      if (!v.muted) { v.volume = 1; v.play().catch(() => {}); }
      b.setAttribute('aria-pressed', String(!v.muted));
      b.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
    });
  });
})();
