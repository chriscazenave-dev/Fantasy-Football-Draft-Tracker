import { useState } from 'react'
import { LogIn, Lock, ArrowRightLeft, X, Plus } from 'lucide-react'
import { STARTER_SLOTS, SLOT_LABELS, SLOT_ELIGIBILITY, MAX_IR } from './lineupData'

function slotAccepts(slot, position) {
  return SLOT_ELIGIBILITY[slot]?.includes(position)
}

export default function RostersPage({ teams, rosters, lineups, setLineups, userTeamId, isAdmin, isLoggedIn, onRequestLogin }) {
  const [selectedTeamId, setSelectedTeamId] = useState(userTeamId || teams[0]?.id)
  const [moving, setMoving] = useState(null) // { name, position, from } — from is a slot key, 'bench', or 'ir'

  const team = teams.find(t => t.id === selectedTeamId)
  const roster = rosters[selectedTeamId] || []
  const lineup = lineups[selectedTeamId] || { starters: {}, ir: [] }
  const canEdit = isLoggedIn && (isAdmin || userTeamId === selectedTeamId)

  const findPlayer = (name) => roster.find(p => p.name === name)
  const starterNames = new Set(Object.values(lineup.starters).filter(Boolean))
  const irNames = new Set(lineup.ir)
  const bench = roster.filter(p => !starterNames.has(p.name) && !irNames.has(p.name))

  const updateLineup = (updater) => {
    setLineups(prev => ({ ...prev, [selectedTeamId]: updater(prev[selectedTeamId] || { starters: {}, ir: [] }) }))
  }

  const selectTeam = (id) => {
    setSelectedTeamId(id)
    setMoving(null)
  }

  const startMove = (player, from) => {
    setMoving({ name: player.name, position: player.position, from })
  }

  const removeFromCurrent = (lu, name) => {
    const starters = { ...lu.starters }
    for (const slot of STARTER_SLOTS) {
      if (starters[slot] === name) starters[slot] = null
    }
    return { starters, ir: lu.ir.filter(n => n !== name) }
  }

  const moveToSlot = (slot) => {
    if (!moving) return
    updateLineup(lu => {
      const occupant = lu.starters[slot]
      let next = removeFromCurrent(lu, moving.name)
      const starters = { ...next.starters }
      let ir = next.ir
      if (occupant && occupant !== moving.name) {
        // Try to send occupant back to where the mover came from; otherwise bench
        const occupantPos = findPlayer(occupant)?.position
        if (STARTER_SLOTS.includes(moving.from) && slotAccepts(moving.from, occupantPos) && !starters[moving.from]) {
          starters[moving.from] = occupant
        }
        // otherwise occupant simply drops to bench (no explicit list needed)
      }
      starters[slot] = moving.name
      return { starters, ir }
    })
    setMoving(null)
  }

  const moveToBench = () => {
    if (!moving) return
    updateLineup(lu => removeFromCurrent(lu, moving.name))
    setMoving(null)
  }

  const moveToIR = () => {
    if (!moving) return
    updateLineup(lu => {
      const next = removeFromCurrent(lu, moving.name)
      if (next.ir.length >= MAX_IR) return lu
      return { ...next, ir: [...next.ir, moving.name] }
    })
    setMoving(null)
  }

  const MoveButton = ({ player, from }) => {
    if (!canEdit) return null
    const isMoving = moving?.name === player.name
    return (
      <button
        onClick={() => (isMoving ? setMoving(null) : startMove(player, from))}
        className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full border transition-colors ${
          isMoving
            ? 'bg-amber-600 text-white border-amber-600'
            : 'bg-white text-gray-600 border-gray-300 hover:border-amber-500 hover:text-amber-700'
        }`}
      >
        {isMoving ? 'Cancel' : 'Move'}
      </button>
    )
  }

  const HereButton = ({ onClick }) => (
    <button
      onClick={onClick}
      className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
    >
      Here
    </button>
  )

  const PlayerCell = ({ player }) => (
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-900 truncate">{player.name}</div>
      <div className="text-xs text-gray-500">{player.position} · {player.nflTeam}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Team Rosters</h2>
        {!isLoggedIn && (
          <button
            onClick={onRequestLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200 hover:text-gray-900 transition-colors"
          >
            <LogIn size={14} />
            Sign in to set your lineup
          </button>
        )}
      </div>

      {/* Team toggle */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => selectTeam(t.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
              selectedTeamId === t.id
                ? 'bg-black text-white border-black shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className={`p-1 rounded-full ${t.bg} ${t.color}`}>
              <t.icon size={12} />
            </div>
            <span className="whitespace-nowrap">{t.name}</span>
            {isLoggedIn && userTeamId === t.id && (
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-amber-500 text-white">You</span>
            )}
          </button>
        ))}
      </div>

      {team && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${team.bg} ${team.color}`}>
                <team.icon size={20} />
              </div>
              <div>
                <div className="font-bold text-gray-900 leading-tight">{team.name}</div>
                <div className="text-xs text-gray-500">{team.owner}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>{roster.length} players</span>
              {canEdit ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  <ArrowRightLeft size={11} /> Lineup editing on
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  <Lock size={11} /> View only
                </span>
              )}
            </div>
          </div>

          {moving && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-800 flex items-center gap-2">
              <ArrowRightLeft size={14} />
              Moving <span className="font-semibold">{moving.name}</span> — choose a destination below
              <button onClick={() => setMoving(null)} className="ml-auto text-amber-700 hover:text-amber-900">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Starters */}
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Starters — 1 QB · 2 RB · 2 WR · 1 TE · 2 FLEX · 1 OP (Superflex) · 1 D/ST
              </p>
              <div className="divide-y divide-gray-50">
                {STARTER_SLOTS.map(slot => {
                  const name = lineup.starters[slot]
                  const player = name ? findPlayer(name) : null
                  const isTarget = moving && slotAccepts(slot, moving.position) && moving.from !== slot
                  return (
                    <div
                      key={slot}
                      className={`flex items-center gap-3 py-2 px-2 rounded-lg ${isTarget ? 'bg-green-50/70 ring-1 ring-green-200' : ''}`}
                    >
                      <span className="w-11 text-[10px] font-black uppercase tracking-wide text-gray-400">{SLOT_LABELS[slot]}</span>
                      {player ? (
                        <PlayerCell player={player} />
                      ) : (
                        <div className="flex-1 text-sm italic text-gray-400">Empty</div>
                      )}
                      {isTarget ? (
                        <HereButton onClick={() => moveToSlot(slot)} />
                      ) : (
                        player && <MoveButton player={player} from={slot} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* IR */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mt-5 mb-2">Injured Reserve — 2 spots</p>
              <div className="divide-y divide-gray-50">
                {lineup.ir.map(name => {
                  const player = findPlayer(name)
                  if (!player) return null
                  return (
                    <div key={name} className="flex items-center gap-3 py-2 px-2 rounded-lg">
                      <span className="w-11 text-[10px] font-black uppercase tracking-wide text-red-400">IR</span>
                      <PlayerCell player={player} />
                      <MoveButton player={player} from="ir" />
                    </div>
                  )
                })}
                {Array.from({ length: MAX_IR - lineup.ir.length }).map((_, i) => {
                  const isTarget = moving && moving.from !== 'ir'
                  return (
                    <div
                      key={`ir-empty-${i}`}
                      className={`flex items-center gap-3 py-2 px-2 rounded-lg ${isTarget ? 'bg-green-50/70 ring-1 ring-green-200' : ''}`}
                    >
                      <span className="w-11 text-[10px] font-black uppercase tracking-wide text-red-400">IR</span>
                      <div className="flex-1 text-sm italic text-gray-400">Empty</div>
                      {isTarget && <HereButton onClick={moveToIR} />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bench */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bench ({bench.length})</p>
                {moving && moving.from !== 'bench' && (
                  <button
                    onClick={moveToBench}
                    className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Plus size={11} /> Send to bench
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-50 max-h-[560px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                {bench.map(player => (
                  <div key={player.name} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50">
                    <span className="w-11 text-[10px] font-black uppercase tracking-wide text-gray-300">BE</span>
                    <PlayerCell player={player} />
                    <MoveButton player={player} from="bench" />
                  </div>
                ))}
                {bench.length === 0 && <p className="text-sm italic text-gray-400 py-3">No bench players</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
