// =====================================================
// SEO Engine — meta, canonical, OpenGraph, Twitter, JSON-LD
// =====================================================
import { Laptop, cpuLabel, gpuShort, imgOf } from './db'
import { faq } from './engine'

export const SITE = {
  name: 'LaptopIndex',
  tagline: 'The Laptop Comparison Engine',
  baseUrl: 'https://laptopindex.info',
  disclosure: 'As Amazon Associates we may earn commission from qualifying purchases.',
}

export interface Meta {
  title: string
  description: string
  path: string
  ogType?: string
  ogImage?: string
  jsonLd?: object[]
}

export function productMeta(l: Laptop): Meta {
  const title = `${l.name} Review (2026): Benchmarks, Specs & Verdict`
  const description = `${l.name} in-depth review — ${cpuLabel(l)}, ${gpuShort(l)}, ${l.ram.gb}GB RAM, ${l.display.sizeInches}″ ${l.display.refreshHz}Hz. Benchmarks, specs, pros, cons & who should buy.`
  return { title, description: description.slice(0, 158), path: `/${l.slug}-review`, ogType: 'article', ogImage: imgOf(l) ? SITE.baseUrl + imgOf(l) : undefined, jsonLd: productJsonLd(l) }
}

export function productJsonLd(l: Laptop): object[] {
  const url = `${SITE.baseUrl}/${l.slug}-review`
  const product: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: l.name,
    image: imgOf(l) ? [SITE.baseUrl + imgOf(l)] : undefined,
    brand: { '@type': 'Brand', name: l.brand },
    sku: l.slug,
    mpn: l.model,
    category: `${l.segment} Laptop`,
    description: `${l.name}: ${cpuLabel(l)}, ${gpuShort(l)}, ${l.ram.gb}GB RAM, ${l.storage.raw} ${l.storage.type}, ${l.display.sizeInches}″ ${l.display.resolution} ${l.display.refreshHz}Hz display.`,
    offers: {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: l.amazon.url || url,
      seller: {
        '@type': 'Organization',
        name: 'Amazon',
      },
    },
    review: {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: l.scores.overall, bestRating: 10, worstRating: 1 },
      author: {
        '@type': 'Organization',
        '@id': `${SITE.baseUrl}/#organization`,
        name: SITE.name,
        url: SITE.baseUrl,
        logo: `${SITE.baseUrl}/static/icon-512.png`,
      },
      publisher: {
        '@id': `${SITE.baseUrl}/#organization`,
      },
      datePublished: '2026-08-19',
    },
  }
  if (l.amazon.rating && l.amazon.reviewCount) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: l.amazon.rating,
      bestRating: 5,
      reviewCount: l.amazon.reviewCount,
    }
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
      { '@type': 'ListItem', position: 2, name: 'Laptops', item: SITE.baseUrl + '/laptops' },
      { '@type': 'ListItem', position: 3, name: l.name, item: url },
    ],
  }
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq(l).map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]*>/g, '').trim() },
    })),
  }
  return [product, breadcrumb, faqLd, organizationJsonLd()]
}

