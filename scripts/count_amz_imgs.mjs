import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
const found = new Set();
for (const a of articles) {
  const m = a.contentHtml.match(/https?:\/\/[^\s"'\)]*media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-\.]+\.(?:jpg|png|jpeg)/gi) || [];
  for (const x of m) found.add(x);
}
console.log('Total distinct Amazon CDN images in current articles.json:', found.size);
