import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const USER_AFFILIATE_TAG = 'wat344r5-20';

export function cleanUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Strip wayback prefix
  const wbMatch = url.match(/^https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\/(https?:\/\/.*)$/i);
  if (wbMatch) {
    url = wbMatch[1];
  } else {
    url = url.replace(/^https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\//i, '');
  }

  // If it is an internal laptopswhizz link, turn it into /slug/
  if (url.includes('laptopswhizz.com/')) {
    const slug = url.split('laptopswhizz.com/')[1]?.split(/[?#]/)[0]?.replace(/\/$/, '');
    if (slug) return `/${slug}/`;
  }
  if (url.includes('laptopindex.info/')) {
    const slug = url.split('laptopindex.info/')[1]?.split(/[?#]/)[0]?.replace(/\/$/, '');
    if (slug) return `/${slug}/`;
  }

  // If it is Amazon, ensure user affiliate tag
  if (url.includes('amazon.com') || url.includes('amzn.to')) {
    if (url.includes('tag=')) {
      url = url.replace(/tag=[^&"'\s]+/g, `tag=${USER_AFFILIATE_TAG}`);
    } else if (url.includes('amazon.com')) {
      url = url.includes('?') ? `${url}&tag=${USER_AFFILIATE_TAG}` : `${url}?tag=${USER_AFFILIATE_TAG}`;
    }
  }

  return url;
}

export function cleanHtmlContent(rawHtml, articleSlug = '') {
  if (!rawHtml) return '';

  // Unescape any escaped img tags
  let html = rawHtml.replace(/&lt;img\s+([^&>]+)&gt;/gi, '<img $1 />');

  // Strip all wayback machine wrappers in URLs
  html = html.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\/(https?:\/\/[^\s"'><\)]+)/gi, '$1');
  html = html.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\//gi, '');

  const $ = cheerio.load(html, { xmlMode: false });

  // Remove unwanted elements
  $('script, style, noscript, .sharedaddy, .sd-sharing, .yarpp-related, #jp-post-flair, .jp-relatedposts, .comments-area').remove();

  // Process all links
  $('a').each((_, el) => {
    const $a = $(el);
    let href = $a.attr('href') || '';
    if (href) {
      const cleaned = cleanUrl(href);
      $a.attr('href', cleaned);
      if (cleaned.includes('amazon.com') || cleaned.includes('amzn.to')) {
        $a.attr('target', '_blank');
        $a.attr('rel', 'nofollow noopener noreferrer');
      }
    }
  });

  // Process all images
  $('img').each((_, el) => {
    const $img = $(el);
    let src = $img.attr('data-lazy-src') || $img.attr('data-src') || $img.attr('src') || '';
    
    // Check if thumb-spacer was used and check parent for background-image
    if (src.includes('thumb-spacer') || src.includes('data:image')) {
      const parentStyle = $img.parent().attr('style') || $img.closest('.aawp-product__thumb').attr('style') || '';
      const bgMatch = parentStyle.match(/url\(['"]?([^'"\)]+)['"]?\)/);
      if (bgMatch) {
        src = bgMatch[1];
      }
    }

    if (src) {
      src = cleanUrl(src);
      // If src still has LaptopIndex.com/wp-content, fix domain
      src = src.replace(/https?:\/\/LaptopIndex\.com\/wp-content\//gi, 'https://laptopswhizz.com/wp-content/');
      $img.attr('src', src);
      $img.removeAttr('data-lazy-src');
      $img.removeAttr('data-src');
      $img.removeAttr('srcset');
      $img.removeAttr('data-srcset');
      $img.attr('loading', 'lazy');
      $img.attr('onerror', "this.style.display='none'");
    }
  });

  // Re-style AAWP product blocks to look like modern product review cards
  $('.aawp-product').each((idx, el) => {
    const $card = $(el);
    $card.addClass('aawp-modern-card my-8 p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:shadow-md');
  });

  let outputHtml = $('body').html() || '';

  // Clean brand and dates
  outputHtml = outputHtml
    .replace(/Laptops\s*Whizz/gi, 'LaptopIndex')
    .replace(/laptopswhizz\.com/gi, 'laptopindex.info')
    .replace(/laptopswhizz/gi, 'laptopindex')
    .replace(/tag=lptpswizz-20/gi, `tag=${USER_AFFILIATE_TAG}`)
    .replace(/\b2019\b/g, '2026')
    .replace(/\b2020\b/g, '2026')
    .replace(/\b2021\b/g, '2026');

  // Double-check for any lingering wayback urls
  outputHtml = outputHtml.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\/(https?:\/\/[^\s"'><\)]+)/gi, '$1');
  outputHtml = outputHtml.replace(/https?:\/\/web\.archive\.org\/web\/[0-9]+[a-z_]*\//gi, '');

  return outputHtml;
}

// Test on article 1
const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
const sampleCleaned = cleanHtmlContent(articles[0].contentHtml, articles[0].slug);

console.log('Original article 1 wayback count:', (articles[0].contentHtml.match(/web\.archive\.org/g) || []).length);
console.log('Cleaned article 1 wayback count:', (sampleCleaned.match(/web\.archive\.org/g) || []).length);
console.log('Cleaned article 1 user tag count:', (sampleCleaned.match(new RegExp(USER_AFFILIATE_TAG, 'g')) || []).length);
console.log('Cleaned article 1 old tag count:', (sampleCleaned.match(/lptpswizz-20/g) || []).length);
console.log('Cleaned article 1 img count:', (sampleCleaned.match(/<img/g) || []).length);
