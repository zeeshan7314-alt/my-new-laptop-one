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
      acceptedAnswer: { '@type': 'Answer', text: f.a },
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
  return [{
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
