import * as cheerio from 'cheerio';

const testSlugs = [
  'best-2-in-1-laptops-under-400',
  'best-17-inch-laptops-under-500',
  'best-thin-laptops-under-500'
];

const URLS = [
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-2-in-1-laptops-under-400/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-17-inch-laptops-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-thin-laptops-under-500/"
];

for (const u of URLS) {
  console.log('Fetching:', u);
  const start = Date.now();
  const res = await fetch(u, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const text = await res.text();
  const $ = cheerio.load(text);
  const imgs = [];
  $('img').each((_, el) => {
    const s = $(el).attr('data-lazy-src') || $(el).attr('src');
    if (s && s.includes('media-amazon.com')) imgs.push(s);
  });
  console.log(`Done in ${Date.now() - start}ms. Found ${imgs.length} Amazon images!`);
  await new Promise(r => setTimeout(r, 1000));
}
