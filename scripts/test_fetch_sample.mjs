import * as cheerio from 'cheerio';

const testUrls = [
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-2-in-1-laptops-under-400/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-thin-laptops-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-online-teaching/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/why-you-shouldnt-buy-a-touch-screen-laptop/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/asus-rog-strix-scar-ii-gaming-laptop-review/"
];

async function testFetch(url) {
  console.log('Fetching:', url);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Check featured image
  const featuredImg = $('img.single-featured, .entry-header img, meta[property="og:image"]').first();
  let featSrc = featuredImg.attr('src') || featuredImg.attr('data-lazy-src') || featuredImg.attr('content');

  // Count product images
  const allImgs = [];
  $('img').each((_, el) => {
    const s = $(el).attr('src') || $(el).attr('data-lazy-src') || $(el).attr('data-src');
    if (s && !s.includes('thumb-spacer') && !s.includes('data:image')) {
      allImgs.push(s);
    }
  });

  console.log({
    url: url.split('laptopswhizz.com/')[1],
    featured: featSrc,
    realImagesFound: allImgs.length,
    sampleImages: allImgs.slice(0, 3)
  });
}

for (const u of testUrls) {
  await testFetch(u);
}
