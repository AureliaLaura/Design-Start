(() => {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const setMenu = (open) => {
        document.body.classList.toggle('is-menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        nav.setAttribute('aria-hidden', String(!open));
    };

    toggle.addEventListener('click', () => {
        setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });

    nav.addEventListener('click', (e) => {
        if (e.target.closest('a')) setMenu(false);
    });
})();

/* ---------- Hero: teks berganti otomatis ---------- */
(() => {
    const title = document.querySelector('.hero__title[data-words]');
    const rotator = title && title.querySelector('.hero__rotator');
    if (!rotator) return;

    const words = title.dataset.words.split(',').map((w) => w.trim()).filter(Boolean);
    const INTERVAL = 2800; // ms tiap kata tampil
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Bangun semua kata sekali, tiap huruf dibungkus span untuk efek stagger
    rotator.innerHTML = '';
    const els = words.map((word, i) => {
        const el = document.createElement('span');
        el.className = 'hero__word' + (i === 0 ? ' is-active' : '');
        [...word].forEach((ch, j) => {
            const c = document.createElement('span');
            c.className = 'hero__char';
            c.style.setProperty('--i', j);
            c.textContent = ch === ' ' ? ' ' : ch;
            el.appendChild(c);
        });
        rotator.appendChild(el);
        return el;
    });

    if (els.length < 2 || reduceMotion) return;

    let current = 0;
    let timer;

    const next = () => {
        const prev = els[current];
        current = (current + 1) % els.length;
        prev.classList.remove('is-active');
        prev.classList.add('is-leaving');
        els[current].classList.remove('is-leaving');
        els[current].classList.add('is-active');
        // setelah animasi keluar selesai, kembalikan ke posisi bawah tanpa terlihat
        setTimeout(() => {
            prev.style.transition = 'none';
            prev.querySelectorAll('.hero__char').forEach((c) => (c.style.transition = 'none'));
            prev.classList.remove('is-leaving');
            prev.offsetHeight; // reflow
            prev.querySelectorAll('.hero__char').forEach((c) => (c.style.transition = ''));
            prev.style.transition = '';
        }, 1200);
    };

    const start = () => { stop(); timer = setInterval(next, INTERVAL); };
    const stop = () => clearInterval(timer);

    // Hemat baterai: berhenti saat tab tidak terlihat
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    // tunggu animasi pembuka selesai sebelum kata mulai berganti
    if (document.documentElement.classList.contains('is-loading')) {
        document.addEventListener('parama:loaded', start, { once: true });
    } else {
        start();
    }
})();


/* ---------- Animasi pembuka ---------- */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('is-loading')) return;

  const MIN_TIME = 1300; // ms minimal tirai tampil
  const started = performance.now();
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    const wait = Math.max(0, MIN_TIME - (performance.now() - started));
    setTimeout(() => {
      root.classList.add('is-revealing');
      root.classList.remove('is-loading');
      document.dispatchEvent(new Event('parama:loaded'));
      // bersihkan setelah semua transisi selesai
      setTimeout(() => root.classList.remove('is-revealing'), 2200);
    }, wait);
  };

  // tunggu font siap supaya teks tidak berubah bentuk saat muncul
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(finish);
  setTimeout(finish, 3000); // cadangan kalau font lambat
})();

/* ---------- Header: sembunyi saat scroll ke bawah ---------- */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    header.classList.toggle('is-hidden', y > lastY && y > 200);
    lastY = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Animasi muncul saat di-scroll ---------- */
(() => {
  // Pecah teks .split menjadi kata, tiap kata naik dari balik masker
  document.querySelectorAll('.split').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.innerHTML = words
      .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
      .join(' ');
  });

  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    // elemen yang masuk layar bersamaan diberi jeda bertahap
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach((entry, i) => {
        entry.target.style.setProperty('--d', `${i * 0.12}s`);
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
  }, { rootMargin: '0px 0px -12% 0px' });

  items.forEach((el) => io.observe(el));
})();

/* ---------- Warna header mengikuti section ---------- */
(() => {
  const header = document.querySelector('.site-header');
  const darks = [...document.querySelectorAll('[data-theme="dark"]')];

  // cek apakah titik y (dari atas layar) sedang berada di atas section gelap
  const isDarkAt = (y) => darks.some((s) => {
    const r = s.getBoundingClientRect();
    return r.top <= y && r.bottom >= y;
  });

  const update = () => {
    if (header) header.classList.toggle('on-dark', isDarkAt(header.offsetHeight / 2));
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Foto karya bergeser halus di dalam bingkainya ---------- */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const frames = [...document.querySelectorAll('.work__media')];
  frames.forEach((f) => f.classList.add('px-img'));

  const update = () => {
    const vh = window.innerHeight;
    frames.forEach((f) => {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      // -1 saat baru masuk dari bawah, 1 saat keluar di atas
      const t = clamp((vh - r.top) / (vh + r.height));
      f.style.setProperty('--iy', (t * 2 - 1).toFixed(3));
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ---------- Scroll halus dengan inersia (khusus mouse) ---------- */
(() => {
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!mouse || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('has-smooth');

  const EASE = 0.085; // makin kecil makin "melayang"
  let target = window.scrollY;
  let current = target;
  let raf = null;

  const maxY = () => document.documentElement.scrollHeight - window.innerHeight;

  const loop = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) current = target;
    window.scrollTo(0, current);
    raf = current !== target ? requestAnimationFrame(loop) : null;
  };

  const scrollToY = (y) => {
    if (!raf) current = window.scrollY;
    target = Math.max(0, Math.min(maxY(), y));
    if (!raf) raf = requestAnimationFrame(loop);
  };

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey || document.body.classList.contains('is-menu-open')) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1;
    scrollToY((raf ? target : window.scrollY) + e.deltaY * unit);
  }, { passive: false });

  // keyboard & scrollbar tetap normal: ikuti posisi aslinya
  window.addEventListener('scroll', () => {
    if (!raf) target = current = window.scrollY;
  }, { passive: true });

  // link ke section (#tentang, #layanan, ...) ikut meluncur halus
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    const id = link && link.getAttribute('href');
    const el = id && id.length > 1 && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    scrollToY(el.getBoundingClientRect().top + window.scrollY);
    history.pushState(null, '', id);
  });
})();

/* ---------- Kursor: titik kecil + lingkaran yang menyusul ---------- */
(() => {
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!mouse) return;

  const cursor = document.createElement('div');
  cursor.className = 'cursor is-hidden';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="cursor__ring"></span><span class="cursor__dot"></span>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add('has-cursor');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = -100, y = -100, rx = -100, ry = -100, raf = null;

  const loop = () => {
    // lingkaran tertinggal sedikit dari titik
    rx += (x - rx) * (reduce ? 1 : 0.16);
    ry += (y - ry) * (reduce ? 1 : 0.16);
    cursor.style.setProperty('--rx', `${rx.toFixed(1)}px`);
    cursor.style.setProperty('--ry', `${ry.toFixed(1)}px`);
    raf = Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : null;
  };

  document.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    cursor.style.setProperty('--x', `${x}px`);
    cursor.style.setProperty('--y', `${y}px`);
    cursor.classList.remove('is-hidden');
    if (!raf) raf = requestAnimationFrame(loop);
  });

  // lingkaran membesar di atas link & tombol
  document.addEventListener('mouseover', (e) => {
    cursor.classList.toggle('is-hover', !!e.target.closest('a, button, summary, [role="button"]'));
  });

  document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
})();

/* ---------- Tahun di footer ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
