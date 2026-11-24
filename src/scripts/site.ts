/**
 * The site's entire runtime script: theme toggle, reveal-on-scroll, header
 * state, mobile navigation, copy buttons, timeline filters and the lightbox.
 * Re-initialised on every ClientRouter navigation (astro:page-load).
 */

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme ---------- */
function currentTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme');
  // Light is the default; dark is used only when the visitor has chosen it.
  return attr === 'dark' ? 'dark' : 'light';
}
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {}
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(theme === 'dark'));
    b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}
function initTheme() {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => {
    const theme = currentTheme();
    b.setAttribute('aria-pressed', String(theme === 'dark'));
    b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    b.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
  });
}

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)');
  if (!els.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el, i) => {
    // stagger siblings that share a parent group
    const group = el.closest('[data-reveal-group]');
    if (group) {
      const idx = Array.from(group.querySelectorAll('[data-reveal]')).indexOf(el);
      el.style.setProperty('--reveal-delay', `${Math.min(idx, 6) * 70}ms`);
    } else {
      el.style.setProperty('--reveal-delay', `${Math.min(i, 3) * 40}ms`);
    }
    io.observe(el);
  });
}

/* ---------- header ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-compact', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = header.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-nav-panel]');
  if (!toggle || !panel) return;
  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    panel.hidden = true;
    document.body.classList.remove('nav-open');
  };
  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    document.body.classList.add('nav-open');
    panel.querySelector<HTMLElement>('a')?.focus();
  };
  toggle.addEventListener('click', () => (toggle.getAttribute('aria-expanded') === 'true' ? close() : open()));
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });
  const mq = window.matchMedia('(min-width: 900px)');
  mq.addEventListener('change', () => mq.matches && close());
}

/* ---------- copy buttons ---------- */
function initCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      const sel = btn.getAttribute('data-copy')!;
      const src = sel.startsWith('#') ? document.querySelector(sel) : null;
      const text = src ? (src as HTMLElement).innerText : sel;
      const label = btn.querySelector('[data-copy-label]') ?? btn;
      const original = label.textContent;
      try {
        await navigator.clipboard.writeText(text.trim());
        label.textContent = btn.dataset.copiedLabel ?? 'Copied';
      } catch {
        label.textContent = 'Select & copy';
      }
      btn.classList.add('is-copied');
      setTimeout(() => {
        label.textContent = original;
        btn.classList.remove('is-copied');
      }, 1800);
    });
  });
}

/* ---------- timeline filters ---------- */
function initFilters() {
  document.querySelectorAll<HTMLElement>('[data-filter-group]').forEach((group) => {
    const target = document.querySelector<HTMLElement>(group.dataset.filterGroup!);
    if (!target) return;
    const buttons = group.querySelectorAll<HTMLButtonElement>('button[data-filter]');
    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        const kind = b.dataset.filter!;
        buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        let shown = 0;
        target.querySelectorAll<HTMLElement>('[data-kind]').forEach((item) => {
          const match = kind === 'all' || item.dataset.kind === kind;
          item.hidden = !match;
          if (match) shown++;
        });
        const live = group.querySelector('[data-filter-live]');
        if (live) live.textContent = `${shown} ${shown === 1 ? 'entry' : 'entries'}`;
      }),
    );
  });
}

/* ---------- lightbox ---------- */
function initLightbox() {
  const galleries = document.querySelectorAll<HTMLElement>('[data-gallery]');
  if (!galleries.length) return;
  let dialog = document.querySelector<HTMLDialogElement>('#lightbox');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'lightbox';
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `
      <button class="lightbox__close" data-lb-close aria-label="Close (Esc)">×</button>
      <button class="lightbox__nav lightbox__nav--prev" data-lb-prev aria-label="Previous image (←)">‹</button>
      <figure class="lightbox__figure"><img alt="" /><figcaption></figcaption></figure>
      <button class="lightbox__nav lightbox__nav--next" data-lb-next aria-label="Next image (→)">›</button>
      <p class="lightbox__count mono" aria-live="polite"></p>`;
    document.body.appendChild(dialog);
  }
  const img = dialog.querySelector('img')!;
  const cap = dialog.querySelector('figcaption')!;
  const count = dialog.querySelector('.lightbox__count')!;
  let items: HTMLAnchorElement[] = [];
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + items.length) % items.length;
    const a = items[index]!;
    img.src = a.href;
    img.alt = a.dataset.alt ?? '';
    cap.textContent = a.dataset.caption ?? '';
    count.textContent = `${index + 1} / ${items.length}`;
  };
  const close = () => {
    dialog!.close();
    opener?.focus();
  };
  dialog.querySelector('[data-lb-close]')!.addEventListener('click', close);
  dialog.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lb-next]')!.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  galleries.forEach((g) => {
    if (g.dataset.bound) return;
    g.dataset.bound = '1';
    g.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-lb]');
      if (!a) return;
      e.preventDefault();
      items = Array.from(g.querySelectorAll<HTMLAnchorElement>('a[data-lb]'));
      opener = a;
      show(items.indexOf(a));
      dialog!.showModal();
    });
  });
}

/* ---------- before/after compare (research explainer) ---------- */
function initCompare() {
  document.querySelectorAll<HTMLInputElement>('input[data-compare]').forEach((range) => {
    if (range.dataset.bound) return;
    range.dataset.bound = '1';
    const stage = range.closest<HTMLElement>('[data-compare-stage]');
    if (!stage) return;
    const apply = () => {
      stage.style.setProperty('--split', `${range.value}%`);
      range.setAttribute('aria-valuetext', `${100 - Number(range.value)}% of the frame shows the boundary-refined result`);
    };
    range.addEventListener('input', apply);
    // first user interaction cancels the intro transition so dragging feels direct
    range.addEventListener('pointerdown', () => stage.classList.add('is-live'), { once: true });
  });
}

/* ---------- reading progress (long-form pages) ---------- */
function initProgress() {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const article = document.querySelector<HTMLElement>('[data-progress-target]');
  if (!bar || !article) return;
  // CSS scroll-driven animations handle this natively where supported.
  if (CSS.supports('animation-timeline: scroll()')) return;
  let ticking = false;
  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const done = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
    bar.style.transform = `scaleX(${done})`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ---------- boot ---------- */
function init() {
  initTheme();
  initHeader();
  initReveal();
  initCopy();
  initFilters();
  initLightbox();
  initCompare();
  initProgress();
}
if (document.documentElement.hasAttribute('data-static-preview')) {
  // Relative preview builds ship without the client router, so astro:page-load never fires.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
} else {
  document.addEventListener('astro:page-load', init);
}
document.addEventListener('astro:after-swap', () => {
  // keep the chosen theme across view-transition swaps
  try {
    const t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch {}
});
