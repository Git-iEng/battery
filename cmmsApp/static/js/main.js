/* ==========================================================
   landing-page-solar-system.js
   - Scroll reveal (replays on scroll up/down)
   - Optional: adjust initial hash scroll for fixed header
   - Optional: smooth scroll for [data-scroll-to] anchors
   ========================================================== */

/* ===== CONFIG ===== */
const SOLAR = {
  revealSelector: '.reveal-solar-system',
  inViewClass: 'in-view-solar-system',
  headerSelector: '.header',
  anchorSelector: '[data-scroll-to]'
};

/* ===== Helpers ===== */
function getHeaderOffset() {
  const header = document.querySelector(SOLAR.headerSelector);
  return header ? header.offsetHeight : 0;
}

function smoothScrollTo(targetSelector) {
  if (!targetSelector || !targetSelector.startsWith('#')) return;
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const y = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
  window.scrollTo({ top: y, behavior: 'smooth' });
}

/* ===== Scroll Reveal that re-triggers on leave ===== */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll(SOLAR.revealSelector).forEach(el => el.classList.add(SOLAR.inViewClass));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add(SOLAR.inViewClass);
      } else {
        // Remove when leaving viewport so it can animate again on return
        el.classList.remove(SOLAR.inViewClass);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(SOLAR.revealSelector).forEach(el => io.observe(el));
})();

/* ===== Smooth in-page scrolling for elements with [data-scroll-to] ===== */
(function initSmoothAnchors() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(SOLAR.anchorSelector);
    if (!trigger) return;

    const href = trigger.getAttribute('href');
    const dataTarget = trigger.getAttribute('data-target');
    const targetSelector = dataTarget || href;

    if (targetSelector && targetSelector.startsWith('#')) {
      e.preventDefault();
      smoothScrollTo(targetSelector);
    }
  });

  // If the page loads with a hash, fix initial position for fixed header
  window.addEventListener('load', () => {
    if (window.location.hash) {
      // Wait a tick so layout is ready
      setTimeout(() => smoothScrollTo(window.location.hash), 0);
    }
  });
})();

/* ==========================================================
   Logos pager (dots) + continuous marquee coexist (robust)
   ========================================================== */
(function initLogosPager() {
  const wrap = document.querySelector('.logos-wrap-solar-system');
  const track = document.getElementById('logos-track-solar-system');
  const dotsWrap = document.getElementById('dots-solar-system');
  if (!wrap || !track || !dotsWrap) return;

  const dots = Array.from(dotsWrap.querySelectorAll('.dot-solar-system'));
  const RESUME_DELAY = 3500; // ms after click before continuous scroll resumes
  let resumeTimer = null;

  // set active dot helper
  function setActiveDot(idx) {
    dots.forEach((d, i) => d.classList.toggle('is-active-solar-system', i === idx));
  }
  setActiveDot(0);

  // compute page width (use visible viewport of the logos)
  function pageWidth() { return wrap.clientWidth; }

  // Fully disable CSS animation and let us control transform
  function enterManualMode() {
    track.classList.add('manual-solar-system');
    track.style.animationPlayState = 'paused';
  }

  // Resume CSS animation from the start smoothly
  function resumeContinuous() {
    // remove manual transform + class and restart animation cleanly
    track.style.transform = '';
    track.classList.remove('manual-solar-system');

    // Restart the CSS animation reliably (toggle to 'none' then back)
    const prevAnim = getComputedStyle(track).animation;
    track.style.animation = 'none';
    // force reflow
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    // restore whatever animation was in CSS
    track.style.animation = prevAnim;
    track.style.animationPlayState = 'running';
  }

  // Jump to page n by translating the track
  function goToPage(n) {
    const idx = Math.max(0, Math.min(n, dots.length - 1));
    setActiveDot(idx);

    enterManualMode();

    const offset = -idx * pageWidth();
    track.style.transform = `translateX(${offset}px)`;

    // schedule resume
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(resumeContinuous, RESUME_DELAY);
  }

  // Click handlers on dots
  dots.forEach(d => {
    d.addEventListener('click', () => {
      const n = parseInt(d.getAttribute('data-page') || '0', 10);
      goToPage(n);
    });
  });

  // Maintain the same page on resize while paused
  const ro = new ResizeObserver(() => {
    const active = dots.findIndex(el => el.classList.contains('is-active-solar-system'));
    if (active > -1 && track.classList.contains('manual-solar-system')) {
      track.style.transform = `translateX(${-active * pageWidth()}px)`;
    }
  });
  ro.observe(wwrap = wrap); // observe container width changes

  // Also pause marquee on hover (optional, keeps prior UX)
  wrap.addEventListener('mouseenter', () => {
    if (!track.classList.contains('manual-solar-system')) {
      track.style.animationPlayState = 'paused';
    }
  });
  wrap.addEventListener('mouseleave', () => {
    if (!track.classList.contains('manual-solar-system')) {
      track.style.animationPlayState = 'running';
    }
  });
})();


/* ==========================================================
   Count-up animation for Impact stats
   ========================================================== */
