import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const URLS = [
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/asus-zenbook-13-ultra-slim-ux331ua-as51-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/asus-rog-strix-scar-ii-gaming-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/sager-np8957-thin-light-gaming-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/gigabyte-aero-15-classic-xa-f74adp-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/gigabyte-aero-15-classic-wa-u74adp-15-inch-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/rog-zephyrus-m-thin-gaming-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-2-in-1-laptops-under-600/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-2-in-1-laptops-under-400/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-17-inch-laptops-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-thin-laptops-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-touch-screen-laptops-under-1000/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-with-thunderbolt-3-ports/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-with-1tb-hard-drive/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-with-backlit-keyboard/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-with-32gb-ram/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptop-with-ubuntu/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/cheap-gaming-laptop-under-600/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-cheap-laptop-for-gaming-under-500/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-gaming-laptops-with-good-battery-life/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-accounting-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-engineering-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-medical-school/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-online-teaching/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-remote-work/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-researchers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-web-developers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-software-engineers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-virtualization/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-financial-modeling/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-arcgis/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-homeschool/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptops-for-realtors/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptops-for-word-processing/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-streaming-netflix/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-streaming-twitch/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-egpu/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-fusion-360/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-cities-skylines/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-civilization-6/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebooks-under-250/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebooks-under-400/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebooks-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebook-for-writers-and-bloggers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-amazon-fire-tablet-under-200/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-tablet-under-100/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablets-for-gaming-under-200/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablets-for-gaming-and-movies/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablet-for-college-students-on-a-budget/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablet-for-medical-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-mouses-under-20/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-mouses-under-30/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-under-50/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-cheap-wireless-gaming-mouse/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-bluetooth-mouse-for-chromebook/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-wireless-mouse-for-large-hands/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-for-fortnite/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-for-wow/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-backpack-for-back-pain/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-backpack-to-carry-laptop/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-bag-for-air-travel/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-stylish-laptop-backpacks-for-ladies/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-designer-bags-for-laptops/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tote-bags-for-laptops/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-stylus-for-touch-screen-laptops/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-graphic-card-for-under-100/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-gaming-headsets-under-200/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-headphones-for-teenagers/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-wireless-headphones-for-athletes/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-bluetooth-for-noisy-environment/",
  "https://web.archive.org/web/20191209014001/https://laptopswhizz.com/best-black-friday-laptops-deals-2019/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-hp-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-lenovo-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-dell-inspiron-black-friday-laptop-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-acer-aspire-black-friday-laptop-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-acer-predator-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-asus-vivobook-black-friday-laptops-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-apple-macbook-black-friday-laptop-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-razer-blade-stealth-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptop-accessories-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-gaming-headset-black-friday-deals/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/how-to-tell-if-a-laptop-is-good-for-gaming/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/what-is-the-best-processor-for-my-laptop/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/why-you-shouldnt-buy-a-touch-screen-laptop/"
]

function extractSlug(url) {
  const parts = url.split('laptopswhizz.com/')
  if (parts.length < 2) return ''
  return parts[1].replace(/\/$/, '')
}

function cleanText(str) {
  if (!str) return ''
  return str
    .replace(/Laptops\s*Whizz/gi, 'LaptopIndex')
    .replace(/laptopswhizz\.com/gi, 'laptopindex.info')
    .replace(/laptopswhizz/gi, 'laptopindex')
    .replace(/\b2019\b/g, '2026')
    .replace(/\b2020\b/g, '2026')
    .replace(/\b2021\b/g, '2026')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 20000)
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      })
      clearTimeout(timeout)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 1500 * (i + 1)))
    }
  }
}

