/* =========================================================
   GRAND PALACE SPORT — interactions & animations
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none),(pointer:coarse)').matches;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Preloader (with % counter) ---------- */
  const pct = $('.preloader__pct');
  if (pct) {
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(100, n + Math.random() * 14);
      pct.textContent = Math.round(n) + '%';
      if (n >= 100) clearInterval(t);
    }, 130);
  }
  window.addEventListener('load', () => setTimeout(() => document.body.classList.add('loaded'), 650));
  setTimeout(() => document.body.classList.add('loaded'), 2800);

  /* ---------- Scroll progress bar ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  /* ---------- Header / active nav / progress ---------- */
  const header = $('.header');
  const sections = $$('section[id]');
  const navLinks = $$('.nav a[href^="#"]');
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 60);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';

    let current = '';
    sections.forEach((sec) => { if (y >= sec.offsetTop - 160) current = sec.id; });
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));

    const toTop = $('.to-top');
    if (toTop) toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const closeMenu = () => document.body.classList.remove('menu-open', 'is-locked');
  if (burger) burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    document.body.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('.mobile-menu a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Split text into words ---------- */
  $$('.split-text').forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="word"><i>${w}</i></span>`).join(' ');
    $$('.word > i', el).forEach((i, idx) => (i.style.transitionDelay = idx * 0.055 + 's'));
  });

  /* ---------- Stagger children reveal ---------- */
  $$('[data-stagger]').forEach((box) => {
    Array.from(box.children).forEach((ch, i) => {
      ch.style.transitionDelay = (i % 12) * 0.07 + 's';
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], .split-text, .reveal-img, .gallery figure, .rule, .eyebrow');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dur = 1700;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const val = target * (1 - Math.pow(1 - p, 3));
      el.textContent = Math.round(val).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (!reduceMotion) animateCount(en.target);
          else en.target.textContent = parseFloat(en.target.dataset.count).toLocaleString('ru-RU');
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach((c) => cio.observe(c));
  }

  /* ---------- Hero slideshow ---------- */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dots button');
  let idx = 0, heroTimer;
  function showSlide(n) {
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
    idx = n;
  }
  function startHero() {
    if (slides.length > 1 && !reduceMotion) {
      clearInterval(heroTimer);
      heroTimer = setInterval(() => showSlide((idx + 1) % slides.length), 6000);
    }
  }
  dots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startHero(); }));
  if (slides.length) { showSlide(0); startHero(); }

  /* ---------- Hero mouse parallax ---------- */
  const hero = $('.hero');
  const heroContent = $('.hero__content');
  const heroSlides = $('.hero__slides');
  if (hero && !isTouch && !reduceMotion) {
    hero.addEventListener('mousemove', (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      if (heroSlides) heroSlides.style.transform = `translate(${cx * 18}px, ${cy * 18}px)`;
      if (heroContent) heroContent.style.transform = `translate(${cx * -12}px, ${cy * -8}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      if (heroSlides) heroSlides.style.transform = '';
      if (heroContent) heroContent.style.transform = '';
    });
  }

  /* ---------- Parallax on scroll ---------- */
  const parallaxEls = $$('.parallax');
  if ((parallaxEls.length) && !reduceMotion && !isTouch) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const vh = window.innerHeight;
          parallaxEls.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.bottom > 0 && r.top < vh) {
              const speed = parseFloat(el.dataset.speed || 0.12);
              const offset = (r.top + r.height / 2 - vh / 2) * -speed;
              el.style.transform = `translateY(${offset.toFixed(1)}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!isTouch && !reduceMotion) {
    $$('.dir-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${py * -6}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => (card.style.transform = ''));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (!isTouch && !reduceMotion) {
    $$('.btn, .magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => (el.style.transform = ''));
    });
  }

  /* ---------- Custom cursor with label ---------- */
  if (!isTouch && !reduceMotion) {
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    ring.className = 'cursor';
    ring.innerHTML = '<span class="cursor__label">Смотреть</span>';
    dot.className = 'cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.body.classList.add('has-cursor');

    let rx = 0, ry = 0, dx = 0, dy = 0;
    window.addEventListener('mousemove', (e) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx = lerp(rx, dx, 0.2); ry = lerp(ry, dy, 0.2);
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hov = 'a, button, input, textarea, .socials a';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('.gallery figure')) ring.classList.add('is-view');
      else if (e.target.closest(hov)) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('.gallery figure')) ring.classList.remove('is-view');
      else if (e.target.closest(hov)) ring.classList.remove('is-hover');
    });
    window.addEventListener('mousedown', () => ring.classList.add('is-down'));
    window.addEventListener('mouseup', () => ring.classList.remove('is-down'));
  }

  /* ---------- Lightbox gallery ---------- */
  const figures = $$('.gallery figure');
  if (figures.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox__close" aria-label="Закрыть">&#10005;</button>
      <button class="lightbox__nav prev" aria-label="Назад">&#8249;</button>
      <button class="lightbox__nav next" aria-label="Вперёд">&#8250;</button>
      <img alt="">
      <div class="lightbox__count"></div>`;
    document.body.appendChild(lb);
    const lbImg = $('img', lb);
    const lbCount = $('.lightbox__count', lb);
    const imgs = figures.map((f) => {
      const im = $('img', f);
      return { src: im.dataset.full || im.src, cap: (($('figcaption', f) || {}).textContent || '') };
    });
    let cur = 0;
    function open(i) {
      cur = i; lbImg.src = imgs[i].src; lbImg.alt = imgs[i].cap;
      lbCount.textContent = `${i + 1} / ${imgs.length}`;
      lb.classList.add('open'); document.body.classList.add('is-locked');
    }
    function close() { lb.classList.remove('open'); document.body.classList.remove('is-locked'); }
    function go(d) { cur = (cur + d + imgs.length) % imgs.length; open(cur); }
    figures.forEach((f, i) => f.addEventListener('click', () => open(i)));
    $('.lightbox__close', lb).addEventListener('click', close);
    $('.lightbox__nav.prev', lb).addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
    $('.lightbox__nav.next', lb).addEventListener('click', (e) => { e.stopPropagation(); go(1); });
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
    let sx = 0;
    lb.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener('touchend', (e) => {
      const d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 50) go(d > 0 ? -1 : 1);
    });
  }

  /* ---------- Callback form ---------- */
  const form = $('#callback-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = $('#form-success');
    const body = form.querySelector('.card-form__body');
    if (body) body.style.display = 'none';
    if (success) success.classList.add('show');
    // TODO: подключить отправку заявки в CRM / на e-mail
  });

  /* ---------- Current year ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
