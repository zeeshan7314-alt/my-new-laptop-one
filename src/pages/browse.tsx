// Browse page with dynamic filters — /laptops
import { Laptop, LAPTOPS, money } from '../lib/db'
import { Header, Footer, CompareBar, LaptopCard, Breadcrumbs } from '../components/layout'

export interface Filters {
  q?: string; brand?: string; segment?: string; gpu?: string; cpu?: string
  minPrice?: number; maxPrice?: number; ram?: number; storage?: number
  size?: string; res?: string; refresh?: number; panel?: string
  touch?: string; maxWeight?: number; sort?: string
}

export function applyFilters(f: Filters): Laptop[] {
  let out = LAPTOPS.filter(l => {
    if (f.q) {
      const q = f.q.toLowerCase()
      const hay = `${l.name} ${l.cpu.brand} ${l.cpu.model} ${l.gpu.model || ''} ${l.segment}`.toLowerCase()
      if (!q.split(/\s+/).every(t => hay.includes(t))) return false
    }
    if (f.brand && l.brand !== f.brand) return false
    if (f.segment && l.segment !== f.segment) return false
    if (f.gpu === 'dedicated' && !l.gpu.dedicated) return false
    if (f.gpu === 'integrated' && l.gpu.dedicated) return false
    if (f.gpu && f.gpu !== 'dedicated' && f.gpu !== 'integrated' && !(l.gpu.model || '').toLowerCase().includes(f.gpu.toLowerCase())) return false
    if (f.cpu && (l.cpu.brand || '') !== f.cpu) return false
    if (f.minPrice && l.price < f.minPrice) return false
    if (f.maxPrice && l.price > f.maxPrice) return false
    if (f.ram && (l.ram.gb || 0) < f.ram) return false
    if (f.storage && (l.storage.gb || 0) < f.storage) return false
    if (f.size) {
      const s = l.display.sizeInches || 0
      if (f.size === 'small' && s >= 14.5) return false
      if (f.size === 'medium' && (s < 14.5 || s > 16.5)) return false
      if (f.size === 'large' && s <= 16.5) return false
    }
    if (f.res && l.display.resClass !== f.res) return false
    if (f.refresh && (l.display.refreshHz || 0) < f.refresh) return false
    if (f.panel === 'OLED' && !['OLED', 'AMOLED'].includes(l.display.panel || '')) return false
    if (f.panel && f.panel !== 'OLED' && l.display.panel !== f.panel) return false
    if (f.touch === 'yes' && !l.display.touch) return false
    if (f.maxWeight && (l.physical.weightLbs || 99) > f.maxWeight) return false
    return true
  })
  const sorts: Record<string, (a: Laptop, b: Laptop) => number> = {
    'score': (a, b) => b.scores.overall - a.scores.overall,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'gaming': (a, b) => b.scores.gaming - a.scores.gaming,
    'value': (a, b) => b.scores.value - a.scores.value,
    'rating': (a, b) => (b.amazon.rating || 0) - (a.amazon.rating || 0),
    'popular': (a, b) => (b.amazon.reviewCount || 0) - (a.amazon.reviewCount || 0),
    'weight': (a, b) => (a.physical.weightLbs || 99) - (b.physical.weightLbs || 99),
  }
  out.sort(sorts[f.sort || 'score'] || sorts['score'])
  return out
}

const Sel = ({ name, label, opts, cur }: { name: string; label: string; opts: [string, string][]; cur?: string }) => (
  <label class="block">
    <span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
    <select name={name} class="filter-sel mt-1 w-full px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm border border-transparent focus:border-brand-400 focus:outline-none">
      <option value="">Any</option>
      {opts.map(([v, t]) => <option value={v} selected={cur === v}>{t}</option>)}
    </select>
  </label>
)