function processArticle(url, html) {
  const slug = extractSlug(url)
  const $ = cheerio.load(html)

  // Title
  let rawTitle = $('title').text().trim()
  rawTitle = rawTitle.replace(/\s*-\s*Laptops\s*Whizz.*$/i, '').trim()
  const title = cleanText(rawTitle) + ' | LaptopIndex'

  // H1
  let rawH1 = $('h1.entry-title').first().text().trim() || $('h1').first().text().trim() || rawTitle
  const h1 = cleanText(rawH1)

  // Meta description
  let rawDesc = $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') ||
                $('.entry-content p').first().text().trim() || ''
  const metaDescription = cleanText(rawDesc).slice(0, 160)

  // Clean entry-content
  const $content = $('.entry-content').first()

  // Remove social sharing, related posts, empty widgets, scripts, styles
  $content.find('script, style, .sharedaddy, .sd-sharing, .yarpp-related, .wpurp-container-actions, #jp-post-flair, .jp-relatedposts').remove()
  $content.find('.fb-like, .twitter-share-button, .social-sharing, .comments-area').remove()

  // Process images
  $content.find('img').each((_, el) => {
    const $img = $(el)
    let src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src') || ''
    if (src) {
      // If src is relative or missing host, fix it
      if (src.startsWith('//')) {
        src = 'https:' + src
      } else if (src.startsWith('/wp-content/')) {
        src = 'https://web.archive.org/web/20191229231343im_/https://laptopswhizz.com' + src
      }
      $img.attr('src', src)
      $img.attr('loading', 'lazy')
      $img.removeAttr('srcset')
      $img.removeAttr('data-srcset')
      $img.removeAttr('data-lazy-src')
      $img.addClass('rounded-lg max-w-full h-auto my-4 mx-auto')
    }
  })

  // Process links
  $content.find('a').each((_, el) => {
    const $a = $(el)
    let href = $a.attr('href') || ''
    if (href) {
      // Check if it links to laptopswhizz on wayback or directly
      if (href.includes('laptopswhizz.com/')) {
        const linkSlug = href.split('laptopswhizz.com/')[1]?.split(/[?#]/)[0]?.replace(/\/$/, '')
        if (linkSlug) {
          $a.attr('href', `/${linkSlug}/`)
        }
      }
    }
    // Clean text inside links
    $a.text(cleanText($a.text()))
  })

  // Process headings & tables
  $content.find('table').addClass('w-full text-sm my-6 border-collapse overflow-x-auto block md:table')
  $content.find('th').addClass('bg-slate-100 dark:bg-slate-800 p-2.5 font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700')
  $content.find('td').addClass('p-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300')
  $content.find('h2').addClass('text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4')
  $content.find('h3').addClass('text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3')
  $content.find('h4').addClass('text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2')
  $content.find('p').addClass('text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4')
  $content.find('ul').addClass('list-disc list-inside space-y-1.5 mb-4 text-slate-700 dark:text-slate-300')
  $content.find('ol').addClass('list-decimal list-inside space-y-1.5 mb-4 text-slate-700 dark:text-slate-300')

  // Clean overall HTML
  let contentHtml = $content.html() || ''
  contentHtml = contentHtml
    .replace(/Laptops\s*Whizz/gi, 'LaptopIndex')
    .replace(/laptopswhizz\.com/gi, 'laptopindex.info')
    .replace(/laptopswhizz/gi, 'laptopindex')
    .replace(/\b2019\b/g, '2026')
    .replace(/\b2020\b/g, '2026')
    .replace(/\b2021\b/g, '2026')

  return {
    slug,
    originalUrl: url,
    canonical: `https://laptopindex.info/${slug}/`,
    title,
    h1,
    metaDescription,
    datePublished: '2026-01-15',
    dateModified: '2026-09-15',
    contentHtml
  }
}

async function run() {
  console.log(`Starting scraper for ${URLS.length} URLs...`)
  const results = []
  const concurrency = 6
  let idx = 0

  async function worker() {
    while (idx < URLS.length) {
      const currentIdx = idx++
      const url = URLS[currentIdx]
      const slug = extractSlug(url)
      try {
        console.log(`[${currentIdx + 1}/${URLS.length}] Fetching: ${slug}`)
        const html = await fetchWithRetry(url)
        const article = processArticle(url, html)
        results.push(article)
        console.log(`[${currentIdx + 1}/${URLS.length}] OK: ${slug} (${article.contentHtml.length} chars)`)
      } catch (err) {
        console.error(`[${currentIdx + 1}/${URLS.length}] FAILED: ${url} -> ${err.message}`)
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker())
  await Promise.all(workers)

  console.log(`Successfully scraped ${results.length} of ${URLS.length} articles!`)

  // Ensure output directory exists
  const outDir = path.resolve('./src/data')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  fs.writeFileSync(
    path.join(outDir, 'articles.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  )
  console.log(`Saved articles to ${path.join(outDir, 'articles.json')}`)
}

run()