(function initImpactCounters() {
  const items = document.querySelectorAll('.stat-value-solar-system-impact');
  if (!items.length) return;

  function countTo(el) {
    const end = parseFloat(el.getAttribute('data-count-to')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400; // ms (slow & smooth)
    const startTime = performance.now();

    function tick(now) {
      const p = Math.min(1, (now - startTime) / duration);
      // easeOutCubic for a nice finish
      const eased = 1 - Math.pow(1 - p, 3);
      let val = end * eased;

      // If the end has decimals, keep one decimal, else integer
      const hasDecimal = String(end).includes('.');
      el.textContent = prefix + (hasDecimal ? val.toFixed(1) : Math.round(val)) + suffix;

      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (hasDecimal ? end.toFixed(1) : Math.round(end)) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // start counting when visible
        countTo(el);
      } else {
        // reset so it can play again on re-enter
        el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
      }
    });
  }, { threshold: 0.35 });

  items.forEach(el => {
    // initialize to 0 with prefix/suffix
    el.textContent = (el.getAttribute('data-prefix') || '') + '0' + (el.getAttribute('data-suffix') || '');
    io.observe(el);
  });
})();
/* ==========================================================
   Solutions: "View All Solutions" toggle
   ========================================================== */
(function initSolutionsToggle() {
  const grid = document.getElementById('solutions-grid-solar-system-solution');
  const btn = document.getElementById('solutions-toggle-btn-solar-system-solution');
  if (!grid || !btn) return;

  function setState(expanded) {
    grid.classList.toggle('is-collapsed-solar-system-solution', !expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    btn.textContent = expanded ? 'View Fewer' : 'View All Solutions';

    // Nudge IntersectionObserver so reveal animations can trigger for newly shown cards
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'));
    });
  }

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    setState(!expanded);
  });

  // default collapsed on load
  setState(false);
})();
/* ==========================================================
   Solar App: lightweight tilt/parallax for media cards
   Targets elements with [data-tilt]
   ========================================================== */
