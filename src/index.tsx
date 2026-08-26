// =====================================================
// LaptopIndex — Affiliate laptop comparison engine
// Router: Hono on Cloudflare Pages (edge SSR)
// =====================================================
import { Hono } from 'hono'
import { renderer } from './renderer'
import { LAPTOPS, bySlug, META } from './lib/db'
import { GUIDES, guideRanking, parseCompareSlug, popularPairs, compareSlug } from './lib/engine'
import { SITE, Meta, productMeta, compareMeta, guideJsonLd, websiteJsonLd } from './lib/seo'
import { HomePage, WishlistPage } from './pages/home'
import { BrowsePage, Filters, applyFilters } from './pages/browse'
import { ProductPage } from './pages/product'
import { ComparePage, CompareHub } from './pages/compare'
import { GuidesHub, GuidePage } from './pages/guides'

const app = new Hono()
app.use(renderer)

const render = (c: any, meta: Meta, node: any) => {
  c.set('meta', meta)
  c.header('Cache-Control', 'public, max-age=300, s-maxage=3600')
  return c.render(node)
}

// ---------- Home ----------
app.get('/', (c) => render(c,
  { title: `${SITE.name} — Laptop Reviews, Benchmarks & Comparisons (2026)`, description: `Compare ${META.count} laptops with real PassMark & G3DMark benchmarks, 10 use-case scores and live Amazon pricing. Find your perfect laptop in minutes.`, path: '/', jsonLd: websiteJsonLd() },
  <HomePage />))

// ---------- Browse + filters ----------
app.get('/laptops', (c) => {
  const q = c.req.query()
  const num = (k: string) => q[k] ? Number(q[k]) || undefined : undefined
  const f: Filters = {
    q: q.q || undefined, brand: q.brand || undefined, segment: q.segment || undefined,
    gpu: q.gpu || undefined, cpu: q.cpu || undefined,
    minPrice: num('minPrice'), maxPrice: num('maxPrice'), ram: num('ram'), storage: num('storage'),
    size: q.size || undefined, res: q.res || undefined, refresh: num('refresh'),
    panel: q.panel || undefined, touch: q.touch || undefined, maxWeight: num('maxWeight'),
    sort: q.sort || undefined,
  }
  const hasFilter = Object.values(f).some(v => v !== undefined)
  const title = f.q ? `"${f.q}" — Laptop Search Results` : f.segment ? `Best ${f.segment} Laptops — Browse & Filter (2026)` : 'Browse All Laptops — Filter by Price, GPU, RAM & More'
  return render(c, {
    title: `${title} | ${SITE.name}`,
    description: `Filter ${META.count} benchmark-scored laptops by brand, price, GPU, CPU, RAM, screen and weight. Sorted by our data-driven overall score.`,
    path: hasFilter ? '/laptops' : '/laptops', // canonical always points to clean browse
  }, <BrowsePage f={f} />)
})

// ---------- API (JSON for client search + data consumers) ----------
app.get('/api/laptops', (c) => {
  c.header('Cache-Control', 'public, max-age=3600')
  return c.json(LAPTOPS.map(l => ({
    id: l.id, slug: l.slug, name: l.name, brand: l.brand, price: l.price,
    segment: l.segment, cpu: `${l.cpu.brand || ''} ${l.cpu.model || ''}`.trim(),
    gpu: l.gpu.dedicated ? l.gpu.model : 'Integrated', ram: l.ram.gb,
    score: l.scores.overall, rating: l.amazon.rating, badges: l.badges,
  })))
})
app.get('/api/laptops/:slug', (c) => {
  const l = bySlug(c.req.param('slug'))
  return l ? c.json(l) : c.json({ error: 'not found' }, 404)
})

// ---------- Compare ----------
app.get('/compare', (c) => render(c, {
  title: `Laptop Comparison Tool — Compare Any 2 of ${META.count} Laptops | ${SITE.name}`,
  description: 'Head-to-head laptop comparisons with weighted benchmark scoring: CPU, GPU, display, RAM, weight and value. Instant winner verdicts.',
  path: '/compare',
}, <CompareHub />))

app.get('/compare/:pair', (c) => {
  const pair = parseCompareSlug(c.req.param('pair'))
  if (!pair) return c.notFound()
  const [a, b] = pair
  const canonical = compareSlug(a, b)
  if (c.req.param('pair') !== canonical) return c.redirect(`/compare/${canonical}`, 301)
  return render(c, compareMeta(a, b, canonical), <ComparePage a={a} b={b} />)
})

// ---------- Guides ----------
app.get('/guides', (c) => render(c, {
  title: `Laptop Buying Guides 2026 — Data-Ranked Best-Of Lists | ${SITE.name}`,
  description: `${GUIDES.length} algorithmically-ranked laptop buying guides: gaming, students, budget, OLED, AI and more. Zero sponsored placements.`,
  path: '/guides',
}, <GuidesHub />))

app.get('/guides/:slug', (c) => {
  const g = GUIDES.find(x => x.slug === c.req.param('slug'))
  if (!g) return c.notFound()
  return render(c, {
    title: `${g.title} | ${SITE.name}`, description: g.description,
    path: `/guides/${g.slug}`, ogType: 'article',
    jsonLd: guideJsonLd(g.title, g.slug, guideRanking(g)),
  }, <GuidePage g={g} />)
})

// ---------- Wishlist ----------
app.get('/wishlist', (c) => render(c, {
  title: `Your Wishlist | ${SITE.name}`, description: 'Your saved laptops.', path: '/wishlist',
}, <WishlistPage />))

// ---------- Sitemap + robots ----------
app.get('/sitemap.xml', (c) => {
  const urls: string[] = ['/', '/laptops', '/compare', '/guides',
    ...LAPTOPS.map(l => `/${l.slug}-review`),
    ...GUIDES.map(g => `/guides/${g.slug}`),
    ...popularPairs(30).map(([a, b]) => `/compare/${compareSlug(a, b)}`),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${SITE.baseUrl}${u}</loc><lastmod>${META.updated}</lastmod></url>`).join('\n')}\n</urlset>`
  c.header('Content-Type', 'application/xml')
  return c.body(xml)
})
app.get('/robots.txt', (c) => c.text(`User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`))

// ---------- Product review pages (catch-all, keep LAST) ----------
app.get('/:page{[a-z0-9-]+-review}', (c) => {
  const slug = c.req.param('page').replace(/-review$/, '')
  const l = bySlug(slug)
  if (!l) return c.notFound()
  return render(c, productMeta(l), <ProductPage l={l} />)
})

app.notFound((c) => {
  (c as any).set('meta', { title: 'Page Not Found | ' + SITE.name, description: 'This page does not exist.', path: '/404' })
  c.status(404)
  return c.render(
    <main class="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 class="text-5xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p class="mt-3 text-slate-500">That page doesn't exist. Try <a href="/laptops" class="text-brand-500 underline">browsing all laptops</a> or the <a href="/" class="text-brand-500 underline">homepage</a>.</p>
    </main>
  )
})

export default app