export function compareMeta(a: Laptop, b: Laptop, slug: string): Meta {
  const title = `${a.name} vs ${b.name}: Which Should You Buy? (2026)`
  const description = `${a.name} vs ${b.name} — CPU & GPU benchmarks, display, RAM, weight and value compared. See the winner.`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: `${SITE.baseUrl}/compare/${slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: SITE.baseUrl + '/compare' },
        { '@type': 'ListItem', position: 3, name: `${a.name} vs ${b.name}`, item: `${SITE.baseUrl}/compare/${slug}` },
      ],
    },
    organizationJsonLd(),
  ]
  return { title, description: description.slice(0, 158), path: `/compare/${slug}`, ogImage: imgOf(a) ? SITE.baseUrl + imgOf(a)! : undefined, jsonLd }
}

export function guideJsonLd(title: string, slug: string, items: Laptop[]): object[] {
  const schemas: object[] = [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    itemListElement: items.map((l, i) => ({
      '@type': 'ListItem', position: i + 1,
      url: `${SITE.baseUrl}/${l.slug}-review`, name: l.name,
    })),
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
      { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: SITE.baseUrl + '/guides' },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE.baseUrl}/guides/${slug}` },
    ],
  }, organizationJsonLd()]

  if (slug === 'best-gaming-laptops') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How much RAM is needed for a gaming laptop in 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'In 2026, 32GB of DDR5 RAM is the recommended sweet spot for AAA gaming and streaming. While 16GB is the entry-level baseline, modern graphics titles with high-res textures and ray tracing can exceed 16GB total system memory usage. Enthusiast rigs pairing RTX 5080 and 5090 GPUs perform best with 32GB to 64GB.'
          }
        },
        {
          '@type': 'Question',
          name: 'Which GPU tier is best for gaming laptops in 2026?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For 1080p competitive esports under $1,000, RTX 4050/4060 machines provide dependable framerates. For 1440p and 1600p high-refresh gaming, the RTX 5070 and RTX 5070 Ti deliver the best performance-per-dollar. For uncompromised 4K resolution, ultra ray tracing, and 240Hz competitive play, the RTX 5080 and RTX 5090 represent the definitive flagship tier.'
          }
        },
        {
          '@type': 'Question',
          name: 'Why does TGP (Total Graphics Power) matter more than GPU model name?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Laptop GPUs can be configured by manufacturers at different wattages (TGP). A maximum-wattage 140W RTX 5070 with robust vapor-chamber cooling can match or outpace a thermally constrained 85W RTX 5080 in thin chassis. LaptopIndex scores account for real G3DMark benchmark outputs rather than nominal naming.'
          }
        },
        {
          '@type': 'Question',
          name: 'What display refresh rate should I target on a gaming laptop?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Target at least 144Hz to 165Hz with a response time of 3ms or faster. For competitive esports (Valorant, CS2, Apex Legends), 240Hz or 300Hz IPS or OLED panels offer lower input latency and sharper motion clarity.'
          }
        }
      ]
    })
  }

  return schemas
}

export function browseJsonLd(): object[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
        { '@type': 'ListItem', position: 2, name: 'Laptops', item: SITE.baseUrl + '/laptops' },
      ],
    },
    organizationJsonLd(),
  ]
}

export function compareHubJsonLd(): object[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: SITE.baseUrl + '/compare' },
      ],
    },
    organizationJsonLd(),
  ]
}

export function guidesHubJsonLd(): object[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl + '/' },
        { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: SITE.baseUrl + '/guides' },
      ],
    },
    organizationJsonLd(),
  ]
}

export function organizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.baseUrl}/#organization`,
    name: SITE.name,
    alternateName: ['Laptop Index', 'laptopindex.info'],
    url: SITE.baseUrl,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE.baseUrl}/#logo`,
      url: `${SITE.baseUrl}/static/icon-512.png`,
      contentUrl: `${SITE.baseUrl}/static/icon-512.png`,
      caption: `${SITE.name} Logo`,
      width: 512,
      height: 512,
    },
    image: `${SITE.baseUrl}/static/icon-512.png`,
    description: 'Data-driven laptop reviews, benchmarks, and comparison engine with PassMark & G3DMark scores.',
    knowsAbout: [
      'Laptops',
      'Laptop Benchmarks',
      'Computer Hardware',
      'PassMark CPU Benchmarks',
      'G3DMark GPU Benchmarks',
    ],
  }
}

