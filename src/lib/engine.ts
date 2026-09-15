// =====================================================
// Comparison Engine + Internal-Link Engine + Guide Engine
// =====================================================
import { Laptop, LAPTOPS, cpuLabel, gpuLabel, Scores } from './db'

// ---------- Similarity / internal linking ----------
export function similar(l: Laptop, n = 4): Laptop[] {
  return LAPTOPS.filter(x => x.id !== l.id)
    .map(x => ({ x, d: simDist(l, x) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n).map(v => v.x)
}
function simDist(a: Laptop, b: Laptop): number {
  const dp = Math.abs(Math.log(a.price) - Math.log(b.price))
  const dperf = Math.abs(a.scores.overall - b.scores.overall) / 10
  const dseg = a.segment === b.segment ? 0 : 0.8
  const dgpu = a.gpu.dedicated === b.gpu.dedicated ? 0 : 0.5
  return dp * 1.2 + dperf * 2 + dseg + dgpu
}

export function betterAlternative(l: Laptop): Laptop | undefined {
  return LAPTOPS.filter(x => x.id !== l.id && x.scores.overall > l.scores.overall && x.price <= l.price * 1.25 && x.segment === l.segment)
    .sort((a, b) => b.scores.overall - a.scores.overall)[0]
}
export function cheaperAlternative(l: Laptop): Laptop | undefined {
  return LAPTOPS.filter(x => x.id !== l.id && x.price < l.price * 0.85 && x.scores.overall >= l.scores.overall - 1.2)
    .sort((a, b) => b.scores.value - a.scores.value)[0]
}
export function premiumAlternative(l: Laptop): Laptop | undefined {
  return LAPTOPS.filter(x => x.id !== l.id && x.price > l.price * 1.15 && x.scores.overall > l.scores.overall)
    .sort((a, b) => a.price - b.price)[0]
}
export function sameBrand(l: Laptop, n = 3) {
  return LAPTOPS.filter(x => x.id !== l.id && x.brand === l.brand)
    .sort((a, b) => Math.abs(a.price - l.price) - Math.abs(b.price - l.price)).slice(0, n)
}
export function sameCpu(l: Laptop, n = 3) {
  return LAPTOPS.filter(x => x.id !== l.id && x.cpu.model && x.cpu.model === l.cpu.model).slice(0, n)
}
export function sameGpu(l: Laptop, n = 3) {
  if (!l.gpu.dedicated || !l.gpu.model) return []
  return LAPTOPS.filter(x => x.id !== l.id && x.gpu.model === l.gpu.model).slice(0, n)
}
export function sameBudget(l: Laptop, n = 3) {
  return LAPTOPS.filter(x => x.id !== l.id && Math.abs(x.price - l.price) / l.price < 0.15)
    .sort((a, b) => b.scores.overall - a.scores.overall).slice(0, n)
}

// ---------- Comparison Engine ----------
export interface CompareRow {
  label: string
  a: string; b: string
  winner: 0 | 1 | 2   // 0=tie, 1=a, 2=b
  weight: number
}
export function compareLaptops(a: Laptop, b: Laptop) {
  const rows: CompareRow[] = []
  const num = (label: string, va: number | null, vb: number | null, fmt: (v: number) => string, weight = 1, lowerBetter = false) => {
    const w = va == null || vb == null || va === vb ? 0 : ((lowerBetter ? va < vb : va > vb) ? 1 : 2)
    rows.push({ label, a: va == null ? '—' : fmt(va), b: vb == null ? '—' : fmt(vb), winner: w as 0 | 1 | 2, weight })
  }
  num('CPU Benchmark (PassMark)', a.cpu.passmark, b.cpu.passmark, v => v.toLocaleString(), 3)
  num('GPU Benchmark (G3DMark)', a.gpu.g3dmark, b.gpu.g3dmark, v => v.toLocaleString(), 3)
  num('RAM', a.ram.gb, b.ram.gb, v => `${v} GB ${''}`.trim(), 2)
  num('Storage', a.storage.gb, b.storage.gb, v => v >= 1024 ? `${v / 1024} TB` : `${v} GB`, 1.5)
  num('Refresh Rate', a.display.refreshHz, b.display.refreshHz, v => `${v} Hz`, 1.5)
  num('Pixel Density', a.display.ppi, b.display.ppi, v => `${v} PPI`, 1)
  num('Weight', a.physical.weightLbs, b.physical.weightLbs, v => `${v} lbs`, 1.5, true)
  num('Thickness', a.physical.thicknessIn, b.physical.thicknessIn, v => `${v}″`, 0.8, true)
  num('Amazon Rating', a.amazon.rating, b.amazon.rating, v => `${v} ★`, 1)
  num('Price (lower wins)', a.price, b.price, v => '$' + v.toLocaleString(), 2, true)
  num('Value Score', a.scores.value, b.scores.value, v => `${v}/10`, 2)

  let sa = 0, sb = 0
  for (const r of rows) { if (r.winner === 1) sa += r.weight; else if (r.winner === 2) sb += r.weight }
  const winner: 0 | 1 | 2 = sa === sb ? 0 : sa > sb ? 1 : 2
  return { rows, pointsA: Math.round(sa * 10) / 10, pointsB: Math.round(sb * 10) / 10, winner }
}

// Category winner helper for score bars
export const SCORE_KEYS: { key: keyof Scores; label: string }[] = [
  { key: 'gaming', label: 'Gaming' },
  { key: 'office', label: 'Productivity' },
  { key: 'programming', label: 'Programming' },
  { key: 'engineering', label: 'Engineering / 3D' },
  { key: 'student', label: 'Student' },
  { key: 'travel', label: 'Travel / Portability' },
  { key: 'ai', label: 'AI Workloads' },
  { key: 'value', label: 'Value for Money' },
]

// ---------- Popular comparison pairs (for hub + internal links) ----------
export function popularPairs(limit = 30): [Laptop, Laptop][] {
  const pairs: { p: [Laptop, Laptop]; score: number }[] = []
  const sorted = [...LAPTOPS].sort((x, y) => (y.amazon.reviewCount || 0) - (x.amazon.reviewCount || 0))
  const top = sorted.slice(0, 40)
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const a = top[i], c = top[j]
      const priceClose = Math.abs(Math.log(a.price) - Math.log(c.price)) < 0.25
      if (!priceClose) continue
      const interest = (a.amazon.reviewCount || 0) + (c.amazon.reviewCount || 0)
        + (a.segment === c.segment ? 5000 : 0) + (a.brand !== c.brand ? 3000 : 0)
      pairs.push({ p: [a, c], score: interest })
    }
  }
  pairs.sort((x, y) => y.score - x.score)
  const used = new Set<number>(), out: [Laptop, Laptop][] = []
  for (const { p } of pairs) {
    const k = p[0].id * 1000 + p[1].id
    if (used.has(k)) continue
    used.add(k)
    out.push(p)
    if (out.length >= limit) break
  }
  return out
}

