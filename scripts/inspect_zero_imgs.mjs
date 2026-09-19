import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
const zeroImgs = articles.filter(a => (a.contentHtml.match(/<img\s/gi) || []).length === 0);

console.log('Zero image articles count:', zeroImgs.length);
for (const a of zeroImgs.slice(0, 10)) {
  console.log(`\n[${a.slug}]`);
  console.log('  featuredImage:', a.featuredImage);
  const asins = a.contentHtml.match(/\/dp\/([A-Z0-9]{10})/gi) || [];
  console.log('  ASINs count:', asins.length, 'Unique:', Array.from(new Set(asins)).slice(0, 3));
  const aawp = a.contentHtml.match(/<div class="aawp-product[^"]*"[^>]*>/gi) || [];
  console.log('  AAWP divs count:', aawp.length);
  if (aawp.length > 0) {
    const idx = a.contentHtml.indexOf('aawp-product');
    console.log('  snippet:', a.contentHtml.substring(idx - 20, idx + 400));
  }
}
