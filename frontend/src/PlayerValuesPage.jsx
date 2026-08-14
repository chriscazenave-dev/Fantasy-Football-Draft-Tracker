import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Search } from 'lucide-react'
import { PLAYER_VALUES } from './playerValuesData'
import { VETERAN_ROSTERS, ROOKIE_PROSPECTS } from './leagueData'
import { ROOKIE_DETAILS } from './rookieDetailData'

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'']/g, '')
    .replace(/-/g, ' ')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE']

export default function PlayerValuesPage({ teams, rosters, draftedPlayers, dateline }) {
  const [filterPosition, setFilterPosition] = useState('All')
  const [filterOwner, setFilterOwner] = useState('All')
  const [search, setSearch] = useState('')

  const today =
    dateline ||
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const ownerByName = useMemo(() => {
    const map = {}
    const veteranRosters = rosters || VETERAN_ROSTERS
    for (const [teamId, roster] of Object.entries(veteranRosters)) {
      for (const player of roster) {
        map[normalizeName(player.name)] = Number(teamId)
      }
    }
    for (const prospect of ROOKIE_PROSPECTS) {
      const teamId = draftedPlayers?.[prospect.id]
      if (!teamId) continue
      const detail = ROOKIE_DETAILS[prospect.id]
      map[normalizeName(detail?.fullName || prospect.name)] = teamId
    }
    return map
  }, [draftedPlayers, rosters])

  const rows = useMemo(
    () =>
      PLAYER_VALUES.map(player => ({
        ...player,
        ownerTeam: teams.find(t => t.id === ownerByName[normalizeName(player.name)]) || null,
      })),
    [teams, ownerByName]
  )

  const teamTotals = useMemo(() => {
    const totals = teams.map(team => ({ team, total: 0, count: 0, topPlayer: null }))
    for (const row of rows) {
      if (!row.ownerTeam) continue
      const entry = totals.find(t => t.team.id === row.ownerTeam.id)
      if (!entry) continue
      entry.total += row.value
      entry.count += 1
      if (!entry.topPlayer) entry.topPlayer = row
    }
    return totals.sort((a, b) => b.total - a.total)
  }, [rows, teams])

  const filteredRows = rows.filter(row => {
    if (filterPosition !== 'All' && row.position !== filterPosition) return false
    if (filterOwner === 'Free Agent' && row.ownerTeam) return false
    if (filterOwner !== 'All' && filterOwner !== 'Free Agent' && row.ownerTeam?.name !== filterOwner) return false
    if (search && !row.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const trendIcon = trend =>
    trend > 0 ? (
      <TrendingUp size={13} className="text-green-700 inline" />
    ) : trend < 0 ? (
      <TrendingDown size={13} className="text-red-700 inline" />
    ) : (
      <Minus size={13} className="text-[#c9bb9c] inline" />
    )

  return (
    <div className="max-w-6xl mx-auto font-serif text-[#2b2418]">
      {/* Page header */}
      <div className="border-y-4 border-double border-[#5a4a32] py-5 text-center bg-[#f3ecdb] px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8a7a5c] mb-2">The Dynasty Madness Times · Page Two</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          The Value Ledger
        </h1>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest text-[#8a7a5c] border-t border-[#c9bb9c] pt-2 mx-auto max-w-2xl">
          <span>{today}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Top 300 Dynasty Assets · KeepTradeCut Superflex</span>
        </div>
      </div>

      {/* Franchise value leaderboard */}
      <div className="py-6 px-4">
        <div className="border-y-2 border-[#5a4a32] py-2 mb-4 text-center">
          <h3 className="text-lg font-black uppercase tracking-[0.2em]">Franchise Valuations</h3>
          <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Sum of KTC value across all owned top-300 assets</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {teamTotals.map((entry, idx) => (
            <div key={entry.team.id} className="border border-[#c9bb9c] bg-[#f3ecdb] p-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#c9bb9c] leading-none">{idx + 1}</span>
                <div className="min-w-0">
                  <p className="font-bold leading-tight text-sm truncate">{entry.team.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#8a7a5c] truncate">{entry.team.owner}</p>
                </div>
              </div>
              <p className="mt-2 text-xl font-black">{entry.total.toLocaleString()}</p>
              <p className="text-[11px] text-[#8a7a5c]">
                {entry.count} top-300 asset{entry.count === 1 ? '' : 's'}
                {entry.topPlayer ? ` · Crown jewel: ${entry.topPlayer.name}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 border border-[#c9bb9c] bg-[#f3ecdb] px-3 py-1.5">
          <Search size={13} className="text-[#8a7a5c]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search the ledger..."
            className="bg-transparent border-none focus:outline-none text-sm w-44 placeholder-[#8a7a5c]"
          />
        </div>
        <select
          value={filterPosition}
          onChange={e => setFilterPosition(e.target.value)}
          className="border border-[#c9bb9c] bg-[#f3ecdb] px-3 py-1.5 text-sm cursor-pointer"
        >
          {POSITIONS.map(pos => (
            <option key={pos} value={pos}>{pos === 'All' ? 'All Positions' : pos}</option>
          ))}
        </select>
        <select
          value={filterOwner}
          onChange={e => setFilterOwner(e.target.value)}
          className="border border-[#c9bb9c] bg-[#f3ecdb] px-3 py-1.5 text-sm cursor-pointer"
        >
          <option value="All">All Owners</option>
          {teams.map(team => (
            <option key={team.id} value={team.name}>{team.name}</option>
          ))}
          <option value="Free Agent">Free Agent</option>
        </select>
        <span className="ml-auto text-xs uppercase tracking-widest text-[#8a7a5c]">
          {filteredRows.length} of {rows.length} listed
        </span>
      </div>

      {/* Ledger table */}
      <div className="px-4 pb-10 overflow-x-auto">
        <table className="w-full border-t-2 border-[#5a4a32]">
          <thead>
            <tr className="border-b-2 border-[#5a4a32] text-left">
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32]">Rk</th>
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32]">Player</th>
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32]">Pos</th>
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32] hidden sm:table-cell">NFL</th>
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32] hidden md:table-cell">Age</th>
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32] text-right">Value</th>
              <th className="py-2 pr-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32] hidden sm:table-cell text-center">Trend</th>
              <th className="py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a4a32]">Owned By</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr key={row.rank} className="border-b border-[#e0d5bc] hover:bg-[#f3ecdb] transition-colors">
                <td className="py-1.5 pr-3 text-sm font-black text-[#8a7a5c]">{row.rank}</td>
                <td className="py-1.5 pr-3 text-sm font-bold">
                  {row.name}
                  {row.rookie && (
                    <span className="ml-1.5 px-1 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 align-middle">R</span>
                  )}
                </td>
                <td className="py-1.5 pr-3 text-sm">{row.position}<span className="text-[#8a7a5c]">{row.positionalRank}</span></td>
                <td className="py-1.5 pr-3 text-sm text-[#8a7a5c] hidden sm:table-cell">{row.team || 'FA'}</td>
                <td className="py-1.5 pr-3 text-sm text-[#8a7a5c] hidden md:table-cell">{row.age ? row.age.toFixed(1) : '—'}</td>
                <td className="py-1.5 pr-3 text-sm font-black text-right tabular-nums">{row.value.toLocaleString()}</td>
                <td className="py-1.5 pr-3 hidden sm:table-cell text-center">{trendIcon(row.trend)}</td>
                <td className="py-1.5 text-sm">
                  {row.ownerTeam ? (
                    <span className="font-bold">{row.ownerTeam.name} <span className="font-normal text-[11px] text-[#8a7a5c]">({row.ownerTeam.owner})</span></span>
                  ) : (
                    <span className="italic text-[#8a7a5c]">Free Agent</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[10px] uppercase tracking-widest text-[#8a7a5c] text-center">
          Values via KeepTradeCut dynasty superflex rankings · Ownership per league rosters and draft results
        </p>
      </div>
    </div>
  )
}
