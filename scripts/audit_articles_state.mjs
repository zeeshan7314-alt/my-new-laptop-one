import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

// Check each article for:
// 1. Featured image or first image
// 2. Number of images
// 3. Number of ASINs
// 4. Any wayback links
const summary = [];

for (const a of articles) {
  const html = a.contentHtml;
  const waybackMatches = html.match(/https?:\/\/web\.archive\.org\/web\/[^\s"'><]+/gi) || [];
  const amzLinks = html.match(/https?:\/\/[^\s"'><]*(?:amazon\.com|amzn\.to)[^\s"'><]*/gi) || [];
  const imgMatches = html.match(/<img[^>]+src="([^">]+)"/gi) || [];
  const asins = html.match(/\/dp\/([A-Z0-9]{10})/gi) || [];
  const uniqueAsins = Array.from(new Set(asins.map(x => x.replace(/\/dp\//i, ''))));

  summary.push({
    slug: a.slug,
    title: a.title,
    waybackCount: waybackMatches.length,
    amzCount: amzLinks.length,
    imgCount: imgMatches.length,
    asinCount: uniqueAsins.length,
    firstAsin: uniqueAsins[0] || null
  });
}

console.log('Total articles:', summary.length);
console.log('Articles with 0 images currently:', summary.filter(s => s.imgCount === 0).length);
console.log('Articles with ASINs:', summary.filter(s => s.asinCount > 0).length);
console.log('Sample summary of articles with 0 images:', summary.filter(s => s.imgCount === 0).slice(0, 10));
