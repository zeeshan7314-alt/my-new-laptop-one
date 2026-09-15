// =====================================================
// Shared layout components: header, footer, cards, score bars
// =====================================================
import { Laptop, cpuLabel, gpuShort, money, storageLabel, META, imgOf, imgAlt } from '../lib/db'
import { SITE } from '../lib/seo'

export const LogoMark = ({ class: className = "w-7 h-7" }: { class?: string }) => (
  <svg class={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="50%" stop-color="#2563eb" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      <linearGradient id="logoScreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="lgb1" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#60a5fa"/></linearGradient>
      <linearGradient id="lgb2" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient>
      <linearGradient id="lgb3" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#34d399"/></linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#logoBg)" />
    <rect x="96" y="90" width="320" height="224" rx="18" fill="#090d16" stroke="#334155" stroke-width="6" />
    <rect x="110" y="104" width="292" height="196" rx="10" fill="url(#logoScreen)" />
    <circle cx="256" cy="97" r="4" fill="#64748b" />
    <rect x="150" y="200" width="28" height="72" rx="6" fill="url(#lgb1)" />
    <rect x="194" y="164" width="28" height="108" rx="6" fill="url(#lgb2)" />
    <rect x="238" y="132" width="28" height="140" rx="6" fill="url(#lgb3)" />
    <path d="M164 190 L208 152 L252 120 L336 142" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="336" cy="142" r="9" fill="#38bdf8" />
    <circle cx="252" cy="120" r="9" fill="#34d399" />
    <path d="M56 322 L456 322 L432 368 C430 372 426 374 420 374 L92 374 C86 374 82 372 80 368 Z" fill="#cbd5e1" />
    <path d="M56 322 L456 322 L450 334 L62 334 Z" fill="#94a3b8" />
    <rect x="216" y="326" width="80" height="8" rx="4" fill="#64748b" />
  </svg>
)

export const Header = () => (
  <header id="site-header" class="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur border-b border-slate-200 dark:border-slate-800">
    <nav class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4" aria-label="Main navigation">
      <a href="/" class="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-slate-900 dark:text-white shrink-0 group" aria-label="LaptopIndex Home">
        <LogoMark class="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
        <span>Laptop<span class="text-brand-500">Index</span></span>
      </a>
      <div class="hidden md:flex items-center gap-1 text-sm font-medium">
        <a href="/laptops" class="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Browse</a>
        <a href="/guides" class="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Buying Guides</a>
        <a href="/compare" class="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Compare</a>
        <a href="/laptops?segment=Gaming" class="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Gaming</a>
      </div>
      <div class="flex-1"></div>
      <form action="/laptops" method="get" class="hidden sm:block relative" role="search">
        <input type="search" name="q" id="header-search" placeholder="Search laptops…" autocomplete="off"
          class="w-44 lg:w-64 pl-9 pr-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-transparent focus:border-brand-400 focus:outline-none" />
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" aria-hidden="true"></i>
        <div id="search-suggest" class="absolute top-full mt-1 left-0 right-0 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 hidden max-h-80 overflow-auto"></div>
      </form>
      <a href="/wishlist" id="wishlist-link" class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" aria-label="Wishlist">
        <i class="far fa-heart" aria-hidden="true"></i>
        <span id="wishlist-count" class="hidden absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 items-center justify-center">0</span>
      </a>
      <button id="theme-toggle" class="theme-toggle-btn p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" aria-label="Toggle dark mode" title="Toggle theme">
        <i class="fas fa-moon dark:hidden" aria-hidden="true"></i><i class="fas fa-sun hidden dark:inline" aria-hidden="true"></i>
      </button>
      <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" aria-label="Menu">
        <i class="fas fa-bars" aria-hidden="true"></i>
      </button>
    </nav>
    <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 space-y-1">
      <a href="/laptops" class="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-500">Browse Laptops</a>
      <a href="/guides" class="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-500">Buying Guides</a>
      <a href="/compare" class="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-500">Compare</a>
      <a href="/wishlist" class="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-500">Wishlist</a>
      <div class="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
        <button class="theme-toggle-btn px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5" aria-label="Toggle theme">
          <i class="fas fa-moon dark:hidden" aria-hidden="true"></i><i class="fas fa-sun hidden dark:inline" aria-hidden="true"></i>
          <span>Toggle Light/Dark</span>
        </button>
      </div>
      <form action="/laptops" method="get" class="pt-2"><input type="search" name="q" placeholder="Search laptops…" class="w-full px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-transparent" /></form>
    </div>
  </header>
)

export const CompareBar = () => (
  <div id="compare-bar" class="fixed bottom-0 inset-x-0 z-50 hidden">
    <div class="max-w-7xl mx-auto px-4 pb-4">
      <div class="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
        <span class="text-sm font-semibold shrink-0"><i class="fas fa-scale-balanced mr-1.5 text-brand-400" aria-hidden="true"></i>Compare</span>
        <div id="compare-chips" class="flex items-center gap-2 flex-wrap text-xs"></div>
        <div class="flex-1"></div>
        <button id="compare-clear" class="text-xs text-slate-300 hover:text-white underline">Clear</button>
        <a id="compare-go" href="#" class="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl pointer-events-none opacity-50">Compare Now <i class="fas fa-arrow-right ml-1" aria-hidden="true"></i></a>
      </div>
    </div>
  </div>
)

export const Footer = () => (
  <footer class="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
      <div>
        <div class="font-extrabold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <LogoMark class="w-6 h-6 rounded shadow-sm" />
          <span>Laptop<span class="text-brand-500">Index</span></span>
        </div>
        <p class="text-slate-500 dark:text-slate-400">Data-driven laptop reviews, benchmarks and comparisons. {META.count} laptops indexed, updated {META.updated}.</p>
      </div>
      <div>
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Popular Guides</h3>
        <ul class="space-y-1.5 text-slate-500 dark:text-slate-400">
          <li><a class="hover:text-brand-500" href="/guides/best-gaming-laptops">Best Gaming Laptops</a></li>
          <li><a class="hover:text-brand-500" href="/guides/best-laptops-under-1000">Best Under $1000</a></li>
          <li><a class="hover:text-brand-500" href="/guides/best-student-laptops">Best Student Laptops</a></li>
          <li><a class="hover:text-brand-500" href="/guides/best-oled-laptops">Best OLED Laptops</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Browse</h3>
        <ul class="space-y-1.5 text-slate-500 dark:text-slate-400">
          <li><a class="hover:text-brand-500" href="/laptops?segment=Gaming">Gaming Laptops</a></li>
          <li><a class="hover:text-brand-500" href="/laptops?segment=Professional">Professional Laptops</a></li>
          <li><a class="hover:text-brand-500" href="/laptops?gpu=dedicated">Dedicated GPU</a></li>
          <li><a class="hover:text-brand-500" href="/compare">All Comparisons</a></li>
        </ul>
      </div>
      <div>
        <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Affiliate Disclosure</h3>
        <p class="text-slate-500 dark:text-slate-400">{META.affiliateDisclosure} Prices shown were captured {META.updated} and may have changed.</p>
      </div>
    </div>
    <div class="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">© 2026 {SITE.name}. All benchmark data from PassMark & G3DMark public databases.</div>
  </footer>
)

export const ScoreDonut = ({ score, size = 'lg' }: { score: number; size?: 'lg' | 'sm' }) => {
  const pct = score * 10
  const color = score >= 8 ? '#10b981' : score >= 6.5 ? '#3388ff' : score >= 5 ? '#f59e0b' : '#ef4444'
  const dim = size === 'lg' ? 'w-24 h-24 text-2xl' : 'w-14 h-14 text-sm'
  return (
    <div class={`relative ${dim} shrink-0`} role="img" aria-label={`Score ${score} out of 10`}>
      <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" stroke-width="3.5" class="text-slate-200 dark:text-slate-700" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} stroke-width="3.5" stroke-linecap="round" stroke-dasharray={`${pct} 100`} />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center font-extrabold" style={`color:${color}`}>{score}</div>
    </div>
  )
}

export const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6.5 ? 'bg-brand-500' : score >= 5 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div class="score-bar-row">
      <div class="flex justify-between text-xs mb-1"><span class="font-medium">{label}</span><span class="font-bold">{score}</span></div>
      <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div class={`h-full rounded-full ${color}`} style={`width:${score * 10}%`}></div>
      </div>
    </div>
  )
}

