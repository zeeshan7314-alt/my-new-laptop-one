import fs from 'fs';
import * as cheerio from 'cheerio';

const USER_AFFILIATE_TAG = 'wat344r5-20';

const BRAND_FALLBACKS = {
  asus: '/static/img/laptops/asus-zenbook-14-oled.webp',
  rog: '/static/img/laptops/asus-rog-strix-scar-16.webp',
  lenovo: '/static/img/laptops/lenovo-thinkpad-x1-carbon-gen-12.webp',
  thinkpad: '/static/img/laptops/lenovo-thinkpad-x1-carbon-gen-12.webp',
  legion: '/static/img/laptops/lenovo-legion-pro-7i.webp',
  ideapad: '/static/img/laptops/lenovo-ideapad-slim-5.webp',
  yoga: '/static/img/laptops/lenovo-yoga-9i-2-in-1.webp',
  hp: '/static/img/laptops/hp-spectre-x360-14.webp',
  omen: '/static/img/laptops/hp-omen-transcend-14.webp',
  pavilion: '/static/img/laptops/hp-pavilion-plus-14.webp',
  envy: '/static/img/laptops/hp-envy-x360-14.webp',
  dell: '/static/img/laptops/dell-xps-14.webp',
  inspiron: '/static/img/laptops/dell-inspiron-16-plus.webp',
  xps: '/static/img/laptops/dell-xps-16.webp',
  alienware: '/static/img/laptops/dell-xps-16.webp',
  acer: '/static/img/laptops/acer-swift-go-14.webp',
  predator: '/static/img/laptops/acer-predator-helios-16.webp',
  aspire: '/static/img/laptops/acer-swift-go-14.webp',
  apple: '/static/img/laptops/apple-macbook-air-13-m3.webp',
  macbook: '/static/img/laptops/apple-macbook-pro-16-m3-max.webp',
  razer: '/static/img/laptops/razer-blade-16.webp',
  samsung: '/static/img/laptops/samsung-galaxy-book4-pro.webp',
  msi: '/static/img/laptops/msi-raider-ge78-hx.webp',
  gigabyte: '/static/img/laptops/gigabyte-aero-16-oled-bsf.webp',
  aero: '/static/img/laptops/gigabyte-aero-16-oled-bsf.webp',
  sager: '/static/img/laptops/acer-predator-helios-16.webp'
};

function getFallbackForTitle(title = '') {
  const lower = title.toLowerCase();
  for (const [key, path] of Object.entries(BRAND_FALLBACKS)) {
    if (lower.includes(key)) return path;
  }
  return '/static/img/laptops/asus-zenbook-14-oled.webp';
}

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
let totalImagesInjected = 0;

for (const a of articles) {
  const $ = cheerio.load(a.contentHtml);

  // Remove deprecated tracking pixel images
  $('img[src*="amazon-adsystem.com"]').remove();

  // 1. Check all table thumb cells (aawp-table__td-thumb)
  $('td.aawp-table__td-thumb').each((_, td) => {
    const $td = $(td);
    const existingImg = $td.find('img');
    if (existingImg.length === 0) {
      const parentTr = $td.closest('tr');
      const asin = parentTr.attr('data-aawp-product-id') || $td.find('a').attr('href')?.match(/\/dp\/([A-Z0-9]{10})/i)?.[1];
      const title = parentTr.attr('data-aawp-product-title') || $td.find('a').attr('title') || 'Laptop';
      if (asin) {
        const fallback = getFallbackForTitle(title);
        const imgTag = `<img src="https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX220_SCLZZZZZZZ_.jpg" alt="${title}" loading="lazy" class="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mx-auto" onerror="this.src='${fallback}'" />`;
        const $link = $td.find('a');
        if ($link.length > 0) {
          $link.html(imgTag);
        } else {
          $td.html(`<a href="https://www.amazon.com/dp/${asin}?tag=${USER_AFFILIATE_TAG}" target="_blank" rel="nofollow noopener noreferrer">${imgTag}</a>`);
        }
        totalImagesInjected++;
      }
    }
  });

  // 2. Check product reviews with VIEW ON AMAZON button or aawp buy buttons
  $('a.aawp-button, a[href*="amazon.com/dp/"]').each((_, el) => {
    const $a = $(el);
    const text = $a.text().trim().toUpperCase();
    if (text.includes('VIEW ON AMAZON') || text.includes('BUY ON AMAZON') || text.includes('CHECK PRICE')) {
      const asin = $a.attr('data-aawp-product-id') || $a.attr('href')?.match(/\/dp\/([A-Z0-9]{10})/i)?.[1];
      const title = $a.attr('data-aawp-product-title') || $a.closest('.aawp-product').attr('data-aawp-product-title') || '';
      
      if (asin && title) {
        // Check if there is already an image in the parent or preceding 3 siblings
        const $parent = $a.closest('p, div.aawp-product, tr');
        const hasNearbyImg = $parent.find('img').length > 0 || $parent.prev().find('img').length > 0 || $parent.prev().prev().find('img').length > 0;
        
        if (!hasNearbyImg) {
          const fallback = getFallbackForTitle(title);
          const showcaseHtml = `
<div class="my-6 text-center bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm sm:max-w-md mx-auto shadow-sm">
  <img src="https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX400_SCLZZZZZZZ_.jpg" alt="${title}" class="max-h-60 sm:max-h-72 object-contain mx-auto transition-transform hover:scale-105" loading="lazy" onerror="this.src='${fallback}'" />
  <p class="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium line-clamp-2">${title}</p>
</div>`;
          $parent.before(showcaseHtml);
          totalImagesInjected++;
        }
      }
    }
  });

  let updatedHtml = $('body').html() || '';

  // Final purge of any stray wayback machine or old tag occurrences
  updatedHtml = updatedHtml.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\/(https?:\/\/[^\s"'><\)]+)/gi, '$1');
  updatedHtml = updatedHtml.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\//gi, '');
  updatedHtml = updatedHtml.replace(/lptpswizz-20/gi, USER_AFFILIATE_TAG);

  a.contentHtml = updatedHtml;
}

console.log(`Total product images injected: ${totalImagesInjected}`);
fs.writeFileSync('./src/data/articles.json', JSON.stringify(articles, null, 2), 'utf-8');
console.log('Saved enriched articles.json!');
