// =====================================================
// Article Page & Articles Hub — 83 in-depth guides & reviews
// =====================================================
import { Article, ARTICLES } from '../lib/articles'
import { getArticleRecommendations } from '../lib/articleRecommendations'
import { Header, Footer, CompareBar, Breadcrumbs } from '../components/layout'

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).length
  return Math.max(3, Math.ceil(words / 220))
}

function processContentHeadings(html: string): { processedHtml: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = []
  let index = 0

  const processedHtml = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, innerText) => {
    const cleanText = innerText.replace(/<[^>]*>/g, '').trim()
    if (!cleanText || cleanText.length < 3) return match

    const idMatch = attrs.match(/id=["']([^"']+)["']/i)
    const id = idMatch ? idMatch[1] : `section-${index++}`
    headings.push({ id, text: cleanText })

    if (idMatch) {
      return match
    }
    return `<h2 id="${id}"${attrs}>${innerText}</h2>`
  })

  return { processedHtml, headings }
}

export const ArticlePage = ({ a }: { a: Article }) => {
  const readMins = estimateReadingTime(a.contentHtml)
  const { processedHtml, headings } = processContentHeadings(a.contentHtml)
  const rec = getArticleRecommendations(a.slug, a.title)

  // Find contextually related articles based on category and title keywords
  const titleTokens = (a.title + ' ' + a.slug)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['best', 'laptop', 'laptops', 'review', 'guide', '2026'].includes(w))

  const related = ARTICLES
    .filter(x => x.slug !== a.slug)
    .map(x => {
      const xTokens = (x.title + ' ' + x.slug).toLowerCase()
      let score = (x.category === a.category ? 3 : 0)
      for (const t of titleTokens) {
        if (xTokens.includes(t)) score += 2
      }
      return { article: x, score }
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, 4)
    .map(x => x.article)

  return (
    <>
      <div id="reading-progress" style="width: 0%"></div>
      <Header />
      <main class="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { name: 'Articles & Reviews', href: '/articles' },
          { name: a.h1 }
        ]} />

        <article class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 md:p-12 shadow-sm mt-4">
          <header class="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
            <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
              <span class="bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-800">
                LaptopIndex Hardware Guide
              </span>
              <span class="text-slate-400">·</span>
              <span class="text-slate-500 dark:text-slate-400">{readMins} min read</span>
              <span class="text-slate-400">·</span>
              <span class="text-slate-500 dark:text-slate-400">Updated 2026</span>
            </div>

            <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
              {a.h1}
            </h1>

            <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-400/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-2xs">
                  LI
                </div>
                <div>
                  <p class="font-bold text-slate-800 dark:text-slate-200">LaptopIndex Hardware Lab</p>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Hero Visual */}
          {a.featuredImage && (
            <div class="my-8 p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <div class="relative overflow-hidden rounded-xl bg-white dark:bg-slate-900/80 p-4 sm:p-8 flex items-center justify-center min-h-[220px] max-h-[360px] shadow-sm">
                <img
                  src={a.featuredImage}
                  alt={a.h1}
                  class="max-h-[300px] max-w-full object-contain mx-auto transition-transform duration-300 hover:scale-[1.02]"
                  loading="eager"
                  onerror="this.src='/static/img/laptops/asus-zenbook-14-oled.webp'"
                />
              </div>
              <div class="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Hardware Evaluation Reference · Verified Specifications & Testing</span>
              </div>
            </div>
          )}

          {/* Table of Contents */}
          {headings.length >= 2 && (
            <nav class="mb-10 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800" aria-label="Table of Contents">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <i class="fas fa-list-ul text-brand-500" aria-hidden="true"></i>
                  Table of Contents
                </span>
                <span class="text-[11px] text-slate-400">{headings.length} sections</span>
              </div>
              <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {headings.map((h) => (
                  <a
                    href={`#${h.id}`}
                    class="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 transition shadow-2xs font-medium max-w-full sm:max-w-xs truncate"
                    title={h.text}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {/* Edward Sturm Topical Authority Callout: Funnel PageRank into 2026 Buying Guides & Modern Reviews (skipped for modern articles) */}
          {!a.hideLegacyCallout && a.slug !== 'best-entry-level-gaming-laptop' && rec && (
            <div class="my-8 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-brand-200/80 dark:border-brand-700/50 shadow-xs not-prose">
              <div class="flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <i class="fas fa-microchip text-base" aria-hidden="true"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">2026 Hardware Update & Verified Benchmarks</span>
                    <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                      {rec.categoryBadge}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {rec.editorialNote} For current generation recommendations, see <a href={`/guides/${rec.pillarSlug}`} class="font-bold text-brand-600 dark:text-brand-400 hover:underline">{rec.pillarAnchor}</a>
                    {rec.clusterSlug ? (
                      <> or check our <a href={`/guides/${rec.clusterSlug}`} class="font-bold text-brand-600 dark:text-brand-400 hover:underline">{rec.clusterAnchor}</a></>
                    ) : null}
                    {rec.modernReviewSlug ? (
                      <> (e.g. read our <a href={`/${rec.modernReviewSlug}`} class="font-bold text-brand-600 dark:text-brand-400 hover:underline">{rec.modernReviewAnchor}</a>)</>
                    ) : null}. You can also analyze specs across the <a href="/" class="text-brand-600 dark:text-brand-400 font-bold hover:underline">LaptopIndex homepage database</a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            id="article-content"
            class="article-content prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4 overflow-x-hidden break-words"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          <footer class="mt-14 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-xs text-slate-500 dark:text-slate-400">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p class="font-semibold text-slate-700 dark:text-slate-300">Published by LaptopIndex Tech Editorial</p>
                  <p class="text-slate-400 mt-0.5">Original hardware reviews, price tracking & synthetic benchmarks</p>
                </div>
                <a href="/articles" class="text-brand-500 hover:text-brand-600 font-bold underline shrink-0">
                  Browse All 83 Articles & Guides →
                </a>
              </div>
              <div class="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <span class="text-slate-400">Contextual Hardware Tools:</span>
                <a href="/" class="text-brand-600 dark:text-brand-400 font-medium hover:underline">LaptopIndex Benchmark Homepage</a>
                <span class="text-slate-300 dark:text-slate-700">•</span>
                <a href="/guides" class="text-brand-600 dark:text-brand-400 font-medium hover:underline">Data-Driven Buying Guides</a>
                <span class="text-slate-300 dark:text-slate-700">•</span>
                <a href="/compare" class="text-brand-600 dark:text-brand-400 font-medium hover:underline">Side-by-Side Laptop Comparison</a>
              </div>
            </div>
          </footer>
        </article>

        {/* Related Articles */}
        <section class="mt-12 mb-6">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">More Hardware Reviews & Guides</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            {related.map(r => (
              <a
                href={`/${r.slug}/`}
                class="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 p-4 transition shadow-sm hover:shadow-md flex gap-4 items-start"
              >
                {r.featuredImage && (
                  <div class="w-20 h-20 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <img
                      src={r.featuredImage}
                      alt={r.h1}
                      class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onerror="this.src='/static/img/laptops/asus-zenbook-14-oled.webp'"
                    />
                  </div>
                )}
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors line-clamp-2">
                    {r.h1}
                  </h3>
                  <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                    {r.metaDescription}
                  </p>
                  <div class="mt-2 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                    Read guide <span class="group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Topical Authority 2026 Buying Guides Pillar Grid */}
        <section class="mt-10 mb-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i class="fas fa-compass text-brand-500" aria-hidden="true"></i> 2026 Laptop Buying Guides & Benchmarks
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Explore our data-driven category rankings scored by PassMark CPU and G3DMark GPU benchmarks.</p>
            </div>
            <a href="/guides" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline shrink-0">
              View all 20 guides <i class="fas fa-arrow-right text-[10px] ml-1" aria-hidden="true"></i>
            </a>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a href="/guides/best-gaming-laptops" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/40 transition group">
              <div class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 flex items-center justify-between">
                <span>Best Gaming Laptops</span>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition text-brand-500" aria-hidden="true"></i>
              </div>
              <p class="text-xs text-slate-500 mt-1">RTX 50-series and high-wattage gaming machines ranked by 1440p frame rates.</p>
            </a>
            <a href="/guides/best-laptops-under-1000" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/40 transition group">
              <div class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 flex items-center justify-between">
                <span>Best Laptops Under $1000</span>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition text-brand-500" aria-hidden="true"></i>
              </div>
              <p class="text-xs text-slate-500 mt-1">The sweet-spot value bracket balancing OLED screens, 16GB RAM, and speed.</p>
            </a>
            <a href="/guides/best-student-laptops" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/40 transition group">
              <div class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 flex items-center justify-between">
                <span>Best Student Laptops</span>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition text-brand-500" aria-hidden="true"></i>
              </div>
              <p class="text-xs text-slate-500 mt-1">Lightweight college laptops with 10+ hours battery life and quiet cooling.</p>
            </a>
            <a href="/guides/best-engineering-laptops" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/40 transition group">
              <div class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 flex items-center justify-between">
                <span>Best Engineering Laptops</span>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition text-brand-500" aria-hidden="true"></i>
              </div>
              <p class="text-xs text-slate-500 mt-1">CAD, 3D simulation, and SolidWorks mobile workstations with dedicated GPUs.</p>
            </a>
            <a href="/guides/best-budget-laptops" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/40 transition group">
              <div class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 flex items-center justify-between">
                <span>Best Budget Laptops</span>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition text-brand-500" aria-hidden="true"></i>
              </div>
              <p class="text-xs text-slate-500 mt-1">Reliable, fast laptops under $500 that never cut corners on NVMe storage.</p>
            </a>
            <a href="/guides/best-oled-laptops" class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-800/40 transition group">
              <div class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 flex items-center justify-between">
                <span>Best OLED Laptops</span>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100 transition text-brand-500" aria-hidden="true"></i>
              </div>
              <p class="text-xs text-slate-500 mt-1">Stunning 100% DCI-P3 color accuracy and infinite contrast for creators and film.</p>
            </a>
          </div>
        </section>
      </main>

      {/* Floating Back to Top */}
      <button
        id="back-to-top"
        class="fixed bottom-6 right-6 z-40 p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 pointer-events-none transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Back to top"
        onclick="window.scrollTo({top: 0, behavior: 'smooth'})"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.addEventListener('scroll', function() {
            var totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = totalHeight > 0 ? (window.pageYOffset / totalHeight) * 100 : 0;
            var bar = document.getElementById('reading-progress');
            if (bar) bar.style.width = progress + '%';

            var btt = document.getElementById('back-to-top');
            if (btt) {
              if (window.pageYOffset > 400) {
                btt.classList.remove('opacity-0', 'pointer-events-none');
              } else {
                btt.classList.add('opacity-0', 'pointer-events-none');
              }
            }
          });
        `
        }}
      />
      <CompareBar />
      <Footer />
    </>
  )
}

export const ArticlesHub = () => (
  <>
    <Header />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: 'Articles & Reviews' }]} />
      <div class="mb-8">
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
          <span>Complete Knowledge Base</span>
          <span>·</span>
          <span>{ARTICLES.length} Guides & Reviews</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          LaptopIndex Hardware Reviews & Buying Guides
        </h1>
        <p class="text-slate-600 dark:text-slate-400 max-w-2xl text-base">
          Explore our complete collection of {ARTICLES.length} in-depth laptop evaluations, category roundups, gaming tablet guides, and hardware buyer checklists.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.map(a => (
          <a
            href={`/${a.slug}/`}
            class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 p-5 transition shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              {a.featuredImage && (
                <div class="mb-4 h-44 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 flex items-center justify-center border border-slate-100 dark:border-slate-700/60 overflow-hidden">
                  <img
                    src={a.featuredImage}
                    alt={a.h1}
                    class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onerror="this.src='/static/img/laptops/asus-zenbook-14-oled.webp'"
                  />
                </div>
              )}
              <div class="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
                2026 Guide · {estimateReadingTime(a.contentHtml)} min read
              </div>
              <h2 class="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors leading-snug line-clamp-2">
                {a.h1}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {a.metaDescription}
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span class="font-medium text-slate-500">In-depth review</span>
              <span class="font-bold text-brand-500 group-hover:translate-x-0.5 transition-transform">Read guide →</span>
            </div>
          </a>
        ))}
      </div>
    </main>
    <CompareBar />
    <Footer />
  </>
)
