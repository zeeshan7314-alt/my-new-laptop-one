// Comparison pages: /compare hub + /compare/:a-vs-:b
import { Laptop, LAPTOPS, cpuLabel, gpuLabel, money, storageLabel, META } from '../lib/db'
import { compareLaptops, compareSlug, popularPairs, similar, SCORE_KEYS } from '../lib/engine'
import { Header, Footer, CompareBar, ScoreDonut, BadgePill, AmazonBtn, LaptopCard, Breadcrumbs, Thumb } from '../components/layout'
import { guidesFor } from '../lib/engine'

const winCls = (mine: boolean) => mine ? 'bg-emerald-50 dark:bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-400' : ''

export const ComparePage = ({ a, b }: { a: Laptop; b: Laptop }) => {
  const cmp = compareLaptops(a, b)
  const winner = cmp.winner === 1 ? a : cmp.winner === 2 ? b : null
  const loser = cmp.winner === 1 ? b : cmp.winner === 2 ? a : null
  const alts = [...similar(a, 3), ...similar(b, 3)].filter((l, i, arr) => l.id !== a.id && l.id !== b.id && arr.findIndex(x => x.id === l.id) === i).slice(0, 4)
  const catRows = SCORE_KEYS.map(k => ({ label: k.label, va: a.scores[k.key], vb: b.scores[k.key], w: a.scores[k.key] === b.scores[k.key] ? 0 : a.scores[k.key] > b.scores[k.key] ? 1 : 2 }))

  const HeadCard = ({ l, isWinner }: { l: Laptop; isWinner: boolean }) => (
    <div class={`flex-1 bg-white dark:bg-slate-900 rounded-2xl border-2 p-5 ${isWinner ? 'border-emerald-400 dark:border-emerald-600' : 'border-slate-200 dark:border-slate-800'}`}>
      {isWinner && <div class="text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1"><i class="fas fa-trophy mr-1" aria-hidden="true"></i>Winner</div>}
      <div class="flex justify-center mb-3"><a href={`/${l.slug}-review`} tabindex={-1} aria-hidden="true"><Thumb l={l} size="lg" eager /></a></div>
      <div class="flex flex-wrap gap-1 mb-1">{l.badges.map(bd => <BadgePill text={bd} />)}</div>
      <h2 class="font-bold text-lg text-slate-900 dark:text-white leading-snug"><a href={`/${l.slug}-review`} class="hover:text-brand-500">{l.name}</a></h2>
      <p class="text-xs text-slate-500 mt-0.5">{cpuLabel(l)} · {gpuLabel(l)}</p>
      <div class="flex items-center gap-4 mt-3">
        <ScoreDonut score={l.scores.overall} size="sm" />
        <div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white">{money(l.price)}</div>
          {l.amazon.rating ? <div class="text-xs text-slate-500"><i class="fas fa-star text-amber-400" aria-hidden="true"></i> {l.amazon.rating} ({(l.amazon.reviewCount || 0).toLocaleString()})</div> : null}
        </div>
      </div>
      <div class="mt-4"><AmazonBtn l={l} /></div>
    </div>
  )
  const numBetter = (get: (l: Laptop) => number | null, lower = false) => {
    const vx = get(a), vy = get(b)
    if (vx == null || vy == null || vx === vy) return 0
    return (lower ? vx < vy : vx > vy) ? 1 : 2
  }
  const spec = (label: string, fmt: (l: Laptop) => string, w: number = 0) => (
    <tr class="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <th scope="row" class="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 w-36">{label}</th>
      <td class={`px-3 py-2.5 text-sm ${winCls(w === 1)}`}>{fmt(a)}</td>
      <td class={`px-3 py-2.5 text-sm ${winCls(w === 2)}`}>{fmt(b)}</td>
    </tr>
  )
  const pctDiff = (x: number, y: number) => Math.round(Math.abs(x - y) / Math.max(Math.min(x, y), 1) * 100)
  const pmA = a.cpu.passmark || 0, pmB = b.cpu.passmark || 0, gA = a.gpu.g3dmark || 0, gB = b.gpu.g3dmark || 0
  const N = ({ icon, title, text }: any) => (
    <div><h2 class="text-lg font-bold text-slate-900 dark:text-white mb-1.5"><i class={`fas ${icon} text-brand-500 mr-2`} aria-hidden="true"></i>{title}</h2>
      <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p></div>
  )
  return (
    <>
      <Header />
      <main class="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: 'Compare', href: '/compare' }, { name: `${a.brand} vs ${b.brand}` }]} />
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{a.name} <span class="text-brand-500">vs</span> {b.name}</h1>
        <p class="text-slate-500 text-sm mb-6">Benchmark-weighted head-to-head · data updated {META.updated}</p>

        <section id="winner-summary" class={`rounded-2xl p-5 mb-6 border ${winner ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <h2 class="font-extrabold text-lg text-slate-900 dark:text-white mb-1"><i class="fas fa-trophy text-amber-500 mr-2" aria-hidden="true"></i>{winner ? `Winner: ${winner.name}` : 'Result: Dead Heat'}</h2>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {winner
              ? `${winner.name} takes ${cmp.winner === 1 ? cmp.pointsA : cmp.pointsB} weighted points vs ${cmp.winner === 1 ? cmp.pointsB : cmp.pointsA}, winning on ${cmp.rows.filter(r => r.winner === cmp.winner).slice(0, 3).map(r => r.label.replace(/ \(.*\)/, '')).join(', ')}. `
              : `Both land ${cmp.pointsA} weighted points — pick by priority. `}
            {winner && loser ? (winner.price < loser.price ? `The winner is also ${money(loser.price - winner.price)} cheaper — a clear-cut call.` : `The ${loser.name} counters at ${money(loser.price)} — worth it if its strengths match your needs.`) : ''}
          </p>
        </section>

        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <HeadCard l={a} isWinner={cmp.winner === 1} />
          <div class="self-center font-extrabold text-slate-300 dark:text-slate-600 text-xl px-1">VS</div>
          <HeadCard l={b} isWinner={cmp.winner === 2} />
        </div>

        <section id="score-table" class="mb-8">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3"><i class="fas fa-chart-column text-brand-500 mr-2" aria-hidden="true"></i>Use-Case Scores</h2>
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table class="w-full text-sm min-w-[480px]">
              <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                <th class="text-left px-3 py-2.5">Category</th><th class="text-left px-3 py-2.5">{a.model}</th><th class="text-left px-3 py-2.5">{b.model}</th></tr></thead>
              <tbody>{catRows.map(r => (
                <tr class="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <th scope="row" class="text-left px-3 py-2 text-xs font-semibold text-slate-500">{r.label}</th>
                  <td class={`px-3 py-2 ${winCls(r.w === 1)}`}>{r.va}/10</td>
                  <td class={`px-3 py-2 ${winCls(r.w === 2)}`}>{r.vb}/10</td>
                </tr>))}</tbody>
            </table>
          </div>
        </section>

        <section id="spec-table" class="mb-8">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3"><i class="fas fa-table-list text-brand-500 mr-2" aria-hidden="true"></i>Detailed Specification Comparison</h2>
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table class="w-full min-w-[520px]">
              <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wide text-slate-400">
                <th class="text-left px-3 py-2.5">Spec</th><th class="text-left px-3 py-2.5">{a.model}</th><th class="text-left px-3 py-2.5">{b.model}</th></tr></thead>
              <tbody>
                {spec('CPU', l => cpuLabel(l))}
                {spec('PassMark Score', l => l.cpu.passmark?.toLocaleString() ?? '—', numBetter(l => l.cpu.passmark))}
                {spec('CPU Cores', l => String(l.cpu.cores ?? '—'), numBetter(l => l.cpu.cores))}
                {spec('GPU', l => gpuLabel(l))}
                {spec('G3DMark Score', l => l.gpu.g3dmark?.toLocaleString() ?? '—', numBetter(l => l.gpu.g3dmark))}
                {spec('RAM', l => `${l.ram.gb} GB ${l.ram.type}`, numBetter(l => l.ram.gb))}
                {spec('RAM Upgradeable', l => l.ram.soldered ? 'No (soldered)' : 'Yes', numBetter(l => l.ram.soldered ? 0 : 1))}
                {spec('Storage', l => storageLabel(l), numBetter(l => l.storage.gb))}
                {spec('Display', l => `${l.display.sizeInches}″ ${l.display.panel || ''}`)}
                {spec('Resolution', l => l.display.resolution || '—', numBetter(l => (l.display.resW || 0) * (l.display.resH || 0)))}
                {spec('Refresh Rate', l => `${l.display.refreshHz} Hz`, numBetter(l => l.display.refreshHz))}
                {spec('Pixel Density', l => `${l.display.ppi ?? '—'} PPI`, numBetter(l => l.display.ppi))}
                {spec('Touchscreen', l => l.display.touch ? 'Yes' : 'No')}
                {spec('Weight', l => `${l.physical.weightLbs} lbs`, numBetter(l => l.physical.weightLbs, true))}
                {spec('Thickness', l => `${l.physical.thicknessIn}″`, numBetter(l => l.physical.thicknessIn, true))}
                {spec('Amazon Rating', l => l.amazon.rating ? `${l.amazon.rating} ★ (${(l.amazon.reviewCount || 0).toLocaleString()})` : '—', numBetter(l => l.amazon.rating))}
                {spec('Price', l => money(l.price), numBetter(l => l.price, true))}
                {spec('Value Score', l => `${l.scores.value}/10`, numBetter(l => l.scores.value))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="analysis" class="space-y-6 mb-10">
          <N icon="fa-microchip" title="CPU Comparison" text={
            pmA === pmB ? `Both run near-identical CPU performance (${pmA.toLocaleString()} PassMark).`
              : `The ${pmA > pmB ? a.name : b.name}'s ${pmA > pmB ? cpuLabel(a) : cpuLabel(b)} is ~${pctDiff(pmA, pmB)}% faster in multi-threaded PassMark (${Math.max(pmA, pmB).toLocaleString()} vs ${Math.min(pmA, pmB).toLocaleString()}). ${pctDiff(pmA, pmB) > 40 ? 'A generational gap you will feel in exports, compiles and heavy multitasking.' : pctDiff(pmA, pmB) > 15 ? 'Noticeable in sustained workloads, less so in everyday browsing.' : 'In practice the difference is marginal.'}`} />
          <N icon="fa-gamepad" title="GPU & Gaming" text={
            !a.gpu.dedicated && !b.gpu.dedicated ? 'Neither carries a dedicated GPU — both fine for esports at low settings, neither for modern AAA gaming.'
              : a.gpu.dedicated && !b.gpu.dedicated ? `Only the ${a.name} has a dedicated GPU (${a.gpu.model}, ${gA.toLocaleString()} G3DMark) — it wins gaming outright.`
              : !a.gpu.dedicated && b.gpu.dedicated ? `Only the ${b.name} has a dedicated GPU (${b.gpu.model}, ${gB.toLocaleString()} G3DMark) — it wins gaming outright.`
              : gA === gB ? 'Both GPUs land identical G3DMark scores — gaming is a wash.'
              : `The ${gA > gB ? a.gpu.model : b.gpu.model} in the ${gA > gB ? a.name : b.name} is ~${pctDiff(gA, gB)}% faster (${Math.max(gA, gB).toLocaleString()} vs ${Math.min(gA, gB).toLocaleString()} G3DMark) — ${pctDiff(gA, gB) > 30 ? 'a full settings-tier advantage.' : 'a modest but real FPS edge.'}`} />
          <N icon="fa-briefcase" title="Productivity & Battery" text={
            `Office scores: ${a.scores.office}/10 vs ${b.scores.office}/10. Battery isn't in our dataset, but ${!a.gpu.dedicated && b.gpu.dedicated ? `the iGPU-only ${a.name} will typically outlast the ${b.name} unplugged.` : a.gpu.dedicated && !b.gpu.dedicated ? `the iGPU-only ${b.name} will typically outlast the ${a.name} unplugged.` : 'both share a similar power class, so expect comparable endurance.'}`} />
          <N icon="fa-display" title="Display" text={
            `${a.model}: ${a.display.sizeInches}″ ${a.display.panel} ${a.display.resolution} @ ${a.display.refreshHz} Hz. ${b.model}: ${b.display.sizeInches}″ ${b.display.panel} ${b.display.resolution} @ ${b.display.refreshHz} Hz. ${['OLED', 'AMOLED', 'Mini LED'].includes(a.display.panel || '') && !['OLED', 'AMOLED', 'Mini LED'].includes(b.display.panel || '') ? `The ${a.name}'s ${a.display.panel} panel is the clear quality win.` : ['OLED', 'AMOLED', 'Mini LED'].includes(b.display.panel || '') && !['OLED', 'AMOLED', 'Mini LED'].includes(a.display.panel || '') ? `The ${b.name}'s ${b.display.panel} panel is the clear quality win.` : (a.display.refreshHz || 0) !== (b.display.refreshHz || 0) ? `The ${(a.display.refreshHz || 0) > (b.display.refreshHz || 0) ? a.name : b.name}'s higher refresh rate wins for motion clarity.` : 'Panel quality is effectively even.'}`} />
          <N icon="fa-memory" title="RAM, Storage & Upgradeability" text={
            `${a.model}: ${a.ram.gb} GB ${a.ram.type} (${a.ram.soldered ? 'soldered' : 'upgradeable'}) + ${storageLabel(a)}. ${b.model}: ${b.ram.gb} GB ${b.ram.type} (${b.ram.soldered ? 'soldered' : 'upgradeable'}) + ${storageLabel(b)}. ${!a.ram.soldered && b.ram.soldered ? `The ${a.name}'s socketed RAM is a longevity advantage.` : !b.ram.soldered && a.ram.soldered ? `The ${b.name}'s socketed RAM is a longevity advantage.` : ''}`} />
          <N icon="fa-weight-hanging" title="Build & Portability" text={
            `${a.physical.weightLbs} lbs / ${a.physical.thicknessIn}″ vs ${b.physical.weightLbs} lbs / ${b.physical.thicknessIn}″. ${Math.abs((a.physical.weightLbs || 0) - (b.physical.weightLbs || 0)) < 0.3 ? 'Effectively identical to carry.' : `The ${(a.physical.weightLbs || 9) < (b.physical.weightLbs || 9) ? a.name : b.name} is ${Math.abs((a.physical.weightLbs || 0) - (b.physical.weightLbs || 0)).toFixed(1)} lbs lighter — significant for daily carry.`} Travel scores: ${a.scores.travel} vs ${b.scores.travel}.`} />
          <N icon="fa-hand-holding-dollar" title="Value" text={
            `At ${money(a.price)} vs ${money(b.price)}, value scores land ${a.scores.value}/10 vs ${b.scores.value}/10. ${a.scores.value === b.scores.value ? 'Both price fairly for what they deliver.' : `The ${a.scores.value > b.scores.value ? a.name : b.name} extracts more performance per dollar.`}`} />
        </section>

        <section id="final-verdict" class="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-6 text-white mb-10">
          <h2 class="text-xl font-extrabold mb-1"><i class="fas fa-flag-checkered mr-2" aria-hidden="true"></i>Final Verdict</h2>
          <p class="text-sm opacity-90 mb-4">{winner ? `Buy the ${winner.name} — it wins the weighted spec battle${winner.price <= (loser?.price || 0) ? ' and costs less' : ''}. ${loser ? `Choose the ${loser.name} only if ${loser.scores.travel > winner.scores.travel ? 'portability' : loser.scores.value > winner.scores.value ? 'budget' : 'its specific strengths'} matter more to you.` : ''}` : 'Both are equally strong — buy whichever fits your budget and brand preference.'}</p>
          <div class="flex flex-wrap gap-3"><AmazonBtn l={a} /><AmazonBtn l={b} /></div>
        </section>

        {alts.length > 0 && (
          <section id="compare-alternatives">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Also Consider</h2>
            <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{alts.map(l => <LaptopCard l={l} />)}</div>
          </section>
        )}

        {/* SEO internal links */}
        <section id="related-links" class="mt-10 grid md:grid-cols-2 gap-4 text-sm">
          {[a, b].map(l => (
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <h2 class="font-bold text-slate-900 dark:text-white mb-2">More on the {l.name}</h2>
              <ul class="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li><a href={`/${l.slug}-review`} class="hover:text-brand-500"><i class="fas fa-file-lines text-brand-400 mr-1.5 text-xs" aria-hidden="true"></i>Full {l.name} review</a></li>
                {guidesFor(l, 3).map(({ guide, rank }) => (
                  <li><a href={`/guides/${guide.slug}`} class="hover:text-brand-500"><i class="fas fa-ranking-star text-brand-400 mr-1.5 text-xs" aria-hidden="true"></i>#{rank} in {guide.h1}</a></li>
                ))}
                <li><a href={`/laptops?brand=${encodeURIComponent(l.brand)}`} class="hover:text-brand-500"><i class="fas fa-list text-brand-400 mr-1.5 text-xs" aria-hidden="true"></i>All {l.brand} laptops</a></li>
              </ul>
            </div>
          ))}
        </section>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}

export const CompareHub = () => {
  const pairs = popularPairs(24)
  return (
    <>
      <Header />
      <main class="max-w-6xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ name: 'Compare' }]} />
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Laptop Comparison Tool</h1>
        <p class="text-slate-500 mb-6">Pick any two of our {LAPTOPS.length} laptops for a benchmark-weighted head-to-head verdict.</p>
        <section id="compare-picker" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-10">
          <div class="grid sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
            <select id="cmp-a" class="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium border border-slate-200 dark:border-transparent focus:border-brand-400 focus:outline-none">
              <option value="">Select first laptop…</option>
              {LAPTOPS.map(l => <option value={l.slug}>{l.name} — {money(l.price)}</option>)}
            </select>
            <span class="text-center font-extrabold text-slate-400 dark:text-slate-500">VS</span>
            <select id="cmp-b" class="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium border border-slate-200 dark:border-transparent focus:border-brand-400 focus:outline-none">
              <option value="">Select second laptop…</option>
              {LAPTOPS.map(l => <option value={l.slug}>{l.name} — {money(l.price)}</option>)}
            </select>
            <button id="cmp-go" class="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">Compare</button>
          </div>
        </section>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Popular Comparisons</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pairs.map(([x, y]) => (
            <a href={`/compare/${compareSlug(x, y)}`} class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg transition p-4">
              <div class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 leading-snug">{x.name} <span class="text-brand-500">vs</span> {y.name}</div>
              <div class="text-xs text-slate-500 mt-1.5">{money(x.price)} vs {money(y.price)} · {x.scores.overall} vs {y.scores.overall} overall</div>
            </a>
          ))}
        </div>
      </main>
      <CompareBar />
      <Footer />
    </>
  )
}
