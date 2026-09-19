import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

// Sample some wp-content/uploads URLs
const wpSamples = [];
for (const a of articles) {
  const matches = a.contentHtml.match(/https?:\/\/[^"'><\s]+wp-content\/uploads\/[^"'><\s]+/gi) || [];
  if (matches.length > 0 && wpSamples.length < 10) {
    wpSamples.push({ slug: a.slug, urls: matches.slice(0, 3) });
  }
}

console.log('Sample WP Uploads URLs:', JSON.stringify(wpSamples, null, 2));
