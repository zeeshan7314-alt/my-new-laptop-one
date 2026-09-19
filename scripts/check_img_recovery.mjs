import fs from 'fs';
import * as cheerio from 'cheerio';

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

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));
console.log('Total articles:', articles.length);

// Let us map slug -> url
const urlMap = new Map();
for (const u of URLS) {
  const slug = u.split('laptopswhizz.com/')[1].replace(/\/$/, '');
  urlMap.set(slug, u);
}

// Check which articles have 0 images right now:
const missingImgArticles = articles.filter(a => {
  const imgs = a.contentHtml.match(/<img[^>]+src="([^">]+)"/gi) || [];
  return imgs.length === 0;
});
console.log('Articles with 0 images in current JSON:', missingImgArticles.length);