export function websiteJsonLd(): object[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE.baseUrl}/#website`,
      url: `${SITE.baseUrl}/`,
      name: SITE.name,
      alternateName: ['Laptop Index', 'laptopindex.info'],
      description: 'Data-driven laptop reviews, benchmarks, and comparison engine.',
      publisher: {
        '@id': `${SITE.baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE.baseUrl}/laptops?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    organizationJsonLd(),
  ]
}

export function filteredBrowseMeta(f: Record<string, any>): { title: string; description: string; h1: string; path: string; jsonLd: object[] } {
  // Canonical URL must ALWAYS be clean /laptops
  const path = '/laptops'
  const jsonLd = browseJsonLd()

  // 1. Search Query
  if (f.q) {
    const title = `"${f.q}" Laptop Search Results | ${SITE.name}`.slice(0, 60)
    return {
      title,
      h1: title,
      description: `Browse benchmark scores, verified specs, and live prices for "${f.q}" in our database of laptops.`.slice(0, 155),
      path, jsonLd
    }
  }

  // 2. Segment & Price combo
  if (f.segment === 'Gaming' && f.maxPrice === 1500) {
    const title = `Best Gaming Laptops Under $1500 | ${SITE.name}`
    return {
      title,
      h1: title,
      description: 'Find top gaming laptops under $1500 with RTX graphics. Review 1080p/1440p fps benchmark scores, cooling specs, and low retail prices.',
      path, jsonLd
    }
  }

  // 3. Category / Segment
  if (f.segment === 'Gaming') {
    const title = `Best Gaming Laptops 2026 | ${SITE.name}`
    return {
      title,
      h1: title,
      description: 'Discover the best gaming laptops ranked by GPU benchmarks, fps scores, thermal specs, and live prices. Find top performance for your budget.',
      path, jsonLd
    }
  }
  if (f.segment === 'Professional') {
    const title = `Best Professional Laptops 2026 | ${SITE.name}`
    return {
      title,
      h1: title,
      description: 'Explore top professional laptops benchmarked for coding, 3D, and workflow tasks. Compare verified specs, benchmark scores, and latest prices.',
      path, jsonLd
    }
  }
  if (f.segment === 'General') {
    const title = `Best Everyday Laptops 2026 | ${SITE.name}`
    return {
      title,
      h1: title,
      description: 'Find the best everyday laptops for browsing, school, and work. Compare battery specs, benchmark scores, overall value, and affordable prices.',
      path, jsonLd
    }
  }

  // 4. GPU / Graphics
  const gpuMap: Record<string, [string, string]> = {
    'RTX 5090': ['Best RTX 5090 Laptops 2026 | LaptopIndex', 'Compare flagship RTX 5090 laptops with maximum TGP benchmark scores, 4K gaming fps, workstation specs, and current enthusiast prices.'],
    'RTX 5080': ['Best RTX 5080 Laptops 2026 | LaptopIndex', 'Find top RTX 5080 laptops evaluated by 1440p and 4K gaming benchmarks. Compare cooling specs, compute performance scores, and live prices.'],
    'RTX 5070': ['Best RTX 5070 Laptops 2026 | LaptopIndex', 'Discover the best RTX 5070 laptops delivering high-FPS 1440p gaming. Review thermal specs, independent benchmark scores, and deal prices.'],
    'RTX 5060': ['Best RTX 5060 Laptops 2026 | LaptopIndex', 'Explore top-value RTX 5060 laptops for competitive gaming. Check ray tracing benchmarks, power specs, overall value scores, and best prices.'],
    'RTX 5050': ['Best RTX 5050 Laptops 2026 | LaptopIndex', 'Find affordable RTX 5050 laptops for budget gaming and creative work. Compare entry-level GPU benchmark scores, hardware specs, and prices.'],
    'RTX 4050': ['Best RTX 4050 Laptops 2026 | LaptopIndex', 'Compare budget-friendly RTX 4050 laptops. Check 1080p gaming benchmark scores, DLSS specs, battery performance, and discounted street prices.'],
    'dedicated': ['Best Dedicated GPU Laptops 2026 | LaptopIndex', 'Browse the best laptops with dedicated graphics for gaming and rendering. Compare GPU benchmark scores, wattage specs, and live retail prices.'],
    'integrated': ['Best Integrated GPU Laptops 2026 | LaptopIndex', 'Find efficient laptops with integrated graphics. Compare battery life specs, lightweight portability scores, benchmarks, and low prices.']
  }
  if (f.gpu && gpuMap[f.gpu]) {
    const [t, d] = gpuMap[f.gpu]
    return { title: t, h1: t, description: d, path, jsonLd }
  }

  // 5. Brand
  const brandMap: Record<string, [string, string]> = {
    'Apple': ['Best Apple MacBooks 2026 | LaptopIndex', 'Compare the best Apple MacBook laptops by M-series chip benchmarks, Liquid Retina specs, battery life scores, and live retail prices.'],
    'ASUS': ['Best ASUS Laptops 2026 | LaptopIndex', 'Compare top ASUS laptops from ROG gaming rigs to Zenbook OLEDs. Filter verified benchmark scores, cooling specs, and current market prices.'],
    'Lenovo': ['Best Lenovo Laptops 2026 | LaptopIndex', 'Browse the best Lenovo laptops including ThinkPad and Legion series. Compare CPU benchmark scores, hardware specs, and discount prices.'],
    'Dell': ['Best Dell Laptops 2026 | LaptopIndex', 'Find the best Dell laptops for productivity and gaming. Compare processor benchmark scores, display specs, build ratings, and current prices.'],
    'HP': ['Best HP Laptops 2026 | LaptopIndex', 'Discover top HP laptops across Envy, Pavilion, and Victus lines. Compare CPU benchmark scores, battery specs, and verified value prices.'],
    'Acer': ['Best Acer Laptops 2026 | LaptopIndex', 'Explore the best Acer laptops from Nitro gaming to Aspire budget picks. Check independent benchmark scores, hardware specs, and best prices.'],
    'MSI': ['Best MSI Laptops 2026 | LaptopIndex', 'Compare high-performance MSI laptops ranked by GPU benchmark scores, display refresh specs, thermal headroom, and competitive prices.'],
    'Samsung': ['Best Samsung Galaxy Books 2026 | LaptopIndex', 'Explore the best Samsung laptops with AMOLED screens. Compare thin-and-light specs, benchmark scores, battery life ratings, and live prices.'],
    'Alienware': ['Best Alienware Laptops 2026 | LaptopIndex', 'Unleash extreme gaming with the best Alienware laptops. Review high-wattage GPU benchmarks, cryo-cooling specs, test scores, and prices.'],
    'Gigabyte': ['Best Gigabyte Laptops 2026 | LaptopIndex', 'Review top Gigabyte laptops for gaming and creators. Check RTX benchmark scores, high-refresh display specs, thermals, and current prices.']
  }
  if (f.brand && brandMap[f.brand]) {
    const [t, d] = brandMap[f.brand]
    return { title: t, h1: t, description: d, path, jsonLd }
  }

  // 6. CPU
  const cpuMap: Record<string, [string, string]> = {
    'Intel': ['Best Intel Laptops 2026 | LaptopIndex', 'Explore top Intel Core and Ultra processor laptops. Compare single-core benchmark scores, AI NPU specs, gaming fps ratings, and prices.'],
    'AMD': ['Best AMD Ryzen Laptops 2026 | LaptopIndex', 'Find the best AMD Ryzen laptops delivering multi-core speed and efficiency. Review benchmark scores, thermal specs, and live market prices.'],
    'Apple': ['Best Apple Silicon Laptops 2026 | LaptopIndex', 'Compare Apple M-series silicon laptops for unmatched battery life and speed. Review unified memory specs, benchmark scores, and prices.'],
    'Snapdragon': ['Best Snapdragon Laptops 2026 | LaptopIndex', 'Discover Snapdragon Copilot+ PC laptops with ultra-long battery life. Compare ARM benchmark scores, quiet fanless specs, and deal prices.']
  }
  if (f.cpu && cpuMap[f.cpu]) {
    const [t, d] = cpuMap[f.cpu]
    return { title: t, h1: t, description: d, path, jsonLd }
  }

  // 7. RAM
  const ramMap: Record<number, [string, string]> = {
    8: ['Best 8GB RAM Laptops 2026 | LaptopIndex', 'Find budget-friendly 8GB RAM laptops for everyday web and office use. Compare responsiveness benchmark scores, hardware specs, and low prices.'],
    16: ['Best 16GB RAM Laptops 2026 | LaptopIndex', 'Browse the best 16GB RAM laptops for multitasking, gaming, and heavy productivity. Compare speed specs, benchmark scores, and top prices.'],
    32: ['Best 32GB RAM Laptops 2026 | LaptopIndex', 'Find top 32GB RAM laptops built for developers, video editors, and power users. Review performance benchmark scores, memory specs, and prices.'],
    64: ['Best 64GB RAM Laptops 2026 | LaptopIndex', 'Compare extreme 64GB RAM workstation laptops for heavy virtualization. Review high-load benchmark scores, hardware specs, and live prices.']
  }
  if (f.ram && ramMap[f.ram]) {
    const [t, d] = ramMap[f.ram]
    return { title: t, h1: t, description: d, path, jsonLd }
  }

  // 8. Storage
  const storageMap: Record<number, [string, string]> = {
    256: ['Best 256GB SSD Laptops 2026 | LaptopIndex', 'Explore affordable 256GB SSD laptops for essential productivity. Compare read-speed specs, system benchmark scores, and budget-friendly prices.'],
    512: ['Best 512GB SSD Laptops 2026 | LaptopIndex', 'Find the best 512GB SSD laptops for everyday work and school. Compare NVMe drive speed specs, overall benchmark scores, and budget prices.'],
    1024: ['Best 1TB SSD Laptops 2026 | LaptopIndex', 'Explore top 1TB SSD laptops with ample storage for game libraries and media files. Review speed specs, benchmark scores, and current prices.'],
    2048: ['Best 2TB SSD Laptops 2026 | LaptopIndex', 'Compare premium 2TB SSD laptops for content creators and gamers. Check ultra-fast storage specs, system benchmark scores, and latest prices.']
  }
  if (f.storage && storageMap[f.storage]) {
    const [t, d] = storageMap[f.storage]
    return { title: t, h1: t, description: d, path, jsonLd }
  }

  // 9. Display Size
  if (f.size === 'small') {
    const t = 'Best 14-Inch Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Discover the best 14-inch compact laptops for travel and commuting. Compare lightweight specs, battery life benchmarks, scores, and prices.', path, jsonLd }
  }
  if (f.size === 'medium') {
    const t = 'Best 15 & 16-Inch Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find balanced 15-inch and 16-inch laptops offering generous screen real estate. Review display specs, benchmark scores, and current prices.', path, jsonLd }
  }
  if (f.size === 'large') {
    const t = 'Best 17 & 18-Inch Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Compare massive 17-inch and 18-inch desktop replacement laptops. Review high-wattage specs, immersive gaming benchmark scores, and prices.', path, jsonLd }
  }

  // 10. Display Panel & Tech
  if (f.panel === 'OLED') {
    const t = 'Best OLED Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Experience true blacks and infinite contrast with the best OLED laptops. Compare color gamut specs, visual benchmark scores, and live prices.', path, jsonLd }
  }
  if (f.panel === 'Mini LED') {
    const t = 'Best Mini LED Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find top Mini-LED laptops featuring peak HDR brightness and local dimming. Review display specs, creator benchmark scores, and market prices.', path, jsonLd }
  }
  if (f.panel === 'IPS') {
    const t = 'Best IPS Display Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Browse reliable IPS display laptops with wide viewing angles and matte finishes. Compare color accuracy specs, benchmark scores, and low prices.', path, jsonLd }
  }
  if (f.panel === 'Liquid Retina') {
    const t = 'Best Liquid Retina Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Compare MacBook models equipped with brilliant Liquid Retina displays. Check color benchmark scores, P3 wide gamut specs, and current prices.', path, jsonLd }
  }
  if (f.touch === 'yes') {
    const t = 'Best Touchscreen Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Explore versatile touchscreen laptops for note-taking and intuitive control. Compare responsive stylus specs, benchmark scores, and prices.', path, jsonLd }
  }

  // 11. Resolution
  if (f.res === 'FHD') {
    const t = 'Best Full HD Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find the best Full HD 1080p laptops for everyday productivity and esports. Compare power efficiency specs, benchmark scores, and low prices.', path, jsonLd }
  }
  if (f.res === 'FHD+') {
    const t = 'Best FHD+ Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Explore productive 16:10 FHD+ laptops for spreadsheets and web browsing. Check vertical screen specs, benchmark scores, and affordable prices.', path, jsonLd }
  }
  if (f.res === 'QHD+' || f.res === 'QHD') {
    const t = 'Best QHD+ Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find optimal QHD+ laptops combining crisp 1600p resolution with fast frame rates. Review panel specs, gaming benchmark scores, and prices.', path, jsonLd }
  }
  if (f.res === '3K+') {
    const t = 'Best 3K+ Display Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Discover stunning 3K+ resolution laptops for creative design and video editing. Compare panel specs, benchmark scores, and latest market prices.', path, jsonLd }
  }
  if (f.res === '4K') {
    const t = 'Best 4K Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Compare ultra-sharp 4K display laptops for photo editing and media creation. Check pixel density specs, hardware benchmark scores, and prices.', path, jsonLd }
  }

  // 12. Refresh Rate
  if (f.refresh === 120) {
    const t = 'Best 120Hz Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find smooth 120Hz laptops ideal for productivity and casual gaming. Compare fluid motion specs, benchmark scores, battery life, and prices.', path, jsonLd }
  }
  if (f.refresh === 144) {
    const t = 'Best 144Hz+ Gaming Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Explore smooth 144Hz+ gaming laptops for esports and fast-paced action. Review response time specs, benchmark scores, and competitive prices.', path, jsonLd }
  }
  if (f.refresh === 165) {
    const t = 'Best 165Hz Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Discover responsive 165Hz gaming laptops with minimal input lag. Compare high-FPS GPU benchmark scores, display specs, and deal prices.', path, jsonLd }
  }
  if (f.refresh === 240) {
    const t = 'Best 240Hz Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Compare tournament-grade 240Hz laptops with zero motion blur. Check GPU benchmark scores, latency specs, esports ratings, and deal prices.', path, jsonLd }
  }

  // 13. Weight
  if (f.maxWeight === 3) {
    const t = 'Best Laptops Under 3 lbs 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Browse ultra-light laptops under 3 pounds designed for mobile professionals. Compare travel battery specs, benchmark scores, and live prices.', path, jsonLd }
  }
  if (f.maxWeight === 4) {
    const t = 'Best Laptops Under 4 lbs 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find the best portable laptops under 4 lbs blending performance with mobility. Review weight specs, productivity benchmark scores, and prices.', path, jsonLd }
  }
  if (f.maxWeight === 5) {
    const t = 'Best Laptops Under 5 lbs 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Discover versatile laptops under 5 lbs offering dedicated graphics and cooling specs. Compare gaming benchmark scores and competitive prices.', path, jsonLd }
  }
  if (f.maxWeight === 6) {
    const t = 'Best Laptops Under 6 lbs 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Compare powerful high-performance laptops under 6 lbs with desktop-class cooling specs, multi-core benchmark scores, and verified prices.', path, jsonLd }
  }

  // 14. Price brackets
  if (f.maxPrice === 500) {
    const t = 'Best Laptops Under $500 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Find the best budget laptops under $500 for school and work. Review verified performance benchmark scores, essential specs, and value prices.', path, jsonLd }
  }
  if (f.maxPrice === 1000) {
    const t = 'Best Laptops Under $1000 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Discover top laptops under $1000 balancing speed, build quality, and battery life. Compare benchmark scores, hardware specs, and best prices.', path, jsonLd }
  }
  if (f.minPrice === 1000 && f.maxPrice === 1500) {
    const t = 'Best Laptops $1000-$1500 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Compare the sweet-spot laptops between $1000 and $1500. Evaluate comprehensive benchmark scores, premium display specs, and current prices.', path, jsonLd }
  }
  if (f.minPrice === 2000) {
    const t = 'Best Premium Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Explore luxury and workstation laptops over $2000. Compare top-of-the-line benchmark scores, high-end display specs, and current market prices.', path, jsonLd }
  }

  // 15. Sorts & Rankings
  if (f.sort === 'value') {
    const t = 'Best Value Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Discover the highest value-for-money laptops scored by price-to-performance algorithms. Compare benchmark scores, hardware specs, and deals.', path, jsonLd }
  }
  if (f.sort === 'gaming') {
    const t = 'Highest Scoring Gaming Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Browse the highest-rated gaming laptops ranked purely by 3D benchmark scores and GPU performance. Check thermal specs, frame rates, and prices.', path, jsonLd }
  }
  if (f.sort === 'score') {
    const t = 'Top Benchmark Scored Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'View laptops ranked by overall composite benchmark scores across CPU, GPU, RAM, and display tests. Compare verified specs and live prices.', path, jsonLd }
  }
  if (f.sort === 'weight') {
    const t = 'Lightest Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Browse the lightest laptops ranked by measured carry weight. Compare ultralight chassis specs, battery benchmark scores, and live prices.', path, jsonLd }
  }
  if (f.sort === 'rating') {
    const t = 'Highest Rated Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Explore top customer-rated laptops backed by verified buyer satisfaction scores, hardware specs, stress test benchmarks, and prices.', path, jsonLd }
  }
  if (f.sort === 'popular') {
    const t = 'Most Popular Laptops 2026 | LaptopIndex'
    return { title: t, h1: t, description: 'Browse the most widely reviewed laptops on the market today. Compare community popularity scores, benchmark specs, and current deal prices.', path, jsonLd }
  }

  // Default clean /laptops
  return {
    title: `Browse All Laptops — Filter by Price, GPU, RAM & More | ${SITE.name}`,
    h1: 'Browse All Laptops',
    description: 'Filter benchmark-scored laptops by brand, price, GPU, CPU, RAM, screen and weight. Data-driven specs, benchmarks, and deals.',
    path, jsonLd
  }
}

