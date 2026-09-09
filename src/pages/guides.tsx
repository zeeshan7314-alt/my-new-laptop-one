// Buying guides — /guides and /guides/:slug
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

export const GuidePage = ({ g }: { g: Guide }) => {
  const ranked = guideRanking(g)
  const awards = ['Editor\u2019s Pick', 'Runner-Up', 'Best Value Alternative']
  return (
    <>
      <Header />
      <main class="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: 'Buying Guides', href: '/guides' }, { name: g.h1 }]} />
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{g.title}</h1>
        <p class="text-slate-600 dark:text-slate-400 mb-1">{g.intro}</p>
        <p class="text-xs text-slate-400 mb-6">{ranked.length} ranked picks · data updated {META.updated} · {META.affiliateDisclosure}</p>

        {/* quick TOC */}
        <nav aria-label="Ranked picks" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-8 text-sm">
          <h2 class="font-bold text-xs uppercase tracking-wide text-slate-400 mb-2">Our Picks at a Glance</h2>
          <ol class="grid sm:grid-cols-2 gap-x-6 gap-y-1 list-decimal list-inside marker:font-bold marker:text-brand-500">
            {ranked.map(l => <li><a href={`#pick-${l.slug}`} class="hover:text-brand-500">{l.name}</a></li>)}
          </ol>
        </nav>

        <div class="space-y-6">
          {ranked.map((l, i) => {
            const pc = prosCons(l)
            return (
              <article id={`pick-${l.slug}`} class="scroll-mt-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6">
                <div class="flex items-start gap-4">
                  <div class={`w-10 h-10 shrink-0 rounded-xl font-extrabold flex items-center justify-center text-lg ${i === 0 ? 'bg-amber-400 text-amber-950' : 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}>{i + 1}</div>
                  <a href={`/${l.slug}-review`} class="hidden sm:block" tabindex={-1} aria-hidden="true"><Thumb l={l} size="md" eager={i < 2} /></a>
                  <div class="min-w-0 flex-1">
                    {i < 3 && <div class="text-[10px] font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-0.5"><i class="fas fa-award mr-1" aria-hidden="true"></i>{awards[i]}</div>}
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
                  <a href={`/${l.slug}-review`} class="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">Full review →</a>
                  {ranked[0] && l.id !== ranked[0].id && <a href={`/compare/${compareSlug(ranked[0], l)}`} class="text-sm font-semibold text-slate-500 hover:text-brand-500 hover:underline">vs #1 pick</a>}
                </div>
              </article>
            )
          })}
        </div>

        {/* SEO internal links: related guides */}
        <section id="related-guides" class="mt-10">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Related Buying Guides</h2>
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
          <h2 class="font-bold text-slate-900 dark:text-white mb-2">How we rank</h2>
          <p>Rankings are computed automatically from our normalized spreadsheet database: PassMark multi-thread CPU scores, G3DMark laptop GPU scores, RAM/storage capacity, display quality (panel type, refresh rate, pixel density), weight, verified Amazon rating (weighted by review count) and price. The "{g.scoreKey}" score weighting used here is documented on every product page. No manufacturer sponsorships influence placement.</p>
        </section>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}
