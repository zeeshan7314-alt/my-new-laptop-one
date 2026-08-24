// Home page
import { LAPTOPS, money, META } from '../lib/db'
import { GUIDES, guideRanking, popularPairs, compareSlug } from '../lib/engine'
import { Header, Footer, CompareBar, LaptopCard } from '../components/layout'

export const HomePage = () => {
  const editors = [...LAPTOPS].sort((a, b) => b.scores.overall - a.scores.overall).slice(0, 6)
  const value = [...LAPTOPS].sort((a, b) => b.scores.value - a.scores.value).slice(0, 3)
  const gaming = [...LAPTOPS].filter(l => l.gpu.dedicated).sort((a, b) => b.scores.gaming - a.scores.gaming).slice(0, 3)
  const trending = [...LAPTOPS].sort((a, b) => (b.amazon.reviewCount || 0) - (a.amazon.reviewCount || 0)).slice(0, 3)
  const pairs = popularPairs(6)
  const segs = [
    ['Gaming', 'fa-gamepad', '/laptops?segment=Gaming', 'RTX-powered machines ranked by real FPS benchmarks'],
    ['Student', 'fa-graduation-cap', '/guides/best-student-laptops', 'Light, affordable and reliable campus picks'],
    ['Business', 'fa-briefcase', '/guides/best-business-laptops', 'Dependable productivity workhorses'],
    ['Creator', 'fa-film', '/guides/best-video-editing-laptops', 'Color-accurate panels + encode muscle'],
    ['AI & Dev', 'fa-robot', '/guides/best-ai-laptops', 'Local LLMs, CUDA and container workloads'],
    ['Budget', 'fa-tags', '/guides/best-budget-laptops', 'Maximum performance-per-dollar under $600'],
  ]
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section id="hero-section" class="bg-gradient-to-b from-brand-600 to-brand-800 dark:from-slate-900 dark:to-slate-950 text-white">
          <div class="max-w-7xl mx-auto px-4 py-14 md:py-20 text-center">
            <h1 class="text-3xl md:text-5xl font-extrabold leading-tight">Find Your Perfect Laptop.<br /><span class="text-amber-300">Backed by Benchmarks, Not Hype.</span></h1>
            <p class="mt-4 text-white/80 max-w-2xl mx-auto">{META.count} laptops scored across 10 real-world use cases using PassMark & G3DMark data, verified Amazon ratings and live pricing. Updated {META.updated}.</p>
            <form action="/laptops" method="get" class="mt-7 max-w-xl mx-auto relative" role="search">
              <input type="search" name="q" placeholder="Search by model, CPU, GPU… e.g. RTX 5060" class="w-full pl-12 pr-32 py-4 rounded-2xl text-slate-900 text-sm font-medium shadow-xl focus:outline-none bg-white" />
              <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
              <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">Search</button>
            </form>
            <div class="mt-5 flex flex-wrap justify-center gap-2 text-xs">
              {[['Best under $1000', '/guides/best-laptops-under-1000'], ['Gaming laptops', '/guides/best-gaming-laptops'], ['OLED picks', '/guides/best-oled-laptops'], ['Ultraportables', '/guides/best-lightweight-laptops'], ['Compare tool', '/compare']].map(([t, h]) => (
                <a href={h} class="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 font-medium">{t}</a>
              ))}
            </div>
          </div>
        </section>

        {/* Category tiles */}
        <section id="categories" class="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {segs.map(([t, ic, href, d]) => (
              <a href={href} class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-lg transition p-4 text-center">
                <i class={`fas ${ic} text-brand-500 text-xl`} aria-hidden="true"></i>
                <div class="font-bold text-sm text-slate-900 dark:text-white mt-2">{t}</div>
                <div class="text-[11px] text-slate-500 mt-1 leading-snug">{d}</div>
              </a>
            ))}
          </div>
        </section>

        <div class="max-w-7xl mx-auto px-4">
          {/* Editor's choice */}
          <section id="editors-choice" class="mt-12">
            <div class="flex items-end justify-between mb-4">
              <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white"><i class="fas fa-medal text-violet-500 mr-2" aria-hidden="true"></i>Highest Rated Overall</h2>
              <a href="/laptops" class="text-sm font-semibold text-brand-500 hover:underline">Browse all →</a>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{editors.map((l, i) => <LaptopCard l={l} rank={i + 1} />)}</div>
          </section>

          {/* 3-col picks */}
          <section id="picks" class="mt-12 grid lg:grid-cols-3 gap-8">
            {[['Best Value', 'fa-hand-holding-dollar', 'text-emerald-500', value], ['Top Gaming', 'fa-gamepad', 'text-rose-500', gaming], ['Trending Now', 'fa-fire', 'text-amber-500', trending]].map(([t, ic, col, list]: any) => (
              <div>
                <h2 class="text-lg font-extrabold text-slate-900 dark:text-white mb-3"><i class={`fas ${ic} ${col} mr-2`} aria-hidden="true"></i>{t}</h2>
                <div class="space-y-4">{list.map((l: any) => <LaptopCard l={l} />)}</div>
              </div>
            ))}
          </section>

          {/* Popular comparisons */}
          <section id="popular-comparisons" class="mt-12">
            <div class="flex items-end justify-between mb-4">
              <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white"><i class="fas fa-scale-balanced text-brand-500 mr-2" aria-hidden="true"></i>Popular Comparisons</h2>
              <a href="/compare" class="text-sm font-semibold text-brand-500 hover:underline">Compare tool →</a>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pairs.map(([x, y]) => (
                <a href={`/compare/${compareSlug(x, y)}`} class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-lg transition p-4">
                  <div class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 leading-snug">{x.name} <span class="text-brand-500">vs</span> {y.name}</div>
                  <div class="text-xs text-slate-500 mt-1.5">{money(x.price)} vs {money(y.price)}</div>
                </a>
              ))}
            </div>
          </section>

          {/* Guides */}
          <section id="guides-strip" class="mt-12">
            <div class="flex items-end justify-between mb-4">
              <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white"><i class="fas fa-book-open text-brand-500 mr-2" aria-hidden="true"></i>Buying Guides</h2>
              <a href="/guides" class="text-sm font-semibold text-brand-500 hover:underline">All guides →</a>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GUIDES.slice(0, 8).map(g => {
                const top = guideRanking(g)[0]
                return (
                  <a href={`/guides/${g.slug}`} class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-lg transition p-4">
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 leading-snug">{g.h1}</h3>
                    {top && <p class="text-xs mt-2 text-emerald-600 dark:text-emerald-400 font-semibold truncate"><i class="fas fa-trophy mr-1" aria-hidden="true"></i>{top.name}</p>}
                  </a>
                )
              })}
            </div>
          </section>

          {/* Methodology */}
          <section id="methodology" class="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
            <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-3">How Our Scores Work</h2>
            <div class="grid md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div><i class="fas fa-microchip text-brand-500 text-lg" aria-hidden="true"></i><h3 class="font-bold text-slate-900 dark:text-white mt-1.5 mb-1">Real Benchmarks</h3><p>PassMark multi-thread CPU scores and G3DMark laptop GPU scores — no marketing numbers, log-normalized across the whole database.</p></div>
              <div><i class="fas fa-users text-brand-500 text-lg" aria-hidden="true"></i><h3 class="font-bold text-slate-900 dark:text-white mt-1.5 mb-1">Verified Buyers</h3><p>Amazon star ratings weighted by review volume, so a 4.6★ with 3,000 reviews counts more than a 5★ with 4.</p></div>
              <div><i class="fas fa-calculator text-brand-500 text-lg" aria-hidden="true"></i><h3 class="font-bold text-slate-900 dark:text-white mt-1.5 mb-1">10 Use-Case Scores</h3><p>Every laptop is scored for gaming, programming, creation, travel, AI and more — each with transparent, documented weightings.</p></div>
            </div>
          </section>
        </div>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}

export const WishlistPage = () => (
  <>
    <Header />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2"><i class="fas fa-heart text-rose-500 mr-2" aria-hidden="true"></i>Your Wishlist</h1>
      <p class="text-slate-500 text-sm mb-6">Saved locally in your browser. Add laptops with the ♥ button anywhere on the site.</p>
      <div id="wishlist-grid" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"></div>
      <div id="wishlist-empty" class="hidden text-center py-20 text-slate-400">
        <i class="far fa-heart text-4xl mb-3" aria-hidden="true"></i>
        <p class="font-semibold">Nothing saved yet.</p>
        <a href="/laptops" class="text-brand-500 hover:underline text-sm">Browse laptops →</a>
      </div>
    </main>
    <CompareBar />
    <Footer />
  </>
)
