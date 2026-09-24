// =====================================================
// LaptopIndex — Affiliate laptop comparison engine
// Router: Hono on Cloudflare Pages (edge SSR)
// =====================================================
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { renderer } from './renderer'
import { LAPTOPS, bySlug, META } from './lib/db'
import { GUIDES, guideRanking, parseCompareSlug, popularPairs, compareSlug } from './lib/engine'
import { SITE, Meta, productMeta, compareMeta, guideJsonLd, websiteJsonLd, browseJsonLd, compareHubJsonLd, guidesHubJsonLd, filteredBrowseMeta } from './lib/seo'
import { HomePage, WishlistPage } from './pages/home'
import { BrowsePage, Filters, applyFilters } from './pages/browse'
import { ProductPage } from './pages/product'
import { ComparePage, CompareHub } from './pages/compare'
import { GuidesHub, GuidePage } from './pages/guides'
import { ARTICLES, byArticleSlug, articleMeta } from './lib/articles'
import { ArticlePage, ArticlesHub } from './pages/article'
import { generateSitemapXml } from './lib/sitemap'

const app = new Hono()

// Canonical Apex Domain Enforcer: Only run on https://laptopindex.info/
// 301 redirects www.laptopindex.info (and any other subdomains) or unencrypted http to https://laptopindex.info
app.use('*', async (c, next) => {
  // Allow container health probes to pass without redirection
  if (c.req.path === '/health' || c.req.path === '/healthz') {
    return next()
  }

  const rawHost = (c.req.header('x-forwarded-host') || c.req.header('host') || '').toLowerCase().trim()
  const hostname = rawHost.split(',')[0].trim().split(':')[0].trim()
  const proto = (c.req.header('x-forwarded-proto') || '').toLowerCase().trim()

  // Detect requests to www.laptopindex.info or any subdomain of laptopindex.info
  const isWwwOrSubdomain = hostname === 'www.laptopindex.info' || (hostname.endsWith('.laptopindex.info') && hostname !== 'laptopindex.info')
  // Detect plain http requests on laptopindex.info
  const isHttpOnApex = hostname === 'laptopindex.info' && proto === 'http'

  if (isWwwOrSubdomain || isHttpOnApex) {
    const url = new URL(c.req.url)
    const canonicalTarget = `https://laptopindex.info${url.pathname}${url.search}`
    return c.redirect(canonicalTarget, 301)
  }

  await next()
})