export const compareSlug = (a: Laptop, b: Laptop) =>
  [a.slug, b.slug].sort().join('-vs-')

export function parseCompareSlug(slug: string): [Laptop, Laptop] | null {
  const idx = slug.indexOf('-vs-')
  if (idx < 0) return null
  // slugs themselves may contain '-vs-'? no — try every split point
  const parts = slug.split('-vs-')
  if (parts.length !== 2) {
    // try all split combos
    for (let i = 1; i < parts.length; i++) {
      const s1 = parts.slice(0, i).join('-vs-'), s2 = parts.slice(i).join('-vs-')
      const a = LAPTOPS.find(l => l.slug === s1), b = LAPTOPS.find(l => l.slug === s2)
      if (a && b) return [a, b]
    }
    return null
  }
  const a = LAPTOPS.find(l => l.slug === parts[0])
  const b = LAPTOPS.find(l => l.slug === parts[1])
  return a && b ? [a, b] : null
}

// ---------- Buying Guide Engine ----------
export interface Guide {
  slug: string
  title: string
  h1: string
  description: string
  intro: string
  scoreKey: keyof Scores
  filter: (l: Laptop) => boolean
  limit: number
}

export const GUIDES: Guide[] = [
  { slug: 'best-gaming-laptops', title: 'Best Gaming Laptops in 2026', h1: 'Best Gaming Laptops', scoreKey: 'gaming',
    description: 'The best gaming laptops of 2026 ranked by real GPU & CPU benchmarks — from budget RTX machines to RTX 5090 flagships.',
    intro: 'Ranked with our gaming score: 46% GPU benchmark, 22% CPU, plus RAM, refresh rate and storage. Only laptops with dedicated GPUs qualify.',
    filter: l => l.gpu.dedicated, limit: 12 },
  { slug: 'best-student-laptops', title: 'Best Laptops for Students in 2026', h1: 'Best Student Laptops', scoreKey: 'student',
    description: 'Top student laptops of 2026: light, affordable, reliable. Ranked by value, portability and verified Amazon ratings.',
    intro: 'Our student score balances price, weight, performance and buyer satisfaction — perfect for note-taking, essays and streaming.',
    filter: l => l.price <= 1200, limit: 12 },
  { slug: 'best-engineering-laptops', title: 'Best Engineering Laptops in 2026', h1: 'Best Engineering Laptops', scoreKey: 'engineering',
    description: 'Best laptops for CAD, simulation and 3D work in 2026 — ranked by combined CPU + GPU compute with 16GB+ RAM.',
    intro: 'Engineering workloads need CPU + GPU together. We weight both at 30% each, plus RAM (20%) for large assemblies.',
    filter: l => (l.ram.gb || 0) >= 16, limit: 10 },
  { slug: 'best-rtx-5060-laptops', title: 'Best RTX 5060 Laptops in 2026', h1: 'Best RTX 5060 Laptops', scoreKey: 'gaming',
    description: 'Every RTX 5060 gaming laptop ranked by benchmark scores, thermals headroom and price-per-frame.',
    intro: 'The RTX 5060 is 2026\u2019s sweet-spot GPU. These are the best implementations, ranked by overall gaming performance and value.',
    filter: l => (l.gpu.model || '').includes('5060'), limit: 10 },
  { slug: 'best-oled-laptops', title: 'Best OLED & Mini-LED Laptops in 2026', h1: 'Best OLED Laptops', scoreKey: 'engineering',
    description: 'The best OLED, AMOLED and Mini-LED laptops of 2026 for perfect blacks and cinema-grade color.',
    intro: 'Self-emissive and Mini-LED panels deliver the best contrast money can buy. Ranked by display quality and workstation benchmarks.',
    filter: l => ['OLED', 'AMOLED', 'Mini LED'].includes(l.display.panel || ''), limit: 10 },
  { slug: 'best-lightweight-laptops', title: 'Best Lightweight Laptops in 2026', h1: 'Best Lightweight Laptops', scoreKey: 'travel',
    description: 'Best ultraportable laptops under 3.5 lbs in 2026 — ranked by weight, thinness and battery-friendly efficiency.',
    intro: 'Everything here is under 3.5 lbs. Ranked by our travel score: weight (34%), thinness, performance and screen.',
    filter: l => (l.physical.weightLbs || 99) <= 3.5, limit: 12 },
  { slug: 'best-budget-laptops', title: 'Best Budget Laptops in 2026', h1: 'Best Budget Laptops', scoreKey: 'value',
    description: 'Best cheap laptops of 2026 under $600 that are actually worth buying — ranked by performance-per-dollar.',
    intro: 'Under $600 and no e-waste allowed. Ranked purely by our value score: performance-per-dollar with rating confidence.',
    filter: l => l.price <= 600, limit: 12 },
  { slug: 'best-programming-laptops', title: 'Best Laptops for Programming in 2026', h1: 'Best Programming Laptops', scoreKey: 'programming',
    description: 'The best developer laptops of 2026 — ranked by multicore CPU, RAM, tall screens and SSD speed.',
    intro: 'Compilers love cores and RAM. Our programming score weights CPU 34%, RAM 24%, storage & display quality the rest — with a bonus for 16:10 screens.',
    filter: () => true, limit: 12 },
  { slug: 'best-video-editing-laptops', title: 'Best Video Editing Laptops in 2026', h1: 'Best Video Editing Laptops', scoreKey: 'engineering',
    description: 'Best laptops for Premiere Pro, DaVinci Resolve and Final Cut in 2026 — ranked by encode power and color-accurate panels.',
    intro: 'Timeline scrubbing needs GPU + CPU; grading needs a great panel. Ranked by dedicated GPU power and multicore performance.',
    filter: l => (l.ram.gb || 0) >= 16, limit: 10 },
  { slug: 'best-ai-laptops', title: 'Best AI Laptops in 2026', h1: 'Best AI Laptops', scoreKey: 'ai',
    description: 'Best laptops for local LLMs, Stable Diffusion and ML dev in 2026 — ranked by GPU compute and RAM capacity.',
    intro: 'Local inference is bound by GPU compute and memory. Our AI score: GPU 34%, CPU 28%, RAM 26%.',
    filter: l => (l.ram.gb || 0) >= 16, limit: 10 },
  { slug: 'best-business-laptops', title: 'Best Business Laptops in 2026', h1: 'Best Business Laptops', scoreKey: 'office',
    description: 'The most dependable business laptops of 2026 — ranked by productivity performance, portability and buyer satisfaction.',
    intro: 'Boardroom to airport: our office score rewards CPU responsiveness, light weight, good screens and proven reliability ratings.',
    filter: l => l.segment !== 'Gaming', limit: 12 },
  { slug: 'best-2-in-1-laptops', title: 'Best 2-in-1 Convertible Laptops in 2026', h1: 'Best 2-in-1 Laptops', scoreKey: 'office',
    description: 'The best convertible touchscreen laptops of 2026 — tablets when you want, laptops when you need.',
    intro: 'Every pick here folds flat or flips around, with touch input standard. Ranked by productivity and versatility.',
    filter: l => l.formFactor === '2-in-1', limit: 10 },
  { slug: 'best-laptops-under-500', title: 'Best Laptops Under $500 in 2026', h1: 'Best Laptops Under $500', scoreKey: 'value',
    description: 'Top laptops under $500 in 2026 that don\u2019t suck — real SSDs, IPS panels, and CPUs that can actually multitask.',
    intro: 'Under $500 the traps are everywhere: eMMC storage, 4GB RAM, TN panels. These picks avoid all of them.',
    filter: l => l.price < 500, limit: 10 },
  { slug: 'best-laptops-under-1000', title: 'Best Laptops Under $1000 in 2026', h1: 'Best Laptops Under $1000', scoreKey: 'value',
    description: 'The best laptops under $1000 in 2026 — where mid-range pricing meets near-flagship performance.',
    intro: 'The $600–$1000 band is where value peaks in 2026. Ranked by value score with benchmark tiebreaker.',
    filter: l => l.price < 1000, limit: 12 },
  { slug: 'best-laptops-under-1500', title: 'Best Laptops Under $1500 in 2026', h1: 'Best Laptops Under $1500', scoreKey: 'value',
    description: 'Best premium laptops under $1500 in 2026 — high-refresh gaming rigs, OLED ultrabooks and creator machines.',
    intro: 'At $1500 you should compromise on nothing. Ranked by value and performance across every discipline.',
    filter: l => l.price < 1500, limit: 12 },
  { slug: 'best-macbooks', title: 'Best MacBooks in 2026', h1: 'Best MacBooks', scoreKey: 'office',
    description: 'Every Apple MacBook ranked for 2026 — M-series Air and Pro compared by real benchmark data.',
    intro: 'Apple silicon dominates efficiency. Every MacBook in our database, ranked by productivity performance.',
    filter: l => l.brand === 'Apple', limit: 10 },
]

