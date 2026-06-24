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

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.add('loaded'), 600);
  });
  // safety net in case load is slow
  setTimeout(() => document.body.classList.add('loaded'), 2600);

  /* ---------- Header on scroll + active nav ---------- */
  const header = $('.header');
  const sections = $$('section[id]');
  const navLinks = $$('.nav a[href^="#"]');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 60);

    let current = '';
    sections.forEach((sec) => {
      if (y >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach((l) =>
      l.classList.toggle('active', l.getAttribute('href') === '#' + current)
    );

    const toTop = $('.to-top');
    if (toTop) toTop.classList.toggle('show', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('.burger');
  const closeMenu = () => {
    document.body.classList.remove('menu-open', 'is-locked');
  };
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      document.body.classList.toggle('is-locked', open);
    });
  }
  $$('.mobile-menu a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], .split-text');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in-view');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Split text into words (for masthead reveals) ---------- */
  $$('.split-text').forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="word"><i>${w}</i></span>`)
      .join(' ');
    $$('.word > i', el).forEach((i, idx) => {
      i.style.transitionDelay = idx * 0.05 + 's';
    });
  });

  /* ---------- Counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dur = 1600;
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = dec
        ? val.toFixed(dec)
        : Math.round(val).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            if (!reduceMotion) animateCount(en.target);
            else en.target.textContent = parseFloat(en.target.dataset.count).toLocaleString('ru-RU');
            cio.unobserve(en.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Hero slideshow ---------- */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dots button');
  let idx = 0;
  let heroTimer;
  function showSlide(n) {
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    dots.forEach((d, i) => d.classList.toggle('active', i === n));
    idx = n;
  }
  function nextSlide() {
    showSlide((idx + 1) % slides.length);
  }
  function startHero() {
    if (slides.length > 1 && !reduceMotion) {
      clearInterval(heroTimer);
      heroTimer = setInterval(nextSlide, 6000);
    }
  }
  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      showSlide(i);
      startHero();
    })
  );
  if (slides.length) {
    showSlide(0);
    startHero();
  }

  /* ---------- Parallax ---------- */
  const parallaxEls = $$('.parallax');
  if (parallaxEls.length && !reduceMotion && !isTouch) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
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
      },
      { passive: true }
    );
  }

  /* ---------- Custom cursor ---------- */
  if (!isTouch && !reduceMotion) {
    const ring = document.createElement('div');
    const dot = document.createElement('div');
    ring.className = 'cursor';
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
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const hov = 'a, button, .gallery figure, .dir-card, input, textarea, .socials a';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hov)) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hov)) ring.classList.remove('is-hover');
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
      cur = i;
      lbImg.src = imgs[i].src;
      lbImg.alt = imgs[i].cap;
      lbCount.textContent = `${i + 1} / ${imgs.length}`;
      lb.classList.add('open');
      document.body.classList.add('is-locked');
    }
    function close() {
      lb.classList.remove('open');
      document.body.classList.remove('is-locked');
    }
    function go(d) {
      cur = (cur + d + imgs.length) % imgs.length;
      open(cur);
    }
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
    // swipe
    let sx = 0;
    lb.addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
    lb.addEventListener('touchend', (e) => {
      const d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 50) go(d > 0 ? -1 : 1);
    });
  }

  /* ---------- Callback form (front-end only; ready to wire to CRM) ---------- */
  const form = $('#callback-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = $('#form-success');
      form.querySelector('.card-form__body').style.display = 'none';
      if (success) success.classList.add('show');
      // TODO: интеграция с CRM / отправка заявки (зарезервировано брифом)
    });
  }

  /* ---------- Lazy-load full images from thumbs ---------- */
  $$('img[data-src]').forEach((img) => {
    if ('IntersectionObserver' in window) {
      const lio = new IntersectionObserver((entries, ob) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const t = en.target;
            t.src = t.dataset.src;
            t.removeAttribute('data-src');
            ob.unobserve(t);
          }
        });
      }, { rootMargin: '200px' });
      lio.observe(img);
    } else {
      img.src = img.dataset.src;
    }
  });

  /* ---------- Current year ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