(function initSolarAppTilt() {
  const els = document.querySelectorAll('[data-tilt]');
  if (!els.length) return;

  const MAX_TILT = 8;         // degrees
  const MAX_TRANS = 10;       // px translate for parallax feel
  const EASE = 'cubic-bezier(.2,.65,.2,1)';

  function applyTilt(el, e) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = (+dy * MAX_TILT).toFixed(2);
    const rotY = (-dx * MAX_TILT).toFixed(2);
    const tx = (-dx * MAX_TRANS).toFixed(2);
    const ty = (-dy * MAX_TRANS).toFixed(2);

    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${tx}px, ${ty}px)`;
    el.style.transition = 'transform .08s';
  }

  function resetTilt(el) {
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translate(0,0)';
    el.style.transition = `transform .5s ${EASE}`;
  }

  els.forEach(el => {
    el.addEventListener('pointermove', (e) => applyTilt(el, e));
    el.addEventListener('pointerleave', () => resetTilt(el));
    el.addEventListener('pointerdown', () => resetTilt(el)); // prevent sticky tilt on touch
  });
})();


/* ==========================================================
   Projects carousel: arrows scroll by one full "page"
   ========================================================== */
(function initProjectsCarousel() {
  const viewport = document.getElementById('projects-viewport-solar-system-projects');
  const prevBtn = document.querySelector('.prev-solar-system-projects');
  const nextBtn = document.querySelector('.next-solar-system-projects');
  if (!viewport || !prevBtn || !nextBtn) return;

  function updateButtons() {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 0;
    const atEnd = viewport.scrollLeft >= maxScroll - 1;
    prevBtn.disabled = atStart;
    nextBtn.disabled = atEnd;
  }

  function scrollPage(dir) {
    const distance = viewport.clientWidth; // page = visible width
    viewport.scrollBy({ left: dir * distance, behavior: 'smooth' });
    // optimistic button state; will correct on 'scroll' event
    setTimeout(updateButtons, 350);
  }

  prevBtn.addEventListener('click', () => scrollPage(-1));
  nextBtn.addEventListener('click', () => scrollPage(1));

  // keep buttons in sync
  viewport.addEventListener('scroll', () => {
    // debounced update
    window.clearTimeout(viewport._btnTimer);
    viewport._btnTimer = setTimeout(updateButtons, 80);
  });
  window.addEventListener('resize', updateButtons);

  // init
  updateButtons();
})();
// 
/* ==========================================================
   Types tabs: click/keyboard + hash support
   ========================================================== */
(function initSolarTypes() {
  const tabs = Array.from(document.querySelectorAll('.tab-btn-solar-system-types'));
  const panels = {
    'on-grid': document.getElementById('panel-on-grid-solar-system-types'),
    'off-grid': document.getElementById('panel-off-grid-solar-system-types'),
    'hybrid': document.getElementById('panel-hybrid-solar-system-types')
  };
  if (!tabs.length) return;

  function activate(type) {
    // tabs
    tabs.forEach(btn => {
      const isActive = btn.dataset.type === type;
      btn.classList.toggle('is-active-solar-system-types', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      // tabindex for roving focus
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    // panels
    Object.entries(panels).forEach(([key, el]) => {
      const show = key === type;
      if (!el) return;
      el.classList.toggle('is-active-solar-system-types', show);
      el.hidden = !show;
      if (show) {
        // restart small fade-in animation
        el.style.animation = 'none'; el.offsetHeight; el.style.animation = '';
      }
    });
  }

  // Click
  tabs.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.type)));

  // Keyboard: left/right arrows
  document.querySelector('.tabs-solar-system-types')?.addEventListener('keydown', (e) => {
    const idx = tabs.findIndex(b => b.classList.contains('is-active-solar-system-types'));
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (idx + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    }
  });

  // Hash support e.g. #hybrid
  function fromHash() {
    const h = (location.hash || '').replace('#', '').toLowerCase();
    if (['on-grid', 'off-grid', 'hybrid'].includes(h)) activate(h);
  }
  window.addEventListener('hashchange', fromHash);

  // init
  activate('on-grid');
  fromHash();
})();
/* ==========================================================
   Scoped tabs for all .section-types-solar-system-types
   (no global getElementById; supports multiple instances)
   ========================================================== */
(function initAllSolarTypeTabs() {
  document.querySelectorAll('.section-types-solar-system-types').forEach(section => {
    const tabsWrap = section.querySelector('.tabs-solar-system-types');
    if (!tabsWrap) return;

    const tabs = Array.from(section.querySelectorAll('.tab-btn-solar-system-types'));
    const panels = Array.from(section.querySelectorAll('.panel-solar-system-types'));
    if (!tabs.length || !panels.length) return;

    function activate(btn) {
      // Tabs state
      tabs.forEach(t => {
        const isActive = t === btn;
        t.classList.toggle('is-active-solar-system-types', isActive);
        t.setAttribute('aria-selected', String(isActive));
        t.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Panels state (scoped within this section)
      const targetId = btn.getAttribute('aria-controls');
      panels.forEach(p => {
        const show = p.id === targetId;
        p.hidden = !show;
        p.classList.toggle('is-active-solar-system-types', show);
        if (show) { p.style.animation = 'none'; p.offsetHeight; p.style.animation = ''; }
      });
    }

    // Click to activate
    tabs.forEach(btn => btn.addEventListener('click', () => activate(btn)));

    // Keyboard: Left/Right arrows within this tablist
    tabsWrap.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const current = tabs.findIndex(t => t.classList.contains('is-active-solar-system-types'));
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (current + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next]);
    });

    // Init: use the one marked active or the first
    activate(tabs.find(t => t.classList.contains('is-active-solar-system-types')) || tabs[0]);
  });
})();

/* IntersectionObserver reveal - shows elements when they enter the viewport,
   hides them again when they leave (works on scroll down and up). */
(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible-mobility'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible-mobility');
      } else {
        entry.target.classList.remove('is-visible-mobility');
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.-gemini-tab');
  const contents = document.querySelectorAll('.-gemini-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to the clicked tab
      tab.classList.add('active');

      // Find the corresponding content using the data-tab attribute
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-content`);

      // Add active class to the content
      if (content) {
        content.classList.add('active');
      }
    });
  });

  // Set the default active tab and content on page load
  const defaultTab = document.querySelector('.-gemini-tab[data-tab="mission"]');
  const defaultContent = document.getElementById('mission-content');

  if (defaultTab && defaultContent) {
    defaultTab.classList.add('active');
    defaultContent.classList.add('active');
  }
});

(function () {
  const grid = document.getElementById('grid-neplan-card-with-animation');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card-neplan-card-with-animation');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-neplan-card-with-animation');
      } else {
        // remove so it replays when scrolling back (LIFO feel)
        e.target.classList.remove('show-neplan-card-with-animation');
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => io.observe(c));
})();


(() => {
  const SELECTOR = '.reveal-left, .reveal-right, .reveal-up, .reveal-down';

  // Apply per-element delay from data attribute if provided
  document.querySelectorAll(SELECTOR).forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', /^\d+$/.test(d) ? `${d}ms` : d);
  });

  // Auto-stagger children inside a .reveal-group
  document.querySelectorAll('.reveal-group[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 120; // ms
    let i = 0;
    group.querySelectorAll(SELECTOR).forEach(el => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
      i++;
    });
  });

  // Observe and toggle visibility (replays when scrolling back unless .reveal-once)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      else if (!target.classList.contains('reveal-once'))
        target.classList.remove('is-visible');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
})();

/* Intersection Observer for gentle reveals */
(function () {
  const items = document.querySelectorAll('.reveal-lv-electrical-panel-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-panel-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(el => io.observe(el));

  /* Simple form handler (prevent empty submit in demo) */
  const form = document.getElementById('service-form-lv-electrical-panel-');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    // You can hook this to your backend
    alert(`Thanks ${fd.get('name') || ''}! We’ll contact you soon.`);
    form.reset();
  });
})();

