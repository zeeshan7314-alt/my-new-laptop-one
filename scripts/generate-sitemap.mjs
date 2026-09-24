#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const BASE_URL = 'https://laptopindex.info'

// 1. Load data
const laptopsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/laptops.json'), 'utf-8'))
const articlesData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/articles.json'), 'utf-8'))

const laptops = laptopsData.laptops || []
const meta = laptopsData.meta || { updated: '2026-09-10' }
const articles = articlesData || []

// 2. Guide Slugs (All 20 data-driven buying guides & gaming clusters)
const guideSlugs = [
  'best-gaming-laptops',
  'best-student-laptops',
  'best-engineering-laptops',
  'best-rtx-5060-laptops',
  'best-oled-laptops',
  'best-lightweight-laptops',
  'best-budget-laptops',
  'best-programming-laptops',
  'best-video-editing-laptops',
  'best-ai-laptops',
  'best-business-laptops',
  'best-2-in-1-laptops',
  'best-laptops-under-500',
  'best-laptops-under-1000',
  'best-laptops-under-1500',
  'best-macbooks',
  'best-rtx-5070-gaming-laptops',
  'best-gaming-laptops-under-1500',
  'best-thin-and-light-gaming-laptops',
  'best-1440p-gaming-laptops'
]

// 3. Compute top 30 comparison pairs
function popularPairs(limit = 30) {
  const pairs = []
  const sorted = [...laptops].sort((x, y) => (y.amazon?.reviewCount || 0) - (x.amazon?.reviewCount || 0))
  const top = sorted.slice(0, 40)
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const a = top[i]
      const c = top[j]
      const priceClose = Math.abs(Math.log(a.price) - Math.log(c.price)) < 0.25
      if (!priceClose) continue
      const interest = (a.amazon?.reviewCount || 0) + (c.amazon?.reviewCount || 0)
        + (a.segment === c.segment ? 5000 : 0) + (a.brand !== c.brand ? 3000 : 0)
      pairs.push({ p: [a, c], score: interest })
    }
  }
  pairs.sort((x, y) => y.score - x.score)
  const used = new Set()
  const out = []
  for (const { p } of pairs) {
    const k = p[0].id * 1000 + p[1].id
    if (used.has(k)) continue
    used.add(k)
    out.push([p[0].slug, p[1].slug].sort().join('-vs-'))
    if (out.length >= limit) break
  }
  return out
}

const compareSlugs = popularPairs(30)

// 4. Latest date determination
let latestArticleDate = '2026-09-20'
for (const a of articles) {
  const d = a.dateModified || a.datePublished
  if (d && d > latestArticleDate) latestArticleDate = d
}

// 5. Build URL set
const entries = []

// Core pages
entries.push(
  { loc: `${BASE_URL}/`, lastmod: latestArticleDate, changefreq: 'daily', priority: '1.0' },
  { loc: `${BASE_URL}/guides`, lastmod: meta.updated, changefreq: 'daily', priority: '0.9' },
  { loc: `${BASE_URL}/laptops`, lastmod: meta.updated, changefreq: 'daily', priority: '0.8' },
  { loc: `${BASE_URL}/articles`, lastmod: latestArticleDate, changefreq: 'weekly', priority: '0.7' },
  { loc: `${BASE_URL}/compare`, lastmod: meta.updated, changefreq: 'weekly', priority: '0.6' }
)

// Guides (Primary commercial pillars)
for (const slug of guideSlugs) {
  entries.push({
    loc: `${BASE_URL}/guides/${slug}`,
    lastmod: meta.updated,
    changefreq: 'weekly',
    priority: '0.9'
  })
}

// Articles (Legacy in-depth content)
for (const a of articles) {
  const cleanSlug = a.slug.replace(/^\/+|\/+$/g, '')
  entries.push({
    loc: `${BASE_URL}/${cleanSlug}/`,
    lastmod: a.dateModified || a.datePublished || latestArticleDate,
    changefreq: 'weekly',
    priority: '0.7'
  })
}

// Laptop product reviews (Evaluation nodes)
for (const l of laptops) {
  entries.push({
    loc: `${BASE_URL}/${l.slug}-review`,
    lastmod: meta.updated,
    changefreq: 'weekly',
    priority: '0.8'
  })
}

// Compare pairs
for (const pair of compareSlugs) {
  entries.push({
    loc: `${BASE_URL}/compare/${pair}`,
    lastmod: meta.updated,
    changefreq: 'monthly',
    priority: '0.6'
  })
}

// Deduplicate entries by loc
const seenLocs = new Set()
const uniqueEntries = []
for (const entry of entries) {
  if (!seenLocs.has(entry.loc)) {
    seenLocs.add(entry.loc)
    uniqueEntries.push(entry)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueEntries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const publicPath = path.join(rootDir, 'public/sitemap.xml')
fs.writeFileSync(publicPath, xml, 'utf-8')
console.log(`[sitemap] Wrote ${uniqueEntries.length} URLs to ${publicPath}`)

const distPath = path.join(rootDir, 'dist/sitemap.xml')
if (fs.existsSync(path.join(rootDir, 'dist'))) {
  fs.writeFileSync(distPath, xml, 'utf-8')
  console.log(`[sitemap] Wrote ${uniqueEntries.length} URLs to ${distPath}`)
}

console.log(`[sitemap] Breakdown:
  - Core navigation pages: 5
  - Guides: ${guideSlugs.length}
  - In-depth articles: ${articles.length}
  - Laptop product reviews: ${laptops.length}
  - Popular comparisons: ${compareSlugs.length}
  - Total: ${entries.length}
  - Date modified for articles: ${latestArticleDate}
`)
