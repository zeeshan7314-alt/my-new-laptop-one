import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const USER_AFFILIATE_TAG = 'wat344r5-20';

const URLS = [
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/asus-zenbook-13-ultra-slim-ux331ua-as51-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/asus-rog-strix-scar-ii-gaming-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/sager-np8957-thin-light-gaming-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/gigabyte-aero-15-classic-xa-f74adp-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/gigabyte-aero-15-classic-wa-u74adp-15-inch-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/rog-zephyrus-m-thin-gaming-laptop-review/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-2-in-1-laptops-under-600/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-2-in-1-laptops-under-400/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-17-inch-laptops-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-thin-laptops-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-touch-screen-laptops-under-1000/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-with-thunderbolt-3-ports/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-with-1tb-hard-drive/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-with-backlit-keyboard/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-with-32gb-ram/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptop-with-ubuntu/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/cheap-gaming-laptop-under-600/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-cheap-laptop-for-gaming-under-500/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-gaming-laptops-with-good-battery-life/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-accounting-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-engineering-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-medical-school/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-online-teaching/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-remote-work/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-researchers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-web-developers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-software-engineers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-virtualization/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-financial-modeling/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-arcgis/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptops-for-homeschool/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptops-for-realtors/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptops-for-word-processing/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-streaming-netflix/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-streaming-twitch/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-egpu/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-fusion-360/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-cities-skylines/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-for-civilization-6/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebooks-under-250/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebooks-under-400/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebooks-under-500/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-chromebook-for-writers-and-bloggers/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-amazon-fire-tablet-under-200/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-tablet-under-100/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablets-for-gaming-under-200/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablets-for-gaming-and-movies/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablet-for-college-students-on-a-budget/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tablet-for-medical-students/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-mouses-under-20/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-gaming-mouses-under-30/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-under-50/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-cheap-wireless-gaming-mouse/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-bluetooth-mouse-for-chromebook/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-wireless-mouse-for-large-hands/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-for-fortnite/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-mouses-for-wow/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-backpack-for-back-pain/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-backpack-to-carry-laptop/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-laptop-bag-for-air-travel/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-stylish-laptop-backpacks-for-ladies/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-designer-bags-for-laptops/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-tote-bags-for-laptops/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-stylus-for-touch-screen-laptops/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/best-graphic-card-for-under-100/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-gaming-headsets-under-200/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-headphones-for-teenagers/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-wireless-headphones-for-athletes/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-bluetooth-for-noisy-environment/",
  "https://web.archive.org/web/20191209014001/https://laptopswhizz.com/best-black-friday-laptops-deals-2019/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-hp-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-lenovo-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-dell-inspiron-black-friday-laptop-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-acer-aspire-black-friday-laptop-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-acer-predator-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-asus-vivobook-black-friday-laptops-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-apple-macbook-black-friday-laptop-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-razer-blade-stealth-laptops-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-laptop-accessories-black-friday-deals/",
  "https://web.archive.org/web/20191117115402/https://laptopswhizz.com/best-gaming-headset-black-friday-deals/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/how-to-tell-if-a-laptop-is-good-for-gaming/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/what-is-the-best-processor-for-my-laptop/",
  "https://web.archive.org/web/20191229102014/https://laptopswhizz.com/why-you-shouldnt-buy-a-touch-screen-laptop/"
];

// Map local fallback laptop images
const localLaptopImages = fs.readdirSync('./public/static/img/laptops').filter(f => f.endsWith('.webp'));