/* IntersectionObserver reveal - shows elements when they enter the viewport,
   hides them again when they leave (works on scroll down and up). */
(function () {
  const els = document.querySelectorAll('.reveal-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('is-visible-mobility'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible-mobility');
      } else {
        entry.target.classList.remove('is-visible-mobility');
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();


document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.-gemini-tab');
  const contents = document.querySelectorAll('.-gemini-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      // Add active class to the clicked tab
      tab.classList.add('active');

      // Find the corresponding content using the data-tab attribute
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(`${tabId}-content`);

      // Add active class to the content
      if (content) {
        content.classList.add('active');
      }
    });
  });

  // Set the default active tab and content on page load
  const defaultTab = document.querySelector('.-gemini-tab[data-tab="mission"]');
  const defaultContent = document.getElementById('mission-content');

  if (defaultTab && defaultContent) {
    defaultTab.classList.add('active');
    defaultContent.classList.add('active');
  }
});

(function () {
  const grid = document.getElementById('grid-neplan-card-with-animation');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card-neplan-card-with-animation');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show-neplan-card-with-animation');
      } else {
        // remove so it replays when scrolling back (LIFO feel)
        e.target.classList.remove('show-neplan-card-with-animation');
      }
    });
  }, { threshold: 0.18 });

  cards.forEach(c => io.observe(c));
})();


(() => {
  const SELECTOR = '.reveal-left, .reveal-right, .reveal-up, .reveal-down';

  // Apply per-element delay from data attribute if provided
  document.querySelectorAll(SELECTOR).forEach(el => {
    const d = el.getAttribute('data-reveal-delay');
    if (d) el.style.setProperty('--reveal-delay', /^\d+$/.test(d) ? `${d}ms` : d);
  });

  // Auto-stagger children inside a .reveal-group
  document.querySelectorAll('.reveal-group[data-reveal-stagger]').forEach(group => {
    const step = parseInt(group.dataset.revealStagger, 10) || 120; // ms
    let i = 0;
    group.querySelectorAll(SELECTOR).forEach(el => {
      el.style.setProperty('--reveal-delay', `${i * step}ms`);
      i++;
    });
  });

  // Observe and toggle visibility (replays when scrolling back unless .reveal-once)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      else if (!target.classList.contains('reveal-once'))
        target.classList.remove('is-visible');
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(SELECTOR).forEach(el => io.observe(el));
})();

