// =====================================================
// Sitemap Generator — Dynamically creates and updates XML sitemap
// =====================================================
import { LAPTOPS, META } from './db'
import { GUIDES, popularPairs, compareSlug } from './engine'
import { ARTICLES } from './articles'
import { SITE } from './seo'

export interface SitemapEntry {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: string
}

export function getSitemapEntries(baseUrl = SITE.baseUrl): SitemapEntry[] {
  const base = baseUrl.replace(/\/+$/, '')

  // Determine latest content update timestamp
  let latestArticleDate = '2026-09-20'
  for (const a of ARTICLES) {
    const d = a.dateModified || a.datePublished
    if (d && d > latestArticleDate) latestArticleDate = d
  }

  // Core navigation pages
  const corePages: SitemapEntry[] = [
    { loc: `${base}/`, lastmod: latestArticleDate, changefreq: 'daily', priority: '1.0' },
    { loc: `${base}/laptops`, lastmod: META.updated || '2026-09-10', changefreq: 'daily', priority: '0.9' },
    { loc: `${base}/compare`, lastmod: META.updated || '2026-09-10', changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/guides`, lastmod: META.updated || '2026-09-10', changefreq: 'weekly', priority: '0.9' },
    { loc: `${base}/articles`, lastmod: latestArticleDate, changefreq: 'weekly', priority: '0.9' },
  ]

  // Data-ranked guides hub pages
  const guidePages: SitemapEntry[] = GUIDES.map(g => ({
    loc: `${base}/guides/${g.slug}`,
    lastmod: META.updated || '2026-09-10',
    changefreq: 'weekly',
    priority: '0.8',
  }))

  // Editorial articles & in-depth product evaluations
  const articlePages: SitemapEntry[] = ARTICLES.map(a => ({
    loc: `${base}/${a.slug.replace(/^\/+|\/+$/g, '')}/`,
    lastmod: a.dateModified || a.datePublished || latestArticleDate,
    changefreq: 'weekly',
    priority: '0.8',
  }))

  // Laptop product reviews
  const productPages: SitemapEntry[] = LAPTOPS.map(l => ({
    loc: `${base}/${l.slug}-review`,
    lastmod: META.updated || '2026-09-10',
    changefreq: 'weekly',
    priority: '0.8',
  }))

  // High-interest comparison pair landing pages
  const comparePages: SitemapEntry[] = popularPairs(30).map(([a, b]) => ({
    loc: `${base}/compare/${compareSlug(a, b)}`,
    lastmod: META.updated || '2026-09-10',
    changefreq: 'monthly',
    priority: '0.7',
  }))

  return [...corePages, ...guidePages, ...articlePages, ...productPages, ...comparePages]
}

export function generateSitemapXml(baseUrl = SITE.baseUrl): string {
  const entries = getSitemapEntries(baseUrl)
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}