export const BadgePill = ({ text }: { text: string }) => {
  const styles: Record<string, string> = {
    "Editor's Choice": 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    'Best Value': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    'Top Gaming Pick': 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    'Highly Rated': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    'Popular': 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
    'Lowest Price': 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
    'Best Deal': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  }
  return <span class={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${styles[text] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{text}</span>
}

export const AmazonBtn = ({ l, size = 'md' }: { l: Laptop; size?: 'md' | 'lg' | 'sm' }) => {
  const cls = size === 'lg' ? 'px-6 py-3 text-base' : size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
  return (
    <a href={l.amazon.url || '#'} target="_blank" rel="nofollow sponsored noopener"
      class={`amazon-btn inline-flex items-center justify-center gap-2 rounded-xl font-bold text-slate-900 bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 shadow-sm transition ${cls}`}>
      <i class="fab fa-amazon" aria-hidden="true"></i>
      <span>Check Prices</span>
    </a>
  )
}

export const Thumb = ({ l, size = 'md', eager }: { l: Laptop; size?: 'sm' | 'md' | 'lg'; eager?: boolean }) => {
  const src = imgOf(l)
  const dim = size === 'lg' ? 'w-40 h-40 md:w-52 md:h-52' : size === 'sm' ? 'w-14 h-14' : 'w-20 h-20'
  return (
    <img src={src} alt={imgAlt(l)} width="400" height="400" loading={eager ? 'eager' : 'lazy'} decoding="async"
      class={`${dim} shrink-0 rounded-xl object-contain bg-white ring-1 ring-slate-200 dark:ring-slate-700`}
      onerror="this.onerror=null;this.src='/static/icon.svg';this.classList.add('p-3');" />
  )
}

export const LaptopCard = ({ l, rank }: { l: Laptop; rank?: number }) => (
  <article class="laptop-card group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition p-4 flex flex-col gap-3" data-id={l.id} data-slug={l.slug} data-name={l.name}>
    <div class="flex items-start gap-3">
      {rank !== undefined && <div class="w-8 h-8 shrink-0 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-extrabold flex items-center justify-center">{rank}</div>}
      <a href={`/${l.slug}-review`} tabindex={-1} aria-hidden="true"><Thumb l={l} size="md" /></a>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap gap-1 mb-1">{l.badges.map(b => <BadgePill text={b} />)}</div>
        <h3 class="font-bold text-slate-900 dark:text-white leading-snug">
          <a href={`/${l.slug}-review`} class="hover:text-brand-500 transition">{l.name}</a>
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">{l.segment} · {l.formFactor}{l.amazon.rating ? <span> · <i class="fas fa-star text-amber-400 text-[10px]" aria-hidden="true"></i> {l.amazon.rating} ({(l.amazon.reviewCount || 0).toLocaleString()})</span> : null}</p>
      </div>
    </div>
    <ul class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
      <li class="truncate"><i class="fas fa-microchip w-4 text-slate-400" aria-hidden="true"></i> {cpuLabel(l)}</li>
      <li class="truncate"><i class="fas fa-gamepad w-4 text-slate-400" aria-hidden="true"></i> {gpuShort(l)}</li>
      <li><i class="fas fa-memory w-4 text-slate-400" aria-hidden="true"></i> {l.ram.gb} GB {l.ram.type}</li>
      <li><i class="fas fa-hard-drive w-4 text-slate-400" aria-hidden="true"></i> {storageLabel(l)}</li>
      <li><i class="fas fa-display w-4 text-slate-400" aria-hidden="true"></i> {l.display.sizeInches}″ {l.display.refreshHz}Hz</li>
      <li><i class="fas fa-weight-hanging w-4 text-slate-400" aria-hidden="true"></i> {l.physical.weightLbs} lbs</li>
    </ul>
    <div class="mt-auto flex items-center gap-2 pt-1">
      <AmazonBtn l={l} size="sm" />
      <a href={`/${l.slug}-review`} class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">Review →</a>
      <div class="flex-1"></div>
      <button class="wish-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-500" data-id={l.id} aria-label="Add to wishlist"><i class="far fa-heart" aria-hidden="true"></i></button>
      <label class="flex items-center gap-1 text-[11px] font-medium text-slate-500 cursor-pointer select-none">
        <input type="checkbox" class="compare-check accent-brand-500 w-3.5 h-3.5" data-id={l.id} data-slug={l.slug} data-name={l.name} /> vs
      </label>
    </div>
  </article>
)

export const Breadcrumbs = ({ items }: { items: { name: string; href?: string }[] }) => (
  <nav aria-label="Breadcrumb" class="text-xs text-slate-500 mb-4">
    <ol class="flex flex-wrap items-center gap-1">
      <li><a href="/" class="hover:text-brand-500">Home</a></li>
      {items.map(it => (
        <li class="flex items-center gap-1"><i class="fas fa-chevron-right text-[8px] text-slate-300" aria-hidden="true"></i>
          {it.href ? <a href={it.href} class="hover:text-brand-500">{it.name}</a> : <span class="text-slate-700 dark:text-slate-300 font-medium">{it.name}</span>}
        </li>
      ))}
    </ol>
  </nav>
)
