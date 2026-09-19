import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

let totalWaybackMatches = 0;
let totalOldTagMatches = 0;
let totalUserTagMatches = 0;
let totalImgTags = 0;
let articlesWithZeroImgs = 0;
const waybackSamples = [];

for (const a of articles) {
  const html = a.contentHtml;
  const wb = html.match(/web\.archive\.org/gi) || [];
  totalWaybackMatches += wb.length;
  if (wb.length > 0 && waybackSamples.length < 5) {
    waybackSamples.push({ slug: a.slug, match: wb.slice(0, 3) });
  }

  const oldTag = html.match(/lptpswizz-20/gi) || [];
  totalOldTagMatches += oldTag.length;

  const userTag = html.match(/wat344r5-20/gi) || [];
  totalUserTagMatches += userTag.length;

  const imgs = html.match(/<img\s/gi) || [];
  totalImgTags += imgs.length;
  if (imgs.length === 0) {
    articlesWithZeroImgs++;
  }
}

console.log('AUDIT RESULTS:');
console.log({
  totalArticles: articles.length,
  totalWaybackMatches,
  totalOldTagMatches,
  totalUserTagMatches,
  totalImgTags,
  articlesWithZeroImgs,
  sampleWaybackIfAny: waybackSamples
});
