import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

for (const a of articles) {
  const matches = a.contentHtml.match(/lptpswizz-20/gi) || [];
  if (matches.length > 0) {
    const idx = a.contentHtml.indexOf('lptpswizz-20');
    console.log(`[${a.slug}] count: ${matches.length}`);
    console.log('  snippet:', a.contentHtml.substring(Math.max(0, idx - 40), idx + 80));
  }
}
