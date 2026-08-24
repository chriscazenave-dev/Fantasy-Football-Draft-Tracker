import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Play, Pause, X, RotateCcw, Minimize2, Newspaper, Clock, Trophy, Feather, ChevronRight, Sparkles } from 'lucide-react'
import { formatTime } from './draftLogic'

const POSITION_COLORS = {
  QB: 'text-rose-900 border-rose-900/50 bg-rose-900/5',
  RB: 'text-emerald-900 border-emerald-900/50 bg-emerald-900/5',
  WR: 'text-sky-900 border-sky-900/50 bg-sky-900/5',
  TE: 'text-amber-900 border-amber-900/50 bg-amber-900/5',
}

function PosBadge({ position }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${POSITION_COLORS[position] || 'text-[var(--ink)] border-[var(--rule-strong)]/50 bg-[#5a4a32]/5'}`}>
      {position}
    </span>
  )
}

function Panel({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`border-2 border-[var(--rule-strong)] bg-[var(--paper)] overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-[var(--rule-strong)] bg-[var(--paper-3)]">
        {Icon && <Icon size={13} className="text-[var(--ink-soft)]" />}
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--ink-soft)]">{title}</span>
      </div>
      {children}
    </div>
  )
}

// Full-screen "Draft Desk" overlay where the draft actually runs, styled as a
// special live edition of the league newspaper. Live phase shows the clock,
// big board, and wire feed; recap phase prints the morning-after edition.
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
    <div className="fixed inset-0 z-[195] bg-[var(--paper-2)] text-[var(--ink)] font-serif overflow-y-auto">
      {/* Masthead */}
      <div className="sticky top-0 z-20 border-b-4 border-double border-[var(--rule-strong)] bg-[var(--paper-2)]/95 backdrop-blur">
        <div className="max-w-[1500px] mx-auto px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 border-2 border-[var(--rule-strong)] bg-[var(--paper-3)]">
              <Newspaper size={18} className="text-[var(--ink-soft)]" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-black tracking-tight">The Draft Desk</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full animate-dc-blink ${isMock ? 'bg-[#8a7a5c]' : 'bg-[#8b2f2f]'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-[0.25em] ${isMock ? 'text-[var(--ink-muted)]' : 'text-[var(--accent-red)]'}`}>
                  {isMock ? 'Mock Edition' : 'Live Edition'}{isPaused ? ' · Presses Paused' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-[var(--ink-muted)]">Pick</span>
            <span className="text-lg font-black tabular-nums">{String(draftOrder.length + 1).padStart(2, '0')}</span>
            <span className="text-[var(--ink-muted)]">of</span>
            <span className="text-sm text-[var(--ink-muted)] tabular-nums">{draftPicks.length}</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 border-2 tabular-nums ${
            timerDanger ? 'border-[var(--accent-red)] bg-[#8b2f2f]/10 text-[var(--accent-red)] animate-dc-blink' : timerWarn ? 'border-amber-700 bg-amber-700/10 text-amber-800' : 'border-[var(--rule-strong)] bg-[var(--paper-3)] text-[var(--ink)]'
          }`}>
            <Clock size={14} />
            <span className="text-xl font-black">{formatTime(timeRemaining)}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {(isAdmin || isMock) && (
              <button
                onClick={onPauseToggle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--rule-strong)] bg-[var(--paper-3)] hover:bg-[var(--paper-4)] text-[var(--ink)] text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            {!isMock && isAdmin && (
              <button
                onClick={onRestart}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--accent-red)] bg-[#8b2f2f]/10 hover:bg-[#8b2f2f]/20 text-[var(--accent-red)] text-[11px] font-bold uppercase tracking-widest transition-colors"
              >
                <RotateCcw size={13} />
                Restart
              </button>
            )}
            <button
              onClick={() => setPhase('recap')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--rule-strong)] bg-[#2b2418] hover:bg-[#463b28] text-[#f3ecdb] text-[11px] font-bold uppercase tracking-widest transition-colors"
            >
              <Trophy size={13} />
              {isMock ? 'End & Recap' : 'Recap'}
            </button>
            <button
              onClick={onMinimize}
              title="Return to site (draft keeps running)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-[var(--rule)] bg-[var(--paper)] hover:bg-[var(--paper-3)] text-[var(--ink-muted)] text-[11px] font-bold uppercase tracking-widest transition-colors"
            >
              <Minimize2 size={13} />
              Minimize
            </button>
          </div>
        </div>
        <p className="text-center text-[9px] uppercase tracking-[0.35em] text-[var(--ink-muted)] pb-1.5">
          The Dynasty Madness Times · Special Draft Coverage · All the picks fit to print
        </p>
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 py-4 space-y-4">
        {/* On the clock hero */}
        {clockTeam && (
          <div className={`relative overflow-hidden border-y-4 border-double px-6 py-4 flex flex-wrap items-center gap-5 ${
            isYourTurn ? 'border-[var(--accent-red)] bg-[#8b2f2f]/5' : 'border-[var(--rule-strong)] bg-[var(--paper-3)]'
          }`}>
            <div className={`animate-clock-pulse flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 ${
              isYourTurn ? 'border-[var(--accent-red)] bg-[#8b2f2f]/10 text-[var(--accent-red)]' : 'border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--ink-soft)]'
            }`}>
              {clockTeam.icon ? <clockTeam.icon size={26} /> : <Clock size={26} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${isYourTurn ? 'text-[var(--accent-red)]' : 'text-[var(--ink-muted)]'}`}>
                  {isYourTurn ? 'Stop the presses — you are on the clock' : 'Now on the clock'}
                </span>
                <span className="text-[10px] text-[var(--ink-muted)]">
                  Rd {currentPick.round}.{String(currentPick.pickInRound).padStart(2, '0')}
                </span>
              </div>
              <p className="text-3xl font-black leading-tight truncate">
                {clockTeam.name} <span className="text-sm font-medium text-[var(--ink-muted)] italic">({clockTeam.owner})</span>
              </p>
            </div>
            {onDeckTeam && (
              <div className="hidden sm:flex flex-col items-end flex-shrink-0 border-l-2 border-[var(--rule)] pl-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--ink-muted)]">On deck</span>
                <span className="text-sm font-bold truncate max-w-[160px]">{onDeckTeam.name}</span>
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
                className={`flex-shrink-0 flex flex-col px-2.5 py-1.5 border leading-tight min-w-[92px] ${
                  isCurrent
                    ? 'border-2 border-[var(--ink)] bg-[#2b2418] text-[#f3ecdb]'
                    : isUsed
                      ? 'border-[var(--rule)] bg-[var(--paper-3)] text-[var(--ink-muted)]'
                      : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)]'
                }`}
              >
                <span className="text-[9px] font-bold tabular-nums opacity-70">{pick.round}.{String(pick.pickInRound).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold truncate max-w-[110px]">{team?.owner?.split(',')[0] || team?.name}</span>
                {name && <span className="text-[9px] truncate max-w-[110px] opacity-70 italic">{name}</span>}
              </div>
            )
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
          {/* Big board */}
          <Panel title="The Big Board · Available Prospects" icon={Feather}>
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-[var(--rule)]">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-[var(--rule)] bg-[var(--paper-2)] flex-1 min-w-[180px]">
                <Search size={13} className="text-[var(--ink-muted)]" />
                <input
                  type="text"
                  placeholder="Search the wire..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm w-full placeholder-[var(--ink-muted)]/60"
                />
              </div>
              <div className="flex gap-1">
                {positions.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setFilterPosition(pos)}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      filterPosition === pos
                        ? 'border-[var(--ink)] bg-[#2b2418] text-[#f3ecdb]'
                        : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[52vh] overflow-y-auto fancy-scroll divide-y divide-[var(--paper-5)]">
              {availableProspects.map(prospect => (
                <div key={prospect.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--paper-3)] transition-colors group">
                  <span className="w-8 text-right text-xs text-[var(--ink-muted)] tabular-nums flex-shrink-0">
                    {prospect.rank ? `#${prospect.rank}` : '—'}
                  </span>
                  <PosBadge position={prospect.position} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-sm font-bold truncate">{prospect.name}</p>
                    <p className="text-[10px] text-[var(--ink-muted)] italic truncate">{prospect.nflTeam || prospect.college}</p>
                  </div>
                  {canPick ? (
                    <button
                      onClick={() => handlePick(prospect.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 border-2 text-[11px] font-black uppercase tracking-widest transition-colors ${
                        isYourTurn
                          ? 'border-[var(--accent-red)] bg-[#8b2f2f] hover:bg-[#a33939] text-[#f3ecdb]'
                          : 'border-[var(--ink)] bg-[#2b2418] hover:bg-[#463b28] text-[#f3ecdb]'
                      }`}
                    >
                      Draft
                      <ChevronRight size={12} />
                    </button>
                  ) : (
                    <span className="text-[10px] text-[var(--ink-muted)]/60 italic pr-1">awaiting desk</span>
                  )}
                </div>
              ))}
              {availableProspects.length === 0 && (
                <p className="text-center text-[var(--ink-muted)] text-sm italic py-10">Nothing on the wire</p>
              )}
            </div>
          </Panel>

          <div className="space-y-4">
            {/* Pick feed */}
            <Panel title="Off the Wire · Latest Picks" icon={Newspaper}>
              <div ref={feedRef} className="max-h-[30vh] overflow-y-auto fancy-scroll divide-y divide-[var(--paper-5)]">
                {[...draftOrder].reverse().map(entry => {
                  const player = prospects.find(p => p.id === entry.playerId)
                  const team = getTeamById(entry.teamId)
                  return (
                    <div key={entry.pickNumber} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--ink-muted)] tabular-nums w-6">{String(entry.pickNumber).padStart(2, '0')}</span>
                        {player && <PosBadge position={player.position} />}
                        <span className="text-xs font-bold truncate">{player?.name}</span>
                      </div>
                      <p className="text-[10px] text-[var(--ink-muted)] mt-0.5 pl-8 truncate">to {team?.name}</p>
                      {entry.reason && <p className="text-[10px] text-[var(--ink-muted)]/80 italic mt-0.5 pl-8 leading-snug">{entry.reason}</p>}
                    </div>
                  )
                })}
                {draftOrder.length === 0 && (
                  <p className="text-center text-[var(--ink-muted)] text-xs italic py-8">The wire is quiet… for now</p>
                )}
              </div>
            </Panel>

            {/* War room (mock only) */}
            {isMock && mockTeamId && (
              <Panel title="Your Column · Selections" icon={Sparkles}>
                <div className="max-h-[22vh] overflow-y-auto fancy-scroll divide-y divide-[var(--paper-5)]">
                  {myPicks.map(entry => (
                    <div key={entry.pickNumber} className="flex items-center gap-2 px-4 py-2">
                      <span className="text-[10px] text-[var(--ink-muted)] tabular-nums w-6">{String(entry.pickNumber).padStart(2, '0')}</span>
                      {entry.player && <PosBadge position={entry.player.position} />}
                      <span className="text-xs font-bold truncate">{entry.player?.name}</span>
                    </div>
                  ))}
                  {myPicks.length === 0 && (
                    <p className="text-center text-[var(--ink-muted)] text-xs italic py-6">No selections filed yet</p>
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
    <div className="fixed inset-0 z-[195] bg-[var(--paper-2)] text-[var(--ink)] font-serif overflow-y-auto">
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3 border-y-4 border-double border-[var(--rule-strong)] py-6 bg-[var(--paper-3)]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[var(--rule-strong)] bg-[var(--paper)]">
            <Trophy size={14} className="text-[#8b6f2f]" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--ink-soft)]">
              {isComplete ? 'Final Edition' : 'Draft Debrief'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            {isMock ? 'The Mock Draft Recap' : 'The Draft Recap'}
          </h1>
          <p className="text-sm text-[var(--ink-muted)] uppercase tracking-[0.25em]">
            {draftOrder.length} of {draftPicks.length} selections filed to print
          </p>
        </div>

        {steals.length > 0 && (
          <Panel title="Biggest Steals" icon={Sparkles}>
            <div className="divide-y divide-[var(--paper-5)]">
              {steals.map(e => (
                <div key={e.pickNumber} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-[var(--ink-muted)] tabular-nums w-10">{String(e.pickNumber).padStart(2, '0')}</span>
                  {e.player && <PosBadge position={e.player.position} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{e.player?.name}</p>
                    <p className="text-[10px] text-[var(--ink-muted)] italic truncate">to {e.team?.name}</p>
                  </div>
                  <span className="flex-shrink-0 px-2 py-1 border border-emerald-900/50 bg-emerald-900/5 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
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
              className={isMock && team.id === mockTeamId ? 'ring-2 ring-[var(--accent-red)]/50' : ''}
            >
              <div className="divide-y divide-[var(--paper-5)]">
                {picks.map(e => (
                  <div key={e.pickNumber} className="flex items-center gap-2.5 px-4 py-2">
                    <span className="text-[10px] text-[var(--ink-muted)] tabular-nums w-6">{String(e.pickNumber).padStart(2, '0')}</span>
                    {e.player && <PosBadge position={e.player.position} />}
                    <span className="text-xs font-bold truncate">{e.player?.name}</span>
                    {e.player?.rank && <span className="ml-auto text-[10px] text-[var(--ink-muted)]">#{e.player.rank}</span>}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <Panel title="Full Pick-by-Pick Log" icon={Feather}>
          <div className="max-h-[40vh] overflow-y-auto fancy-scroll divide-y divide-[var(--paper-5)]">
            {picksWithMeta.map(e => (
              <div key={e.pickNumber} className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-[var(--ink-muted)] tabular-nums w-6">{String(e.pickNumber).padStart(2, '0')}</span>
                  {e.player && <PosBadge position={e.player.position} />}
                  <span className="text-xs font-bold">{e.player?.name}</span>
                  <span className="text-[10px] text-[var(--ink-muted)]">to {e.team?.name}</span>
                </div>
                {e.reason && <p className="text-[10px] text-[var(--ink-muted)]/80 italic mt-0.5 pl-8 leading-snug">{e.reason}</p>}
              </div>
            ))}
            {picksWithMeta.length === 0 && (
              <p className="text-center text-[var(--ink-muted)] text-sm italic py-8">No picks were made</p>
            )}
          </div>
        </Panel>

        <div className="flex items-center justify-center gap-3 pb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--rule-strong)] bg-[var(--paper-3)] hover:bg-[var(--paper-4)] text-[var(--ink)] text-sm font-black uppercase tracking-widest transition-colors"
            >
              <Play size={15} />
              Back to Draft
            </button>
          )}
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[var(--ink)] bg-[#2b2418] hover:bg-[#463b28] text-[#f3ecdb] text-sm font-black uppercase tracking-widest transition-colors"
          >
            <X size={15} />
            {isMock ? 'Save & Exit Mock' : 'Exit Draft Center'}
          </button>
        </div>
      </div>
    </div>
  )
}
