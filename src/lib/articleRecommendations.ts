// =====================================================
// Contextual Recommendation Engine for Legacy Articles
// Implements Edward Sturm's Topical Authority Architecture
// Funnels PageRank from 83 legacy articles into 2026 Buying Guides & Modern Reviews
// =====================================================

export interface ArticlePillarRecommendation {
  pillarSlug: string
  pillarTitle: string
  pillarAnchor: string
  clusterSlug?: string
  clusterTitle?: string
  clusterAnchor?: string
  modernReviewSlug?: string
  modernReviewName?: string
  modernReviewAnchor?: string
  categoryBadge: string
  editorialNote: string
}

export function getArticleRecommendations(slug: string, title: string): ArticlePillarRecommendation {
  const text = (slug + ' ' + title).toLowerCase()

  // 1. Gaming Laptops & Gaming Peripherals / GPUs
  if (
    text.includes('gaming') ||
    text.includes('strix') ||
    text.includes('zephyrus') ||
    text.includes('geforce') ||
    text.includes('rtx') ||
    text.includes('gtx') ||
    text.includes('titan') ||
    text.includes('graphic-card') ||
    text.includes('cities-skylines') ||
    text.includes('civilization') ||
    text.includes('fortnite') ||
    text.includes('wow') ||
    text.includes('aero') ||
    text.includes('sager') ||
    text.includes('egpu') ||
    text.includes('predator')
  ) {
    if (text.includes('battery') || text.includes('thin') || text.includes('light')) {
      return {
        pillarSlug: 'best-gaming-laptops',
        pillarTitle: 'Best Gaming Laptops (2026)',
        pillarAnchor: 'comprehensive ranking of the best gaming laptops',
        clusterSlug: 'best-thin-and-light-gaming-laptops',
        clusterTitle: 'Best Thin & Light Gaming Laptops',
        clusterAnchor: 'top-rated thin and light gaming laptops',
        modernReviewSlug: 'asus-rog-zephyrus-g16-gu605my-review',
        modernReviewName: 'ASUS ROG Zephyrus G16 (RTX 4090 / OLED)',
        modernReviewAnchor: 'ASUS ROG Zephyrus G16 review',
        categoryBadge: 'High-Performance Gaming',
        editorialNote: 'While this article reviews older portable hardware, modern gaming laptops now deliver over 8 hours of battery life with high-wattage Ada Lovelace and Blackwell GPUs.',
      }
    }

    if (text.includes('under-600') || text.includes('under-500') || text.includes('cheap')) {
      return {
        pillarSlug: 'best-gaming-laptops',
        pillarTitle: 'Best Gaming Laptops (2026)',
        pillarAnchor: 'benchmark-tested best gaming laptops guide',
        clusterSlug: 'best-gaming-laptops-under-1500',
        clusterTitle: 'Best Gaming Laptops Under $1500',
        clusterAnchor: 'best gaming laptops under $1500',
        modernReviewSlug: 'hp-victus-fa1082wm-review',
        modernReviewName: 'HP Victus 15 (RTX 3050 / i5-12450H)',
        modernReviewAnchor: 'budget HP Victus 15 review',
        categoryBadge: 'Budget Gaming Hardware',
        editorialNote: 'Budget laptop graphics have advanced dramatically. Modern entry-level discrete GPUs now handle 1080p esports and modern AAA titles with full DLSS support.',
      }
    }

    return {
      pillarSlug: 'best-gaming-laptops',
      pillarTitle: 'Best Gaming Laptops (2026)',
      pillarAnchor: 'tested best gaming laptops of 2026',
      clusterSlug: 'best-rtx-5070-gaming-laptops',
      clusterTitle: 'Best RTX 5070 Gaming Laptops',
      clusterAnchor: 'next-gen RTX 5070 gaming laptops',
      modernReviewSlug: 'lenovo-legion-pro-7i-rtx-5090-64gb-review',
      modernReviewName: 'Lenovo Legion Pro 7i (RTX 5090)',
      modernReviewAnchor: 'flagship Lenovo Legion Pro 7i review',
      categoryBadge: 'Flagship Gaming Authority',
      editorialNote: 'Looking for verified frame rates and thermal benchmarks? Our automated test database tracks G3DMark scores, TGP wattages, and refresh rates across all modern rigs.',
    }
  }

  // 2. Engineering, CAD, 3D, ArcGIS, Financial Modeling, Heavy Workstations
  if (
    text.includes('engineer') ||
    text.includes('autocad') ||
    text.includes('solidworks') ||
    text.includes('fusion') ||
    text.includes('arcgis') ||
    text.includes('32gb') ||
    text.includes('virtualization') ||
    text.includes('financial-modeling')
  ) {
    return {
      pillarSlug: 'best-engineering-laptops',
      pillarTitle: 'Best Engineering Laptops (2026)',
      pillarAnchor: 'our workstation-tested best engineering laptops guide',
      clusterSlug: 'best-programming-laptops',
      clusterTitle: 'Best Programming Laptops',
      clusterAnchor: 'best programming laptops',
      modernReviewSlug: 'dell-xps-16-9640-review',
      modernReviewName: 'Dell XPS 16 9640 (Core Ultra 7 / RTX 4070)',
      modernReviewAnchor: 'in-depth Dell XPS 16 9640 review',
      categoryBadge: 'Engineering & CAD Workstations',
      editorialNote: 'Engineering software like SolidWorks, AutoCAD, and ArcGIS demands high single-core clocks paired with robust multi-threaded compute and dedicated VRAM.',
    }
  }

  // 3. Programming, Web Development, Software Engineering, Ubuntu/Linux
  if (
    text.includes('developer') ||
    text.includes('software-engineer') ||
    text.includes('programming') ||
    text.includes('ubuntu')
  ) {
    return {
      pillarSlug: 'best-programming-laptops',
      pillarTitle: 'Best Programming Laptops (2026)',
      pillarAnchor: 'our comprehensive best programming laptops guide',
      clusterSlug: 'best-engineering-laptops',
      clusterTitle: 'Best Engineering Laptops',
      clusterAnchor: 'high-RAM engineering workstations',
      modernReviewSlug: 'apple-macbook-pro-14-m5-pro-15-core-review',
      modernReviewName: 'Apple MacBook Pro 14 (M5 Pro)',
      modernReviewAnchor: 'MacBook Pro 14 developer benchmark review',
      categoryBadge: 'Software Engineering',
      editorialNote: 'Modern compile times, Docker virtualization, and multi-container development run fastest on Unix-native Apple Silicon or high-core Intel Core Ultra machines.',
    }
  }

  // 4. Students, College, Medical School, Teaching, Homeschool
  if (
    text.includes('student') ||
    text.includes('college') ||
    text.includes('medical') ||
    text.includes('teaching') ||
    text.includes('homeschool') ||
    text.includes('researcher') ||
    text.includes('accounting')
  ) {
    return {
      pillarSlug: 'best-student-laptops',
      pillarTitle: 'Best Student Laptops (2026)',
      pillarAnchor: 'verified ranking of the best student laptops',
      clusterSlug: 'best-lightweight-laptops',
      clusterTitle: 'Best Lightweight Laptops',
      clusterAnchor: 'lightweight travel laptops',
      modernReviewSlug: 'apple-macbook-air-13-m4-review',
      modernReviewName: 'Apple MacBook Air 13 (M4 / 16GB)',
      modernReviewAnchor: 'Apple MacBook Air 13 M4 review',
      categoryBadge: 'Campus & Higher Education',
      editorialNote: 'For students, the critical metrics are all-day battery life, lightweight chassis under 3.3 lbs, and silent fanless cooling for lectures and libraries.',
    }
  }

  // 5. 2-in-1, Touchscreen, Stylus, Drawing
  if (
    text.includes('2-in-1') ||
    text.includes('touch-screen') ||
    text.includes('touchscreen') ||
    text.includes('stylus')
  ) {
    return {
      pillarSlug: 'best-2-in-1-laptops',
      pillarTitle: 'Best 2-in-1 Laptops (2026)',
      pillarAnchor: 'top-rated best 2-in-1 convertible laptops guide',
      clusterSlug: 'best-student-laptops',
      clusterTitle: 'Best Student Laptops',
      clusterAnchor: 'student laptops with stylus support',
      modernReviewSlug: 'lenovo-yoga-7-2-in-1-14-review',
      modernReviewName: 'Lenovo Yoga 7 2-in-1 14 (Core Ultra 5)',
      modernReviewAnchor: 'Lenovo Yoga 7 2-in-1 review',
      categoryBadge: 'Convertible 2-in-1 Hardware',
      editorialNote: 'Modern 360-degree hinges and precision digitizers now support active MPP 2.0 and USI pen protocols with zero perceptible latency.',
    }
  }

  // 6. Deep Budget & Sub-$500 / Sub-$400 / Chromebooks
  if (
    text.includes('under-400') ||
    text.includes('under-500') ||
    text.includes('under-250') ||
    text.includes('chromebook')
  ) {
    return {
      pillarSlug: 'best-budget-laptops',
      pillarTitle: 'Best Budget Laptops (2026)',
      pillarAnchor: 'expert selection of the best budget laptops',
      clusterSlug: 'best-laptops-under-500',
      clusterTitle: 'Best Laptops Under $500',
      clusterAnchor: 'best laptops under $500 with NVMe storage',
      modernReviewSlug: 'acer-aspire-3-a315-24p-r7vh-review',
      modernReviewName: 'Acer Aspire 3 (Ryzen 3 7320U / 8GB)',
      modernReviewAnchor: 'budget Acer Aspire 3 review',
      categoryBadge: 'Budget & Everyday Computing',
      editorialNote: 'Avoid outdated eMMC storage and sub-1080p panels. Our budget scoring mandates at least 8GB RAM, NVMe SSDs, and full HD IPS anti-glare screens.',
    }
  }

  // 7. Sweet Spot $1,000 & Mid-Range
  if (
    text.includes('under-1000') ||
    text.includes('under-800') ||
    text.includes('under-600') ||
    text.includes('black-friday') ||
    text.includes('1tb') ||
    text.includes('backlit')
  ) {
    return {
      pillarSlug: 'best-laptops-under-1000',
      pillarTitle: 'Best Laptops Under $1000 (2026)',
      pillarAnchor: 'curated guide to the best laptops under $1000',
      clusterSlug: 'best-budget-laptops',
      clusterTitle: 'Best Budget Laptops',
      clusterAnchor: 'best budget laptops leaderboard',
      modernReviewSlug: 'acer-nitro-v-16-anv16-41-r89u-review',
      modernReviewName: 'Acer Nitro V 16 (RTX 4060 / Ryzen 7)',
      modernReviewAnchor: 'Acer Nitro V 16 benchmark review',
      categoryBadge: 'Mid-Range Value Benchmark',
      editorialNote: 'The $800–$1,000 price window offers the highest price-to-performance ratio in personal computing, often featuring 100% sRGB displays and high-efficiency processors.',
    }
  }

  // 8. OLED Displays, Streaming & Visual Content
  if (
    text.includes('oled') ||
    text.includes('streaming') ||
    text.includes('netflix') ||
    text.includes('twitch') ||
    text.includes('movies')
  ) {
    return {
      pillarSlug: 'best-oled-laptops',
      pillarTitle: 'Best OLED Laptops (2026)',
      pillarAnchor: 'color-accurate best OLED laptops guide',
      clusterSlug: 'best-laptops-under-1000',
      clusterTitle: 'Best Laptops Under $1000',
      clusterAnchor: 'affordable high-resolution laptops',
      modernReviewSlug: 'asus-zenbook-14-oled-review',
      modernReviewName: 'ASUS Zenbook 14 OLED (Core Ultra 7)',
      modernReviewAnchor: 'ASUS Zenbook 14 OLED review',
      categoryBadge: 'OLED & Display Quality',
      editorialNote: 'Infinite contrast ratios, true 0.2ms response times, and 100% DCI-P3 color gamut coverage have made OLED and Mini-LED screens accessible even in sub-$1000 ultrabooks.',
    }
  }

  // 9. MacBooks & Apple Ecosystem
  if (text.includes('macbook') || text.includes('apple')) {
    return {
      pillarSlug: 'best-macbooks',
      pillarTitle: 'Best MacBooks (2026)',
      pillarAnchor: 'tested best MacBooks comparison guide',
      clusterSlug: 'best-student-laptops',
      clusterTitle: 'Best Student Laptops',
      clusterAnchor: 'top student laptops',
      modernReviewSlug: 'apple-macbook-pro-16-m5-max-18-core-review',
      modernReviewName: 'Apple MacBook Pro 16 (M5 Max)',
      modernReviewAnchor: 'flagship Apple MacBook Pro 16 review',
      categoryBadge: 'Apple Silicon Hardware',
      editorialNote: 'Apple M-series chips combine unified memory architecture with market-leading battery efficiency. We compare base M4, M5 Pro, and M5 Max configurations across actual workflows.',
    }
  }

  // 10. Portability, Backpacks, Bags, Travel
  if (
    text.includes('backpack') ||
    text.includes('bag') ||
    text.includes('travel') ||
    text.includes('air-travel') ||
    text.includes('ladies') ||
    text.includes('tote')
  ) {
    return {
      pillarSlug: 'best-lightweight-laptops',
      pillarTitle: 'Best Lightweight Laptops (2026)',
      pillarAnchor: 'portability-tested best lightweight laptops guide',
      clusterSlug: 'best-student-laptops',
      clusterTitle: 'Best Student Laptops',
      clusterAnchor: 'compact student laptops',
      modernReviewSlug: 'asus-zenbook-14-oled-review',
      modernReviewName: 'ASUS Zenbook 14 OLED (2.82 lbs)',
      modernReviewAnchor: 'lightweight ASUS Zenbook 14 review',
      categoryBadge: 'Mobile Portability & Travel',
      editorialNote: 'Carrying a heavy laptop creates unnecessary strain. Modern magnesium-alloy and CNC aluminum chassis allow 14-inch laptops to weigh less than 2.8 pounds without sacrificing ports.',
    }
  }

  // Default Fallback
  return {
    pillarSlug: 'best-laptops-under-1000',
    pillarTitle: 'Best Laptops Under $1000 (2026)',
    pillarAnchor: 'tested guide to the best laptops under $1000',
    clusterSlug: 'best-gaming-laptops',
    clusterTitle: 'Best Gaming Laptops',
    clusterAnchor: 'gaming laptop benchmark leaderboard',
    modernReviewSlug: 'lenovo-legion-pro-7i-rtx-5090-64gb-review',
    modernReviewName: 'Lenovo Legion Pro 7i Review',
    modernReviewAnchor: 'Lenovo Legion Pro 7i benchmark review',
    categoryBadge: 'Hardware Benchmark Authority',
    editorialNote: 'Compare hardware specifications, PassMark CPU ratings, and G3DMark GPU frame rates across 100+ normalized machines in our real-time database.',
  }
}
