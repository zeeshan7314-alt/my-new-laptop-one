// Buying guides — /guides and /guides/:slug
import { raw } from 'hono/html'
import { Laptop, LAPTOPS, cpuLabel, gpuLabel, money, storageLabel, META } from '../lib/db'
import { GUIDES, Guide, guideRanking, prosCons, compareSlug, relatedGuides } from '../lib/engine'
import { Header, Footer, CompareBar, ScoreDonut, BadgePill, AmazonBtn, Breadcrumbs, Thumb } from '../components/layout'

export const GuidesHub = () => (
  <>
    <Header />
    <main class="max-w-6xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ name: 'Buying Guides' }]} />
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Laptop Buying Guides</h1>
      <p class="text-slate-500 mb-6">Every guide is ranked automatically from live benchmark + pricing data across {LAPTOPS.length} laptops — no pay-to-play placements.</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GUIDES.map(g => {
          const top = guideRanking(g)[0]
          return (
            <a href={`/guides/${g.slug}`} class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition p-5">
              <h2 class="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 leading-snug">{g.h1}</h2>
              <p class="text-xs text-slate-500 mt-1.5 line-clamp-2">{g.description}</p>
              {top && <p class="text-xs mt-3 font-semibold text-emerald-600 dark:text-emerald-400"><i class="fas fa-trophy mr-1" aria-hidden="true"></i>#1: {top.name}</p>}
            </a>
          )
        })}
      </div>
    </main>
    <CompareBar />
    <Footer />
  </>
)

const guideScoreLabel = (k: string) => {
  const map: Record<string, string> = {
    gaming: 'Gaming',
    student: 'Student',
    engineering: 'Engineering',
    travel: 'Travel',
    value: 'Value',
    programming: 'Dev',
    ai: 'AI',
    office: 'Productivity',
  }
  return `${map[k] || k} Score`
}

