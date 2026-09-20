// =====================================================
// Articles Data Layer — 83 in-depth reviews & buying guides
// =====================================================
import rawArticles from '../data/articles.json'
import { SITE, Meta } from './seo'

export interface Article {
  slug: string
  originalUrl: string
  canonical: string
  title: string
  h1: string
  metaDescription: string
  featuredImage?: string
  datePublished: string
  dateModified: string
  contentHtml: string
}

export const ARTICLES: Article[] = rawArticles as Article[]

const articleMap = new Map<string, Article>()
for (const art of ARTICLES) {
  articleMap.set(art.slug, art)
  // Also index normalized slug without trailing slashes
  const clean = art.slug.replace(/^\/+|\/+$/g, '')
  articleMap.set(clean, art)
}

export function byArticleSlug(slug: string): Article | undefined {
  if (!slug) return undefined
  const clean = slug.replace(/^\/+|\/+$/g, '')
  return articleMap.get(clean)
}

export function articleMeta(a: Article): Meta {
  const imgUrl = a.featuredImage
    ? (a.featuredImage.startsWith('http') ? a.featuredImage : `${SITE.baseUrl}${a.featuredImage}`)
    : `${SITE.baseUrl}/static/logo.png`

  return {
    title: a.title,
    description: a.metaDescription,
    path: `/${a.slug}/`,
    image: imgUrl,
    ogImage: imgUrl,
    ogType: 'article',
    jsonLd: articleJsonLd(a),
  }
}

export function articleJsonLd(a: Article): object[] {
  const url = `${SITE.baseUrl}/${a.slug}/`
  const imgUrl = a.featuredImage
    ? (a.featuredImage.startsWith('http') ? a.featuredImage : `${SITE.baseUrl}${a.featuredImage}`)
    : undefined

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      headline: a.h1,
      name: a.title,
      description: a.metaDescription,
      url: url,
      image: imgUrl ? [imgUrl] : undefined,
      datePublished: a.datePublished,
      dateModified: a.dateModified,
      publisher: {
        '@type': 'Organization',
        name: SITE.name,
        url: SITE.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE.baseUrl}/static/icon-512.png`,
        },
      },
      author: {
        '@type': 'Organization',
        name: `${SITE.name} Tech Editorial Team`,
        url: SITE.baseUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE.baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Articles & Guides',
          item: `${SITE.baseUrl}/guides`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: a.h1,
          item: url,
        },
      ],
    },
  ]
}
