import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

let escapedImgCount = 0;
let rawImgCount = 0;
let wpUploadsCount = 0;
let mediaAmazonCount = 0;
const articlesWithoutAnyImages = [];

for (const a of articles) {
  const html = a.contentHtml;
  const hasEscaped = html.includes('&lt;img');
  const hasRaw = /<img/i.test(html);
  const hasWpUploads = html.includes('wp-content/uploads');
  const hasMediaAmz = html.includes('media-amazon.com');
  const hasBgImg = html.includes('background-image');

  if (hasEscaped) escapedImgCount++;
  if (hasRaw) rawImgCount++;
  if (hasWpUploads) wpUploadsCount++;
  if (hasMediaAmz) mediaAmazonCount++;

  if (!hasEscaped && !hasRaw && !hasBgImg && !hasMediaAmz && !hasWpUploads) {
    articlesWithoutAnyImages.push(a.slug);
  }
}

console.log({
  total: articles.length,
  escapedImgCount,
  rawImgCount,
  wpUploadsCount,
  mediaAmazonCount,
  articlesWithoutAnyImagesCount: articlesWithoutAnyImages.length,
  articlesWithoutAnyImages
});
