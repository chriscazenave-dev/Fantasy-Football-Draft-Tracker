import { Check, ClipboardCheck, TrendingDown, TrendingUp } from 'lucide-react'

const POSITIONS = ['QB', 'RB', 'WR', 'TE']

const formatDate = (value) => {
  if (!value) return 'unknown date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function TeamLabel({ team, teamIdToOwner, teamId }) {
  return (
    <span>
      {team?.name || `Team ${teamId}`}
      {teamIdToOwner?.[teamId] && <span className="text-gray-400"> · {teamIdToOwner[teamId]}</span>}
    </span>
  )
}

function PickLabel({ pick, team, teamIdToOwner }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="w-11 flex-shrink-0 font-mono text-xs font-semibold tabular-nums text-gray-400">
        {pick.round}.{String(pick.pickInRound).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{pick.playerName || 'Unknown player'}</p>
        <p className="text-xs text-gray-500">
          <span className="mr-1 inline-flex rounded-md border border-gray-200 bg-white px-1.5 py-0.5 font-medium text-gray-600">
            {pick.position || '—'}
          </span>
          <TeamLabel team={team} teamIdToOwner={teamIdToOwner} teamId={pick.teamId} />
        </p>
      </div>
    </div>
  )
}

export default function DraftResults({
  year,
  teams,
  prospects,
  draftOrder,
  draftPicks,
  getTeamById,
  teamIdToOwner,
  results,
  isAdmin,
  isComplete,
  isDirty,
  onConfirm,
}) {
  const livePicks = draftOrder.map((entry, index) => {
    const pick = draftPicks.find(item => item.id === entry.pickNumber) || draftPicks[index] || {}
    const player = prospects.find(item => String(item.id) === String(entry.playerId))
    return {
      pickNumber: entry.pickNumber || pick.id || index + 1,
      round: entry.round || pick.round || Math.floor(index / Math.max(teams.length, 1)) + 1,
      pickInRound: entry.pickInRound || pick.pickInRound || (index % Math.max(teams.length, 1)) + 1,
      teamId: entry.teamId ?? pick.currentTeamId,
      playerId: entry.playerId,
      playerName: player?.name || 'Unknown player',
      position: player?.position || '—',
      nflTeam: player?.nflTeam,
      college: player?.college,
      rank: player?.rank ?? null,
      reason: entry.reason,
    }
  })

  const displayPicks = results && (!isComplete || !isDirty) ? results.picks : livePicks
  const positionCounts = POSITIONS.reduce((counts, position) => {
    counts[position] = displayPicks.filter(pick => pick.position === position).length
    return counts
  }, {})
  const rankedPicks = displayPicks.filter(pick => typeof pick.rank === 'number')
  const biggestSteal = rankedPicks
    .filter(pick => pick.pickNumber - pick.rank > 0)
    .sort((a, b) => (b.pickNumber - b.rank) - (a.pickNumber - a.rank))[0]
  const biggestReach = rankedPicks
    .filter(pick => pick.pickNumber - pick.rank < 0)
    .sort((a, b) => (a.pickNumber - a.rank) - (b.pickNumber - b.rank))[0]

  const picksByRound = displayPicks.reduce((rounds, pick) => {
    const round = pick.round || 1
    if (!rounds[round]) rounds[round] = []
    rounds[round].push(pick)
    return rounds
  }, {})
  const picksByTeam = displayPicks.reduce((byTeam, pick) => {
    if (!byTeam[pick.teamId]) byTeam[pick.teamId] = []
    byTeam[pick.teamId].push(pick)
    return byTeam
  }, {})
  const confirmedDate = results ? formatDate(results.confirmedAt) : null

  return (
    <div className="space-y-6">
      <section className="bg-gray-50/80 rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">{year} Rookie Draft Results</h2>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                results ? 'border-green-200 bg-green-50 text-green-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'
              }`}>
                {results ? `Official Results — confirmed by ${results.confirmedBy || 'league admin'} on ${confirmedDate}` : 'Unconfirmed preview'}
              </span>
            </div>
            {results && isDirty && (
              <p className="mt-2 text-xs text-amber-700">Live board has changed since confirmation.</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClipboardCheck size={15} className="text-blue-500" />
            {displayPicks.length} of {draftPicks.length} picks recorded
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total picks</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{displayPicks.length} <span className="text-sm font-medium text-gray-400">/ {draftPicks.length}</span></p>
          </div>
          {POSITIONS.map(position => (
            <div key={position} className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{position}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{positionCounts[position]}</p>
            </div>
          ))}
          <div className="rounded-xl border border-green-200 bg-green-50/60 p-3">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700"><TrendingUp size={12} /> Biggest steal</p>
            <p className="mt-1 truncate text-sm font-bold text-gray-900">{biggestSteal?.playerName || '—'}</p>
            {biggestSteal && <p className="truncate text-[11px] text-green-700">+{biggestSteal.pickNumber - biggestSteal.rank} · {getTeamById(biggestSteal.teamId)?.name || 'Unknown team'}</p>}
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700"><TrendingDown size={12} /> Biggest reach</p>
            <p className="mt-1 truncate text-sm font-bold text-gray-900">{biggestReach?.playerName || '—'}</p>
            {biggestReach && <p className="truncate text-[11px] text-red-700">{biggestReach.pickNumber - biggestReach.rank} · {getTeamById(biggestReach.teamId)?.name || 'Unknown team'}</p>}
          </div>
        </div>
      </section>

      {displayPicks.length === 0 ? (
        <section className="bg-gray-50/80 rounded-2xl p-10 border border-gray-200 shadow-sm text-center">
          <h3 className="font-semibold text-gray-900">No picks recorded yet</h3>
          <p className="mt-1 text-sm text-gray-500">Results will appear here as the draft progresses.</p>
        </section>
      ) : (
        <>
          <section className="bg-gray-50/80 rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Round-by-round board</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(picksByRound).sort(([a], [b]) => Number(a) - Number(b)).map(([round, picks]) => (
                <div key={round} className="rounded-xl border border-gray-200 bg-white p-3">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Round {round}</h4>
                  <div className="space-y-1.5">
                    {picks.sort((a, b) => a.pickNumber - b.pickNumber).map(pick => (
                      <PickLabel key={`${pick.pickNumber}-${pick.playerId}`} pick={pick} team={getTeamById(pick.teamId)} teamIdToOwner={teamIdToOwner} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-50/80 rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">By team</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(picksByTeam).map(([teamId, picks]) => (
                <div key={teamId} className="rounded-xl border border-gray-200 bg-white p-3">
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    <TeamLabel team={getTeamById(Number(teamId))} teamIdToOwner={teamIdToOwner} teamId={teamId} />
                  </h4>
                  <div className="space-y-1.5">
                    {picks.sort((a, b) => a.pickNumber - b.pickNumber).map(pick => (
                      <div key={`${pick.pickNumber}-${pick.playerId}`} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-gray-700">{pick.playerName}</span>
                        <span className="flex-shrink-0 font-mono text-xs text-gray-400">R{pick.round}.{String(pick.pickInRound).padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-50/80 rounded-2xl p-5 md:p-6 border border-gray-200 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Full pick-by-pick log</h3>
            <div className="max-h-96 space-y-2 overflow-y-auto pr-2 fancy-scroll">
              {displayPicks.slice().sort((a, b) => a.pickNumber - b.pickNumber).map(pick => (
                <div key={`${pick.pickNumber}-${pick.playerId}`} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
                  <span className="w-8 flex-shrink-0 font-mono text-xs text-gray-400">{pick.pickNumber}.</span>
                  <div className="min-w-0">
                    <PickLabel pick={pick} team={getTeamById(pick.teamId)} teamIdToOwner={teamIdToOwner} />
                    {pick.reason && <p className="mt-1 text-xs leading-relaxed text-gray-500">{pick.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="flex justify-end">
        {isAdmin && isComplete && (results && !isDirty ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
            <Check size={16} />
            Confirmed {confirmedDate}
          </div>
        ) : (
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            <Check size={16} />
            {results ? 'Update Official Results' : 'Confirm Official Results'}
          </button>
        ))}
      </div>
    </div>
  )
}
