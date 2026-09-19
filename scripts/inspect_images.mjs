import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

let countWithDataSrc = 0;
let countWithDataLazy = 0;
let countWithBgImage = 0;
let countWithThumbSpacer = 0;
let countWithMediaAmazon = 0;

for (const a of articles) {
  const html = a.contentHtml;
  if (html.includes('data-src=')) countWithDataSrc++;
  if (html.includes('data-lazy-src=')) countWithDataLazy++;
  if (html.includes('background-image:')) countWithBgImage++;
  if (html.includes('thumb-spacer.png')) countWithThumbSpacer++;
  if (html.includes('media-amazon.com')) countWithMediaAmazon++;
}

console.log({
  totalArticles: articles.length,
  countWithDataSrc,
  countWithDataLazy,
  countWithBgImage,
  countWithThumbSpacer,
  countWithMediaAmazon
});

// Let's inspect a chunk of article 1 and article 3 where images appear:
const a1 = articles[0];
console.log('\n--- Article 1 Snippet around aawp-product__thumb ---');
const thumbMatches = a1.contentHtml.match(/<div class="aawp-product__thumb"[^>]*>[\s\S]*?<\/div>/gi) || [];
thumbMatches.slice(0, 3).forEach((t, i) => console.log(`Thumb ${i+1}:`, t));

console.log('\n--- Article 1 all attributes with http/https ---');
const httpAttrs = a1.contentHtml.match(/(?:src|data-[a-z-]+|href|style)="[^"]*https?:\/\/[^"]*"/gi) || [];
console.log('Sample attributes with URLs:', httpAttrs.slice(0, 10));