function extractSlug(url) {
  const parts = url.split('laptopswhizz.com/');
  if (parts.length < 2) return '';
  return parts[1].replace(/\/$/, '');
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/Laptops\s*Whizz/gi, 'LaptopIndex')
    .replace(/laptopswhizz\.com/gi, 'laptopindex.info')
    .replace(/laptopswhizz/gi, 'laptopindex')
    .replace(/\b2018\b/g, '2026')
    .replace(/\b2019\b/g, '2026')
    .replace(/\b2020\b/g, '2026')
    .replace(/\b2021\b/g, '2026')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Strip wayback prefix
  const wbMatch = url.match(/^https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\/(https?:\/\/.*)$/i);
  if (wbMatch) {
    url = wbMatch[1];
  } else {
    url = url.replace(/^https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\//i, '');
  }

  // Internal routes
  if (url.includes('laptopswhizz.com/')) {
    const slug = url.split('laptopswhizz.com/')[1]?.split(/[?#]/)[0]?.replace(/\/$/, '');
    if (slug) return `/${slug}/`;
  }
  if (url.includes('laptopindex.info/')) {
    const slug = url.split('laptopindex.info/')[1]?.split(/[?#]/)[0]?.replace(/\/$/, '');
    if (slug) return `/${slug}/`;
  }

  // Amazon tag replacement
  if (url.includes('amazon.com') || url.includes('amzn.to')) {
    if (url.includes('tag=')) {
      url = url.replace(/tag=[^&"'\s]+/g, `tag=${USER_AFFILIATE_TAG}`);
    } else if (url.includes('amazon.com')) {
      url = url.includes('?') ? `${url}&tag=${USER_AFFILIATE_TAG}` : `${url}?tag=${USER_AFFILIATE_TAG}`;
    }
  }

  return url;
}

// Download image helper with timeout
async function downloadImage(url, destPath) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return false; // Ignore empty / 1x1 spacer
    fs.writeFileSync(destPath, buf);
    // Also copy to dist if dist exists
    const distPath = destPath.replace('./public/', './dist/');
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, buf);
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function fetchPageWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    clearTimeout(timeout);
    return null;
  }
}

export async function processOneArticle(url, existingArticlesMap) {
  const slug = extractSlug(url);
  const existing = existingArticlesMap.get(slug);

  console.log(`Processing [${slug}]...`);

  let html = null;
  // Always fetch fresh from wayback to get full images & markup
  html = await fetchPageWithTimeout(url);

  let $;
  if (html) {
    $ = cheerio.load(html);
  } else if (existing) {
    console.log(`  Falling back to existing content for [${slug}]`);
    $ = cheerio.load(existing.contentHtml);
  } else {
    console.error(`  Could not fetch or load [${slug}]`);
    return null;
  }

  // Find featured image
  let featuredImageUrl = '';
  const heroCandidates = [
    $('img.single-featured').attr('src') || $('img.single-featured').attr('data-lazy-src'),
    $('.entry-header img').attr('src') || $('.entry-header img').attr('data-lazy-src'),
    $('meta[property="og:image"]').attr('content'),
    $('.entry-content img').first().attr('data-lazy-src') || $('.entry-content img').first().attr('src')
  ].filter(Boolean);

  let heroSrc = heroCandidates[0] || '';
  if (heroSrc && !heroSrc.includes('thumb-spacer') && !heroSrc.includes('data:image')) {
    // Try to download if it is a wp-content image from wayback
    if (heroSrc.includes('wp-content/uploads/')) {
      const ext = heroSrc.includes('.png') ? '.png' : '.jpg';
      const localRelPath = `/static/img/articles/${slug}-hero${ext}`;
      const localAbsPath = `./public${localRelPath}`;
      // Format proper wayback URL for downloading
      let downloadUrl = heroSrc;
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = 'https:' + downloadUrl;
      }
      if (!downloadUrl.includes('web.archive.org') && downloadUrl.includes('laptopswhizz.com')) {
        downloadUrl = `https://web.archive.org/web/20191229102014im_/${downloadUrl}`;
      }
      const downloaded = await downloadImage(downloadUrl, localAbsPath);
      if (downloaded) {
        featuredImageUrl = localRelPath;
      }
    } else if (heroSrc.includes('media-amazon.com')) {
      // Amazon media image is direct
      featuredImageUrl = cleanUrl(heroSrc);
    }
  }

  // Title & H1
  let rawTitle = $('title').text().trim();
  rawTitle = rawTitle.replace(/\s*-\s*Laptops\s*Whizz.*$/i, '').trim();
  const title = cleanText(rawTitle) + ' | LaptopIndex';

  let rawH1 = $('h1.entry-title').first().text().trim() || $('h1').first().text().trim() || (existing ? existing.h1 : rawTitle);
  const h1 = cleanText(rawH1);

  let rawDesc = $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') ||
                $('.entry-content p').first().text().trim() || (existing ? existing.metaDescription : '');
  const metaDescription = cleanText(rawDesc).slice(0, 160);

  // Content processing
  let $content = $('.entry-content').first();
  if ($content.length === 0) {
    $content = $('body');
  }

  // Remove junk
  $content.find('script, style, noscript, .sharedaddy, .sd-sharing, .yarpp-related, .wpurp-container-actions, #jp-post-flair, .jp-relatedposts, .comments-area, .fb-like, .twitter-share-button, .social-sharing').remove();

  // Fix all images inside content
  $content.find('img').each((_, el) => {
    const $img = $(el);
    let src = $img.attr('data-lazy-src') || $img.attr('data-src') || $img.attr('src') || '';

    // Handle AAWP thumb-spacer background images
    if (src.includes('thumb-spacer') || src.includes('data:image')) {
      const parentStyle = $img.parent().attr('style') || $img.closest('.aawp-product__thumb').attr('style') || '';
      const bgMatch = parentStyle.match(/url\(['"]?([^'"\)]+)['"]?\)/);
      if (bgMatch) {
        src = bgMatch[1];
      }
    }

    if (src) {
      src = cleanUrl(src);
      $img.attr('src', src);
      $img.removeAttr('data-lazy-src');
      $img.removeAttr('data-src');
      $img.removeAttr('srcset');
      $img.removeAttr('data-srcset');
      $img.attr('loading', 'lazy');
      $img.addClass('rounded-xl max-w-full h-auto my-4 mx-auto object-contain');
      $img.attr('onerror', "this.style.display='none'");

      // If featured image wasn't set, use first good product image
      if (!featuredImageUrl && src.includes('media-amazon.com')) {
        featuredImageUrl = src;
      }
    }
  });

  // Handle AAWP product thumb containers where img tag was absent or escaped
  $content.find('.aawp-product__thumb').each((_, el) => {
    const $thumb = $(el);
    const style = $thumb.attr('style') || '';
    const bgMatch = style.match(/url\(['"]?([^'"\)]+)['"]?\)/);
    const existingImg = $thumb.find('img');
    if (bgMatch && (existingImg.length === 0 || existingImg.attr('src')?.includes('thumb-spacer'))) {
      const realSrc = cleanUrl(bgMatch[1]);
      $thumb.html(`<img src="${realSrc}" class="rounded-xl max-h-48 object-contain mx-auto" loading="lazy" onerror="this.style.display='none'" />`);
      $thumb.removeAttr('style');
    }
  });

  // Modernize AAWP Product Cards
  $content.find('.aawp-product').each((idx, el) => {
    const $card = $(el);
    $card.addClass('aawp-modern-card my-8 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:shadow-md');
  });

  // Process links
  $content.find('a').each((_, el) => {
    const $a = $(el);
    let href = $a.attr('href') || '';
    if (href) {
      const cleaned = cleanUrl(href);
      $a.attr('href', cleaned);
      if (cleaned.includes('amazon.com') || cleaned.includes('amzn.to')) {
        $a.attr('target', '_blank');
        $a.attr('rel', 'nofollow noopener noreferrer');
        // If it is an AAWP button, give it pristine button styling
        if ($a.hasClass('aawp-button') || $a.hasClass('aawp-check-premium')) {
          $a.addClass('inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-sm transition hover:shadow text-sm my-2 text-decoration-none');
        }
      }
    }
    $a.text(cleanText($a.text()));
  });

  // Tables, headings & typography classes
  $content.find('table').addClass('w-full text-sm my-6 border-collapse overflow-x-auto block md:table rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700');
  $content.find('th').addClass('bg-slate-100 dark:bg-slate-800 p-3 font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700');
  $content.find('td').addClass('p-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300');
  $content.find('h2').addClass('text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800');
  $content.find('h3').addClass('text-xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-3');
  $content.find('h4').addClass('text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2');
  $content.find('p').addClass('text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4');
  $content.find('ul').addClass('list-disc list-inside space-y-2 mb-4 text-slate-700 dark:text-slate-300');
  $content.find('ol').addClass('list-decimal list-inside space-y-2 mb-4 text-slate-700 dark:text-slate-300');

  let contentHtml = $content.html() || '';

  // Unescape any escaped img tags that might have been stored as text
  contentHtml = contentHtml.replace(/&lt;img\s+([^&>]+)&gt;/gi, '<img $1 />');

  // Strip all remaining wayback prefixes anywhere in the HTML
  contentHtml = contentHtml.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\/(https?:\/\/[^\s"'><\)]+)/gi, '$1');
  contentHtml = contentHtml.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\//gi, '');

  // Brand and dates cleanup
  contentHtml = contentHtml
    .replace(/Laptops\s*Whizz/gi, 'LaptopIndex')
    .replace(/laptopswhizz\.com/gi, 'laptopindex.info')
    .replace(/laptopswhizz/gi, 'laptopindex')
    .replace(/tag=lptpswizz-20/gi, `tag=${USER_AFFILIATE_TAG}`)
    .replace(/\b2018\b/g, '2026')
    .replace(/\b2019\b/g, '2026')
    .replace(/\b2020\b/g, '2026')
    .replace(/\b2021\b/g, '2026');

  // If still no featured image, pick a relevant image from local laptop library or default
  if (!featuredImageUrl) {
    // Check if slug contains a laptop brand
    const brandMatch = localLaptopImages.find(imgName => {
      const parts = slug.split('-');
      return parts.some(p => p.length > 3 && imgName.includes(p));
    });
    if (brandMatch) {
      featuredImageUrl = `/static/img/laptops/${brandMatch}`;
    } else {
      featuredImageUrl = `/static/img/laptops/${localLaptopImages[0]}`;
    }
  }

  return {
    slug,
    originalUrl: url,
    canonical: `https://laptopindex.info/${slug}/`,
    title,
    h1,
    metaDescription,
    featuredImage: featuredImageUrl,
    datePublished: '2026-01-15',
    dateModified: '2026-09-19',
    contentHtml
  };
}

async function run() {
  console.log(`Starting enrichment for ${URLS.length} articles...`);
  const existingArticles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
  const existingMap = new Map(existingArticles.map(a => [a.slug, a]));

  const results = [];
  const CONCURRENCY = 5;

  for (let i = 0; i < URLS.length; i += CONCURRENCY) {
    const chunk = URLS.slice(i, i + CONCURRENCY);
    const chunkPromises = chunk.map(url => processOneArticle(url, existingMap));
    const chunkResults = await Promise.all(chunkPromises);
    for (const r of chunkResults) {
      if (r) results.push(r);
    }
    console.log(`Completed ${results.length} / ${URLS.length}`);
  }

  console.log(`All ${results.length} articles processed.`);
  fs.writeFileSync('./src/data/articles.json', JSON.stringify(results, null, 2), 'utf-8');
  console.log('Saved updated articles to src/data/articles.json');
}

run();