// Quick intent matrix for top gaming picks
const gamingCategoryPicks = (ranked: Laptop[]) => [
  { label: 'Editor’s Choice (Best Overall)', badge: 'bg-amber-400 text-amber-950', item: ranked[0] },
  { label: 'Extreme 18″ Desktop Replacement', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', item: ranked.find(l => l.name.includes('MSI Titan') || l.display.sizeInches >= 18) || ranked[1] },
  { label: 'Best Esports 16″ High-Refresh', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', item: ranked.find(l => l.name.includes('ROG Strix SCAR 16')) || ranked[2] },
  { label: 'Sweet Spot ($1,500–$2,000)', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', item: ranked.find(l => l.price >= 1500 && l.price <= 2000) || ranked[3] },
  { label: 'Best Value Gaming Machine', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', item: ranked.find(l => l.price < 1500) || ranked[ranked.length - 1] },
].filter(p => p.item)

export const GuidePage = ({ g }: { g: Guide }) => {
  const ranked = guideRanking(g)
  const isGaming = g.slug === 'best-gaming-laptops'

  const getAward = (i: number, l: Laptop) => {
    if (!isGaming) {
      const defaultAwards = ['Editor’s Pick', 'Runner-Up', 'Best Value Alternative']
      return defaultAwards[i] || null
    }
    if (i === 0) return 'Editor’s Choice: Best Overall Flagship'
    if (l.name.includes('MSI Titan')) return 'Runner-Up: Extreme Desktop Replacement'
    if (l.name.includes('SCAR 16')) return 'Best Esports 16″ Competitive Machine'
    if (l.name.includes('Alienware M18')) return 'Top 18″ Enthusiast Gaming Rig'
    if (l.price <= 2000 && l.gpu.model?.includes('5070')) return 'Best Value Sweet-Spot ($1,500–$2,000)'
    if (i === 1) return 'Runner-Up: Extreme Performance'
    if (i === 2) return 'Top-Tier Contender'
    return null
  }

  return (
    <>
      <Header />
      <main class="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: 'Buying Guides', href: '/guides' }, { name: g.h1 }]} />
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{g.title}</h1>
        <div class="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed text-base prose-intro">
          {raw(g.intro)}
        </div>
        <p class="text-xs text-slate-400 mb-6">{ranked.length} ranked picks · data updated {META.updated} · {META.affiliateDisclosure}</p>

        {/* Above-the-fold Quick Comparison Matrix for Best Gaming Laptops */}
        {isGaming && (
          <section id="quick-matrix" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <i class="fas fa-bolt text-amber-500" aria-hidden="true"></i> Top Gaming Picks at a Glance
              </h2>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                2026 Tested
              </span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 uppercase tracking-wide">
                    <th class="py-2.5 pr-3 font-semibold">Category</th>
                    <th class="py-2.5 px-3 font-semibold">Model</th>
                    <th class="py-2.5 px-3 font-semibold">GPU & PassMark</th>
                    <th class="py-2.5 px-3 font-semibold">Display</th>
                    <th class="py-2.5 px-3 font-semibold">Price</th>
                    <th class="py-2.5 pl-3 text-right font-semibold">Verdict</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {gamingCategoryPicks(ranked).map(({ label, badge, item }) => (
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td class="py-3 pr-3">
                        <span class={`text-[11px] font-extrabold uppercase px-2 py-1 rounded-md inline-block whitespace-nowrap ${badge}`}>
                          {label}
                        </span>
                      </td>
                      <td class="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        <a href={`#pick-${item.slug}`} class="hover:text-brand-500">{item.name}</a>
                      </td>
                      <td class="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {item.gpu.model || 'Discrete GPU'} <span class="text-xs text-slate-400">({item.gpu.g3dmark?.toLocaleString()} G3D)</span>
                      </td>
                      <td class="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {item.display.sizeInches}″ · {item.display.refreshHz}Hz
                      </td>
                      <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        ${item.price.toLocaleString()}
                      </td>
                      <td class="py-3 pl-3 text-right whitespace-nowrap">
                        <a href={`#pick-${item.slug}`} class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                          Jump to review ↓
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* quick TOC */}
        <nav aria-label="Ranked picks" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-8 text-sm">
          <h2 class="font-bold text-xs uppercase tracking-wide text-slate-400 mb-2">Ranked Shortlist ({ranked.length} Models)</h2>
          <ol class="grid sm:grid-cols-2 gap-x-6 gap-y-1 list-decimal list-inside marker:font-bold marker:text-brand-500">
            {ranked.map(l => <li><a href={`#pick-${l.slug}`} class="hover:text-brand-500">{l.name}</a></li>)}
          </ol>
        </nav>

        <div class="space-y-6">
          {ranked.map((l, i) => {
            const pc = prosCons(l)
            const award = getAward(i, l)
            return (
              <article id={`pick-${l.slug}`} class="scroll-mt-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6">
                <div class="flex items-start gap-4">
                  <div class={`w-10 h-10 shrink-0 rounded-xl font-extrabold flex items-center justify-center text-lg ${i === 0 ? 'bg-amber-400 text-amber-950' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}>{i + 1}</div>
                  <a href={`/${l.slug}-review`} class="hidden sm:block" tabindex={-1} aria-hidden="true"><Thumb l={l} size="md" eager={i < 2} /></a>
                  <div class="min-w-0 flex-1">
                    {award && (
                      <div class="text-[10px] font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-0.5">
                        <i class="fas fa-award mr-1" aria-hidden="true"></i>{award}
                      </div>
                    )}
                    <div class="flex flex-wrap gap-1 mb-1">{l.badges.map(b => <BadgePill text={b} />)}</div>
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white leading-snug"><a href={`/${l.slug}-review`} class="hover:text-brand-500">{l.name}</a></h2>
                    <p class="text-sm text-slate-500 mt-1">{cpuLabel(l)} · {gpuLabel(l)} · {l.ram.gb} GB · {storageLabel(l)} · {l.display.sizeInches}″ {l.display.refreshHz} Hz · {l.physical.weightLbs} lbs</p>
                  </div>
                  <div class="hidden sm:flex flex-col items-center gap-1 shrink-0">
                    <ScoreDonut score={l.scores[g.scoreKey]} size="sm" />
                    <span class="text-[10px] uppercase font-bold text-slate-400">{guideScoreLabel(g.scoreKey)}</span>
                  </div>
                </div>
                <div class="grid md:grid-cols-2 gap-4 mt-4 text-sm">
                  <ul class="space-y-1">{pc.pros.slice(0, 3).map(p => <li class="flex gap-2"><i class="fas fa-plus text-emerald-500 mt-1 text-xs shrink-0" aria-hidden="true"></i><span>{p}</span></li>)}</ul>
                  <ul class="space-y-1">{pc.cons.slice(0, 2).map(p => <li class="flex gap-2"><i class="fas fa-minus text-rose-500 mt-1 text-xs shrink-0" aria-hidden="true"></i><span>{p}</span></li>)}</ul>
                </div>
                <div class="flex flex-wrap items-center gap-3 mt-4">
                  <AmazonBtn l={l} />
                  <a href={`/${l.slug}-review`} class="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">Full review & benchmarks →</a>
                  {ranked[0] && l.id !== ranked[0].id && <a href={`/compare/${compareSlug(ranked[0], l)}`} class="text-sm font-semibold text-slate-500 hover:text-brand-500 hover:underline">vs #1 pick</a>}
                </div>
              </article>
            )
          })}
        </div>

        {/* Gaming Buying Advice & FAQs for Search Intent */}
        {isGaming && (
          <section id="gaming-faqs" class="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Gaming Laptop Buying Guide & FAQ</h2>
            <p class="text-sm text-slate-500 mb-6">Expert technical answers to high-priority questions before investing in a 2026 gaming rig.</p>
            <div class="space-y-4">
              <details class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 group" open>
                <summary class="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center text-base">
                  How much RAM do you actually need for a gaming laptop in 2026?
                  <i class="fas fa-chevron-down text-slate-400 text-xs group-open:rotate-180 transition" aria-hidden="true"></i>
                </summary>
                <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  In 2026, <strong>32GB of DDR5 RAM</strong> is the optimal standard for enthusiast gaming and streaming. While 16GB remains acceptable for 1080p esports titles, modern AAA releases with ray tracing, high-resolution textures, and background applications (Discord, browser tabs, OBS) frequently exceed 16GB total system memory. For flagship RTX 5080 and RTX 5090 laptops, 32GB to 64GB ensures zero memory bottlenecks.
                </p>
              </details>

              <details class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 group">
                <summary class="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center text-base">
                  RTX 5060 vs. RTX 5070 vs. RTX 5080 vs. RTX 5090: Which GPU tier is right for you?
                  <i class="fas fa-chevron-down text-slate-400 text-xs group-open:rotate-180 transition" aria-hidden="true"></i>
                </summary>
                <div class="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                  <p>• <strong>RTX 5060</strong>: Best for high-FPS 1080p gaming and budget-conscious buyers seeking sub-$1,200 pricing.</p>
                  <p>• <strong>RTX 5070 / 5070 Ti</strong>: The undisputed sweet spot for 1440p and 1600p high-refresh gaming under $2,000.</p>
                  <p>• <strong>RTX 5080 / 5090</strong>: Uncompromised 4K resolution, maximum ray tracing settings, and 240Hz competitive esports desktop replacements.</p>
                </div>
              </details>

              <details class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 group">
                <summary class="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center text-base">
                  Why does TGP (Total Graphics Power) matter more than GPU model name?
                  <i class="fas fa-chevron-down text-slate-400 text-xs group-open:rotate-180 transition" aria-hidden="true"></i>
                </summary>
                <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Manufacturers configure laptop GPUs with wildly different wattages (TGP). For instance, a full-power 140W RTX 5070 with vapor chamber cooling can deliver higher sustained framerates than a thermally throttled 85W RTX 5080 in an ultra-slim chassis. That is why LaptopIndex ranks laptops using real-world G3DMark graphics compute and PassMark thermal benchmarks rather than nominal branding.
                </p>
              </details>

              <details class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 group">
                <summary class="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center text-base">
                  What display specs should you look for in 2026?
                  <i class="fas fa-chevron-down text-slate-400 text-xs group-open:rotate-180 transition" aria-hidden="true"></i>
                </summary>
                <p class="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Target at least a <strong>165Hz to 240Hz refresh rate</strong> with a 3ms or faster gray-to-gray (GtG) response time and 100% sRGB or DCI-P3 color gamut. For 16-inch laptops, 16:10 aspect ratio 2560×1600 (QHD+) panels provide significantly sharper visuals than older 1080p screens without imposing the extreme battery and performance penalties of native 4K.
                </p>
              </details>
            </div>
          </section>
        )}

        {/* SEO internal links: related guides */}
        <section id="related-guides" class="mt-10">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Related Buying Guides & Clusters</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedGuides(g).map(rg => (
              <a href={`/guides/${rg.slug}`} class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-lg transition p-4">
                <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-500 leading-snug">{rg.h1}</h3>
                <p class="text-xs text-slate-500 mt-1.5 line-clamp-2">{rg.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section class="mt-10 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 text-sm text-slate-600 dark:text-slate-400">
          <h2 class="font-bold text-slate-900 dark:text-white mb-2">How We Test & Rank (E-E-A-T Methodology)</h2>
          <p class="leading-relaxed">
            Rankings are computed automatically from our normalized spreadsheet database: PassMark multi-thread CPU scores, G3DMark laptop GPU scores, RAM/storage capacity, display quality (panel type, refresh rate, pixel density), weight, verified Amazon rating (weighted by review count) and price. The "{g.scoreKey}" score weighting used here is documented on every product page. No manufacturer sponsorships or affiliate payments influence placement.
          </p>
        </section>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}

