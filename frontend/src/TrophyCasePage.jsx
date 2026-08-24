import { useMemo, useState } from 'react'
import { Crown, Medal, Star, Trophy } from 'lucide-react'
import { LEAGUE_HISTORY, LINEAGE_MAP } from './leagueHistoryData'

const tones = {
  1: { name: 'gold', accent: '#b58a2a', soft: '#f5e8b9', label: 'Champion' },
  2: { name: 'silver', accent: '#7d8790', soft: '#e3e6e8', label: 'Runner-up' },
  3: { name: 'bronze', accent: '#9c6038', soft: '#ead4c3', label: 'Third place' },
}

function parseRecord(record) {
  const [wins, losses, ties] = record.split('-').map(Number)
  return { wins, losses, ties, pct: (wins + ties * 0.5) / (wins + losses + ties) }
}

function recordText(record) {
  const parsed = parseRecord(record)
  return `${parsed.wins}-${parsed.losses}-${parsed.ties}`
}

function lineageFor(name) {
  return LINEAGE_MAP[name]?.franchiseId ? `franchise-${LINEAGE_MAP[name].franchiseId}` : `historical-${name}`
}

function TrophyMark({ size = 100 }) {
  return (
    <svg viewBox="0 0 120 140" width={size} height={size * 1.16} aria-hidden="true" className="drop-shadow-[0_5px_3px_rgba(90,74,50,0.25)]">
      <defs>
        <linearGradient id="foilGold" x1="0" x2="1">
          <stop offset="0" stopColor="#755718" />
          <stop offset="0.22" stopColor="#f6df83" />
          <stop offset="0.48" stopColor="#aa7d1d" />
          <stop offset="0.72" stopColor="#ffe9a2" />
          <stop offset="1" stopColor="#806019" />
        </linearGradient>
      </defs>
      <path d="M31 29H17c-1 23 9 37 29 39M89 29h14c1 23-9 37-29 39" fill="none" stroke="url(#foilGold)" strokeWidth="8" strokeLinecap="round" />
      <path d="M36 20h48l-4 39c-2 16-10 25-20 29-10-4-18-13-20-29z" fill="url(#foilGold)" stroke="#755718" strokeWidth="2" />
      <path d="M49 43c7 5 15 5 22 0M50 54c6 3 14 3 20 0" fill="none" stroke="#755718" strokeWidth="2" opacity=".8" />
      <path d="M60 88v24M43 119h34" stroke="#755718" strokeWidth="7" strokeLinecap="round" />
      <path d="M34 126h52" stroke="url(#foilGold)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}

function getAggregates() {
  const byLineage = new Map()
  for (const season of LEAGUE_HISTORY) {
    season.standings.forEach(([name, record], index) => {
      const key = lineageFor(name)
      if (!byLineage.has(key)) byLineage.set(key, { key, names: [], titles: 0, runnerUps: 0, thirds: 0, records: [], seasons: [] })
      const entry = byLineage.get(key)
      if (!entry.names.includes(name)) entry.names.push(name)
      entry.records.push({ season: season.year, record })
      entry.seasons.push(season.year)
      if (index === 0) entry.titles += 1
      if (index === 1) entry.runnerUps += 1
      if (index === 2) entry.thirds += 1
    })
  }
  return [...byLineage.values()]
    .map(entry => ({
      ...entry,
      podiums: entry.titles + entry.runnerUps + entry.thirds,
      best: entry.records.reduce((best, item) => parseRecord(item.record).pct > parseRecord(best.record).pct ? item : best),
      worst: entry.records.reduce((worst, item) => parseRecord(item.record).pct < parseRecord(worst.record).pct ? item : worst),
    }))
    .sort((a, b) => b.titles - a.titles || b.podiums - a.podiums || b.runnerUps - a.runnerUps)
}

export default function TrophyCasePage({ teams = [], dateline }) {
  const [selectedYear, setSelectedYear] = useState(2025)
  const aggregates = useMemo(() => getAggregates(), [])
  const selectedSeason = LEAGUE_HISTORY.find(season => season.year === selectedYear)
  const teamById = new Map(teams.map(team => [team.id, team]))
  const champion = LEAGUE_HISTORY[0]
  const backToBack = LEAGUE_HISTORY.slice(0, -1).filter((season, index) => season.champion === LEAGUE_HISTORY[index + 1].champion).map(season => season.champion)
  const lowestChampion = LEAGUE_HISTORY.reduce((lowest, season) => parseRecord(season.standings[0][1]).pct < parseRecord(lowest.standings[0][1]).pct ? season : lowest)
  const teddy = aggregates.find(entry => entry.key === 'franchise-4')
  const championRecord = champion.standings[0][1]
  const thirdRecord = champion.standings[2][1]
  const cazCollapse = LEAGUE_HISTORY.find(season => season.year === 2022)?.standings.find(([name]) => name === 'Team caz')?.[1]
  const cazTitleYear = LEAGUE_HISTORY.find(season => season.champion === 'Team caz')?.year
  const today = dateline || 'The 2025 championship edition'

  return (
    <div className="max-w-6xl mx-auto font-serif text-[var(--ink)]">
      <header className="border-y-4 border-double border-[var(--rule-strong)] bg-[var(--paper-2)] px-4 py-5 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--ink-muted)] mb-2">The Dynasty Madness Times · Page Four</p>
        <h1 className="text-3xl md:text-6xl font-black tracking-tight uppercase">The Trophy Case</h1>
        <p className="mt-2 text-sm md:text-base italic text-[var(--ink-muted)]">Five Seasons of Dynasty Madness</p>
        <div className="mt-3 border-t border-[var(--rule)] pt-2 text-[10px] uppercase tracking-[0.25em] text-[var(--ink-muted)]">{today} · Records etched forever</div>
      </header>

      <section className="relative overflow-hidden border-b-2 border-[var(--rule-strong)] bg-[#332918] px-5 py-8 text-[#f3ecdb] md:px-10">
        <div className="absolute -right-12 -top-16 opacity-10"><TrophyMark size={260} /></div>
        <div className="relative max-w-3xl">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#e6c65e]"><Crown size={15} /> Reigning champion · 2025</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-none">{champion.champion}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#dbcfae]">The crown stays in the present tense. The Evil Empire survived a season where the numbers refused to behave, finishing first at {championRecord} while a {thirdRecord} juggernaut settled for third.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {[champion.champion, champion.runnerUp, champion.third].map((name, index) => (
              <div key={name} className="border px-3 py-2" style={{ borderColor: tones[index + 1].accent, backgroundColor: `${tones[index + 1].accent}22` }}>
                <span className="block text-[9px] uppercase tracking-widest" style={{ color: tones[index + 1].accent }}>{tones[index + 1].label}</span>
                <span className="font-bold">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-7">
        <div className="mb-4 flex items-end justify-between border-y-2 border-[var(--rule-strong)] py-2">
          <div><h3 className="text-xl font-black uppercase tracking-[0.18em]">The Trophy Shelf</h3><p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">Select a season to inspect its podium</p></div>
          <Trophy size={22} className="text-[var(--accent-gold)]" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {LEAGUE_HISTORY.map(season => {
            const active = season.year === selectedYear
            return (
              <button key={season.year} onClick={() => setSelectedYear(season.year)} className={`group relative border-2 p-3 text-left transition-all duration-300 motion-reduce:transition-none ${active ? 'border-[var(--accent-gold)] bg-[var(--gold-wash)] -translate-y-1 shadow-[0_6px_0_#b58a2a]' : 'border-[var(--rule)] bg-[var(--paper-2)] hover:-translate-y-1 hover:border-[var(--accent-gold)]'}`}>
                <div className="flex justify-center"><TrophyMark size={62} /></div>
                <div className="mt-1 border-t border-[var(--accent-gold-soft)] pt-2 text-center"><p className="text-xl font-black">{season.year}</p><p className="truncate text-xs font-bold">{season.champion}</p><p className="mt-1 text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Engraved champion</p></div>
              </button>
            )
          })}
        </div>
        <div className="mt-5 border-2 border-[var(--accent-gold)] bg-[var(--gold-wash)] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#806019]">Podium engraving · {selectedSeason.year}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {[selectedSeason.champion, selectedSeason.runnerUp, selectedSeason.third].map((name, index) => (
              <div key={name} className="flex items-center gap-3 border border-[var(--accent-gold-soft)] bg-[var(--paper-2)] p-3">
                {index === 0 ? <Crown size={22} style={{ color: tones[index + 1].accent }} /> : <Medal size={22} style={{ color: tones[index + 1].accent }} />}
                <div><p className="text-[9px] uppercase tracking-widest" style={{ color: tones[index + 1].accent }}>{tones[index + 1].label}</p><p className="font-bold">{name}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-7">
        <div className="mb-4 border-y-2 border-[var(--rule-strong)] py-2"><h3 className="text-xl font-black uppercase tracking-[0.18em]">All-Time Honors Ledger</h3><p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">Titles first, podiums thereafter · historical aliases retained</p></div>
        <div className="overflow-x-auto border border-[var(--rule)]">
          <table className="w-full min-w-[720px] bg-[var(--paper-2)] text-sm">
            <thead><tr className="border-b-2 border-[var(--rule-strong)] text-left text-[10px] uppercase tracking-widest"><th className="p-2">Franchise / known names</th><th className="p-2 text-center">Titles</th><th className="p-2 text-center">Seconds</th><th className="p-2 text-center">Thirds</th><th className="p-2">Best record</th><th className="p-2">Worst record</th></tr></thead>
            <tbody>{aggregates.map((entry, index) => {
              const mapped = entry.key.startsWith('franchise-') ? teamById.get(Number(entry.key.split('-')[1])) : null
              return <tr key={entry.key} className={`border-b border-[var(--paper-5)] ${index === 0 ? 'bg-[var(--gold-wash)]' : ''}`}><td className="p-2"><p className="font-bold">{mapped?.name || entry.names[0]} {mapped && <span className="font-normal text-xs text-[var(--ink-muted)]">· {mapped.owner}</span>}</p><p className="text-[10px] leading-relaxed text-[var(--ink-muted)]">{entry.names.join(' · ')}</p></td><td className="p-2 text-center font-black">{entry.titles}</td><td className="p-2 text-center">{entry.runnerUps}</td><td className="p-2 text-center">{entry.thirds}</td><td className="p-2 tabular-nums">{recordText(entry.best.record)} <span className="text-[10px] text-[var(--ink-muted)]">({entry.best.season})</span></td><td className="p-2 tabular-nums">{recordText(entry.worst.record)} <span className="text-[10px] text-[var(--ink-muted)]">({entry.worst.season})</span></td></tr>
            })}</tbody>
          </table>
        </div>
        {aggregates[0] && <p className="mt-3 flex items-center gap-2 text-sm italic"><Star size={15} className="text-[var(--accent-gold)]" /> Most decorated: <strong>{aggregates[0].names.join(' / ')}</strong> with {aggregates[0].titles} title{aggregates[0].titles === 1 ? '' : 's'} and {aggregates[0].podiums} podium finish{aggregates[0].podiums === 1 ? '' : 'es'}.</p>}
      </section>

      <section className="px-4 pb-10">
        <div className="mb-4 border-y-2 border-[var(--rule-strong)] py-2"><h3 className="text-xl font-black uppercase tracking-[0.18em]">The Engraved Archives</h3><p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">Every final table, every scar</p></div>
        <div className="grid gap-5 lg:grid-cols-2">
          {LEAGUE_HISTORY.map(season => <article key={season.year} className="border-2 border-[var(--rule-strong)] bg-[var(--paper-3)] p-4 shadow-[4px_4px_0_#c9bb9c] motion-reduce:shadow-none">
            <div className="flex items-start justify-between border-b border-[var(--rule)] pb-2"><div><p className="text-3xl font-black">{season.year}</p><p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">The final standings</p></div><Trophy size={28} className="text-[var(--accent-gold)]" /></div>
            <div className="mt-3 space-y-1">{season.standings.map(([name, record], index) => <div key={`${season.year}-${name}`} className="flex items-center gap-2 border-b border-[var(--rule-soft)] py-1.5 text-sm"><span className="w-5 text-center font-black" style={{ color: tones[index + 1]?.accent || '#8a7a5c' }}>{index + 1}</span><span className={`min-w-0 flex-1 ${index < 3 ? 'font-black' : ''}`}>{name}</span><span className="tabular-nums text-xs text-[var(--ink-muted)]">{record}</span></div>)}</div>
          </article>)}
        </div>
      </section>

      <section className="mx-4 mb-8 grid gap-3 border-y-2 border-[var(--rule-strong)] bg-[var(--paper-2)] p-4 text-sm md:grid-cols-4">
        <div><p className="text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Dynasty note</p><p className="font-bold">{backToBack[0]} is the only back-to-back champion.</p></div>
        <div><p className="text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Lowest-record champion</p><p className="font-bold">{lowestChampion.year}: {lowestChampion.champion} ({lowestChampion.standings[0][1]})</p></div>
        <div><p className="text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">The comeback</p><p className="font-bold">Team caz went {cazCollapse}, then won the {cazTitleYear} title.</p></div>
        <div><p className="text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Ironman</p><p className="font-bold">Teddy Bongwater: {teddy?.seasons.length} straight appearances, {teddy?.titles || 0} titles.</p></div>
      </section>
    </div>
  )
}
