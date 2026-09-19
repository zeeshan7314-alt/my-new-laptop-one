import fs from 'fs';

const noImgSlugs = [
  'best-laptop-for-online-teaching',
  'best-laptop-for-researchers',
  'best-laptops-for-arcgis',
  'best-laptops-for-financial-modeling',
  'best-laptop-for-egpu',
  'best-laptop-for-cities-skylines',
  'best-gaming-tablet-under-100',
  'best-tablets-for-gaming-under-200',
  'best-tablets-for-gaming-and-movies',
  'best-tablet-for-college-students-on-a-budget',
  'best-gaming-mouses-under-30',
  'best-tablet-for-medical-students',
  'best-gaming-mouses-under-20',
  'best-cheap-wireless-gaming-mouse',
  'best-bluetooth-mouse-for-chromebook',
  'best-mouses-for-wow',
  'best-mouses-for-fortnite',
  'best-wireless-mouse-for-large-hands',
  'gigabyte-aero-15-classic-wa-u74adp-15-inch-review',
  'rog-zephyrus-m-thin-gaming-laptop-review'
];

const articles = JSON.parse(fs.readFileSync('./src/data/articles.json', 'utf-8'));

for (const slug of noImgSlugs.slice(0, 5)) {
  const a = articles.find(x => x.slug === slug);
  console.log(`\nSlug: ${slug}, originalUrl: ${a?.originalUrl}`);
  // Check if there are amazon ASINs or product links in the content:
  const asins = a?.contentHtml.match(/\/dp\/([A-Z0-9]{10})/g) || [];
  const amzLinks = a?.contentHtml.match(/https?:\/\/[^\s"'><]*(?:amazon\.com|amzn\.to)[^\s"'><]*/g) || [];
  console.log(`  ASINs found in text:`, asins.slice(0, 5));
  console.log(`  Amazon links in text:`, amzLinks.slice(0, 5));
}
