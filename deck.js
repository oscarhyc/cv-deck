/* ─────────────────────────────────────────────────────────────────────────── */
/* Chan Ho Yin · Portfolio Deck · deck.js                                     */
/* Phase 2: navigation + IntersectionObserver slide reveal + stat count-up   */
/* Phase 3 (later): add scroll-snap mandatory fullscreen + effects            */
/* ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const SLIDE_COUNT = 14;
  const SLIDE_TITLES = [
    'Cover',
    'The Agent Stack',
    'Application Architecture',
    'Agentic AI Architecture (runtime chain)',
    'Strength 1: Agentic Engineering (vs Vibe Coding)',
    'Strength 2: Agent Guardrails & HITL',
    'Strength 3: TDD Software Development',
    'Strength 4: Agent Harness Design',
    'Strength 5: AgentOps · Deploy/Observe/Rollback',
    'Project Live + Scale',
    'Stack',
    'Agentic Build Session · Live Walkthrough',
    'Receipts — How to Verify',
    'Contact + Download'
  ];
  const slides = document.querySelectorAll('.slide');
  const progress = document.getElementById('deckProgress');
  const counter = document.getElementById('slideCounter');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const tocEl = document.getElementById('deckToc');
  const crtEl = document.getElementById('deckCrt');
  const loadingEl = document.getElementById('deckLoading');

  /* ── Detect prefers-reduced-motion (early) ───────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Build TOC dots (Phase 3) ────────────────────────────────────────── */
  function buildTOC() {
    if (!tocEl) return;
    tocEl.innerHTML = '';
    for (let i = 0; i < SLIDE_COUNT; i++) {
      const btn = document.createElement('button');
      btn.className = 'toc-dot';
      btn.setAttribute('aria-label', `Go to slide ${i + 1}: ${SLIDE_TITLES[i]}`);
      btn.dataset.slideIndex = String(i + 1);

      const label = document.createElement('span');
      label.className = 'toc-dot-label';
      label.textContent = `${String(i + 1).padStart(2, '0')} · ${SLIDE_TITLES[i]}`;
      btn.appendChild(label);

      btn.addEventListener('click', () => scrollToSlide(i + 1));
      tocEl.appendChild(btn);
    }
  }

  function updateTOCActive() {
    const cur = currentSlideIndex();
    if (!tocEl) return;
    tocEl.querySelectorAll('.toc-dot').forEach((dot) => {
      const idx = parseInt(dot.dataset.slideIndex, 10);
      dot.classList.toggle('is-active', idx === cur);
    });
  }

  /* ── Update progress bar + counter (unchanged) ───────────────────────── */
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = Math.min(100, pct) + '%';

    let current = 1;
    let maxVisible = 0;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      if (visible > maxVisible) {
        maxVisible = visible;
        current = i + 1;
      }
    });
    if (counter) {
      counter.textContent = String(current).padStart(2, '0') + ' / ' + String(SLIDE_COUNT).padStart(2, '0');
    }
    updateTOCActive();
  }

  /* ── Slide-to-slide navigation ──────────────────────────────────────── */
  function scrollToSlide(index) {
    const slide = slides[index - 1];
    if (!slide) return;
    slide.scrollIntoView({ block: 'start' });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const cur = currentSlideIndex();
      if (cur > 1) scrollToSlide(cur - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const cur = currentSlideIndex();
      if (cur < SLIDE_COUNT) scrollToSlide(cur + 1);
    });
  }

  function currentSlideIndex() {
    let current = 1;
    let maxVisible = 0;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      if (visible > maxVisible) {
        maxVisible = visible;
        current = i + 1;
      }
    });
    return current;
  }

  /* ── Keyboard navigation ───────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const cur = currentSlideIndex();

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      if (cur < SLIDE_COUNT) scrollToSlide(cur + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      if (cur > 1) scrollToSlide(cur - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToSlide(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToSlide(SLIDE_COUNT);
    } else if (e.key === 'F10') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'Escape' && document.body.classList.contains('deck-fullscreen')) {
      e.preventDefault();
      document.body.classList.remove('deck-fullscreen');
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      toggleCRT();
    }
  });

  function toggleCRT() {
    if (!crtEl) return;
    const on = crtEl.classList.toggle('is-on');
    try {
      localStorage.setItem('deck-crt-pref', on ? 'on' : 'off');
    } catch (e) { /* localStorage may be blocked; ignore */ }
  }

  /* Persisted CRT preference */
  function restoreCRT() {
    if (!crtEl) return;
    try {
      if (localStorage.getItem('deck-crt-pref') === 'on') {
        crtEl.classList.add('is-on');
      }
    } catch (e) { /* ignore */ }
  }

  function toggleFullscreen() {
    document.body.classList.toggle('deck-fullscreen');
    setTimeout(() => {
      updateProgress();
      updateTOCActive();
    }, 50);
  }

  /* ── IntersectionObserver: detect slide entering viewport ───────────── */
  /* ─────────────────────────────────────────────────────────────────────
     When a slide enters the viewport, we:
     1. Add .is-visible to trigger fade-in transition
     2. If it has stat-num elements, kick off the count-up animation
  */
  const observedSlides = new WeakSet();

  function revealSlide(slide) {
    if (observedSlides.has(slide)) return;
    observedSlides.add(slide);
    slide.classList.add('is-visible');

    /* Find stats inside this slide and start count-up */
    if (!prefersReducedMotion) {
      const stats = slide.querySelectorAll('.stat-num[data-target]');
      stats.forEach((el, i) => {
        const delay = 200 + (i * 80);  /* +80ms stagger per stat */
        setTimeout(() => animateCount(el), delay);
      });
    }
  }

  function setupIntersectionObserver() {
    /* If reduced motion → reveal all slides immediately (no observers) */
    if (prefersReducedMotion) {
      slides.forEach(revealSlide);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealSlide(entry.target);
          observer.unobserve(entry.target);  /* Only animate once */
        }
      });
    }, {
      /* Trigger when 20% of the slide is visible */
      threshold: 0.20,
      /* Slight bottom inset so we trigger slightly early */
      rootMargin: '0px 0px -10% 0px'
    });

    slides.forEach((slide) => observer.observe(slide));
  }

  /* ── Count-up animation ───────────────────────────────────────────── */
  /* Each .stat-num can have these data attributes:
     - data-target        : numeric value (integer or float)
     - data-format        : 'int' | 'comma' | 'percent' | 'ratio' (default: as-is)
     If no data-target, the original textContent stays as final value.
  */
  function parseStatValue(text) {
    /* Extract leading numeric value from text like "244", "62,631", "0.52", "v1.19.0 → v1.41.3" */
    /* For text with no leading number (e.g. range), skip animation */
    const m = text.trim().match(/^(-?[\d,]+(?:\.\d+)?)/);
    if (!m) return null;
    const raw = m[1].replace(/,/g, '');
    return parseFloat(raw);
  }

  function formatStatValue(value, originalText) {
    /* Detect original format from source text */
    if (originalText.indexOf(',') !== -1) {
      /* Comma-separated: 62,631 */
      return Math.round(value).toLocaleString('en-US');
    }
    if (originalText.indexOf('.') !== -1 && originalText.split('.').pop().length <= 3) {
      /* Decimal: 0.52 */
      return value.toFixed(2);
    }
    return Math.round(value).toString();
  }

  function animateCount(el) {
    /* Skip if already counted */
    if (el.classList.contains('is-counted')) return;

    const originalText = el.textContent.trim();
    const target = parseStatValue(originalText);
    if (target === null || isNaN(target)) {
      /* No number to count — just mark as done */
      el.classList.add('is-counted');
      return;
    }

    /* Special case: target is 0 — don't animate, just show it */
    if (target === 0) {
      el.classList.add('is-counted');
      return;
    }

    const start = performance.now();
    const duration = 1200;  /* 1.2s count-up */

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out (cubic) — fast start, slow finish */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      el.textContent = formatStatValue(current, originalText);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        /* Final value */
        el.textContent = formatStatValue(target, originalText);
        el.classList.add('is-counted');
        /* Trigger pulse */
        el.style.animation = 'phase2-pulse 0.6s ease-out';
      }
    }
    requestAnimationFrame(step);
  }

  /* ── Auto-tag all stat-num elements with data-target on init ──────── */
  function tagStatElements() {
    document.querySelectorAll('.stat-num').forEach((el) => {
      if (el.dataset.target) return;  /* already tagged */
      const target = parseStatValue(el.textContent);
      if (target !== null && !isNaN(target)) {
        el.dataset.target = target.toString();
      }
    });
  }

  /* ── Wire up scroll listener ──────────────────────────────────────── */
  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateProgress);
  });

  /* ── Initial render ──────────────────────────────────────────────── */
  buildTOC();
  tagStatElements();
  restoreCRT();
  updateProgress();
  setupIntersectionObserver();

  /* ── Hide loading screen once fonts/paint are ready ──────────────── */
  function hideLoading() {
    if (loadingEl && !loadingEl.classList.contains('is-hidden')) {
      loadingEl.classList.add('is-hidden');
      /* Remove from DOM after fade animation completes */
      setTimeout(() => {
        if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);
      }, 500);
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(hideLoading);
  }
  /* Fallback: hide after 1.5s in any case so loading never stays */
  setTimeout(hideLoading, 1500);

  /* ── Console easter egg (Phase 3) ────────────────────────────────── */
  try {
    const ascii = [
      '',
      '  ╔══════════════════════════════════════════════════════╗',
      '  ║   portfolio deck · by Chan Ho Yin · v1.41.3          ║',
      '  ║   built with rules, wrappers, and receipts.          ║',
      '  ╚══════════════════════════════════════════════════════╝',
      '',
      '   244 commits  ·  1,130 tests  ·  0 unauthorized prod writes',
      '',
      '   keyboard shortcuts (on this page):',
      '     ·  F10        → toggle fullscreen presentation mode',
      '     ·  S          → toggle CRT scanline overlay',
      '     ·  → / Space  → next slide',
      '     ·  ←          → previous slide',
      '     ·  Home/End   → first / last slide',
      '',
    ].join('\\n');
    const styled = 'color:#f48225;font-family:monospace;font-size:11px;line-height:1.4;';
    console.log('%c' + ascii, styled);
    console.log('%c👋 like what you see? chan_here@hire.example', 'color:#58a6ff;font-style:italic;');
  } catch (e) { /* ignore */ }

  /* ── Expose hooks ────────────────────────────────────────────────── */
  window.__deck = {
    slides,
    scrollToSlide,
    toggleFullscreen,
    toggleCRT,
    updateProgress,
    updateTOCActive,
    currentSlideIndex,
    animateCount,
    prefersReducedMotion
  };
})();

