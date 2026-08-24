// LaptopIndex client runtime: theme, compare bar, wishlist, search suggest
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  };

  // ---------- Theme ----------
  $('#theme-toggle')?.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  // ---------- Mobile menu ----------
  $('#mobile-menu-btn')?.addEventListener('click', () => $('#mobile-menu')?.classList.toggle('hidden'));

  // ---------- Compare bar ----------
  const CMP_KEY = 'li_compare';
  let cmp = store.get(CMP_KEY, []); // [{id, slug, name}]
  function renderCompare() {
    const bar = $('#compare-bar'), chips = $('#compare-chips'), go = $('#compare-go');
    if (!bar) return;
    if (cmp.length === 0) { bar.classList.add('hidden'); syncChecks(); return; }
    bar.classList.remove('hidden');
    chips.innerHTML = cmp.map(x =>
      `<span class="inline-flex items-center gap-1.5 bg-white/10 rounded-full pl-3 pr-1.5 py-1 border border-white/20">${esc(x.name)}<button data-rm="${x.id}" class="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 text-[9px] leading-none" aria-label="Remove">✕</button></span>`
    ).join('');
    $$('#compare-chips [data-rm]').forEach(b => b.addEventListener('click', () => { cmp = cmp.filter(x => x.id != b.dataset.rm); store.set(CMP_KEY, cmp); renderCompare(); }));
    if (cmp.length >= 2) {
      go.classList.remove('pointer-events-none', 'opacity-50');
      go.href = '/compare/' + [cmp[0].slug, cmp[1].slug].sort().join('-vs-');
    } else {
      go.classList.add('pointer-events-none', 'opacity-50');
    }
    syncChecks();
  }
  function syncChecks() {
    $$('.compare-check').forEach(ch => { ch.checked = cmp.some(x => x.id == ch.dataset.id); });
  }
  document.addEventListener('change', (e) => {
    const ch = e.target.closest?.('.compare-check');
    if (!ch) return;
    const item = { id: +ch.dataset.id, slug: ch.dataset.slug, name: ch.dataset.name };
    if (ch.checked) {
      cmp = cmp.filter(x => x.id !== item.id);
      cmp.push(item);
      if (cmp.length > 2) cmp = cmp.slice(-2); // keep last two
    } else {
      cmp = cmp.filter(x => x.id !== item.id);
    }
    store.set(CMP_KEY, cmp);
    renderCompare();
  });
  $('#compare-clear')?.addEventListener('click', () => { cmp = []; store.set(CMP_KEY, cmp); renderCompare(); });
  renderCompare();

  // ---------- Wishlist ----------
  const WISH_KEY = 'li_wishlist';
  let wish = store.get(WISH_KEY, []); // [id]
  function renderWishUI() {
    const n = wish.length, badge = $('#wishlist-count');
    if (badge) { badge.textContent = n; badge.classList.toggle('hidden', n === 0); badge.classList.toggle('flex', n > 0); }
    $$('.wish-btn').forEach(b => {
      const on = wish.includes(+b.dataset.id);
      const i = b.querySelector('i');
      if (i) { i.className = (on ? 'fas' : 'far') + ' fa-heart'; }
      b.classList.toggle('text-rose-500', on);
    });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('.wish-btn');
    if (!b) return;
    const id = +b.dataset.id;
    wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id];
    store.set(WISH_KEY, wish);
    renderWishUI();
    if (location.pathname === '/wishlist') renderWishlistPage();
  });
  renderWishUI();

  // ---------- Search suggestions + wishlist page (need API data) ----------
  let cache = null;
  async function data() {
    if (!cache) cache = await fetch('/api/laptops').then(r => r.json()).catch(() => []);
    return cache;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

  const inp = $('#header-search'), sug = $('#search-suggest');
  if (inp && sug) {
    let t;
    inp.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        const q = inp.value.trim().toLowerCase();
        if (q.length < 2) { sug.classList.add('hidden'); return; }
        const list = (await data()).filter(l =>
          `${l.name} ${l.cpu} ${l.gpu}`.toLowerCase().includes(q)).slice(0, 8);
        if (!list.length) { sug.classList.add('hidden'); return; }
        sug.innerHTML = list.map(l =>
          `<a href="/${l.slug}-review" class="block px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">
            <span class="font-semibold">${esc(l.name)}</span>
            <span class="block text-xs text-slate-500">$${l.price.toLocaleString()} · ${esc(l.cpu)} · ${l.score}/10</span></a>`).join('');
        sug.classList.remove('hidden');
      }, 150);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('#header-search') && !e.target.closest('#search-suggest')) sug.classList.add('hidden'); });
  }

  // ---------- Wishlist page render ----------
  async function renderWishlistPage() {
    const grid = $('#wishlist-grid'), empty = $('#wishlist-empty');
    if (!grid) return;
    const list = (await data()).filter(l => wish.includes(l.id));
    empty.classList.toggle('hidden', list.length > 0);
    grid.innerHTML = list.map(l => `
      <article class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <h3 class="font-bold text-slate-900 dark:text-white"><a href="/${l.slug}-review" class="hover:text-brand-500">${esc(l.name)}</a></h3>
        <p class="text-xs text-slate-500 mt-1">${esc(l.cpu)} · ${esc(l.gpu)} · ${l.ram} GB RAM · ${l.score}/10</p>
        <div class="mt-3 flex items-center gap-2">
          <span class="font-extrabold text-lg">$${l.price.toLocaleString()}</span>
          <a href="/${l.slug}-review" class="text-xs font-semibold text-brand-500 hover:underline">Review →</a>
          <div class="flex-1"></div>
          <button class="wish-btn p-1.5 text-rose-500" data-id="${l.id}" aria-label="Remove"><i class="fas fa-heart"></i></button>
        </div>
      </article>`).join('');
    renderWishUI();
  }
  if (location.pathname === '/wishlist') renderWishlistPage();

  // ---------- Compare hub picker ----------
  $('#cmp-go')?.addEventListener('click', () => {
    const a = $('#cmp-a')?.value, b = $('#cmp-b')?.value;
    if (a && b && a !== b) location.href = '/compare/' + [a, b].sort().join('-vs-');
  });

  // ---------- Auto-submit filters on change ----------
  $$('#filter-form .filter-sel').forEach(el => el.addEventListener('change', () => $('#filter-form').submit()));
})();
