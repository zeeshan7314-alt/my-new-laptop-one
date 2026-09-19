import fs from 'fs';

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

// Sample first 5 articles
for (let i = 0; i < 5; i++) {
  const a = articles[i];
  console.log(`\n================== ARTICLE ${i+1}: ${a.slug} ==================`);
  
  // Find all <img tags
  const imgTags = a.contentHtml.match(/<img[^>]+>/gi) || [];
  console.log(`Found ${imgTags.length} <img> tags:`);
  imgTags.slice(0, 5).forEach(img => console.log('  IMG:', img.substring(0, 150)));

  // Find background-image in inline styles
  const bgImgs = a.contentHtml.match(/background-image:\s*url\([^)]+\)/gi) || [];
  console.log(`Found ${bgImgs.length} background-images:`);
  bgImgs.slice(0, 5).forEach(bg => console.log('  BG:', bg.substring(0, 150)));

  // Find all links
  const links = a.contentHtml.match(/<a\s+[^>]*href="([^"]+)"[^>]*>/gi) || [];
  console.log(`Found ${links.length} links:`);
  links.slice(0, 5).forEach(l => console.log('  LINK:', l.substring(0, 150)));
}
