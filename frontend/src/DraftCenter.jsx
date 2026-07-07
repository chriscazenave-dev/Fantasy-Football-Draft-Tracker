import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Play, Pause, X, RotateCcw, Minimize2, Radio, Clock, Trophy, Activity, ChevronRight, Sparkles } from 'lucide-react'
import { formatTime } from './draftLogic'

const POSITION_COLORS = {
  QB: 'text-rose-300 border-rose-400/40 bg-rose-500/10',
  RB: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10',
  WR: 'text-sky-300 border-sky-400/40 bg-sky-500/10',
  TE: 'text-amber-300 border-amber-400/40 bg-amber-500/10',
}

function PosBadge({ position }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold font-mono ${POSITION_COLORS[position] || 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10'}`}>
      {position}
    </span>
  )
}

function Panel({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-cyan-400/20 bg-[#0a1224]/80 shadow-[0_0_20px_rgba(34,211,238,0.06)] overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-400/15 bg-cyan-400/5">
        {Icon && <Icon size={13} className="text-cyan-400" />}
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300/80 font-mono">{title}</span>
      </div>
      {children}
    </div>
  )
}

// Full-screen futuristic "mission control" overlay where the draft actually
// runs. Live phase shows the clock, big board, and pick feed; recap phase
// summarizes the completed draft before exiting.
export default function DraftCenter({
  mode,
  teams,
  prospects,
  draftedPlayers,
  draftOrder,
  draftPicks,
  mockTeamId,
  timeRemaining,
  isPaused,
  isAdmin,
  isLoggedIn,
  onPauseToggle,
  onEndMock,
  onRestart,
  onUserMockPick,
  onAdminDraft,
  onMinimize,
  getTeamById,
}) {
  const isMock = mode === 'mock'
  const [phase, setPhase] = useState('live')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPosition, setFilterPosition] = useState('All')
  const feedRef = useRef(null)

  const isComplete = draftPicks.length > 0 && draftOrder.length >= draftPicks.length
  const effectivePhase = isComplete ? 'recap' : phase

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0
  }, [draftOrder.length])

  const currentPick = draftPicks.find(p => p.id === draftOrder.length + 1)
  const clockTeam = currentPick ? getTeamById(currentPick.currentTeamId) : null
  const onDeck = currentPick ? draftPicks.find(p => p.id === currentPick.id + 1) : null
  const onDeckTeam = onDeck ? getTeamById(onDeck.currentTeamId) : null
  const isYourTurn = isMock && mockTeamId && currentPick?.currentTeamId === mockTeamId
  const canPick = isMock ? isYourTurn : (isAdmin || isLoggedIn)

  const positions = ['All', ...new Set(prospects.map(p => p.position))]
  const availableProspects = useMemo(() => {
    let pool = prospects.filter(p => !draftedPlayers[p.id])
    if (filterPosition !== 'All') pool = pool.filter(p => p.position === filterPosition)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      pool = pool.filter(p => p.name.toLowerCase().includes(q) || (p.college || '').toLowerCase().includes(q))
    }
    return [...pool].sort((a, b) => (a.rank || 999) - (b.rank || 999))
  }, [prospects, draftedPlayers, filterPosition, searchQuery])

  const myPicks = useMemo(() => {
    if (!isMock || !mockTeamId) return []
    return draftOrder
      .filter(e => e.teamId === mockTeamId)
      .map(e => ({ ...e, player: prospects.find(p => p.id === e.playerId) }))
  }, [isMock, mockTeamId, draftOrder, prospects])

  const handlePick = (playerId) => {
    if (!currentPick) return
    if (isMock) onUserMockPick(playerId, mockTeamId)
    else onAdminDraft(playerId, currentPick.currentTeamId)
  }

  const timerDanger = timeRemaining <= 30
  const timerWarn = timeRemaining <= 60 && !timerDanger

  if (effectivePhase === 'recap') {
    return (
      <DraftRecap
        isMock={isMock}
        teams={teams}
        prospects={prospects}
        draftOrder={draftOrder}
        draftPicks={draftPicks}
        mockTeamId={mockTeamId}
        getTeamById={getTeamById}
        onExit={isMock ? onEndMock : onMinimize}
        onBack={isComplete ? null : () => setPhase('live')}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[195] bg-[#050914] text-cyan-50 overflow-y-auto dc-grid">
      <div className="pointer-events-none fixed inset-0 dc-scanline" />

      {/* Command header */}
      <div className="sticky top-0 z-20 border-b border-cyan-400/20 bg-[#050914]/90 backdrop-blur-xl">
        <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-cyan-400/30 bg-cyan-400/10">
              <Radio size={18} className="text-cyan-300" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-black uppercase tracking-[0.3em] font-mono text-white">Draft Command</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-dc-blink ${isMock ? 'bg-purple-400' : 'bg-red-500'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-[0.25em] font-mono ${isMock ? 'text-purple-300' : 'text-red-400'}`}>
                  {isMock ? 'Mock Simulation' : 'Live Draft'}{isPaused ? ' · Paused' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/60">Pick</span>
            <span className="text-lg font-black text-white tabular-nums">{String(draftOrder.length + 1).padStart(2, '0')}</span>
            <span className="text-cyan-400/40">/</span>
            <span className="text-sm text-cyan-300/60 tabular-nums">{draftPicks.length}</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-mono tabular-nums ${
            timerDanger ? 'border-red-500/50 bg-red-500/10 text-red-300 animate-dc-blink' : timerWarn ? 'border-amber-400/50 bg-amber-400/10 text-amber-300' : 'border-cyan-400/30 bg-cyan-400/5 text-cyan-200'
          }`}>
            <Clock size={14} />
            <span className="text-xl font-black">{formatTime(timeRemaining)}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {(isAdmin || isMock) && (
              <button
                onClick={onPauseToggle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-200 text-xs font-bold uppercase tracking-wider font-mono transition-colors"
              >
                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            {!isMock && isAdmin && (
              <button
                onClick={onRestart}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider font-mono transition-colors"
              >
                <RotateCcw size={13} />
                Restart
              </button>
            )}
            <button
              onClick={() => setPhase('recap')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-xs font-bold uppercase tracking-wider font-mono transition-colors"
            >
              <Trophy size={13} />
              {isMock ? 'End & Recap' : 'Recap'}
            </button>
            <button
              onClick={onMinimize}
              title="Return to site (draft keeps running)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider font-mono transition-colors"
            >
              <Minimize2 size={13} />
              Minimize
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 py-4 space-y-4">
        {/* On the clock hero */}
        {clockTeam && (
          <div className={`relative overflow-hidden rounded-2xl border px-6 py-4 flex flex-wrap items-center gap-5 ${
            isYourTurn
              ? 'border-purple-400/60 bg-gradient-to-r from-purple-900/60 via-purple-800/30 to-transparent shadow-[0_0_35px_rgba(168,85,247,0.25)]'
              : 'border-cyan-400/30 bg-gradient-to-r from-cyan-900/40 via-cyan-900/15 to-transparent shadow-[0_0_35px_rgba(34,211,238,0.12)]'
          }`}>
            <div className={`animate-clock-pulse flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border ${
              isYourTurn ? 'border-purple-400/50 bg-purple-400/15 text-purple-200' : 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200'
            }`}>
              {clockTeam.icon ? <clockTeam.icon size={26} /> : <Clock size={26} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 font-mono">
                <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${isYourTurn ? 'text-purple-300' : 'text-cyan-400/80'}`}>
                  {isYourTurn ? '>> You are on the clock <<' : 'On the clock'}
                </span>
                <span className="text-[10px] text-white/40">
                  RD {currentPick.round}.{String(currentPick.pickInRound).padStart(2, '0')}
                </span>
              </div>
              <p className="text-2xl font-black leading-tight truncate text-white">
                {clockTeam.name} <span className="text-sm font-medium text-white/50">({clockTeam.owner})</span>
              </p>
            </div>
            {onDeckTeam && (
              <div className="hidden sm:flex flex-col items-end flex-shrink-0 border-l border-white/10 pl-5 font-mono">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">On deck</span>
                <span className="text-sm font-bold text-white/80 truncate max-w-[160px]">{onDeckTeam.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Pick tracker strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {draftPicks.map(pick => {
            const isCurrent = pick.id === draftOrder.length + 1
            const isUsed = pick.id <= draftOrder.length
            const entry = isUsed ? draftOrder[pick.id - 1] : null
            const name = entry ? prospects.find(p => p.id === entry.playerId)?.name : null
            const team = getTeamById(pick.currentTeamId)
            return (
              <div
                key={pick.id}
                className={`flex-shrink-0 flex flex-col px-2.5 py-1.5 rounded-lg border font-mono leading-tight min-w-[92px] ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-400/15 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                    : isUsed
                      ? 'border-white/10 bg-white/[0.03] text-white/40'
                      : 'border-white/15 bg-white/[0.06] text-white/70'
                }`}
              >
                <span className="text-[9px] font-bold tabular-nums opacity-70">{pick.round}.{String(pick.pickInRound).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold truncate max-w-[110px]">{team?.owner?.split(',')[0] || team?.name}</span>
                {name && <span className="text-[9px] truncate max-w-[110px] opacity-70">{name}</span>}
              </div>
            )
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          {/* Big board */}
          <Panel title="Big Board · Available Prospects" icon={Activity}>
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-cyan-400/10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-white/[0.04] flex-1 min-w-[180px]">
                <Search size={13} className="text-cyan-400/60" />
                <input
                  type="text"
                  placeholder="Scan prospects..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-white/30 font-mono"
                />
              </div>
              <div className="flex gap-1">
                {positions.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setFilterPosition(pos)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase border transition-colors ${
                      filterPosition === pos
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-100'
                        : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[52vh] overflow-y-auto fancy-scroll divide-y divide-white/5">
              {availableProspects.map(prospect => (
                <div key={prospect.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-400/[0.06] transition-colors group">
                  <span className="w-8 text-right font-mono text-xs text-cyan-400/60 tabular-nums flex-shrink-0">
                    {prospect.rank ? `#${prospect.rank}` : '—'}
                  </span>
                  <PosBadge position={prospect.position} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-sm font-bold text-white truncate">{prospect.name}</p>
                    <p className="text-[10px] text-white/40 font-mono truncate">{prospect.nflTeam || prospect.college}</p>
                  </div>
                  {canPick ? (
                    <button
                      onClick={() => handlePick(prospect.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider font-mono transition-all ${
                        isYourTurn
                          ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-[#050914] shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      }`}
                    >
                      Draft
                      <ChevronRight size={12} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-white/25 font-mono italic pr-1">standby</span>
                  )}
                </div>
              ))}
              {availableProspects.length === 0 && (
                <p className="text-center text-white/30 text-sm font-mono py-10">No targets on scanner</p>
              )}
            </div>
          </Panel>

          <div className="space-y-4">
            {/* Pick feed */}
            <Panel title="Pick Telemetry" icon={Radio}>
              <div ref={feedRef} className="max-h-[30vh] overflow-y-auto fancy-scroll divide-y divide-white/5">
                {[...draftOrder].reverse().map(entry => {
                  const player = prospects.find(p => p.id === entry.playerId)
                  const team = getTeamById(entry.teamId)
                  return (
                    <div key={entry.pickNumber} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-cyan-400/60 tabular-nums w-6">{String(entry.pickNumber).padStart(2, '0')}</span>
                        {player && <PosBadge position={player.position} />}
                        <span className="text-xs font-bold text-white truncate">{player?.name}</span>
                      </div>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5 pl-8 truncate">→ {team?.name}</p>
                      {entry.reason && <p className="text-[10px] text-white/30 mt-0.5 pl-8 leading-snug">{entry.reason}</p>}
                    </div>
                  )
                })}
                {draftOrder.length === 0 && (
                  <p className="text-center text-white/30 text-xs font-mono py-8">Awaiting first transmission…</p>
                )}
              </div>
            </Panel>

            {/* War room (mock only) */}
            {isMock && mockTeamId && (
              <Panel title="Your War Room" icon={Sparkles}>
                <div className="max-h-[22vh] overflow-y-auto fancy-scroll divide-y divide-white/5">
                  {myPicks.map(entry => (
                    <div key={entry.pickNumber} className="flex items-center gap-2 px-4 py-2">
                      <span className="font-mono text-[10px] text-purple-300/70 tabular-nums w-6">{String(entry.pickNumber).padStart(2, '0')}</span>
                      {entry.player && <PosBadge position={entry.player.position} />}
                      <span className="text-xs font-bold text-white truncate">{entry.player?.name}</span>
                    </div>
                  ))}
                  {myPicks.length === 0 && (
                    <p className="text-center text-white/30 text-xs font-mono py-6">No selections yet</p>
                  )}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DraftRecap({ isMock, teams, prospects, draftOrder, draftPicks, mockTeamId, getTeamById, onExit, onBack }) {
  const picksWithMeta = useMemo(
    () => draftOrder.map(e => ({ ...e, player: prospects.find(p => p.id === e.playerId), team: getTeamById(e.teamId) })),
    [draftOrder, prospects, getTeamById]
  )

  const steals = useMemo(
    () =>
      picksWithMeta
        .filter(e => e.player?.rank)
        .map(e => ({ ...e, delta: e.pickNumber - e.player.rank }))
        .filter(e => e.delta > 0)
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 3),
    [picksWithMeta]
  )

  const teamsWithPicks = teams
    .map(team => ({ team, picks: picksWithMeta.filter(e => e.teamId === team.id) }))
    .filter(t => t.picks.length > 0)

  const isComplete = draftPicks.length > 0 && draftOrder.length >= draftPicks.length

  return (
    <div className="fixed inset-0 z-[195] bg-[#050914] text-cyan-50 overflow-y-auto dc-grid">
      <div className="pointer-events-none fixed inset-0 dc-scanline" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 font-mono">
            <Trophy size={14} className="text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-200">
              {isComplete ? 'Mission Complete' : 'Draft Debrief'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
            {isMock ? 'MOCK DRAFT RECAP' : 'DRAFT RECAP'}
          </h1>
          <p className="text-sm text-white/50 font-mono">
            {draftOrder.length} of {draftPicks.length} selections logged
          </p>
        </div>

        {steals.length > 0 && (
          <Panel title="Biggest Steals" icon={Sparkles}>
            <div className="divide-y divide-white/5">
              {steals.map(e => (
                <div key={e.pickNumber} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-mono text-xs text-cyan-400/60 tabular-nums w-10">{String(e.pickNumber).padStart(2, '0')}</span>
                  {e.player && <PosBadge position={e.player.position} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{e.player?.name}</p>
                    <p className="text-[10px] text-white/40 font-mono truncate">→ {e.team?.name}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-1 rounded-md border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 text-[10px] font-black font-mono">
                    +{e.delta} value
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamsWithPicks.map(({ team, picks }) => (
            <Panel
              key={team.id}
              title={`${team.name}${isMock && team.id === mockTeamId ? ' · You' : ''}`}
              icon={team.icon}
              className={isMock && team.id === mockTeamId ? 'ring-1 ring-purple-400/40' : ''}
            >
              <div className="divide-y divide-white/5">
                {picks.map(e => (
                  <div key={e.pickNumber} className="flex items-center gap-2.5 px-4 py-2">
                    <span className="font-mono text-[10px] text-cyan-400/60 tabular-nums w-6">{String(e.pickNumber).padStart(2, '0')}</span>
                    {e.player && <PosBadge position={e.player.position} />}
                    <span className="text-xs font-bold text-white truncate">{e.player?.name}</span>
                    {e.player?.rank && <span className="ml-auto text-[10px] text-white/30 font-mono">#{e.player.rank}</span>}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <Panel title="Full Pick-by-Pick Log" icon={Activity}>
          <div className="max-h-[40vh] overflow-y-auto fancy-scroll divide-y divide-white/5">
            {picksWithMeta.map(e => (
              <div key={e.pickNumber} className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-cyan-400/60 tabular-nums w-6">{String(e.pickNumber).padStart(2, '0')}</span>
                  {e.player && <PosBadge position={e.player.position} />}
                  <span className="text-xs font-bold text-white">{e.player?.name}</span>
                  <span className="text-[10px] text-white/40 font-mono">→ {e.team?.name}</span>
                </div>
                {e.reason && <p className="text-[10px] text-white/30 mt-0.5 pl-8 leading-snug">{e.reason}</p>}
              </div>
            ))}
            {picksWithMeta.length === 0 && (
              <p className="text-center text-white/30 text-sm font-mono py-8">No picks were made</p>
            )}
          </div>
        </Panel>

        <div className="flex items-center justify-center gap-3 pb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-200 text-sm font-black uppercase tracking-wider font-mono transition-colors"
            >
              <Play size={15} />
              Back to Draft
            </button>
          )}
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-black uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:scale-105 active:scale-95 transition-transform"
          >
            <X size={15} />
            {isMock ? 'Save & Exit Mock' : 'Exit Draft Center'}
          </button>
        </div>
      </div>
    </div>
  )
}