// Guides this laptop appears in (for SEO internal links from product pages)
export function guidesFor(l: Laptop, n = 5): { guide: Guide; rank: number }[] {
  const out: { guide: Guide; rank: number }[] = []
  for (const g of GUIDES) {
    const idx = guideRanking(g).findIndex(x => x.id === l.id)
    if (idx >= 0) out.push({ guide: g, rank: idx + 1 })
  }
  return out.sort((a, b) => a.rank - b.rank).slice(0, n)
}

// Comparisons involving this laptop, against its most relevant rivals
export function comparisonsFor(l: Laptop, n = 6): Laptop[] {
  return similar(l, n)
}

// Related guides (share overlapping laptops with the given guide)
export function relatedGuides(g: Guide, n = 4): Guide[] {
  const mine = new Set(guideRanking(g).map(l => l.id))
  return GUIDES.filter(x => x.slug !== g.slug)
    .map(x => ({ x, overlap: guideRanking(x).filter(l => mine.has(l.id)).length }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, n).map(v => v.x)
}

export function guideRanking(g: Guide): Laptop[] {
  return LAPTOPS.filter(g.filter)
    .sort((a, b) => b.scores[g.scoreKey] - a.scores[g.scoreKey] || b.scores.overall - a.scores.overall)
    .slice(0, g.limit)
}

// ---------- Review content generator (deterministic, data-driven) ----------
export function verdictLine(l: Laptop): string {
  const s = l.scores
  if (s.overall >= 8.5) return `${l.name} is one of the strongest laptops in our entire database`
  if (s.overall >= 7) return `${l.name} is an excellent pick in its class`
  if (s.overall >= 5.5) return `${l.name} is a solid, well-rounded choice`
  if (s.overall >= 4) return `${l.name} is a capable machine for everyday basics`
  return `${l.name} is a bare-essentials machine best suited to light use`
}

export function prosCons(l: Laptop): { pros: string[]; cons: string[] } {
  const pros: string[] = [], cons: string[] = []
  const d = l.display, s = l.scores
  if ((l.cpu.passmark || 0) > 30000) pros.push(`Powerful ${cpuLabel(l)} scores ${l.cpu.passmark!.toLocaleString()} in PassMark — flagship-class CPU speed`)
  else if ((l.cpu.passmark || 0) > 18000) pros.push(`${cpuLabel(l)} delivers strong multi-core performance (${l.cpu.passmark!.toLocaleString()} PassMark)`)
  if ((l.gpu.g3dmark || 0) > 20000) pros.push(`${l.gpu.model} pushes ${l.gpu.g3dmark!.toLocaleString()} G3DMark — high-FPS AAA gaming`)
  else if (l.gpu.dedicated) pros.push(`Dedicated ${l.gpu.model} GPU for 1080p gaming and GPU-accelerated apps`)
  if ((d.refreshHz || 60) >= 144) pros.push(`${d.refreshHz} Hz high-refresh display for fluid motion`)
  if (['OLED', 'AMOLED'].includes(d.panel || '')) pros.push(`${d.panel} panel with perfect blacks and vivid color`)
  if (d.panel === 'Mini LED') pros.push('Mini-LED panel with high brightness and deep contrast')
  if ((l.ram.gb || 0) >= 32) pros.push(`${l.ram.gb} GB RAM handles heavy multitasking and pro workloads`)
  if ((l.storage.gb || 0) >= 1024) pros.push(`Spacious ${l.storage.gb! / 1024} TB ${l.storage.type} storage`)
  if ((l.physical.weightLbs || 9) <= 3.2) pros.push(`Very light at ${l.physical.weightLbs} lbs — genuine grab-and-go portability`)
  if (!l.ram.soldered) pros.push('User-upgradeable RAM extends useful lifespan')
  if ((l.amazon.rating || 0) >= 4.4 && (l.amazon.reviewCount || 0) >= 300) pros.push(`Strong ${l.amazon.rating}★ average across ${l.amazon.reviewCount!.toLocaleString()} Amazon reviews`)
  if (s.value >= 7.5) pros.push('Outstanding performance-per-dollar in its price bracket')
  if (d.touch) pros.push('Touchscreen input' + (l.formFactor === '2-in-1' ? ' with 2-in-1 convertible hinge' : ''))

  if ((l.cpu.passmark || 0) < 8000) cons.push(`Entry-level CPU (${l.cpu.passmark?.toLocaleString() || '—'} PassMark) will struggle beyond basic tasks`)
  if (!l.gpu.dedicated && l.segment === 'Gaming') cons.push('No dedicated GPU — not suitable for modern gaming')
  else if (!l.gpu.dedicated && s.gaming < 4) cons.push('Integrated graphics only — light/older games at low settings')
  if ((l.ram.gb || 0) <= 8) cons.push(`${l.ram.gb} GB RAM is limiting for heavy multitasking in 2026`)
  if (l.ram.soldered) cons.push('RAM is soldered — no memory upgrades later')
  if ((l.storage.gb || 0) < 256) cons.push(`Only ${l.storage.raw} of storage fills up fast`)
  if (l.storage.type === 'eMMC') cons.push('Slow eMMC storage instead of a real SSD')
  if ((d.refreshHz || 60) === 60 && l.segment === 'Gaming') cons.push('60 Hz panel undercuts the gaming experience')
  if ((d.resW || 1920) < 1920) cons.push(`Low ${d.resolution} resolution looks dated`)
  if ((l.physical.weightLbs || 0) >= 6) cons.push(`Heavy at ${l.physical.weightLbs} lbs — desk-bound by design`)
  if ((l.amazon.rating || 5) < 4.0 && (l.amazon.reviewCount || 0) > 50) cons.push(`Mixed buyer feedback (${l.amazon.rating}★ average)`)
  if (s.value < 4) cons.push('Price runs ahead of what the spec sheet delivers')
  if (cons.length === 0) cons.push('Little to fault at this price — check stock levels, popular configs sell out')
  return { pros: pros.slice(0, 6), cons: cons.slice(0, 5) }
}

export function whoFor(l: Laptop): { buy: string[]; avoid: string[] } {
  const s = l.scores, buy: string[] = [], avoid: string[] = []
  if (s.gaming >= 7) buy.push('Gamers who want high-FPS AAA performance without a desktop')
  else if (s.gaming >= 5) buy.push('Casual gamers happy at 1080p medium settings')
  if (s.programming >= 7) buy.push('Developers running IDEs, containers and local builds')
  if (s.engineering >= 7) buy.push('Engineers, 3D artists, and video editors who need compute')
  if (s.student >= 7) buy.push('Students who need reliable all-day productivity on a budget')
  if (s.travel >= 7) buy.push('Frequent travelers who count every ounce in their bag')
  if (s.ai >= 7) buy.push('AI tinkerers running local models and CUDA workloads')
  if (s.office >= 7) buy.push('Professionals living in browsers, spreadsheets and video calls')
  if (buy.length === 0) buy.push('Buyers who need basic web, email and document work at minimal cost')

  if (s.gaming < 5) avoid.push('Serious gamers — the graphics hardware isn\u2019t there')
  if (s.travel < 5) avoid.push('Anyone commuting daily with a laptop — too heavy/bulky')
  if (s.engineering < 5) avoid.push('Heavy 3D modeling, CAD, or GPU rendering workloads')
  if ((l.ram.gb || 0) <= 8) avoid.push('Power users who keep 40 browser tabs and 5 apps open')
  if (avoid.length === 0) avoid.push('Bargain hunters — similar performance exists for less if you shop the tier below')
  return { buy: buy.slice(0, 4), avoid: avoid.slice(0, 3) }
}

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h) + slug.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function getAnchor(url: string, l: Laptop, rival?: Laptop, seed = 0): string {
  if (url.includes('/guides/best-gaming-laptops')) {
    const list = [
      'top-rated gaming laptops guide',
      'our 2026 gaming laptop rankings',
      'curated gaming notebook benchmarks',
      'definitive guide to the best gaming laptops',
      'high-performance gaming laptop roundup',
      'curated best gaming laptops'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-rtx-5060-laptops')) {
    const list = [
      'best RTX 5060 laptops guide',
      'top RTX 5060 gaming machines',
      'benchmarked RTX 5060 laptop roundup',
      'curated RTX 5060 laptop rankings',
      'dedicated RTX 5060 buyer\'s guide'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-student-laptops')) {
    const list = [
      'best student laptops guide',
      'our top-rated laptops for students',
      'curated college laptop recommendations',
      'campus-ready student notebook rankings',
      'best laptops for student productivity'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-engineering-laptops')) {
    const list = [
      'best engineering laptops guide',
      'workstation laptops for engineering and CAD',
      'curated engineering laptop rankings',
      'high-compute machines for CAD and simulation',
      'top-rated laptops for engineers'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-programming-laptops')) {
    const list = [
      'best programming laptops guide',
      'top developer laptops ranking',
      'coding and software development laptop roundup',
      'compiler-tested developer laptops guide',
      'curated programming laptops collection'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-video-editing-laptops')) {
    const list = [
      'best video editing laptops guide',
      'top creator laptops for Premiere and DaVinci',
      'curated video editing and content creation laptops',
      'timeline-tested video editing laptop rankings',
      'our guide to the best video editing laptops'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-lightweight-laptops')) {
    const list = [
      'best lightweight laptops guide',
      'top ultraportables under 3.5 lbs',
      'curated lightweight laptops ranking',
      'travel-friendly lightweight laptops roundup',
      'our favorite ultraportable commuter laptops'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-oled-laptops')) {
    const list = [
      'best OLED laptops guide',
      'top OLED and Mini-LED display rankings',
      'curated OLED laptop screens roundup',
      'vibrant OLED and AMOLED laptops guide',
      'leading high-contrast OLED laptops'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-2-in-1-laptops')) {
    const list = [
      'best 2-in-1 laptops guide',
      'top convertible 2-in-1 touchscreens',
      'curated 2-in-1 laptop rankings',
      'flexible 2-in-1 convertible notebooks',
      'our guide to the best 2-in-1 laptops'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-macbooks')) {
    const list = [
      'best MacBooks guide',
      'complete Apple MacBook lineup rankings',
      'curated M-series MacBook guide',
      'our guide to the best Apple MacBooks',
      'benchmarked MacBook Air and Pro lineup'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-laptops-under-500')) {
    const list = [
      'best laptops under $500 guide',
      'top-scoring laptops under $500',
      'our sub-$500 budget laptop recommendations',
      'best budget laptops under $500 ranking',
      'affordable notebook picks under $500'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-laptops-under-1000')) {
    const list = [
      'best laptops under $1,000 guide',
      'top mid-range laptops under $1,000',
      'our recommended laptops under $1,000',
      'curated sub-$1,000 laptop rankings',
      'best value laptops under $1,000'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-laptops-under-1500')) {
    const list = [
      'best laptops under $1,500 ranking',
      'premium laptops under $1,500 guide',
      'our top-tier laptop picks under $1,500',
      'curated sub-$1,500 laptop recommendations',
      'best laptops under $1,500'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-budget-laptops')) {
    const list = [
      'best budget laptops guide',
      'curated cheap laptops that don\'t suck',
      'top-performing budget laptop rankings',
      'our recommended budget-friendly laptops',
      'best value budget laptops'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/guides/best-business-laptops')) {
    const list = [
      'best business laptops guide',
      'top-rated business laptop rankings',
      'curated workplace and enterprise laptops',
      'dependable business laptops roundup'
    ]
    return list[seed % list.length]
  }
  if (url.includes('/compare/') && rival) {
    const list = [
      `head-to-head ${l.model} vs ${rival.name} comparison`,
      `direct benchmark showdown with the ${rival.name}`,
      `spec-by-spec ${l.name} vs ${rival.name} matchup`,
      `side-by-side analysis against the ${rival.name}`,
      `direct comparison review vs the ${rival.name}`
    ]
    return list[seed % list.length]
  }
  if (url === '/compare') {
    const list = [
      'interactive laptop comparison tool',
      'side-by-side specification comparator',
      'multi-model laptop comparison engine',
      'head-to-head benchmark matrix'
    ]
    return list[seed % list.length]
  }
  if (url.includes('refresh=144')) {
    const list = [
      '144Hz+ high-refresh laptops',
      'high-refresh-rate laptop catalog',
      '144Hz and faster gaming displays'
    ]
    return list[seed % list.length]
  }
  if (url.includes('gpu=dedicated')) {
    const list = [
      'laptops with dedicated graphics',
      'dedicated GPU laptop catalog',
      'discrete graphics laptops in our database'
    ]
    return list[seed % list.length]
  }
  if (url.includes('cpu=')) {
    const list = [
      `all ${l.cpu.brand || 'Intel/AMD'} laptops in our database`,
      `other ${l.cpu.brand || 'competing'}-powered laptops`,
      `our catalog of ${l.cpu.brand || 'modern'} processor laptops`
    ]
    return list[seed % list.length]
  }
  if (url.includes('brand=')) {
    const list = [
      `the full ${l.brand} laptop lineup`,
      `all ${l.brand} models in our database`,
      `our complete ${l.brand} laptop catalog`
    ]
    return list[seed % list.length]
  }
  if (url.includes('segment=')) {
    const list = [
      `${l.segment.toLowerCase()} laptops category`,
      `${l.segment.toLowerCase()} laptops catalog`,
      `our ${l.segment.toLowerCase()} laptop leaderboard`
    ]
    return list[seed % list.length]
  }
  return 'detailed laptop buying guide'
}

function getSectionSnippet(sec: string, url: string, anchor: string, seed = 0): string {
  const linkHtml = `<a href="${url}">${anchor}</a>`
  if (sec === 'gaming') {
    if (url.includes('/guides/best-rtx-5060-laptops')) {
      const v = [
        ` See how this configuration stacks up in our ${linkHtml}.`,
        ` Check benchmark frame rates against contenders in our ${linkHtml}.`,
        ` It is currently featured in our ${linkHtml}.`,
        ` Compare its cooling and power profiles in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    if (url.includes('/guides/best-gaming-laptops')) {
      const v = [
        ` Compare benchmark frame rates against top rigs in our ${linkHtml}.`,
        ` See where its discrete GPU places it in our ${linkHtml}.`,
        ` Explore how it stacks up against rivals in our ${linkHtml}.`,
        ` You can track its gaming index score in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    const v = [
      ` You can also compare other options in our ${linkHtml}.`,
      ` Explore competing configurations across all ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'display') {
    if (url.includes('/guides/best-oled-laptops')) {
      const v = [
        ` See where its panel ranks in our ${linkHtml}.`,
        ` Compare its contrast ratio and color gamut with top picks in our ${linkHtml}.`,
        ` It is featured for its visual fidelity in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    if (url.includes('/guides/best-2-in-1-laptops')) {
      const v = [
        ` Compare its convertible touch versatility in our ${linkHtml}.`,
        ` See where its 2-in-1 hinge ranks in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    const v = [
      ` Explore competing high-frame-rate options in our ${linkHtml}.`,
      ` For competitive smoothness, browse all ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'battery') {
    if (url.includes('/guides/best-macbooks')) {
      const v = [
        ` Compare real-world battery endurance across our ${linkHtml}.`,
        ` See where its efficiency scores land in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    const v = [
      ` Its lightweight chassis makes it a natural candidate for our ${linkHtml}.`,
      ` Commuters seeking all-day portability can see how it ranks in our ${linkHtml}.`,
      ` Compare its travel footprint with other models in our ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'productivity') {
    if (url.includes('/guides/best-student-laptops')) {
      const v = [
        ` Its balanced footprint makes it a strong contender in our ${linkHtml}.`,
        ` See where it places for academic workloads in our ${linkHtml}.`,
        ` Compare campus battery and note-taking ergonomics in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    const v = [
      ` This score makes it competitive alongside top picks in our ${linkHtml}.`,
      ` For demanding spreadsheet workflows and multitasking, compare models in our ${linkHtml}.`,
      ` See how it rates for enterprise reliability in our ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'programming') {
    const v = [
      ` Software engineers can see how its build performance compares in our ${linkHtml}.`,
      ` Compare Docker compile times against alternatives in our ${linkHtml}.`,
      ` It is evaluated alongside other developer machines in our ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'videoEditing') {
    const v = [
      ` Content creators can compare timeline export speeds against our ${linkHtml}.`,
      ` See how its GPU acceleration scores in our ${linkHtml}.`,
      ` Compare rendering benchmarks with other creative rigs in our ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'rendering') {
    const v = [
      ` 3D designers can evaluate its viewport performance against competitors in our ${linkHtml}.`,
      ` Compare simulation and CAD compute benchmarks in our ${linkHtml}.`,
      ` See how it handles complex assemblies in our ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'performance') {
    if (url.includes('/guides/best-engineering-laptops')) {
      const v = [
        ` For heavy compilation and multi-threaded simulations, compare it with top picks in our ${linkHtml}.`,
        ` High-throughput workloads can benchmark this CPU against alternatives in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    const v = [
      ` You can also compare clock speeds with other ${linkHtml}.`,
      ` Explore benchmark scores across ${linkHtml}.`,
      ` See how it compares to competing chips in ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  if (sec === 'value') {
    if (url.startsWith('/guides/')) {
      const v = [
        ` Compare its value score with contenders in our ${linkHtml}.`,
        ` See where its performance-per-dollar ranks in our ${linkHtml}.`,
        ` It is evaluated alongside price-bracket rivals in our ${linkHtml}.`,
        ` Check our breakdown of competing options in our ${linkHtml}.`
      ]
      return v[seed % v.length]
    }
    const v = [
      ` Compare pricing across ${linkHtml}.`,
      ` Explore alternative price tiers in ${linkHtml}.`
    ]
    return v[seed % v.length]
  }
  return ` Check our ${linkHtml}.`
}

export function sectionText(l: Laptop) {
  const s = l.scores, d = l.display
  const cpu = cpuLabel(l), gpu = gpuLabel(l)
  const pm = l.cpu.passmark?.toLocaleString() || 'N/A'
  const g3 = l.gpu.g3dmark?.toLocaleString()
  const pct = (k: keyof Scores) => {
    const better = LAPTOPS.filter(x => x.scores[k] < l.scores[k]).length
    return Math.round((better / (LAPTOPS.length - 1)) * 100)
  }

  const h = hashSlug(l.slug)
  const targetCount = (h % 2 === 0) ? 3 : 4
  const rivals = comparisonsFor(l, 1)
  const rival = rivals[0]

  // Build candidate links
  type Candidate = [string, string, number]
  const cands: Candidate[] = []

  // 1. Gaming
  if (l.gpu.dedicated) {
    if ((l.gpu.model || '').includes('5060')) {
      cands.push(['gaming', '/guides/best-rtx-5060-laptops', 10])
    } else {
      cands.push(['gaming', '/guides/best-gaming-laptops', 9])
    }
  }

  // 2. Display
  const panel = l.display.panel || ''
  if (['OLED', 'AMOLED', 'Mini LED'].includes(panel)) {
    cands.push(['display', '/guides/best-oled-laptops', 9])
  } else if (l.formFactor === '2-in-1') {
    cands.push(['display', '/guides/best-2-in-1-laptops', 8])
  } else if ((l.display.refreshHz || 60) >= 144) {
    cands.push(['display', '/laptops?refresh=144', 7])
  }

  // 3. Battery / Portability
  if (l.brand === 'Apple') {
    cands.push(['battery', '/guides/best-macbooks', 9])
  } else if ((l.physical.weightLbs || 9) <= 3.5) {
    cands.push(['battery', '/guides/best-lightweight-laptops', 8])
  }

  // 4. Programming
  if (l.scores.programming >= 7) {
    cands.push(['programming', '/guides/best-programming-laptops', 7])
  }

  // 5. Video Editing
  if (l.scores.engineering >= 7 && l.gpu.dedicated) {
    cands.push(['videoEditing', '/guides/best-video-editing-laptops', 7])
  }

  // 6. Rendering
  if (l.scores.engineering >= 7) {
    cands.push(['rendering', '/guides/best-engineering-laptops', 6])
  }

  // 7. Productivity
  if (l.scores.student >= 7) {
    cands.push(['productivity', '/guides/best-student-laptops', 6])
  } else if (l.scores.office >= 7 && l.segment !== 'Gaming') {
    cands.push(['productivity', '/guides/best-business-laptops', 6])
  }

  // 8. Performance
  if ((l.cpu.passmark || 0) > 25000) {
    cands.push(['performance', '/guides/best-engineering-laptops', 5])
  } else {
    cands.push(['performance', `/laptops?cpu=${encodeURIComponent(l.cpu.brand || '')}`, 4])
  }

  // 9. Value
  if (l.price < 500) {
    cands.push(['value', '/guides/best-laptops-under-500', 8])
  } else if (l.price < 600) {
    cands.push(['value', '/guides/best-budget-laptops', 7])
  } else if (l.price < 1000) {
    cands.push(['value', '/guides/best-laptops-under-1000', 6])
  } else if (l.price < 1500) {
    cands.push(['value', '/guides/best-laptops-under-1500', 5])
  } else {
    cands.push(['value', `/laptops?brand=${encodeURIComponent(l.brand)}`, 4])
  }

  // 10. Alternatives
  if (rival) {
    cands.push(['alternatives', `/compare/${compareSlug(l, rival)}`, 6])
  } else {
    cands.push(['alternatives', '/compare', 5])
  }

  // 11. Verdict
  const gList = guidesFor(l, 1)
  if (gList.length > 0) {
    cands.push(['verdict', `/guides/${gList[0].guide.slug}`, 5])
  } else {
    cands.push(['verdict', `/laptops?segment=${encodeURIComponent(l.segment)}`, 4])
  }

  // Sort with hash-based rotation to diversify selected sections across laptops
  cands.sort((a, b) => {
    const aHash = (h + hashSlug(a[0])) % 7
    const bHash = (h + hashSlug(b[0])) % 7
    return (b[2] * 10 + bHash) - (a[2] * 10 + aHash)
  })

  // Select targetCount distinct sections and distinct URLs
  const selected: Record<string, { url: string; anchor: string; snippet: string }> = {}
  const usedUrls = new Set<string>()

  for (const [sec, url] of cands) {
    if (selected[sec] || usedUrls.has(url)) continue
    const anchor = getAnchor(url, l, rival, h + Object.keys(selected).length)
    const snippet = getSectionSnippet(sec, url, anchor, h + Object.keys(selected).length)
    selected[sec] = { url, anchor, snippet }
    usedUrls.add(url)
    if (Object.keys(selected).length === targetCount) break
  }

  // Backfill if needed
  if (Object.keys(selected).length < targetCount) {
    for (const [sec, url] of cands) {
      if (selected[sec]) continue
      const anchor = getAnchor(url, l, rival, h + Object.keys(selected).length)
      const snippet = getSectionSnippet(sec, url, anchor, h + Object.keys(selected).length)
      selected[sec] = { url, anchor, snippet }
      if (Object.keys(selected).length === targetCount) break
    }
  }

  // Verdict / summary ranking
  let summaryRanking = ''
  if (selected['verdict']) {
    const vr = [
      `Currently featured in our <a href="${selected['verdict'].url}">${selected['verdict'].anchor}</a>.`,
      `Ranked among top contenders in our <a href="${selected['verdict'].url}">${selected['verdict'].anchor}</a>.`,
      `Evaluated and benchmarked in our <a href="${selected['verdict'].url}">${selected['verdict'].anchor}</a>.`,
      `Featured recommendation in our <a href="${selected['verdict'].url}">${selected['verdict'].anchor}</a>.`
    ]
    summaryRanking = vr[h % vr.length]
  } else {
    const vr = [
      `Tested and verified against all ${l.segment.toLowerCase()} laptops in our database.`,
      `Evaluated across real-world workloads in our ${l.segment.toLowerCase()} category.`,
      `Benchmarked against our full 2026 laptop performance database.`,
      `Ranks competitively within the ${l.segment.toLowerCase()} laptop segment.`
    ]
    summaryRanking = vr[h % vr.length]
  }

  // Alternatives Intro
  let alternativesIntro = ''
  if (selected['alternatives']) {
    const linkHtml = `<a href="${selected['alternatives'].url}" class="text-brand-600 dark:text-brand-400 font-medium underline decoration-brand-300 hover:decoration-brand-500">${selected['alternatives'].anchor}</a>`
    if (rival && selected['alternatives'].url.includes('/compare/')) {
      const v = [
        `Evaluating different configurations or price brackets? Compare the ${l.name} with direct alternatives below, or check our ${linkHtml} to see real benchmark differences.`,
        `Looking for close alternatives? Review our ${linkHtml}, or explore similar models in the same tier below.`,
        `Weighing your options? Read our ${linkHtml}, or browse direct alternatives below.`
      ]
      alternativesIntro = v[h % v.length]
    } else {
      const v = [
        `Evaluating different configurations or price brackets? Compare the ${l.name} with direct alternatives below, or use our ${linkHtml} to benchmark any two models head-to-head.`,
        `Looking for close alternatives? Explore the similar models below, or test any matchup in our ${linkHtml}.`,
        `Weighing your options? Browse direct alternatives below or launch our ${linkHtml} for a side-by-side spec comparison.`
      ]
      alternativesIntro = v[h % v.length]
    }
  } else {
    const v = [
      `Evaluating different configurations or price brackets? Compare the ${l.name} with direct alternatives below to find the best match for your budget and workload.`,
      `Looking for close alternatives? Browse similar models in the same price and performance bracket below.`,
      `Weighing your options? Review the direct alternative configurations and related picks below.`
    ]
    alternativesIntro = v[h % v.length]
  }

  const perfExtra = selected['performance'] ? selected['performance'].snippet : ''
  const dispExtra = selected['display'] ? selected['display'].snippet : ''
  const gameExtra = selected['gaming'] ? selected['gaming'].snippet : ''
  const prodExtra = selected['productivity'] ? selected['productivity'].snippet : ''
  const progExtra = selected['programming'] ? selected['programming'].snippet : ''
  const vidExtra = selected['videoEditing'] ? selected['videoEditing'].snippet : ''
  const rendExtra = selected['rendering'] ? selected['rendering'].snippet : ''
  const battExtra = selected['battery'] ? selected['battery'].snippet : ''
  const valExtra = selected['value'] ? selected['value'].snippet : ''

  return {
    summaryRanking,
    performance: `The ${l.name} runs on the ${cpu} with ${l.cpu.cores || '—'} cores${l.cpu.multiThread ? ' (multi-threaded)' : ''}, posting a PassMark multi-thread score of ${pm}. That places it ahead of ${pct('overall')}% of the ${LAPTOPS.length} laptops in our database. ${(l.cpu.passmark || 0) > 25000 ? 'This is genuine workstation-class throughput: heavy compiles, batch exports and simulation all run comfortably.' : (l.cpu.passmark || 0) > 15000 ? 'That is comfortably mid-to-upper tier: fast app launches, smooth multitasking and respectable rendering times.' : (l.cpu.passmark || 0) > 8000 ? 'Expect competent everyday performance — office suites, streaming and light photo edits are fine; heavy creation is not its lane.' : 'This is entry-level silicon. Single-app usage is fine, but expect slowdowns under multitasking pressure.'}${perfExtra}`,
    display: `You get a ${d.sizeInches}″ ${d.panel || ''} panel at ${d.resolution} (${d.ppi || '—'} PPI) refreshing at ${d.refreshHz} Hz${d.touch ? ', with touch input' : ''}. ${['OLED', 'AMOLED'].includes(d.panel || '') ? 'The self-emissive panel delivers true blacks and saturated color that IPS simply cannot match — outstanding for movies and creative work.' : d.panel === 'Mini LED' ? 'Mini-LED backlighting brings HDR-grade brightness with excellent contrast zones.' : d.panel === 'Liquid Retina' ? 'Apple\u2019s Liquid Retina calibration is superb out of the box, with high brightness and accurate P3 color.' : (d.refreshHz || 60) >= 144 ? 'The high refresh rate makes motion — from scrolling to shooters — feel immediately smoother than any 60 Hz panel.' : 'The IPS panel offers dependable viewing angles and accurate-enough color for everyday use.'}${dispExtra}`,
    gaming: l.gpu.dedicated
      ? `With the ${l.gpu.model} (${g3} G3DMark), the ${l.model} scores ${s.gaming}/10 for gaming. ${(l.gpu.g3dmark || 0) > 25000 ? 'Expect very high framerates at 1440p and confident 4K performance in most titles with DLSS.' : (l.gpu.g3dmark || 0) > 15000 ? 'Modern AAA titles run at high settings in 1080p/1440p, and esports titles will saturate the display\u2019s refresh rate.' : 'It handles 1080p gaming at medium-to-high settings — a genuine gaming entry point.'} ${(d.refreshHz || 60) >= 144 ? `The ${d.refreshHz} Hz panel means the GPU\u2019s frames actually reach your eyes.` : ''}${gameExtra}`
      : `There is no dedicated GPU here — graphics run on the ${l.cpu.brand} integrated solution, scoring ${s.gaming}/10 for gaming. Esports staples (Valorant, LoL, CS2) are playable at modest settings; modern AAA gaming is off the table.${gameExtra}`,
    productivity: `For office and productivity work the ${l.model} scores ${s.office}/10. ${l.ram.gb} GB of ${l.ram.type} memory ${(l.ram.gb || 0) >= 16 ? 'keeps large spreadsheets, dozens of tabs and video calls running simultaneously without paging.' : 'covers everyday workloads, though heavy multitaskers will hit the ceiling.'} The ${l.storage.raw} ${l.storage.type} keeps boots and file operations ${l.storage.type === 'SSD' ? 'fast' : 'adequate'}.${prodExtra}`,
    programming: `Developers should expect a ${s.programming}/10 experience. ${(l.cpu.cores || 0) >= 10 ? `${l.cpu.cores} cores chew through parallel builds and containerized stacks.` : (l.cpu.cores || 0) >= 6 ? `${l.cpu.cores} cores handle typical web/dev stacks smoothly.` : 'Core count is limited — fine for scripting and web work, slow for big compiles.'} ${(d.resH || 0) >= 1200 ? 'The taller 16:10-class screen shows meaningfully more code per screenful.' : ''} ${l.ram.soldered ? 'Note the soldered RAM: buy the capacity you\u2019ll need in 3 years, today.' : 'Upgradeable RAM means you can start smaller and expand later.'}${progExtra}`,
    videoEditing: `${l.gpu.dedicated ? `The ${l.gpu.model} accelerates timeline playback, effects and export encoding.` : 'Without a dGPU, editing leans entirely on the CPU — fine for 1080p cuts, slow for 4K multi-layer work.'} ${['OLED', 'AMOLED', 'Mini LED', 'Liquid Retina'].includes(d.panel || '') ? 'The premium panel is a genuine asset for color grading.' : 'For color-critical delivery, plan on an external calibrated monitor.'}${vidExtra}`,
    rendering: `3D and engineering workloads score ${s.engineering}/10. ${l.gpu.dedicated && (l.gpu.g3dmark || 0) > 15000 ? 'Viewport manipulation in CAD/DCC apps stays fluid, and GPU renders (Blender Cycles, V-Ray GPU) are well within reach.' : l.gpu.dedicated ? 'Light CAD and moderate scenes are workable; production rendering will test your patience.' : 'Integrated graphics restrict this machine to light 2D CAD and coursework-scale models.'}${rendExtra}`,
    battery: `Battery specifics aren\u2019t listed in our source data, so treat this as guidance: ${!l.gpu.dedicated && (l.physical.weightLbs || 9) < 4 ? 'efficiency-focused hardware like this typically delivers strong all-day endurance under office loads.' : l.gpu.dedicated ? 'gaming-class hardware prioritizes performance; expect moderate unplugged endurance and pack the charger for long days.' : 'expect average endurance typical of this class.'} ${l.brand === 'Apple' ? 'Apple silicon MacBooks are the industry benchmark for battery life in practice.' : ''}${battExtra}`,
    upgradeability: `${l.ram.soldered ? `RAM is soldered at ${l.ram.gb} GB — what you buy is what you keep.` : `RAM is socketed and user-upgradeable beyond the included ${l.ram.gb} GB — a big longevity win.`} Storage is ${l.storage.type === 'SSD' ? 'M.2 SSD-based, typically replaceable for capacity upgrades' : `${l.storage.type}, which generally cannot be upgraded`}.`,
    heatNoise: `${l.gpu.dedicated ? `With ${(l.gpu.g3dmark || 0) > 20000 ? 'high-wattage' : 'mid-range'} discrete graphics inside ${(l.physical.thicknessIn || 1) < 0.8 ? 'a slim chassis, expect audible fans and warm surfaces under sustained gaming load — normal for the class' : 'this chassis, the added thickness buys real thermal headroom; noise under load should stay reasonable'}.` : 'Integrated-graphics designs like this run cool and quiet; fan noise should only surface under sustained heavy loads.'} ${l.brand === 'Apple' ? 'M-series MacBooks are famously near-silent in typical use.' : ''}`,
    ports: `Port selection isn\u2019t enumerated in our source sheet, but as a ${l.segment.toLowerCase()} ${l.formFactor === '2-in-1' ? 'convertible' : 'laptop'} in the ${l.display.sizeInches}″ class, expect ${l.segment === 'Gaming' ? 'a full loadout: multiple USB-A, USB-C, HDMI 2.1 and Ethernet on most gaming designs' : (l.physical.weightLbs || 9) < 3.2 ? 'a lean ultraportable selection — USB-C-centric, so budget for a small hub' : 'the standard mix of USB-A, USB-C and HDMI'}. Verify the exact loadout on the Amazon listing before buying.`,
    value: `In the ${l.priceBracket} category, the value score is ${s.value}/10. ${s.value >= 7.5 ? 'That is exceptional performance-per-dollar — this configuration undercuts most rivals with similar benchmarks.' : s.value >= 5.5 ? 'Fair market pricing: you get what you pay for, with no meaningful premium.' : 'You are paying some premium here — brand, build or panel quality rather than raw benchmark throughput.'}${valExtra}`,
    alternativesIntro,
  }
}

export function faq(l: Laptop): { q: string; a: string }[] {
  const s = l.scores
  const out: { q: string; a: string }[] = []
  out.push({
    q: `Is the ${l.name} good for gaming?`,
    a: l.gpu.dedicated
      ? `Yes — it carries a ${l.gpu.model} scoring ${l.gpu.g3dmark?.toLocaleString()} in G3DMark and earns ${s.gaming}/10 on our gaming index. ${(l.gpu.g3dmark || 0) > 15000 ? 'Modern AAA titles run smoothly at high settings.' : 'It is best for 1080p gaming at medium settings.'}`
      : `Not really. It uses integrated graphics (${s.gaming}/10 gaming score). Esports titles are playable at low settings, but modern AAA games are not realistic. For AAA gaming, consider stepping up to a dedicated GPU configuration.`,
  })
  out.push({
    q: `Is the ${l.name} worth it in 2026?`,
    a: `${s.value >= 7 ? 'Yes — it ranks among the best value laptops in our database' : s.value >= 5 ? 'It offers fair value' : 'Only if its specific strengths match your needs'} at ${'$' + l.price.toLocaleString()}, with a ${s.value}/10 value score.`,
  })
  out.push({
    q: `Can the RAM be upgraded on the ${l.name}?`,
    a: l.ram.soldered
      ? `No — the ${l.ram.gb} GB of ${l.ram.type} memory is soldered to the board. Choose the capacity you will need long-term at purchase.`
      : `Yes — the ${l.ram.type} memory is socketed, so you can expand beyond the included ${l.ram.gb} GB later.`,
  })
  out.push({
    q: `Is the ${l.name} good for students?`,
    a: `It scores ${s.student}/10 on our student index. ${s.student >= 7 ? 'A great pick — the balance of price, weight and performance suits campus life well.' : s.student >= 5 ? 'A reasonable choice, though better-balanced options exist in this price range.' : 'Probably not the best student pick — compare lighter alternatives.'}`,
  })
  out.push({
    q: `How heavy is the ${l.name}?`,
    a: `It weighs ${l.physical.weightLbs} lbs (${l.physical.weightKg} kg) and measures ${l.physical.thicknessIn}″ thick. ${(l.physical.weightLbs || 0) <= 3.5 ? 'That is genuinely portable for daily carry.' : (l.physical.weightLbs || 0) <= 5 ? 'That is average — fine for occasional transport.' : 'That is desk-replacement territory; not a commuter machine.'}`,
  })
  return out
}
