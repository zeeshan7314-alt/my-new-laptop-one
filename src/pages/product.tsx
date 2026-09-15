// =====================================================
// Product Review Page — /:slug-review
// =====================================================
import { Laptop, cpuLabel, gpuLabel, money, storageLabel, META } from '../lib/db'
import {
  prosCons, whoFor, sectionText, faq, verdictLine, similar,
  betterAlternative, cheaperAlternative, premiumAlternative,
  sameBrand, sameCpu, sameGpu, sameBudget, compareSlug, SCORE_KEYS,
  guidesFor, comparisonsFor,
} from '../lib/engine'
import { Header, Footer, CompareBar, ScoreDonut, ScoreBar, BadgePill, AmazonBtn, LaptopCard, Breadcrumbs, Thumb } from '../components/layout'

const Section = ({ id, icon, title, children }: any) => (
  <section id={id} class="scroll-mt-20">
    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3"><i class={`fas ${icon} text-brand-500 mr-2`} aria-hidden="true"></i>{title}</h2>
    {children}
  </section>
)

const AltRow = ({ label, l, current }: { label: string; l?: Laptop; current: Laptop }) => l ? (
  <div class="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <span class="text-[10px] font-bold uppercase tracking-wide text-slate-400 w-20 shrink-0">{label}</span>
    <div class="min-w-0 flex-1">
      <a href={`/${l.slug}-review`} class="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-500 truncate block">{l.name}</a>
      <span class="text-xs text-slate-500">{l.priceBracket}</span>
    </div>
    <a href={`/compare/${compareSlug(current, l)}`} class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline shrink-0">Compare</a>
  </div>
) : null

