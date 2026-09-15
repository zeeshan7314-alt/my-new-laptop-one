// =====================================================
// LaptopIndex — Affiliate laptop comparison engine
// Router: Hono on Cloudflare Pages (edge SSR)
// =====================================================
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { renderer } from './renderer'
import { LAPTOPS, bySlug, META } from './lib/db'
import { GUIDES, guideRanking, parseCompareSlug, popularPairs, compareSlug } from './lib/engine'
import { SITE, Meta, productMeta, compareMeta, guideJsonLd, websiteJsonLd, browseJsonLd, compareHubJsonLd, guidesHubJsonLd } from './lib/seo'
import { HomePage, WishlistPage } from './pages/home'
import { BrowsePage, Filters, applyFilters } from './pages/browse'
import { ProductPage } from './pages/product'
import { ComparePage, CompareHub } from './pages/compare'
import { GuidesHub, GuidePage } from './pages/guides'

const app = new Hono()

// Serve static assets (images, css, js, icons) in production runtime (Node / Docker / Hyperlift)
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/static/*', serveStatic({ root: './dist' }))
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))
app.use('/favicon.ico', serveStatic({ path: './dist/favicon.ico' }))

app.use(renderer)

// Normalize common sitemap request patterns (e.g. accidentally pasted full URL in GSC or missing extension)
app.use('*', async (c, next) => {
  const path = c.req.path
  if (path !== '/sitemap.xml' && (path.endsWith('sitemap.xml') || path === '/sitemap' || path.endsWith('sitemap_index.xml'))) {
    return c.redirect('/sitemap.xml', 301)
  }
  await next()
})

const render = (c: any, meta: Meta, node: any) => {
  c.set('meta', meta)
  c.header('Cache-Control', 'public, max-age=300, s-maxage=3600')
  return c.render(node)
}

// ---------- Home ----------
app.get('/', (c) => render(c,
  { title: `${SITE.name} — Laptop Reviews, Benchmarks & Comparisons (2026)`, description: `Compare ${META.count} laptops with real PassMark & G3DMark benchmarks, use-case scores and live Amazon pricing. Find your perfect laptop in minutes.`, path: '/', jsonLd: websiteJsonLd() },
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
    description: `Filter ${META.count} benchmark-scored laptops by brand, price, GPU, CPU, RAM, screen and weight. Data-driven specs, benchmarks, and deals.`,
    path: hasFilter ? '/laptops' : '/laptops', // canonical always points to clean browse
    jsonLd: browseJsonLd(),
  }, <BrowsePage f={f} />)
})

// ---------- API (JSON for client search + data consumers) ----------
app.get('/api/laptops', (c) => {
  c.header('Cache-Control', 'public, max-age=3600')
  return c.json(LAPTOPS.map(l => ({
    id: l.id, slug: l.slug, name: l.name, brand: l.brand, price: l.price,
    segment: l.segment, cpu: `${l.cpu.brand || ''} ${l.cpu.model || ''}`.trim(),
    gpu: l.gpu.dedicated ? l.gpu.model : 'Integrated', ram: l.ram.gb,
    rating: l.amazon.rating, badges: l.badges,
  })))
})
app.get('/api/search', (c) => {
  const q = (c.req.query('q') || '').toLowerCase().trim()
  c.header('Cache-Control', 'public, max-age=3600')
  const results = LAPTOPS.filter(l =>
    !q || `${l.name} ${l.brand} ${l.cpu.brand || ''} ${l.cpu.model || ''} ${l.gpu.model || ''}`.toLowerCase().includes(q)
  ).slice(0, 20)
  return c.json(results.map(l => ({
    id: l.id, slug: l.slug, name: l.name, brand: l.brand, price: l.price,
    segment: l.segment, cpu: `${l.cpu.brand || ''} ${l.cpu.model || ''}`.trim(),
    gpu: l.gpu.dedicated ? l.gpu.model : 'Integrated', ram: l.ram.gb,
    rating: l.amazon.rating, badges: l.badges,
  })))
})
app.get('/api/laptops/:slug', (c) => {
  const l = bySlug(c.req.param('slug'))
  return l ? c.json(l) : c.json({ error: 'not found' }, 404)
})

// ---------- Compare ----------
app.get('/compare', (c) => {
  const a = c.req.query('a')
  const b = c.req.query('b')
  if (a && b && a !== b) {
    const pair = [a, b].sort().join('-vs-')
    return c.redirect(`/compare/${pair}`, 302)
  }
  return render(c, {
    title: `Laptop Comparison Tool — Compare Any 2 of ${META.count} Laptops | ${SITE.name}`,
    description: 'Head-to-head laptop comparisons with weighted benchmark scoring: CPU, GPU, display, RAM, weight and value. Instant winner verdicts.',
    path: '/compare',
    jsonLd: compareHubJsonLd(),
  }, <CompareHub />)
})

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
  jsonLd: guidesHubJsonLd(),
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
  const reqHost = c.req.header('host')?.toLowerCase() || ''
  const base = reqHost.includes('laptopindex.info') ? `https://${reqHost}` : SITE.baseUrl

  const corePages: { loc: string; priority: string; changefreq: string }[] = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/laptops', priority: '0.9', changefreq: 'daily' },
    { loc: '/compare', priority: '0.9', changefreq: 'weekly' },
    { loc: '/guides', priority: '0.9', changefreq: 'weekly' },
  ]
  const guidePages = GUIDES.map(g => ({
    loc: `/guides/${g.slug}`, priority: '0.8', changefreq: 'weekly',
  }))
  const productPages = LAPTOPS.map(l => ({
    loc: `/${l.slug}-review`, priority: '0.8', changefreq: 'weekly',
  }))
  const comparePages = popularPairs(30).map(([a, b]) => ({
    loc: `/compare/${compareSlug(a, b)}`, priority: '0.7', changefreq: 'monthly',
  }))

  const allEntries = [...corePages, ...guidePages, ...productPages, ...comparePages]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(e => `  <url>
    <loc>${base}${e.loc}</loc>
    <lastmod>${META.updated}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`
  c.header('Content-Type', 'application/xml; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return c.body(xml)
})

app.get('/robots.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return c.text(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /wishlist

Sitemap: ${SITE.baseUrl}/sitemap.xml
`)
})

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
