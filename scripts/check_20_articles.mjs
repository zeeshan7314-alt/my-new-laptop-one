import fs from 'fs';
import * as cheerio from 'cheerio';

const URLS = [
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-online-teaching/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-researchers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-arcgis/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-financial-modeling/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-egpu/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-cities-skylines/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-tablet-under-100/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablets-for-gaming-under-200/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablets-for-gaming-and-movies/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablet-for-college-students-on-a-budget/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-mouses-under-30/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablet-for-medical-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-mouses-under-20/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-cheap-wireless-gaming-mouse/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-bluetooth-mouse-for-chromebook/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-for-wow/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-for-fortnite/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-wireless-mouse-for-large-hands/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/gigabyte-aero-15-classic-wa-u74adp-15-inch-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/rog-zephyrus-m-thin-gaming-laptop-review/"
];

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const text = await res.text();
    const $ = cheerio.load(text);

    // Featured image
    let feat = $('img.single-featured').attr('src') || $('img.single-featured').attr('data-lazy-src') || $('.entry-header img').attr('src');
    
    // Find all images inside entry-content
    const imgs = [];
    $('.entry-content img').each((_, el) => {
      const s = $(el).attr('src') || $(el).attr('data-lazy-src') || $(el).attr('data-src');
      if (s && !s.includes('thumb-spacer') && !s.includes('data:image')) imgs.push(s);
    });

    // Also check AAWP thumbs
    const aawpThumbs = [];
    $('.aawp-product').each((_, el) => {
      const id = $(el).attr('data-aawp-product-id');
      const title = $(el).attr('data-aawp-product-title');
      const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-lazy-src');
      if (id || title || img) aawpThumbs.push({ id, title: title?.slice(0, 40), img });
    });

    const slug = url.split('laptopswhizz.com/')[1].replace(/\/$/, '');
    console.log(`[${slug}] featured: ${!!feat}, imgsInContent: ${imgs.length}, aawpProducts: ${aawpThumbs.length}`);
  } catch (e) {
    console.error(`Error on ${url}:`, e.message);
  }
}

for (const u of URLS.slice(0, 5)) {
  await checkUrl(u);
}