/* Simple reveal on scroll */
(() => {
  const els = document.querySelectorAll('.reveal-lv-electrical-panel-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-panel-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  els.forEach(el => io.observe(el));
})();

// Reveal on scroll for the About section
(() => {
  const items = document.querySelectorAll('.reveal-lv-electrical-about-');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-about-');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-services');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => io.observe(el));
})();
// Simple reveal on scroll for the process section
(() => {
  const els = document.querySelectorAll(
    '.reveal-left-lv-electrical-process, .reveal-right-lv-electrical-process'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in-lv-electrical-process');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
})();
// Reveal-on-scroll for the Why Choose Us section
(() => {
  const targets = document.querySelectorAll(
    '.reveal-left-le-electrical-why-us, .reveal-right-le-electrical-why-us, .reveal-top-le-electrical-why-us, .reveal-bottom-le-electrical-why-us'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in-le-electrical-why-us');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  targets.forEach(t => io.observe(t));
})();

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('servicesGrid');
  const detail = document.getElementById('svcDetail');
  const exploreBtn = document.getElementById('exploreServicesBtn'); // header button if present

  if (!grid || !detail) return;

  // --- DETAILS CONTENT MAP ---
  const detailsMap = {
    liion: {
      title: 'Lithium-ion Battery Systems',
      body: `
    <p>
      <strong>Lithium-ion (Li-ion) battery systems</strong> provide high energy density, low self-discharge,
      and excellent cycle life—making them the preferred choice for portable electronics, EV/HEV platforms,
      and stationary energy storage from <strong>kW to MW</strong> scale. Our solutions are engineered for
      safety, performance, and fast integration in cabinets or communication racks.
    </p>

    <h4>Key Advantages</h4>
    <ul>
      <li><strong>Best energy-to-weight ratio:</strong> compact footprint with high usable capacity.</li>
      <li><strong>Low self-discharge:</strong> slow loss of charge when idle; ready when needed.</li>
      <li><strong>Fast charge & high round-trip efficiency:</strong> reduced downtime, lower losses.</li>
      <li><strong>Smart BMS:</strong> cell balancing, protection, telemetry & alarms.</li>
      <li><strong>Long service life:</strong> extended cycle and calendar life with warranty options.</li>
      <li><strong>Safe integration:</strong> cabinet/rack mounting with ventilation & access for maintenance.</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li><strong>Commercial & Industrial ESS:</strong> peak-shaving, backup, load-shifting, and PV self-consumption.</li>
      <li><strong>Renewables & Microgrids:</strong> smoothing, firming, black-start, and islanded operation.</li>
      <li><strong>EV/HEV & e-Mobility:</strong> traction batteries and fast-charge buffer systems.</li>
      <li><strong>Data Centers & Healthcare:</strong> clean, reliable backup with rapid response.</li>
      <li><strong>Telecom & Utilities:</strong> DC plants, substation support, and remote sites.</li>
    </ul>

    <h4>Where They Are Used</h4>
    <ul>
      <li><strong>Battery Cabinets & Racks:</strong> modular packs with BMS in controlled enclosures.</li>
      <li><strong>Cabinet Energy Storage:</strong> integrated PCS/EMS for turnkey indoor deployments.</li>
      <li><strong>Transportation:</strong> electric cars and three-wheel EVs requiring high power density.</li>
      <li><strong>Buildings & Campuses:</strong> backup power, resilience, and energy cost optimization.</li>
    </ul>
  `,
      image: { src: '../static/images/types/type1.avif', alt: 'Lithium-ion battery cabinet and racks' }
    },
    agm: {
       title: 'AGM VRLA Batteries',
  body: `
    <p>
      <strong>AGM VRLA (Absorbent Glass Mat, Valve-Regulated Lead-Acid)</strong> batteries trap electrolyte
      in a fiberglass separator, enabling sealed, spill-proof operation with low maintenance. They deliver
      high surge currents, dependable standby performance, and stable operation across a wide temperature range.
    </p>

    <h4>Key Advantages</h4>
    <ul>
      <li><strong>Maintenance-free & sealed:</strong> no topping up; spill-proof, transport-friendly.</li>
      <li><strong>High discharge capability:</strong> strong cranking / UPS surge performance.</li>
      <li><strong>Lower internal resistance:</strong> better voltage stability under load.</li>
      <li><strong>Faster charge acceptance:</strong> shorter recovery times than flooded lead-acid.</li>
      <li><strong>Low self-discharge:</strong> long shelf life and dependable standby readiness.</li>
      <li><strong>Rugged build:</strong> vibration-resistant, suited to mobile and industrial use.</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li><strong>UPS & Data Centers:</strong> reliable backup with predictable runtime.</li>
      <li><strong>Telecom & Networks:</strong> 48 V DC plants, outdoor cabinets, remote sites.</li>
      <li><strong>Security & Fire Systems:</strong> standby power for critical infrastructure.</li>
      <li><strong>Renewables & Off-grid:</strong> solar storage, hybrid systems.</li>
      <li><strong>Mobility & Industrial:</strong> forklifts, AGVs, marine, and auxiliary power.</li>
    </ul>

    <h4>Where They Are Used</h4>
    <ul>
      <li><strong>Cabinets / Racks:</strong> easy access, front-terminal options for fast service.</li>
      <li><strong>Battery Rooms:</strong> strings with monitoring for long-duration standby.</li>
      <li><strong>Outdoor Enclosures:</strong> temperature-tolerant designs for field deployments.</li>
    </ul>
  `,
  image: { src: '../static/images/types/type2.avif', alt: 'AGM VRLA battery cabinet and racks' }
    },
    gel: {
      
  title: 'Solar GEL Batteries',
  body: `
    <p>
      <strong>Solar GEL (Valve-Regulated Lead-Acid)</strong> batteries use a silica-gelled electrolyte,
      delivering safe, spill-proof operation with excellent <em>deep-cycle</em> performance and long life
      in harsh outdoor environments. They’re ideal for solar and hybrid systems that cycle daily.
    </p>

    <h4>Key Advantages</h4>
    <ul>
      <li><strong>Maintenance-free & sealed:</strong> no topping up; non-spill, safe handling.</li>
      <li><strong>Deep-cycle durability:</strong> strong cycle life under regular charge/discharge.</li>
      <li><strong>Wide temperature tolerance:</strong> reliable in hot/cold, outdoor conditions.</li>
      <li><strong>Low self-discharge:</strong> dependable standby readiness for remote sites.</li>
      <li><strong>Resists vibration & shock:</strong> suited to field and cabinet installations.</li>
      <li><strong>Flexible mounting:</strong> cabinet, rack or enclosure with natural/forced ventilation.</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li><strong>Solar & Off-Grid:</strong> homes, telecom shelters, remote monitoring, microgrids.</li>
      <li><strong>Hybrid systems:</strong> PV + genset/utility buffering and load-shifting.</li>
      <li><strong>Public lighting:</strong> solar street & area lighting, signage.</li>
      <li><strong>UPS with frequent cycling:</strong> sites with unstable grid supply.</li>
    </ul>

    <h4>Where They Are Used</h4>
    <ul>
      <li><strong>Cabinets / Racks:</strong> compact banks with easy access and service.</li>
      <li><strong>Outdoor enclosures:</strong> IP-rated, ventilated housings for heat management.</li>
      <li><strong>Energy storage arrays:</strong> cabinet ESS and wall/floor-mount systems.</li>
    </ul>
  `,
  image: { src: '../static/images/types/type3.avif', alt: 'Solar GEL battery cabinet and racks' }
    },
    cabinets: {
  title: 'Cabinet & Rack Energy Storage',
  body: `
    <p>
      Factory-built <strong>cabinet and rack energy storage</strong> systems that scale from kWh to MWh.
      Designed for fast installation, safe operation, and easy service in <em>indoor electrical rooms,
      data/telecom racks, and outdoor enclosures</em>.
    </p>

    <h4>Key Advantages</h4>
    <ul>
      <li><strong>Modular & scalable:</strong> hot-swappable modules; quick capacity expansion.</li>
      <li><strong>Integrated BMS:</strong> cell balancing, SOH/SOC, alarms, remote monitoring.</li>
      <li><strong>Safety & compliance:</strong> ventilated designs to <em>AS/NZS 2676.2</em>, IP-rated options, lockable access.</li>
      <li><strong>Thermal management:</strong> natural/forced ventilation or active cooling options.</li>
      <li><strong>Flexible chemistries:</strong> Lithium-ion (LFP/NMC), AGM VRLA, Solar GEL.</li>
      <li><strong>Rapid install:</strong> pre-wired harnesses, labelled terminations, clearances & lifting points.</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li><strong>Commercial backup & peak-shaving:</strong> ride-through, tariff optimisation, demand charge reduction.</li>
      <li><strong>Telecom & IT:</strong> 19″/21″ rack UPS strings, edge sites, micro-data rooms.</li>
      <li><strong>Solar & hybrid systems:</strong> PV self-consumption, microgrids, genset optimisation.</li>
      <li><strong>EV charging buffer:</strong> depot forecourts; grid impact mitigation.</li>
      <li><strong>Industrial process:</strong> controls, safety systems, and critical loads.</li>
    </ul>

    <h4>Deployment Options</h4>
    <ul>
      <li><strong>Cabinet ESS:</strong> floor-standing, wall-mount tabs, cable entries top/bottom.</li>
      <li><strong>Rack ESS:</strong> 6–48U frames, front-serviceable drawers, busbars & isolators.</li>
      <li><strong>Outdoor enclosures:</strong> IP21–IP55, corrosion-resistant, forced-air/AC, fire detection/suppression (optional).</li>
    </ul>
  `,
  image: { src: '../static/images/types/type4.avif', alt: 'Battery cabinet and rack energy storage system' }
    },
    ev:{
  title: 'EV Traction Batteries',
  body: `
    <p>
      High-performance <strong>EV traction batteries</strong> designed to power BEV/HEV drivetrains with
      optimal energy density, safety, and cycle life. Built around automotive-grade cells with
      advanced BMS for real-time protection and telemetry.
    </p>

    <h4>Key Advantages</h4>
    <ul>
      <li><strong>Energy density &amp; power:</strong> fast charge/discharge, strong acceleration support.</li>
      <li><strong>Safety first:</strong> multi-level BMS (cell/pack), thermal sensors, contactor logic, fault isolation.</li>
      <li><strong>Long life:</strong> high cycle count with optimized DoD &amp; temperature management.</li>
      <li><strong>Thermal management:</strong> air/liquid cooling options for consistent performance.</li>
      <li><strong>Comms &amp; control:</strong> CAN/RS485 for VCU, charger, and telematics integration.</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li><strong>Battery Electric Vehicles (BEV)</strong> – cars, buses, trucks, material handling.</li>
      <li><strong>Hybrid Electric Vehicles (HEV/PHEV)</strong> – traction + regenerative braking storage.</li>
      <li><strong>Light electric mobility</strong> – three-wheelers, utility carts, last-mile delivery.</li>
    </ul>

    <h4>Integration &amp; Services</h4>
    <ul>
      <li>Pack design (LFP/NMC), module layout, enclosure &amp; interlocks.</li>
      <li>Charger matching (on-board / off-board), HVIL, ISO standards alignment.</li>
      <li>Diagnostics, commissioning, and lifecycle support.</li>
    </ul>
  `,
  image: { src: '../static/images/types/type5.avif', alt: 'EV traction battery pack' }
    },
    charger:  {
  title: 'Chargers & Enclosures',
  body: `
    <p>
      Robust <strong>charger cabinets &amp; enclosures</strong> engineered for industrial and commercial battery systems.
      Designed for safety, airflow and serviceability, with compliant layouts for chargers and battery banks.
    </p>

    <h4>Key Features</h4>
    <ul>
      <li><strong>Standards:</strong> ventilation and construction in line with <strong>AS/NZS 2676.2</strong>.</li>
      <li><strong>Thermal &amp; airflow:</strong> louvered/filtered paths, fan-assisted options for heat management.</li>
      <li><strong>Ingress protection:</strong> IP-rated finishes (e.g., IP21) with durable powder coat.</li>
      <li><strong>Mounting:</strong> floor standing with wall-mount tabs; service-friendly clearances.</li>
      <li><strong>Capacity:</strong> layouts for <em>4 × L6V110</em> plus charger (and other common bank sizes).</li>
      <li><strong>Wiring &amp; safety:</strong> cable management, gland plates, lockable doors, interlocks, labels.</li>
      <li><strong>Options:</strong> meters, alarms, drip trays, drip shields, spill containment, custom colors.</li>
    </ul>

    <h4>Typical Use Cases</h4>
    <ul>
      <li>UPS and DC systems in data centers &amp; hospitals</li>
      <li>Industrial plants, utilities &amp; telecom rooms</li>
      <li>Solar/BESS rooms and charger rooms</li>
    </ul>

    <h4>Example Build</h4>
    <ul>
      <li>Battery housing for <em>4 × L6V110</em> and charger</li>
      <li>Grey tray, white powder coated, IP21 rated</li>
      <li>Floor standing with wall mounting tabs</li>
      <li>Approx. enclosure size: <em>488&nbsp;W × 390&nbsp;D × H&nbsp;mm</em></li>
    </ul>
  `,
  image: { src: '../static/images/types/type6.avif', alt: 'Industrial battery charger enclosure' }
    },

ups: {
  title: 'Industrial UPS Batteries',
  body: `
    <p>
      High-reliability <strong>UPS battery systems</strong> engineered for mission-critical backup:
      data centres, telecom, control rooms, healthcare, and industrial automation. Available in
      <strong>AGM VRLA</strong>, <strong>GEL VRLA</strong>, and <strong>Lithium-ion (LFP/NMC)</strong> chemistries to match
      float or cyclic duty, autonomy targets, footprint and lifecycle cost.
    </p>

    <h4>Key Features</h4>
    <ul>
      <li><strong>High-rate discharge</strong> performance for 5–60 min UPS autonomy windows.</li>
      <li><strong>Long design life</strong> options (5/10/12/15-year @ 25&nbsp;°C classes).</li>
      <li><strong>Sealed &amp; maintenance-free</strong> VRLA; <em>front-terminal</em> blocks for dense racks.</li>
      <li><strong>Low self-discharge</strong>; stable float service, rapid recharge acceptance.</li>
      <li><strong>Safety</strong>: flame-retardant cases (UL94-V0 options), venting &amp; pressure relief.</li>
      <li><strong>Lithium-ion</strong> packs with integrated <strong>BMS</strong>, cell balancing, SoC/SoH telemetry.</li>
      <li><strong>Thermal</strong>: wide operating range, cabinet ventilation &amp; thermal management ready.</li>
      <li><strong>Compliance</strong>: IEC/UL/CE tested ranges; Li-ion transport per UN38.3.</li>
    </ul>

    <h4>Form Factors &amp; Integration</h4>
    <ul>
      <li>19&quot;/23&quot; <strong>rack-mount strings</strong>, cabinet banks, or wall-mount blocks.</li>
      <li>Configured DC buses: <strong>+/- 192–384&nbsp;V</strong> (VRLA strings) or Li-ion <strong>48–384&nbsp;V</strong> modules.</li>
      <li>Room layouts with clearances, cabling, fusing, isolators and monitoring (SNMP/BMS/Modbus).</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li>Data centres, server rooms &amp; <strong>network/telecom</strong> POPs</li>
      <li><strong>Industrial control</strong>, SCADA, DCS/PLC, substations</li>
      <li><strong>Healthcare</strong> (imaging, theatres, critical loads) &amp; emergency lighting</li>
      <li>Oil &amp; gas, transport, utilities &amp; public safety infrastructure</li>
    </ul>

    <h4>Typical Ranges</h4>
    <ul>
      <li><strong>VRLA AGM/GEL</strong>: 12&nbsp;V, 7–200&nbsp;Ah; 2&nbsp;V cells up to 1500&nbsp;Ah.</li>
      <li><strong>Li-ion LFP/NMC</strong> racks: 48–384&nbsp;V, scalable 5–200&nbsp;kWh with BMS.</li>
    </ul>

    <p>
      We size strings for your <em>kW load &times; autonomy</em>, ambient temperature, growth margin and
      lifecycle TCO, and deliver complete cabinets with protection, metering and alarms.
    </p>
  `,
  image: { src: '../static/images/types/type7.avif', alt: 'Industrial UPS battery cabinet and racks' }
},
bms: {
  title: 'Battery Management Systems (BMS)',
  body: `
    <p>
      Intelligent <strong>BMS</strong> for Lithium-ion (LFP/NMC) and advanced VRLA strings—ensuring cell-level safety,
      longer life, and accurate visibility of <em>SoC/SoH</em>. Our BMS platforms supervise charge/discharge, balance
      cells, and protect against abnormal conditions to keep storage assets reliable and grid/UPS ready.
    </p>

    <h4>Key Functions</h4>
    <ul>
      <li><strong>Protection</strong>: OVP/UVP, OC/SC, OTP/UTP, insulation &amp; pre-charge management.</li>
      <li><strong>Cell Balancing</strong>: active/passive algorithms for tighter voltage spread &amp; longer life.</li>
      <li><strong>Telemetry</strong>: pack &amp; cell voltages, currents, temps, cycle counts, alarms &amp; events.</li>
      <li><strong>SoC/SoH Estimation</strong>: coulomb counting + model-based refinement (OCV &amp; temperature).</li>
      <li><strong>Contactors/Relays</strong>: coordinated switching, soft-start, fault isolation.</li>
    </ul>

    <h4>Integration &amp; Comms</h4>
    <ul>
      <li><strong>Protocols</strong>: Modbus-RTU/TCP, CAN, SNMP; optional MQTT/REST gateways.</li>
      <li><strong>SCADA/EMS/UPS</strong> integration with alarms, throttling &amp; charge profile control.</li>
      <li><strong>Cloud/Local dashboards</strong> for fleet monitoring, trends &amp; maintenance planning.</li>
    </ul>

    <h4>Safety &amp; Compliance</h4>
    <ul>
      <li>Designs aligned to IEC/UL/CE; Li-ion transport per UN38.3 (cells/packs).</li>
      <li>Event logging, SOE, fire/thermal escalation hooks, and E-stop inputs.</li>
    </ul>

    <h4>Applications</h4>
    <ul>
      <li><strong>UPS &amp; data centre</strong> strings (48–384&nbsp;V)</li>
      <li><strong>Cabinet/rack energy storage</strong> (kWh–MWh)</li>
      <li><strong>Solar hybrid &amp; microgrids</strong>, commercial &amp; industrial peak-shaving</li>
      <li><strong>EV/traction</strong> battery packs and test benches</li>
    </ul>

    <p>
      We engineer BMS to your pack voltage/capacity, thermal profile, and safety case—complete with harness,
      CT/NTC placement, fusing, and commissioning support.
    </p>
  `,
  image: { src: '../static/images/types/type8.avif', alt: 'Battery management system monitoring pack diagnostics' }
},

  };

  // --- RENDER DETAILS (single function) ---
  function openDetails(key) {
    const data = detailsMap[key];
    if (!data) return;

    const imgHTML = data.image
      ? `<figure class="svc-detail-figure"><img class="svc-detail-img" src="${data.image.src}" alt="${data.image.alt || ''}"></figure>`
      : '';

    detail.innerHTML = `
      <div class="svc-detail-layout">
        ${imgHTML}
        <div class="svc-detail-copy">
          <h3>${data.title}</h3>
          ${data.body || ''}
        </div>
      </div>
    `;
    detail.style.display = 'block';
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function closeDetails() {
    detail.style.display = 'none';
    detail.innerHTML = '';
  }

  // --- CLICK HANDLER (delegated) ---
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.svc-cta-lv-electrical-services');
    if (!btn) return;
    const key = btn.getAttribute('data-detail');
    const currentTitle = detail.querySelector('h3')?.textContent || '';
    if (detail.style.display === 'block' && currentTitle === (detailsMap[key]?.title || '')) {
      closeDetails();
    } else {
      openDetails(key);
    }
  });

  // --- EXPLORE / VIEW LESS toggle (uses .is-hidden on extra cards) ---
  if (exploreBtn) {
    const allCards = Array.from(grid.querySelectorAll('.svc-item-lv-electrical-services'));
    const extraCards = allCards.slice(3); // cards 4..7
    let expanded = false;

    function setExpanded(state) {
      expanded = state;
      if (expanded) {
        extraCards.forEach(el => el.classList.remove('is-hidden'));
        exploreBtn.textContent = 'View Less';
        exploreBtn.setAttribute('aria-expanded', 'true');

      } else {
        extraCards.forEach(el => el.classList.add('is-hidden'));
        closeDetails();
        exploreBtn.textContent = 'Explore Types';
        exploreBtn.setAttribute('aria-expanded', 'false');

      }
      // retrigger reveal animations if you use them
      extraCards.forEach(el => {
        el.classList.remove('reveal-in-lv-electrical-services');
        void el.offsetWidth;
      });
    }

    // init collapsed
    setExpanded(false);

    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setExpanded(!expanded);
    });
  }

  // --- SCROLL REVEAL (bi-directional) ---
  const revealEls = document.querySelectorAll(
    '.reveal-left-lv-electrical-services, .reveal-right-lv-electrical-services, .reveal-up-lv-electrical-services'
  );
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in-lv-electrical-services');
      } else {
        entry.target.classList.remove('reveal-in-lv-electrical-services');
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => io.observe(el));
});
(() => {
  const modal = document.getElementById('csc-modal');
  const form = document.getElementById('csc-form');
  const close = modal.querySelector('.modal-close-csc-solar-system-csc-products');
  const successPane = document.getElementById('csc-success');
  const docNameInput = document.getElementById('csc-doc-name');

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    successPane.hidden = true;
    form.hidden = false;
    form.reset();
    setTimeout(() => document.getElementById('csc-name')?.focus(), 50);
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Open from each "Request Download" button
  document.querySelectorAll('.request-download-csc-solar-system-csc-products').forEach(btn => {
    btn.addEventListener('click', () => {
      docNameInput.value = btn.dataset.doc || '';
      openModal();
    });
  });

  // Close handlers
  close.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop-csc-solar-system-csc-products')
    .addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