export const ProductPage = ({ l }: { l: Laptop }) => {
  const pc = prosCons(l)
  const wf = whoFor(l)
  const st = sectionText(l)
  const faqs = faq(l)
  const sims = similar(l, 4)
  const better = betterAlternative(l), cheaper = cheaperAlternative(l), premium = premiumAlternative(l)
  const brand3 = sameBrand(l), cpu3 = sameCpu(l), gpu3 = sameGpu(l), budget3 = sameBudget(l)
  const toc = [
    ['verdict', 'Verdict'], ['scores', 'Scores'], ['specs', 'Full Specs'], ['performance', 'Performance'],
    ['display', 'Display'], ['gaming', 'Gaming'], ['productivity', 'Productivity'], ['programming', 'Programming'],
    ['video-editing', 'Video Editing'], ['rendering', '3D Rendering'], ['battery', 'Battery'],
    ['upgradeability', 'Upgradeability'], ['heat-noise', 'Heat & Noise'], ['ports', 'Ports'],
    ['value', 'Value'], ['alternatives', 'Alternatives'], ['rankings', 'Where It Ranks'], ['faq', 'FAQ'],
  ]
  const specRows: [string, any][] = [
    ['Brand', l.brand],
    ['Model', l.model],
    ['Category', `${l.segment} · ${l.formFactor}`],
    ['CPU', cpuLabel(l)],
    ['CPU Cores', `${l.cpu.cores ?? '—'}${l.cpu.multiThread ? ' (multi-threaded)' : ''}`],
    ['PassMark (Multi)', l.cpu.passmark?.toLocaleString() ?? '—'],
    ['GPU', gpuLabel(l)],
    ['G3DMark', l.gpu.g3dmark?.toLocaleString() ?? '— (integrated)'],
    ['RAM', `${l.ram.gb} GB ${l.ram.type}${l.ram.soldered ? ' (soldered)' : ' (upgradeable)'}`],
    ['Storage', storageLabel(l)],
    ['Display', `${l.display.sizeInches}″ ${l.display.panel ? `${l.display.panel} ` : ''}${l.display.resolution} @ ${l.display.refreshHz} Hz`],
    ['Pixel Density', `${l.display.ppi ?? '—'} PPI`], ['Touchscreen', l.display.touch ? 'Yes' : 'No'],
    ['Dimensions', `${l.physical.lengthIn}″ × ${l.physical.widthIn}″ × ${l.physical.thicknessIn}″`],
    ['Weight', `${l.physical.weightLbs} lbs (${l.physical.weightKg} kg)`],
    ['Amazon Rating', l.amazon.rating ? `${l.amazon.rating} ★ (${(l.amazon.reviewCount || 0).toLocaleString()} reviews)` : '—'],
  ]
  return (
    <>
      <Header />
      <main class="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: 'Laptops', href: '/laptops' }, { name: l.name }]} />
        {/* Hero */}
        <section id="review-hero" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div class="flex flex-col md:flex-row md:items-start gap-6">
            <div class="self-center md:self-start"><Thumb l={l} size="lg" eager /></div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap gap-1.5 mb-2">{l.badges.map(b => <BadgePill text={b} />)}</div>
              <h1 class="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">{l.name} Review <span class="text-slate-400 font-bold">(2026)</span></h1>
              <p class="mt-2 text-slate-600 dark:text-slate-400">{cpuLabel(l)} · {gpuLabel(l)} · {l.ram.gb} GB RAM · {storageLabel(l)} · {l.display.sizeInches}″ {l.display.refreshHz} Hz{l.display.panel ? ` ${l.display.panel}` : ''}</p>
              {l.amazon.rating ? <p class="mt-1 text-sm text-slate-500"><i class="fas fa-star text-amber-400" aria-hidden="true"></i> {l.amazon.rating} average · {(l.amazon.reviewCount || 0).toLocaleString()} Amazon reviews</p> : null}
              <div class="mt-5 flex flex-wrap items-center gap-3">
                <AmazonBtn l={l} size="lg" />
                <button class="wish-btn inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold hover:border-rose-400 hover:text-rose-500" data-id={l.id}><i class="far fa-heart" aria-hidden="true"></i> Save</button>
                <label class="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold cursor-pointer select-none">
                  <input type="checkbox" class="compare-check accent-brand-500" data-id={l.id} data-slug={l.slug} data-name={l.name} /> Add to compare
                </label>
              </div>
              <p class="mt-3 text-[11px] text-slate-400">{META.affiliateDisclosure} Price captured {META.updated}.</p>
            </div>
          </div>
        </section>

        <div class="mt-6 grid lg:grid-cols-[240px_1fr] gap-6">
          {/* TOC */}
          <aside class="hidden lg:block">
            <nav id="toc" class="sticky top-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-sm" aria-label="Table of contents">
              <h2 class="font-bold text-xs uppercase tracking-wide text-slate-400 mb-2">On this page</h2>
              <ul class="space-y-1">{toc.map(([id, t]) => <li><a href={`#${id}`} class="block py-0.5 text-slate-600 dark:text-slate-400 hover:text-brand-500">{t}</a></li>)}</ul>
            </nav>
          </aside>

          <div class="space-y-10 min-w-0">
            {/* Verdict + pros/cons */}
            <Section id="verdict" icon="fa-gavel" title="Verdict">
              <div class="space-y-3 mb-5">
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed text-base">{verdictLine(l)} in our {META.count}-laptop database.</p>
                <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: st.summaryRanking }} />
              </div>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200 dark:border-emerald-500/20">
                  <h3 class="font-bold text-emerald-700 dark:text-emerald-400 mb-2"><i class="fas fa-circle-check mr-1.5" aria-hidden="true"></i>Pros</h3>
                  <ul class="space-y-1.5 text-sm">{pc.pros.map(p => <li class="flex gap-2"><i class="fas fa-plus text-emerald-500 mt-1 text-xs shrink-0" aria-hidden="true"></i><span>{p}</span></li>)}</ul>
                </div>
                <div class="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-4 border border-rose-200 dark:border-rose-500/20">
                  <h3 class="font-bold text-rose-700 dark:text-rose-400 mb-2"><i class="fas fa-circle-xmark mr-1.5" aria-hidden="true"></i>Cons</h3>
                  <ul class="space-y-1.5 text-sm">{pc.cons.map(p => <li class="flex gap-2"><i class="fas fa-minus text-rose-500 mt-1 text-xs shrink-0" aria-hidden="true"></i><span>{p}</span></li>)}</ul>
                </div>
              </div>
              <div class="grid md:grid-cols-2 gap-4 mt-4">
                <div class="rounded-xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h3 class="font-bold text-slate-900 dark:text-white mb-2"><i class="fas fa-user-check text-brand-500 mr-1.5" aria-hidden="true"></i>Who should buy</h3>
                  <ul class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">{wf.buy.map(x => <li class="flex gap-2"><i class="fas fa-check text-brand-500 mt-1 text-xs shrink-0" aria-hidden="true"></i><span>{x}</span></li>)}</ul>
                </div>
                <div class="rounded-xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h3 class="font-bold text-slate-900 dark:text-white mb-2"><i class="fas fa-user-xmark text-slate-400 mr-1.5" aria-hidden="true"></i>Who should avoid</h3>
                  <ul class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">{wf.avoid.map(x => <li class="flex gap-2"><i class="fas fa-xmark text-slate-400 mt-1 text-xs shrink-0" aria-hidden="true"></i><span>{x}</span></li>)}</ul>
                </div>
              </div>
            </Section>

            {/* Scores */}
            <Section id="scores" icon="fa-chart-simple" title="Score Breakdown">
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {SCORE_KEYS.map(k => <ScoreBar label={k.label} score={l.scores[k.key]} />)}
              </div>
            </Section>

            {/* Specs table */}
            <Section id="specs" icon="fa-list" title="Full Specifications">
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table class="w-full text-sm">
                  <tbody>{specRows.map(([k, v], i) => (
                    <tr class={i % 2 ? 'bg-slate-50 dark:bg-slate-800/40' : ''}>
                      <th scope="row" class="text-left px-4 py-2.5 font-semibold text-slate-500 dark:text-slate-400 w-44">{k}</th>
                      <td class="px-4 py-2.5 text-slate-800 dark:text-slate-200">{v}</td>
                    </tr>))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="performance" icon="fa-microchip" title="Performance Summary"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.performance }} /></Section>
            <Section id="display" icon="fa-display" title="Display"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.display }} /></Section>
            <Section id="gaming" icon="fa-gamepad" title="Gaming Performance"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.gaming }} /></Section>
            <Section id="productivity" icon="fa-briefcase" title="Productivity"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.productivity }} /></Section>
            <Section id="programming" icon="fa-code" title="Programming"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.programming }} /></Section>
            <Section id="video-editing" icon="fa-film" title="Video Editing"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.videoEditing }} /></Section>
            <Section id="rendering" icon="fa-cube" title="3D Rendering & Engineering"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.rendering }} /></Section>
            <Section id="battery" icon="fa-battery-three-quarters" title="Battery"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.battery }} /></Section>
            <Section id="upgradeability" icon="fa-screwdriver-wrench" title="Upgradeability"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.upgradeability }} /></Section>
            <Section id="heat-noise" icon="fa-temperature-half" title="Heat & Noise"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.heatNoise }} /></Section>
            <Section id="ports" icon="fa-plug" title="Port Selection"><p class="prose-p" dangerouslySetInnerHTML={{ __html: st.ports }} /></Section>

            {/* Value + price widget */}
            <Section id="value" icon="fa-hand-holding-dollar" title="Value for Money">
              <p class="prose-p mb-4" dangerouslySetInnerHTML={{ __html: st.value }} />
              <div id="price-widget" class="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center gap-4">
                <div class="flex-1 text-center sm:text-left">
                  <div class="text-xs uppercase tracking-wider opacity-80 font-bold">{l.priceBracket} Category</div>
                  <div class="text-2xl sm:text-3xl font-extrabold">Check Current Price on Amazon</div>
                  <div class="text-xs opacity-80 mt-1">Live pricing, configurations & deals update frequently on Amazon</div>
                </div>
                <AmazonBtn l={l} size="lg" />
              </div>
            </Section>

            {/* Alternatives */}
            <Section id="alternatives" icon="fa-shuffle" title="Alternatives & Similar Laptops">
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 prose-p" dangerouslySetInnerHTML={{ __html: st.alternativesIntro }} />
              <div class="grid md:grid-cols-2 gap-4 mb-6">
                <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-1">Smart Alternatives</h3>
                  <AltRow label="Better" l={better} current={l} />
                  <AltRow label="Cheaper" l={cheaper} current={l} />
                  <AltRow label="Premium" l={premium} current={l} />
                  {!better && !cheaper && !premium && <p class="text-sm text-slate-500 py-2">This laptop already leads its bracket.</p>}
                </div>
                <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-1">Related Picks</h3>
                  {cpu3[0] && <AltRow label="Same CPU" l={cpu3[0]} current={l} />}
                  {gpu3[0] && <AltRow label="Same GPU" l={gpu3[0]} current={l} />}
                  {brand3[0] && <AltRow label={`More ${l.brand}`} l={brand3[0]} current={l} />}
                  {budget3[0] && <AltRow label="Same Budget" l={budget3[0]} current={l} />}
                </div>
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white mb-3">Similar Laptops</h3>
              <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{sims.map(s => <LaptopCard l={s} />)}</div>
            </Section>

            {/* SEO internal links: guide placements + head-to-heads */}
            <Section id="rankings" icon="fa-ranking-star" title="Where It Ranks">
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-2">Featured in Buying Guides</h3>
                  <ul class="space-y-2 text-sm">
                    {guidesFor(l).map(({ guide, rank }) => (
                      <li class="flex items-center gap-2">
                        <span class={`w-7 h-7 shrink-0 rounded-lg text-xs font-extrabold flex items-center justify-center ${rank === 1 ? 'bg-amber-400 text-amber-950' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}>#{rank}</span>
                        <a href={`/guides/${guide.slug}`} class="text-slate-700 dark:text-slate-300 hover:text-brand-500 font-medium">{guide.h1}</a>
                      </li>
                    ))}
                    {guidesFor(l).length === 0 && <li class="text-slate-500">Not currently ranked in a guide — see <a href="/guides" class="text-brand-500 hover:underline">all buying guides</a>.</li>}
                  </ul>
                </div>
                <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-2">Head-to-Head Comparisons</h3>
                  <ul class="space-y-2 text-sm">
                    {comparisonsFor(l).map(r => (
                      <li><a href={`/compare/${compareSlug(l, r)}`} class="text-slate-700 dark:text-slate-300 hover:text-brand-500"><i class="fas fa-scale-balanced text-brand-400 mr-1.5 text-xs" aria-hidden="true"></i>{l.model} <span class="text-brand-500 font-semibold">vs</span> {r.name}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* FAQ */}
            <Section id="faq" icon="fa-circle-question" title="Frequently Asked Questions">
              <div class="space-y-3">
                {faqs.map(f => (
                  <details class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 group">
                    <summary class="font-semibold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                      {f.q}<i class="fas fa-chevron-down text-slate-400 text-xs group-open:rotate-180 transition" aria-hidden="true"></i>
                    </summary>
                    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed prose-p" dangerouslySetInnerHTML={{ __html: f.a }} />
                  </details>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}
