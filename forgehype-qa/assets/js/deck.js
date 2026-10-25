/* Deck: horizontal card carousel (services, fixes).
   Centre card full size, neighbours peek on both sides. Native swipe with snap, optional auto-advance
   (data-auto="ms"), pauses while touched, hovered or off screen. Tapping a side card brings it to the centre. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.deck').forEach(deck => {
    const track = deck.querySelector('.deck-track');
    if (!track) return;
    const cards = [...track.children], n = cards.length;
    if (n < 2) return;
    const auto = +deck.dataset.auto || 0;
    const dotsWrap = deck.querySelector('.deck-dots');
    const dots = cards.map((c, i) => {
      if (!dotsWrap) return null;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'deck-dot';
      b.setAttribute('aria-label', 'Show card ' + (i + 1) + ' of ' + n);
      b.addEventListener('click', () => { hold(); goTo(i); });
      dotsWrap.appendChild(b);
      return b;
    });
    let cur = -1, tick = false, hover = false, inView = false, holdUntil = 0, lastMove = performance.now();

    const centerOf = el => el.offsetLeft + el.offsetWidth / 2;
    const goTo = i => {
      i = (i + n) % n;
      track.scrollTo({ left: Math.round(centerOf(cards[i]) - track.clientWidth / 2), behavior: RM.matches ? 'auto' : 'smooth' });
      lastMove = performance.now();
    };
    const update = () => {
      tick = false;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bd = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(centerOf(c) - mid); if (d < bd) { bd = d; best = i; } });
      if (best === cur) return;
      cur = best;
      cards.forEach((c, i) => {
        const on = i === cur;
        c.classList.toggle('is-center', on);
        c.setAttribute('aria-hidden', String(!on));
        c.querySelectorAll('a, button').forEach(el => { el.tabIndex = on ? 0 : -1; });
      });
      dots.forEach((d, i) => d && d.classList.toggle('on', i === cur));
    };
    track.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', () => { const k = cur; cur = -1; update(); if (k >= 0) track.scrollLeft = Math.round(centerOf(cards[k]) - track.clientWidth / 2); });

    /* a tap on a side card centres it instead of following its link */
    cards.forEach((c, i) => c.addEventListener('click', e => {
      if (i === cur) return;
      e.preventDefault(); e.stopPropagation(); hold(); goTo(i);
    }, true));

    const hold = () => { holdUntil = performance.now() + 6000; };
    ['pointerdown', 'touchstart', 'wheel'].forEach(t => track.addEventListener(t, hold, { passive: true }));
    deck.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    deck.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    deck.addEventListener('focusin', hold);
    deck.querySelectorAll('.deck-arrow').forEach(b => b.addEventListener('click', () => { hold(); goTo(cur + (+b.dataset.dir || 1)); }));
    deck.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { hold(); goTo(cur + 1); }
      if (e.key === 'ArrowLeft') { hold(); goTo(cur - 1); }
    });

    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: .45 }).observe(track);
    if (auto) setInterval(() => {
      const now = performance.now();
      if (RM.matches || !inView || hover || document.hidden || now < holdUntil || now - lastMove < auto) return;
      goTo(cur + 1);
    }, 400);

    deck._goTo = i => { hold(); goTo(i); };
    deck._index = () => cur;
    const start = +(innerWidth >= 900 ? deck.dataset.startDesktop : deck.dataset.start) || 0;
    if (start) track.scrollLeft = Math.round(centerOf(cards[start]) - track.clientWidth / 2);
    update();
  });
})();