export const BrowsePage = ({ f }: { f: Filters }) => {
  const results = applyFilters(f)
  const brands = [...new Set(LAPTOPS.map(l => l.brand))].sort()
  const title = f.q ? `Search: "${f.q}"` : f.segment ? `${f.segment} Laptops` : 'Browse All Laptops'
  return (
    <>
      <Header />
      <main class="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: 'Laptops' }]} />
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{title}</h1>
        <p class="text-slate-500 text-sm mb-5"><span id="result-count">{results.length}</span> of {LAPTOPS.length} laptops match · sorted by {f.sort || 'overall score'}</p>
        <div class="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside>
            <form id="filter-form" method="get" action="/laptops" class="lg:sticky lg:top-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="font-bold text-sm text-slate-900 dark:text-white"><i class="fas fa-sliders text-brand-500 mr-1.5" aria-hidden="true"></i>Filters</h2>
                <a href="/laptops" class="text-xs text-brand-500 hover:underline">Reset</a>
              </div>
              {f.q ? <input type="hidden" name="q" value={f.q} /> : null}
              <Sel name="segment" label="Category" cur={f.segment} opts={[['General', 'General'], ['Gaming', 'Gaming'], ['Professional', 'Professional']]} />
              <Sel name="brand" label="Brand" cur={f.brand} opts={brands.map(b => [b, b] as [string, string])} />
              <div class="grid grid-cols-2 gap-2">
                <label class="block"><span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Min $</span>
                  <input type="number" name="minPrice" value={f.minPrice || ''} placeholder="0" class="filter-sel mt-1 w-full px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" /></label>
                <label class="block"><span class="text-[11px] font-bold uppercase tracking-wide text-slate-400">Max $</span>
                  <input type="number" name="maxPrice" value={f.maxPrice || ''} placeholder="10000" class="filter-sel mt-1 w-full px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm" /></label>
              </div>
              <Sel name="gpu" label="Graphics" cur={f.gpu} opts={[['dedicated', 'Dedicated GPU'], ['integrated', 'Integrated GPU'], ['RTX 5050', 'RTX 5050'], ['RTX 5060', 'RTX 5060'], ['RTX 5070', 'RTX 5070 / Ti'], ['RTX 5080', 'RTX 5080'], ['RTX 5090', 'RTX 5090'], ['RTX 4050', 'RTX 4050']]} />
              <Sel name="cpu" label="CPU Brand" cur={f.cpu} opts={[['Intel', 'Intel'], ['AMD', 'AMD'], ['Apple', 'Apple'], ['Snapdragon', 'Snapdragon']]} />
              <Sel name="ram" label="Min RAM" cur={f.ram ? String(f.ram) : undefined} opts={[['8', '8 GB+'], ['16', '16 GB+'], ['32', '32 GB+'], ['64', '64 GB+']]} />
              <Sel name="storage" label="Min Storage" cur={f.storage ? String(f.storage) : undefined} opts={[['256', '256 GB+'], ['512', '512 GB+'], ['1024', '1 TB+'], ['2048', '2 TB+']]} />
              <Sel name="size" label="Screen Size" cur={f.size} opts={[['small', 'Under 14.5″'], ['medium', '14.5–16.5″'], ['large', 'Over 16.5″']]} />
              <Sel name="res" label="Resolution" cur={f.res} opts={[['FHD', 'Full HD'], ['FHD+', 'FHD+ (16:10)'], ['QHD+', 'QHD+'], ['3K+', '3K+'], ['4K', '4K']]} />
              <Sel name="refresh" label="Min Refresh" cur={f.refresh ? String(f.refresh) : undefined} opts={[['120', '120 Hz+'], ['144', '144 Hz+'], ['165', '165 Hz+'], ['240', '240 Hz+']]} />
              <Sel name="panel" label="Panel" cur={f.panel} opts={[['OLED', 'OLED / AMOLED'], ['Mini LED', 'Mini LED'], ['IPS', 'IPS'], ['Liquid Retina', 'Liquid Retina']]} />
              <Sel name="touch" label="Touchscreen" cur={f.touch} opts={[['yes', 'Touch only']]} />
              <Sel name="maxWeight" label="Max Weight" cur={f.maxWeight ? String(f.maxWeight) : undefined} opts={[['3', 'Under 3 lbs'], ['4', 'Under 4 lbs'], ['5', 'Under 5 lbs'], ['6', 'Under 6 lbs']]} />
              <Sel name="sort" label="Sort By" cur={f.sort} opts={[['score', 'Overall Score'], ['value', 'Best Value'], ['gaming', 'Gaming Score'], ['price-asc', 'Price: Low → High'], ['price-desc', 'Price: High → Low'], ['rating', 'Amazon Rating'], ['popular', 'Most Reviewed'], ['weight', 'Lightest']]} />
              <button type="submit" class="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-sm">Apply Filters</button>
            </form>
          </aside>
          <section id="results">
            {results.length === 0
              ? <div class="text-center py-20 text-slate-400"><i class="fas fa-magnifying-glass text-4xl mb-3" aria-hidden="true"></i><p class="font-semibold">No laptops match those filters.</p><a href="/laptops" class="text-brand-500 hover:underline text-sm">Clear filters</a></div>
              : <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{results.map(l => <LaptopCard l={l} />)}</div>}
          </section>
        </div>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}