// Serve static assets (images, css, js, icons) in production runtime (Node / Docker / Hyperlift)
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/static/*', serveStatic({ root: './dist' }))
app.use('/favicon.ico', serveStatic({ path: './public/favicon.ico' }))
app.use('/favicon.ico', serveStatic({ path: './dist/favicon.ico' }))

// Fast health check endpoints for container orchestrators, Spaceship Hyperlift & monitoring
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/healthz', (c) => c.text('OK'))

app.use(renderer)

// Legacy article redirects to preserve SEO and prevent 404s
const LEGACY_ARTICLE_REDIRECTS: Record<string, string> = {
  'best-graphics-card-for-under-500': '/best-graphic-card-for-under-100/',
  'best-laptop-for-live-streaming': '/best-laptop-for-streaming-twitch/',
  'best-laptops-for-travel-and-work': '/best-laptop-for-remote-work/',
  'best-15-inch-laptops-under-500': '/best-thin-laptops-under-500/',
  'best-graphics-card-for-under-300': '/best-graphic-card-for-under-100/',
  'best-14-inch-laptops-under-500': '/best-thin-laptops-under-500/',
  'best-lightweight-laptops-under-500': '/best-thin-laptops-under-500/',
  'best-17-inch-laptops-under-1000': '/best-17-inch-laptops-under-500/',
  'best-video-editing-laptops-under-500': '/best-laptop-for-web-developers/',
  'best-graphics-card-for-under-150': '/best-graphic-card-for-under-100/',
  'best-laptop-for-basic-use': '/best-laptops-for-word-processing/',
  'best-laptop-with-big-screen': '/best-17-inch-laptops-under-500/',
  'best-ssd-laptops-under-500': '/best-laptops-with-1tb-hard-drive/',
  'best-13-inch-laptops-under-500': '/best-thin-laptops-under-500/',
  'best-laptop-for-cricut-explore-air': '/best-laptop-for-fusion-360/',
  'best-graphic-card-for-fortnite': '/best-graphic-card-for-under-100/',
  'best-black-friday-laptops-deals-2026': '/best-black-friday-laptops-deals-2019/',
  'best-laptop-for-seniors': '/best-laptops-for-word-processing/',
  'best-non-touch-screen-laptops': '/why-you-shouldnt-buy-a-touch-screen-laptop/',
  'best-laptop-for-writers-and-photographers': '/best-chromebook-for-writers-and-bloggers/',
  'best-earphones-for-running': '/best-wireless-headphones-for-athletes/',
  'best-laptop-with-a-cd-drive': '/best-laptop-for-engineering-students/',
  'how-much-ram-do-i-need-on-my-laptop': '/best-laptop-with-32gb-ram/',
  'best-laptop-under-500-for-gaming': '/best-cheap-laptop-for-gaming-under-500/',
}

// Normalize common sitemap request patterns & redirect legacy article URLs
app.use('*', async (c, next) => {
  const path = c.req.path
  if (path !== '/sitemap.xml' && (path.endsWith('sitemap.xml') || path === '/sitemap' || path.endsWith('sitemap_index.xml'))) {
    return c.redirect('/sitemap.xml', 301)
  }

  const cleanSlug = path.replace(/^\/|\/$/g, '')
  if (LEGACY_ARTICLE_REDIRECTS[cleanSlug]) {
    return c.redirect(LEGACY_ARTICLE_REDIRECTS[cleanSlug], 301)
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
  const meta = filteredBrowseMeta(f)
  return render(c, meta, <BrowsePage f={f} h1={meta.h1} />)
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
  const xml = generateSitemapXml(SITE.baseUrl)
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

// ---------- Articles Hub ----------
app.get('/articles', (c) => render(c, {
  title: `Hardware Reviews, Guides & Tech Insights 2026 | ${SITE.name}`,
  description: `Browse all ${ARTICLES.length} in-depth laptop evaluations, category roundups, gaming tablet guides, and hardware buyer checklists.`,
  path: '/articles',
}, <ArticlesHub />))

app.get('/articles/', (c) => c.redirect('/articles', 301))

// Redirect singular variant to canonical plural article
app.get('/articles/best-entry-level-gaming-laptop', (c) => c.redirect('/best-entry-level-gaming-laptops/', 301))
app.get('/articles/best-entry-level-gaming-laptop/', (c) => c.redirect('/best-entry-level-gaming-laptops/', 301))
app.get('/best-entry-level-gaming-laptop', (c) => c.redirect('/best-entry-level-gaming-laptops/', 301))
app.get('/best-entry-level-gaming-laptop/', (c) => c.redirect('/best-entry-level-gaming-laptops/', 301))

// Direct /articles/:slug support (render article directly or redirect to canonical)
app.get('/articles/:slug{[a-z0-9-]+}/', (c, next) => {
  const slug = c.req.param('slug')
  const a = byArticleSlug(slug)
  if (a) return render(c, articleMeta(a), <ArticlePage a={a} />)
  return next()
})

app.get('/articles/:slug{[a-z0-9-]+}', (c, next) => {
  const slug = c.req.param('slug')
  const a = byArticleSlug(slug)
  if (a) return render(c, articleMeta(a), <ArticlePage a={a} />)
  return next()
})

// ---------- Articles & Reviews (Supports both /:slug/ and /:slug as requested) ----------
app.get('/:slug{[a-z0-9-]+}/', (c, next) => {
  const slug = c.req.param('slug')
  const a = byArticleSlug(slug)
  if (a) return render(c, articleMeta(a), <ArticlePage a={a} />)
  return next()
})

app.get('/:slug{[a-z0-9-]+}', (c, next) => {
  const slug = c.req.param('slug')
  const a = byArticleSlug(slug)
  if (a) return render(c, articleMeta(a), <ArticlePage a={a} />)

  // Fallback to laptop product review if it matches [slug]-review
  if (slug.endsWith('-review')) {
    const laptopSlug = slug.replace(/-review$/, '')
    const l = bySlug(laptopSlug)
    if (l) return render(c, productMeta(l), <ProductPage l={l} />)
  }

  return next()
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