/* ── Credentials modal (Live Demo) ────────────────────────────────── */
(function() {
  const modal = document.getElementById('creds-modal');
  if (!modal) return;

  const panel = modal.querySelector('.creds-panel');
  const openers = document.querySelectorAll('[data-open-credentials]');
  const closers = document.querySelectorAll('[data-close-credentials]');
  let lastFocus = null;

  function open(e) {
    // Let middle-click / cmd+click / ctrl+click / right-click fall through to the href
    // so power users can open the demo directly in a new tab without seeing the modal.
    if (e) {
      if (e.button !== undefined && e.button !== 0) return;            // middle / right click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;     // modifier-click
      e.preventDefault();
    }
    lastFocus = document.activeElement;
    modal.hidden = false;
    // Focus close button after a tick (so transition could fire)
    setTimeout(() => {
      const closeBtn = modal.querySelector('.creds-close');
      if (closeBtn) closeBtn.focus();
    }, 30);
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  openers.forEach(b => b.addEventListener('click', open));
  closers.forEach(b => b.addEventListener('click', close));

  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    // Trap focus inside panel
    if (e.key === 'Tab') {
      const focusables = panel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  // Copy buttons
  modal.querySelectorAll('.creds-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (!target) return;
      const text = target.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        const orig = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1200);
      } catch (e) {
        // fallback: select the text
        const r = document.createRange();
        r.selectNode(target);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
      }
    });
  });

  // Cover-slide inline credentials copy buttons (always visible on cover)
  document.querySelectorAll('.cover-copy[data-copy-target-inline]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copyTargetInline);
      if (!target) return;
      const text = target.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('copied');
        const orig = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1200);
      } catch (e) {
        // fallback: select the text
        const r = document.createRange();
        r.selectNode(target);
        const sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(r);
      }
    });
  });
})();
