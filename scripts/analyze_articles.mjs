import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
console.log('Total articles:', articles.length);

let totalWayback = 0;
const sampleWayback = [];
const amazonTags = new Set();
const sampleAmazon = [];
const allImageUrls = [];

for (const a of articles) {
  const html = a.contentHtml;
  // Match any web.archive.org URLs
  const wbMatches = html.match(/https:\/\/web\.archive\.org\/web\/[0-9a-zA-Z_]+\/[^"'><\s]+/g) || [];
  totalWayback += wbMatches.length;
  if (sampleWayback.length < 15 && wbMatches.length > 0) {
    sampleWayback.push(...wbMatches.slice(0, 5));
  }

  // Find amazon links
  const amzMatches = html.match(/https?:\/\/[^"'><\s]*(?:amazon\.com|amzn\.to)[^"'><\s]*/g) || [];
  for (const link of amzMatches) {
    if (sampleAmazon.length < 5) sampleAmazon.push(link);
    const tagMatch = link.match(/[?&]tag=([^&"'><\s]+)/);
    if (tagMatch) amazonTags.add(tagMatch[1]);
  }

  // Check images
  const imgMatches = html.match(/<img[^>]+src="([^">]+)"/g) || [];
  for (const img of imgMatches) {
    const src = img.match(/src="([^">]+)"/)?.[1];
    if (src && allImageUrls.length < 10) allImageUrls.push(src);
  }
}

console.log('Total Wayback URLs found:', totalWayback);
console.log('Sample Wayback URLs:', sampleWayback.slice(0, 8));
console.log('Found Amazon tags:', Array.from(amazonTags));
console.log('Sample Amazon links:', sampleAmazon);
console.log('Sample Image URLs:', allImageUrls.slice(0, 8));
