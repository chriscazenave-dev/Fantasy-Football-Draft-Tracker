import { Fragment, useState, useEffect, useMemo, useRef } from 'react'
import { Upload, Users, ChevronDown, Check, X, UserCircle, ArrowRightLeft, Edit2, ListOrdered, Search, Shield, Zap, Flame, Star, Crown, Anchor, Target, Hexagon, Play, Pause, RotateCcw, Clock, FileText, LogOut, LogIn, Sparkles, Newspaper, ChevronRight } from 'lucide-react'
import Ably from 'ably'
import FutureDraftPicks from './FutureDraftPicks'
import DraftHype from './DraftHype'
import NewspaperPage from './NewspaperPage'
import RostersPage from './RostersPage'
import { ROOKIE_DETAILS } from './rookieDetailData'
import { VETERAN_ROSTERS, ROOKIE_PROSPECTS } from './leagueData'
import { INITIAL_LINEUPS } from './lineupData'
import { INITIAL_PICK_DATA, INITIAL_FOOTNOTES, OWNERS, ROUNDS, DRAFT_SLOT_ORDER, OWNER_TO_TEAM_ID, TEAM_ID_TO_OWNER } from './futurePicksData'
import MockDraftHistory from './MockDraftHistory'
import DraftPickCelebration from './DraftPickCelebration'
import DraftCenter from './DraftCenter'
import CollegeStatsTooltip from './CollegeStatsTooltip'
import UploadPage from './UploadPage'
import { generatePicksFromFutureData, formatTime, filterProspects, pickCpuPlayerSmart, loadStored, saveStored, STORAGE_KEYS, computeTradeSideValue, getTradeVerdict } from './draftLogic'
import { PLAYER_VALUES } from './playerValuesData'
import { fetchLeagueState, saveLeagueState } from './leagueState'

const INITIAL_TEAMS = [
  { id: 1, name: 'The Evil Empire', owner: 'jmo morgan', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 2, name: 'Whatever who cares', owner: 'Sam Bowlin', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 3, name: 'Suave Shaheed', owner: 'Nick Casey', icon: Flame, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 4, name: 'Teddy Bongwater', owner: 'Dylan McElroy', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 5, name: 'Team Faircloth', owner: 'Zachary Faircloth, Steven Lambou', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 6, name: 'Team caz', owner: 'chris caz', icon: Anchor, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 7, name: "Hoidus' Hemmroid", owner: 'Perri Prevost', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 8, name: 'Cheznovs Abduction', owner: 'Austin Dedon', icon: Hexagon, color: 'text-cyan-500', bg: 'bg-cyan-50' },
]

const DRAFT_YEAR = 2026

const PLAYER_VALUE_MAP = new Map(PLAYER_VALUES.map(p => [p.name, p.value]))

const VERDICT_STYLES = {
  even: 'bg-gray-100 text-gray-700 border-gray-200',
  fair: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  win: 'bg-blue-50 text-blue-700 border-blue-200',
  fleece: 'bg-amber-50 text-amber-700 border-amber-200',
  robbery: 'bg-red-50 text-red-700 border-red-200',
}

function App({ session, onLogout, onRequestLogin }) {
  const isAdmin = !!session?.isAdmin
  const isLoggedIn = !!session
  const [storedDraftState] = useState(() => loadStored(STORAGE_KEYS.draftState, null))
  const [activeTab, setActiveTab] = useState('home')
  const [lineups, setLineups] = useState(INITIAL_LINEUPS)
  const [prospects, setProspects] = useState(ROOKIE_PROSPECTS)
  const [hoveredProspect, setHoveredProspect] = useState(null)
  const [expandedProspectId, setExpandedProspectId] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [teams] = useState(INITIAL_TEAMS)
  const [rosters, setRosters] = useState(VETERAN_ROSTERS)
  const [draftedPlayers, setDraftedPlayers] = useState(() => storedDraftState?.draftedPlayers ?? {})
  const [draftOrder, setDraftOrder] = useState(() => storedDraftState?.draftOrder ?? [])
  const [openDropdown, setOpenDropdown] = useState(null)
  const [filterPosition, setFilterPosition] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDraftActive, setIsDraftActive] = useState(() => !!storedDraftState?.isMockDraft)
  const [isPaused, setIsPaused] = useState(() => !!storedDraftState?.isMockDraft)
  const [timeRemaining, setTimeRemaining] = useState(120)
  const timerRef = useRef(null)
  const [hypeMode, setHypeMode] = useState(null)
  const [showDraftCenter, setShowDraftCenter] = useState(() => !!storedDraftState?.showDraftCenter)
  const [isMockDraft, setIsMockDraft] = useState(() => !!storedDraftState?.isMockDraft)
  const [mockTeamId, setMockTeamId] = useState(() => storedDraftState?.mockTeamId ?? null)
  const mockSnapshotRef = useRef(storedDraftState?.mockSnapshot ?? null)
  const [mockHistory, setMockHistory] = useState(() => loadStored(STORAGE_KEYS.mockHistory, []))
  const [futurePickData, setFuturePickData] = useState(INITIAL_PICK_DATA)
  const [footnotes, setFootnotes] = useState(INITIAL_FOOTNOTES)
  const [futureTradeFrom, setFutureTradeFrom] = useState(null)
  const [futureTradeTo, setFutureTradeTo] = useState(null)
  const [selectedFuturePicks, setSelectedFuturePicks] = useState([])
  const [selectedFuturePicksTo, setSelectedFuturePicksTo] = useState([])
  const [selectedPlayersFrom, setSelectedPlayersFrom] = useState([])
  const [selectedPlayersTo, setSelectedPlayersTo] = useState([])
  const [futureTradeNote, setFutureTradeNote] = useState('')
  const [celebration, setCelebration] = useState(null)
  const [tradeToast, setTradeToast] = useState(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const versionRef = useRef(0)
  const skipSaveRef = useRef(false)
  const saveTimerRef = useRef(null)
  const isMockRef = useRef(false)
  const FUTURE_YEARS = [2026, 2027, 2028]

  useEffect(() => {
    isMockRef.current = isMockDraft
  }, [isMockDraft])

  const applyRemoteState = (state, { skipDraftFields = false } = {}) => {
    if (!state) return
    skipSaveRef.current = true
    if (state.lineups) setLineups(state.lineups)
    if (state.rosters) setRosters(state.rosters)
    if (state.prospects) setProspects(state.prospects)
    if (!skipDraftFields) {
      if (state.draftedPlayers) setDraftedPlayers(state.draftedPlayers)
      if (state.draftOrder) setDraftOrder(state.draftOrder)
    }
    if (state.futurePickData) setFuturePickData(state.futurePickData)
    if (state.footnotes) setFootnotes(state.footnotes)
  }

  const refreshFromServer = () => {
    fetchLeagueState()
      .then(({ state, version }) => {
        if (isMockRef.current) return
        if (version >= versionRef.current) {
          applyRemoteState(state)
          versionRef.current = version
        }
      })
      .catch(() => {})
  }

  const refreshFromServerRef = useRef(refreshFromServer)
  useEffect(() => {
    refreshFromServerRef.current = refreshFromServer
  })

  // Hydrate shared league state from the server on load
  useEffect(() => {
    let cancelled = false
    fetchLeagueState()
      .then(({ state, version }) => {
        if (cancelled) return
        applyRemoteState(state, { skipDraftFields: isMockRef.current })
        versionRef.current = version
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsHydrated(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Persist league state (debounced). Mock drafts stay local-only.
  useEffect(() => {
    if (!isHydrated || isMockDraft || !isLoggedIn) return
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }
    clearTimeout(saveTimerRef.current)
    const state = { lineups, rosters, prospects, draftedPlayers, draftOrder, futurePickData, footnotes }
    saveTimerRef.current = setTimeout(() => {
      saveLeagueState(state, versionRef.current)
        .then(({ version }) => {
          versionRef.current = Math.max(versionRef.current, version)
        })
        .catch((err) => {
          if (err.status === 409) refreshFromServerRef.current()
        })
    }, 800)
    return () => clearTimeout(saveTimerRef.current)
  }, [isHydrated, isLoggedIn, isMockDraft, lineups, rosters, prospects, draftedPlayers, draftOrder, futurePickData, footnotes])

  // Realtime sync: refetch when another member saves a change
  useEffect(() => {
    const ably = new Ably.Realtime({ authUrl: '/api/ably-token' })
    const channel = ably.channels.get('league-state')
    const onUpdate = (msg) => {
      const version = Number(msg?.data?.version ?? 0)
      if (version <= versionRef.current || isMockRef.current) return
      fetchLeagueState()
        .then(({ state, version: v }) => {
          if (isMockRef.current) return
          if (v > versionRef.current) {
            applyRemoteState(state)
            versionRef.current = v
          }
        })
        .catch(() => {})
    }
    channel.subscribe('update', onUpdate)
    return () => {
      channel.unsubscribe('update', onUpdate)
      ably.close()
    }
  }, [])

  const tooltipWidth = 256

  useEffect(() => {
    saveStored(STORAGE_KEYS.draftState, {
      draftedPlayers,
      draftOrder,
      isMockDraft,
      mockTeamId,
      mockSnapshot: mockSnapshotRef.current,
      showDraftCenter,
    })
  }, [draftedPlayers, draftOrder, isMockDraft, mockTeamId, showDraftCenter])

  useEffect(() => {
    saveStored(STORAGE_KEYS.mockHistory, mockHistory)
  }, [mockHistory])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab])

  useEffect(() => {
    if (!tradeToast) return
    const t = setTimeout(() => setTradeToast(null), 9000)
    return () => clearTimeout(t)
  }, [tradeToast])

  const handleProspectMouseEnter = (prospect, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    let left = rect.left + rect.width / 2 - tooltipWidth / 2
    const top = rect.top - 8

    left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8))

    setTooltipPos({ top, left })
    setHoveredProspect(prospect)
  }

  const handleProspectMouseLeave = () => {
    setHoveredProspect(null)
  }

  const positions= ['All', ...new Set(prospects.map(p => p.position))]

  const getTeamById = (teamId) => teams.find(t => t.id === teamId)

  const getTeamRoster = (teamId) => rosters[teamId] || rosters[String(teamId)] || []

  // Live draft board: 2026 picks in standard (non-snake) order, ownership
  // synced with the Future Picks grid so trades update the board.
  const draftPicks = useMemo(
    () => generatePicksFromFutureData(futurePickData[DRAFT_YEAR], ROUNDS, DRAFT_SLOT_ORDER, OWNERS, OWNER_TO_TEAM_ID),
    [futurePickData]
  )

  const userTeam = session?.team ? teams.find(t => t.name === session.team) : null

  const getCurrentPickNumber = () => draftOrder.length + 1
  const getCurrentPick = () => draftPicks.find(p => p.id === getCurrentPickNumber())

  const handleDraft = (playerId, teamId, reason = null) => {
    const currentPick = getCurrentPick()
    setDraftedPlayers(prev => ({
      ...prev,
      [playerId]: teamId
    }))
    setDraftOrder(prev => [...prev, { playerId, teamId, pickNumber: currentPick?.id || prev.length + 1, reason }])
    setOpenDropdown(null)
    if (isDraftActive) {
      setTimeRemaining(120)
    }
  }

  const POSITION_LABELS = { QB: 'quarterback', RB: 'running back', WR: 'receiver', TE: 'tight end' }

  const describePickFit = (player, teamId) => {
    const rosterPlayers = [
      ...getTeamRoster(teamId),
      ...prospects.filter(p => draftedPlayers[p.id] === teamId),
    ]
    const have = rosterPlayers.filter(p => p.position === player.position).length
    const posLabel = POSITION_LABELS[player.position] || player.position
    const rankTxt = player.rank ? `the #${player.rank} player on the board` : 'a top prospect'
    if (have <= 1) {
      return `You were thin at ${player.position} (${have} rostered) — ${player.name} steps in as ${rankTxt} and an instant contributor at ${posLabel}.`
    }
    if (have <= 3) {
      return `${player.name} deepens your ${player.position} room (now ${have + 1}) and gives you ${rankTxt} to build around.`
    }
    return `A best-player-available luxury pick: ${player.name} is ${rankTxt} and adds premium depth at ${posLabel}.`
  }

  const handleUserMockPick = (playerId, teamId) => {
    const player = prospects.find(p => p.id === playerId)
    const currentPick = getCurrentPick()
    handleDraft(playerId, teamId)
    if (player) {
      setCelebration({
        player,
        detail: ROOKIE_DETAILS[playerId] || null,
        team: getTeamById(teamId),
        pickLabel: currentPick ? `${currentPick.round}.${String(currentPick.pickInRound).padStart(2, '0')}` : null,
        fit: describePickFit(player, teamId),
      })
    }
  }

  const handleAutoPick = () => {
    const currentPick = getCurrentPick()
    if (!currentPick) return
    const team = getTeamById(currentPick.currentTeamId)
    const rosterPlayers = [
      ...getTeamRoster(currentPick.currentTeamId),
      ...prospects.filter(p => draftedPlayers[p.id] === currentPick.currentTeamId),
    ]
    const result = pickCpuPlayerSmart(prospects, draftedPlayers, team, rosterPlayers)
    if (result) {
      handleDraft(result.player.id, currentPick.currentTeamId, `Clock expired — ${result.reason}`)
    }
  }

  const handleStartDraft = () => {
    setHypeMode('real')
  }

  const handleStartMockDraft = () => {
    setMockTeamId(userTeam?.id ?? null)
    setHypeMode('mock')
  }

  const beginDraft = () => {
    const mode = hypeMode
    setHypeMode(null)
    if (mode === 'mock') {
      mockSnapshotRef.current = { draftedPlayers, draftOrder }
      setDraftedPlayers({})
      setDraftOrder([])
      setIsMockDraft(true)
    }
    setIsDraftActive(true)
    setIsPaused(false)
    setTimeRemaining(120)
    setShowDraftCenter(true)
    setActiveTab('prospects')
  }

  const handleEndMockDraft = () => {
    setShowDraftCenter(false)
    if (draftOrder.length > 0) {
      setMockHistory(prev => [
        { id: Date.now(), date: new Date().toISOString(), mockTeamId, picks: draftOrder },
        ...prev,
      ])
    }
    const snapshot = mockSnapshotRef.current
    mockSnapshotRef.current = null
    setIsMockDraft(false)
    setMockTeamId(null)
    setIsDraftActive(false)
    setIsPaused(false)
    setTimeRemaining(120)
    setDraftedPlayers(snapshot?.draftedPlayers ?? {})
    setDraftOrder(snapshot?.draftOrder ?? [])
    refreshFromServer()
  }

  const handlePauseDraft = () => {
    setIsPaused(prev => !prev)
  }

  const handleRestartDraft = () => {
    setIsDraftActive(false)
    setIsPaused(false)
    setTimeRemaining(120)
    setDraftOrder([])
    setDraftedPlayers({})
  }

  useEffect(() => {
    if (isDraftActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isDraftActive, isPaused])

  const draftActionsRef = useRef(null)
  useEffect(() => {
    draftActionsRef.current = { handleAutoPick, handleDraft, draftPicks, prospects, draftedPlayers, draftOrder, teams, getTeamRoster }
  })

  useEffect(() => {
    if (timeRemaining !== 0 || !isDraftActive || isPaused) return
    const timeout = setTimeout(() => draftActionsRef.current.handleAutoPick(), 0)
    return () => clearTimeout(timeout)
  }, [timeRemaining, isDraftActive, isPaused])

  useEffect(() => {
    if (!isMockDraft || !isDraftActive || isPaused) return
    const timeout = setTimeout(() => {
      const { handleDraft: draft, draftPicks: picks, prospects: pool, draftedPlayers: drafted, draftOrder: order, teams: allTeams, getTeamRoster: rosterOf } = draftActionsRef.current
      if (order.length >= picks.length) return
      const currentPick = picks.find(p => p.id === order.length + 1)
      if (!currentPick) return
      if (mockTeamId && currentPick.currentTeamId === mockTeamId) return
      const team = allTeams.find(t => t.id === currentPick.currentTeamId)
      const rosterPlayers = [
        ...rosterOf(currentPick.currentTeamId),
        ...pool.filter(p => drafted[p.id] === currentPick.currentTeamId),
      ]
      const result = pickCpuPlayerSmart(pool, drafted, team, rosterPlayers)
      if (result) draft(result.player.id, currentPick.currentTeamId, result.reason)
    }, 1500)
    return () => clearTimeout(timeout)
  }, [isMockDraft, isDraftActive, isPaused, draftOrder.length, mockTeamId])

  const handleUndraft = (playerId) => {
    setDraftedPlayers(prev => {
      const newState = { ...prev }
      delete newState[playerId]
      return newState
    })
    setDraftOrder(prev => prev.filter(d => d.playerId !== playerId))
  }

  // Future pick helpers
  const getTeamFuturePicks = (teamId) => {
    const ownerName = TEAM_ID_TO_OWNER[teamId]
    if (!ownerName) return []
    const picks = []
    for (const year of FUTURE_YEARS) {
      const yearData = futurePickData[year]
      if (!yearData) continue
      for (const round of ROUNDS) {
        const roundPicks = yearData[round] || []
        roundPicks.forEach((pick, idx) => {
          if (pick.owner === ownerName || OWNER_TO_TEAM_ID[pick.owner] === teamId) {
            picks.push({
              year,
              round,
              ownerIdx: idx,
              originalOwner: OWNERS[idx],
              currentOwner: pick.owner,
              notes: pick.notes,
              key: `${year}|${round}|${idx}`,
            })
          }
        })
      }
    }
    return picks
  }

  const toggleFuturePickSelection = (pickKey) => {
    setSelectedFuturePicks(prev =>
      prev.includes(pickKey)
        ? prev.filter(k => k !== pickKey)
        : [...prev, pickKey]
    )
  }

  const toggleFuturePickSelectionTo = (pickKey) => {
    setSelectedFuturePicksTo(prev =>
      prev.includes(pickKey)
        ? prev.filter(k => k !== pickKey)
        : [...prev, pickKey]
    )
  }

  const togglePlayerSelection = (name) => {
    setSelectedPlayersFrom(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const togglePlayerSelectionTo = (name) => {
    setSelectedPlayersTo(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const handleFuturePickTrade = () => {
    if (!futureTradeFrom || !futureTradeTo) return
    const fromAssets = selectedFuturePicks.length + selectedPlayersFrom.length
    const toAssets = selectedFuturePicksTo.length + selectedPlayersTo.length
    if (fromAssets === 0 && toAssets === 0) return
    const fromOwnerName = TEAM_ID_TO_OWNER[futureTradeFrom]
    const toOwnerName = TEAM_ID_TO_OWNER[futureTradeTo]
    if (!fromOwnerName || !toOwnerName) return

    // Auto-generate footnote for this trade
    const nextFootnoteId = footnotes.length > 0 ? Math.max(...footnotes.map(f => typeof f.id === 'number' ? f.id : 0)) + 1 : 1

    const describePicks = (pickKeys) => pickKeys.map(key => {
      const parts = key.split('|')
      return `${parts[0]} ${parts[1].replace(' Rounder', '')}`
    }).join(', ')

    const describeAssets = (pickKeys, playerNames) => {
      const parts = []
      if (playerNames.length > 0) parts.push(playerNames.join(', '))
      if (pickKeys.length > 0) parts.push(describePicks(pickKeys))
      return parts.join(', ')
    }

    const today = new Date()
    const dateStr = `${today.getMonth() + 1}.${today.getDate()}.${String(today.getFullYear()).slice(2)}`

    let noteText = ''
    if (fromAssets > 0 && toAssets > 0) {
      noteText = `${fromOwnerName} trades ${describeAssets(selectedFuturePicks, selectedPlayersFrom)} to ${toOwnerName} for ${describeAssets(selectedFuturePicksTo, selectedPlayersTo)} - ${dateStr}`
    } else if (fromAssets > 0) {
      noteText = `${fromOwnerName} trades ${describeAssets(selectedFuturePicks, selectedPlayersFrom)} to ${toOwnerName} - ${dateStr}`
    } else {
      noteText = `${toOwnerName} trades ${describeAssets(selectedFuturePicksTo, selectedPlayersTo)} to ${fromOwnerName} - ${dateStr}`
    }
    if (futureTradeNote.trim()) {
      noteText = futureTradeNote.trim() + ' - ' + dateStr
    }

    setFootnotes(prev => [...prev, { id: nextFootnoteId, text: noteText }])

    setFuturePickData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      // Move "From" team's selected picks to "To" team and attach footnote
      for (const pickKey of selectedFuturePicks) {
        const parts = pickKey.split('|')
        const year = Number(parts[0])
        const round = parts[1]
        const idx = Number(parts[2])
        if (next[year]?.[round]?.[idx]) {
          next[year][round][idx].owner = toOwnerName
          next[year][round][idx].notes.push(nextFootnoteId)
        }
      }
      // Move "To" team's selected picks to "From" team and attach footnote
      for (const pickKey of selectedFuturePicksTo) {
        const parts = pickKey.split('|')
        const year = Number(parts[0])
        const round = parts[1]
        const idx = Number(parts[2])
        if (next[year]?.[round]?.[idx]) {
          next[year][round][idx].owner = fromOwnerName
          next[year][round][idx].notes.push(nextFootnoteId)
        }
      }
      return next
    })

    // Move traded players between rosters and clear them from the sender's lineup
    if (selectedPlayersFrom.length > 0 || selectedPlayersTo.length > 0) {
      setRosters(prev => {
        const next = { ...prev }
        const movePlayers = (names, srcId, dstId) => {
          if (names.length === 0) return
          const srcKey = next[srcId] ? srcId : String(srcId)
          const dstKey = next[dstId] ? dstId : String(dstId)
          const src = [...(next[srcKey] || [])]
          const moving = src.filter(p => names.includes(p.name))
          next[srcKey] = src.filter(p => !names.includes(p.name))
          next[dstKey] = [...(next[dstKey] || []), ...moving]
        }
        movePlayers(selectedPlayersFrom, futureTradeFrom, futureTradeTo)
        movePlayers(selectedPlayersTo, futureTradeTo, futureTradeFrom)
        return next
      })
      setLineups(prev => {
        const next = { ...prev }
        const clearFromLineup = (names, teamId) => {
          if (names.length === 0 || !next[teamId]) return
          const starters = { ...next[teamId].starters }
          for (const slot of Object.keys(starters)) {
            if (names.includes(starters[slot])) starters[slot] = null
          }
          next[teamId] = {
            ...next[teamId],
            starters,
            ir: (next[teamId].ir || []).filter(n => !names.includes(n)),
          }
        }
        clearFromLineup(selectedPlayersFrom, futureTradeFrom)
        clearFromLineup(selectedPlayersTo, futureTradeTo)
        return next
      })
    }

    // Detect starters vacated by this trade so we can nudge managers to re-set
    const countVacated = (names, teamId) => {
      const lu = lineups[teamId]
      if (!lu || names.length === 0) return null
      const vacated = Object.values(lu.starters).filter(n => n && names.includes(n)).length
      return vacated > 0 ? { name: getTeamById(teamId)?.name, count: vacated } : null
    }
    const vacatedTeams = [
      countVacated(selectedPlayersFrom, futureTradeFrom),
      countVacated(selectedPlayersTo, futureTradeTo),
    ].filter(Boolean)

    setTradeToast({
      id: Date.now(),
      note: noteText,
      footnoteId: nextFootnoteId,
      vacatedTeams,
    })

    setFutureTradeFrom(null)
    setFutureTradeTo(null)
    setSelectedFuturePicks([])
    setSelectedFuturePicksTo([])
    setSelectedPlayersFrom([])
    setSelectedPlayersTo([])
    setFutureTradeNote('')
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        let data

        if (file.name.endsWith('.json')) {
          data = JSON.parse(text)
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
          data = lines.slice(1).map((line, index) => {
            const values = line.split(',').map(v => v.trim())
            const obj = { id: Date.now() + index }
            headers.forEach((header, i) => {
              obj[header] = values[i] || ''
            })
            return obj
          })
        }

        if (Array.isArray(data) && data.length > 0) {
          setProspects(data.map((p, i) => ({
            id: p.id || Date.now() + i,
            name: p.name || 'Unknown',
            position: p.position || 'N/A',
            college: p.college || 'N/A'
          })))
          setDraftedPlayers({})
          alert(`Successfully loaded ${data.length} prospects!`)
        }
      } catch {
        alert('Error parsing file. Please ensure it is valid JSON or CSV.')
      }
    }
    reader.readAsText(file)
  }

  const filteredProspects = filterProspects(prospects, draftedPlayers, {
    position: filterPosition,
    status: filterStatus,
    query: searchQuery,
  })

  const tabs = [
    { id: 'home', label: 'Paper', icon: Newspaper },
    { id: 'prospects', label: 'Draft', icon: ListOrdered },
    { id: 'teams', label: 'Rosters', icon: UserCircle },
    { id: 'trades', label: 'Trades', icon: ArrowRightLeft },
    { id: 'futurePicks', label: 'Future Picks', mobileLabel: 'Picks', icon: FileText },
    ...(isAdmin ? [{ id: 'upload', label: 'Data', icon: Upload }] : []),
  ]

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-[#faf8f3] text-[#211d16] font-sans selection:bg-amber-500/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#faf8f3]/85 backdrop-blur-xl border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Dynasty Madness logo" className="w-8 h-8 rounded-xl shadow-md" />
            <h1 className="text-xl font-semibold tracking-tight">Dynasty<span className="text-gray-400"> Madness</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex bg-gray-100 p-1 rounded-lg border border-gray-200 backdrop-blur-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-black shadow-sm ring-1 ring-black/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {session && (
              <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
                <UserCircle size={16} className="text-gray-400" />
                {session.name || session.username}
                {isAdmin && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-md">Admin</span>
                )}
              </span>
            )}
            {onLogout ? (
              <button
                onClick={onLogout}
                title="Log out"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg border border-gray-200 hover:text-gray-900 hover:bg-gray-200/70 transition-colors duration-200"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            ) : (
              <button
                onClick={onRequestLogin}
                title="Sign in"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200 shadow-sm"
              >
                <LogIn size={14} />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#faf8f3]/95 backdrop-blur-xl border-t border-gray-200">
        <div className="flex justify-around items-stretch">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-black'
                  : 'text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors duration-200 ${
                activeTab === tab.id ? 'bg-black/5' : ''
              }`}>
                <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
              </div>
              <span className={`text-[10px] leading-tight ${
                activeTab === tab.id ? 'font-semibold' : 'font-medium'
              }`}>
                {tab.mobileLabel || tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'home' && <NewspaperPage teams={teams} draftedPlayers={draftedPlayers} />}

        {activeTab === 'prospects' && (
          <div className="space-y-6">
            {/* Draft Order Display */}
            <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                  <ListOrdered size={16} className="text-blue-500" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900">Draft Order</h3>
                <span className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-500 border border-gray-200">
                  Pick {getCurrentPickNumber()} of {draftPicks.length}
                </span>
                {isDraftActive && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-1.5 ${
                    timeRemaining <= 30 ? 'bg-red-50 text-red-600 border-red-200' : timeRemaining <= 60 ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-green-50 text-green-600 border-green-200'
                  }`}>
                    <Clock size={14} />
                    {formatTime(timeRemaining)}
                  </span>
                )}
                {isMockDraft && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                    Mock Draft{mockTeamId ? ` · ${getTeamById(mockTeamId)?.name}` : ''}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {!isDraftActive ? (
                    <>
                      {isAdmin && (
                        <button
                          onClick={handleStartDraft}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                        >
                          <Play size={14} />
                          Start Draft
                        </button>
                      )}
                      <button
                        onClick={handleStartMockDraft}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                      >
                        <Sparkles size={14} />
                        Mock Draft
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowDraftCenter(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2b2418] hover:bg-[#463b28] text-[#f3ecdb] text-xs font-medium rounded-lg transition-all shadow-sm"
                      >
                        <Zap size={14} />
                        Enter Draft Center
                      </button>
                      {(isAdmin || isMockDraft) && (
                        <button
                          onClick={handlePauseDraft}
                          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all shadow-sm ${
                            isPaused ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          }`}
                        >
                          {isPaused ? <Play size={14} /> : <Pause size={14} />}
                          {isPaused ? 'Resume' : 'Pause'}
                        </button>
                      )}
                      {isMockDraft ? (
                        <button
                          onClick={handleEndMockDraft}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                        >
                          <X size={14} />
                          End Mock Draft
                        </button>
                      ) : (
                        isAdmin && (
                          <button
                            onClick={handleRestartDraft}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                          >
                            <RotateCcw size={14} />
                            Restart Draft
                          </button>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {isDraftActive && (() => {
                const onClock = getCurrentPick()
                if (!onClock) return null
                const clockTeam = getTeamById(onClock.currentTeamId)
                const onDeck = draftPicks.find(p => p.id === onClock.id + 1)
                const onDeckTeam = onDeck ? getTeamById(onDeck.currentTeamId) : null
                const isYou = isMockDraft && onClock.currentTeamId === mockTeamId
                return (
                  <div className={`mb-4 flex items-center gap-4 rounded-2xl px-5 py-3 border shadow-sm ${
                    isYou ? 'bg-purple-600 border-purple-600 text-white' : 'bg-gray-900 border-gray-900 text-white'
                  }`}>
                    <div className="animate-clock-pulse flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-white/15">
                      {clockTeam?.icon ? <clockTeam.icon size={22} /> : <Clock size={22} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                          {isYou ? "You're on the clock" : 'On the clock'}
                        </span>
                        <span className="text-[10px] font-mono text-white/50">
                          Pick {getCurrentPickNumber()} · Rd {onClock.round}.{String(onClock.pickInRound).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-lg font-black leading-tight truncate">
                        {clockTeam?.name} <span className="font-medium text-white/60 text-sm">({TEAM_ID_TO_OWNER[onClock.currentTeamId]})</span>
                      </p>
                    </div>
                    {onDeckTeam && (
                      <div className="hidden sm:flex flex-col items-end flex-shrink-0 border-l border-white/15 pl-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">On deck</span>
                        <span className="text-sm font-semibold text-white/80 truncate max-w-[140px]">{onDeckTeam.name}</span>
                      </div>
                    )}
                  </div>
                )
              })()}

              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 pr-4 scrollbar-hide">
                {draftPicks.map((pick) => {
                  const isCurrentPick = pick.id === getCurrentPickNumber()
                  const isUsed = pick.id < getCurrentPickNumber()
                  const isTraded = pick.currentTeamId !== pick.originalTeamId
                  const pickLabel = `${pick.round}.${String(pick.pickInRound).padStart(2, '0')}`
                  const draftedEntry = isUsed ? draftOrder[pick.id - 1] : null
                  const draftedName = draftedEntry ? prospects.find(p => p.id === draftedEntry.playerId)?.name : null

                  return (
                    <Fragment key={pick.id}>
                      {pick.pickInRound === 1 && pick.round > 1 && (
                        <div className="flex-shrink-0 flex items-center gap-2 px-1 self-stretch">
                          <div className="w-px h-8 bg-gray-200"></div>
                        </div>
                      )}
                      <div
                        className={`flex-shrink-0 flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl border transition-colors ${
                          isCurrentPick
                            ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                            : isUsed
                              ? 'bg-gray-50 border-gray-200 text-gray-400'
                              : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      >
                        <span className={`font-mono text-[11px] font-semibold tabular-nums ${isCurrentPick ? 'text-gray-300' : 'text-gray-400'}`}>
                          {pickLabel}
                        </span>
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-semibold whitespace-nowrap">
                            {TEAM_ID_TO_OWNER[pick.currentTeamId]}
                          </span>
                          {isUsed && draftedName ? (
                            <span className="text-[10px] whitespace-nowrap opacity-70">{draftedName}</span>
                          ) : isTraded ? (
                            <span className={`text-[10px] whitespace-nowrap ${isCurrentPick ? 'text-amber-300' : 'text-amber-600'}`}>
                              via {TEAM_ID_TO_OWNER[pick.originalTeamId]}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Fragment>
                  )
                })}
              </div>

              {isMockDraft && draftOrder.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Pick-by-pick recap</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 fancy-scroll">
                    {[...draftOrder].reverse().map(entry => {
                      const player = prospects.find(x => x.id === entry.playerId)
                      const entryTeam = getTeamById(entry.teamId)
                      return (
                        <div key={entry.pickNumber} className="flex items-start gap-2 text-xs">
                          <span className="font-mono text-gray-400 w-7 flex-shrink-0">{entry.pickNumber}.</span>
                          <div>
                            <span className="font-semibold text-gray-900">{player?.name}</span>
                            <span className="text-gray-400"> · {entryTeam?.name} ({TEAM_ID_TO_OWNER[entry.teamId]})</span>
                            {entry.reason && <p className="text-gray-500 mt-0.5">{entry.reason}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 bg-gray-50/80 p-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 px-3 py-1 bg-white rounded-lg border border-gray-200 w-full sm:w-auto">
                <Search size={14} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter prospects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm w-full sm:w-48 text-gray-900 placeholder-gray-400"
                />
              </div>
              
              <div className="hidden sm:block h-6 w-px bg-gray-200"></div>

              <div className="flex gap-3">
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos === 'All' ? 'All Positions' : pos}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Drafted">Drafted</option>
                </select>
              </div>

              <div className="ml-auto px-4 text-sm text-gray-500 font-medium">
                {Object.keys(draftedPlayers).length} <span className="text-gray-300">/</span> {prospects.length} <span className="text-gray-400">Drafted</span>
              </div>
            </div>

            {/* Prospects Table */}
            <div className="bg-gray-50/80 rounded-2xl overflow-hidden border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prospect</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NFL Team</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KTC Value</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProspects.map((prospect) => {
                    const draftedTeam = getTeamById(draftedPlayers[prospect.id])
                    const isDrafted = !!draftedTeam
                    const detail = ROOKIE_DETAILS[prospect.id]
                    const isExpanded = expandedProspectId === prospect.id

                    return (
                      <Fragment key={prospect.id}>
                      <tr
                        className={`group transition-colors duration-200 ${
                          isDrafted ? 'bg-gray-100/50' : 'hover:bg-white'
                        }`}
                        onMouseEnter={(e) => handleProspectMouseEnter(prospect, e)}
                        onMouseLeave={handleProspectMouseLeave}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => detail && setExpandedProspectId(isExpanded ? null : prospect.id)}
                            className={`flex items-center gap-1.5 font-medium text-left ${isDrafted ? 'text-gray-400' : 'text-gray-900'} ${detail ? 'hover:text-blue-600 cursor-pointer' : 'cursor-default'}`}
                          >
                            {detail && (
                              <ChevronRight size={13} className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                            )}
                            {detail?.fullName || prospect.name}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-gray-600 border border-gray-200">
                            {prospect.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{prospect.nflTeam || prospect.college}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{prospect.rank ? `#${prospect.rank}` : '—'}</td>
                        <td className="px-6 py-4 text-sm">
                          {detail?.ktcValue ? (
                            <span className="font-semibold text-gray-800 tabular-nums">{detail.ktcValue.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isDrafted ? (
                            <div className="flex flex-col">
                              <span className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-xs font-medium border ${draftedTeam.bg} border-transparent ${draftedTeam.color.replace('text-', 'text-opacity-90 text-')}`}>
                                <draftedTeam.icon size={12} />
                                {draftedTeam.name}
                              </span>
                              <span className="text-[10px] text-gray-500 ml-2 mt-0.5">({draftedTeam.owner})</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isDrafted ? (
                            (isMockDraft || isLoggedIn) && (
                              <button
                                onClick={() => handleUndraft(prospect.id)}
                                className="invisible group-hover:visible inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={14} />
                                Undraft
                              </button>
                            )
                          ) : isMockDraft && mockTeamId ? (
                            getCurrentPick()?.currentTeamId === mockTeamId ? (
                              <button
                                onClick={() => handleUserMockPick(prospect.id, mockTeamId)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                              >
                                Draft to {getTeamById(mockTeamId)?.name}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 italic pr-2">Waiting…</span>
                            )
                          ) : !isLoggedIn ? (
                            <button
                              onClick={onRequestLogin}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 transition-all"
                            >
                              <LogIn size={12} />
                              Sign in to draft
                            </button>
                          ) : (
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === prospect.id ? null : prospect.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                              >
                                Draft
                                <ChevronDown size={12} className="opacity-70" />
                              </button>
                              
                              {openDropdown === prospect.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setOpenDropdown(null)}
                                  ></div>
                                  <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl bg-white border border-gray-200 shadow-xl ring-1 ring-black/5 focus:outline-none p-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
                                      Select Team
                                    </div>
                                    <div className="max-h-64 overflow-y-auto fancy-scroll">
                                      {teams.map(team => (
                                        <button
                                          key={team.id}
                                          onClick={() => handleDraft(prospect.id, team.id)}
                                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group"
                                        >
                                          <div className={`p-1 rounded-full ${team.bg} ${team.color}`}>
                                            <team.icon size={12} />
                                          </div>
                                          <div className="flex flex-col items-start">
                                            <span className="font-medium">{team.name}</span>
                                            <span className="text-[10px] text-gray-500">({team.owner})</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && detail && (
                        <tr className="bg-blue-50/40">
                          <td colSpan={7} className="px-6 py-5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Profile</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                                  {detail.college && (<><span className="text-gray-500">College</span><span className="font-medium text-gray-900">{detail.college}</span></>)}
                                  {detail.age != null && (<><span className="text-gray-500">Age</span><span className="font-medium text-gray-900">{detail.age}</span></>)}
                                  {detail.height && (<><span className="text-gray-500">Height</span><span className="font-medium text-gray-900">{detail.height}</span></>)}
                                  {detail.weight != null && (<><span className="text-gray-500">Weight</span><span className="font-medium text-gray-900">{detail.weight} lbs</span></>)}
                                  {detail.draftCapital && (<><span className="text-gray-500">NFL Draft</span><span className="font-medium text-gray-900">{detail.draftCapital}</span></>)}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Dynasty Value</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                                  {detail.ktcValue != null && (<><span className="text-gray-500">KTC Value</span><span className="font-semibold text-gray-900">{detail.ktcValue.toLocaleString()}</span></>)}
                                  {detail.ktcRookieRank != null && (<><span className="text-gray-500">KTC Rookie Rank</span><span className="font-medium text-gray-900">#{detail.ktcRookieRank}</span></>)}
                                  {detail.ktcOverallRank != null && (<><span className="text-gray-500">KTC Overall Rank</span><span className="font-medium text-gray-900">#{detail.ktcOverallRank}</span></>)}
                                  {detail.dsRank != null && (<><span className="text-gray-500">DraftSharks Rank</span><span className="font-medium text-gray-900">#{detail.dsRank} (Tier {detail.dsTier})</span></>)}
                                  {detail.dsRookieAdp && (<><span className="text-gray-500">Rookie ADP</span><span className="font-medium text-gray-900">{detail.dsRookieAdp}</span></>)}
                                  {detail.projPtsYear1 != null && (<><span className="text-gray-500">Proj Pts (Yr 1)</span><span className="font-medium text-gray-900">{detail.projPtsYear1}</span></>)}
                                  {detail.projPts3Yr != null && (<><span className="text-gray-500">Proj Pts (3 Yr)</span><span className="font-medium text-gray-900">{detail.projPts3Yr}</span></>)}
                                  {detail.projPts5Yr != null && (<><span className="text-gray-500">Proj Pts (5 Yr)</span><span className="font-medium text-gray-900">{detail.projPts5Yr}</span></>)}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Scouting Report</h4>
                                {detail.scoutingReport ? (
                                  <p className="text-sm text-gray-700 leading-relaxed">{detail.scoutingReport}</p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No scouting report available.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
              {filteredProspects.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium">No prospects found</h3>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {!isMockDraft && (
              <MockDraftHistory
                history={mockHistory}
                teams={teams}
                prospects={prospects}
                onClear={() => setMockHistory([])}
              />
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <RostersPage
            teams={teams}
            rosters={rosters}
            lineups={lineups}
            setLineups={setLineups}
            userTeamId={userTeam?.id ?? null}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onRequestLogin={onRequestLogin}
          />
        )}

        {activeTab === 'trades' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Draft Picks & Trades</h2>
            
            {/* Future Picks Trade Center */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <ArrowRightLeft size={20} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Trade Center</h3>
                  <p className="text-sm text-gray-500">Two-way trades for players and future draft picks (2026–2028) — every trade is logged as a footnote</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A Side */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Team A</label>
                    <select
                      value={futureTradeFrom || ''}
                      onChange={(e) => {
                        setFutureTradeFrom(Number(e.target.value) || null)
                        setSelectedFuturePicks([])
                        setSelectedPlayersFrom([])
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-shadow"
                    >
                      <option value="">Select team...</option>
                      {teams.filter(t => t.id !== futureTradeTo).map(team => (
                        <option key={team.id} value={team.id}>{team.name} ({team.owner})</option>
                      ))}
                    </select>
                  </div>

                  {futureTradeFrom && (
                    <div className="bg-purple-50/50 rounded-xl border border-purple-100 p-4">
                      <label className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-3 block">
                        Picks to send → {futureTradeTo ? teams.find(t => t.id === futureTradeTo)?.name : '...'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getTeamFuturePicks(futureTradeFrom).map(pick => {
                          const isSelected = selectedFuturePicks.includes(pick.key)
                          const isTraded = pick.currentOwner !== pick.originalOwner
                          const roundShort = pick.round.replace(' Rounder', '')
                          return (
                            <button
                              key={pick.key}
                              onClick={() => toggleFuturePickSelection(pick.key)}
                              className={`group relative px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5 ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-500/20'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-[10px] text-gray-400 font-bold">{pick.year}</span>
                              <span className={`text-xs font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>{roundShort}</span>
                              {isTraded && (
                                <span className="text-[9px] text-amber-600 font-medium">via {pick.originalOwner}</span>
                              )}
                              {pick.notes.length > 0 && (
                                <div className="flex gap-0.5">
                                  {pick.notes.map((n, i) => (
                                    <span key={i} className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[8px] font-bold border border-amber-200">{n}</span>
                                  ))}
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      {getTeamFuturePicks(futureTradeFrom).length === 0 && (
                        <p className="text-gray-400 text-sm italic py-2">No future picks available.</p>
                      )}
                      <label className="text-xs font-semibold text-purple-500 uppercase tracking-wider mt-4 mb-2 block">Players to send</label>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 fancy-scroll">
                        {getTeamRoster(futureTradeFrom).map(player => {
                          const isSelected = selectedPlayersFrom.includes(player.name)
                          return (
                            <button
                              key={player.name}
                              onClick={() => togglePlayerSelection(player.name)}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-500/20'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <span>{player.name}</span>
                              <span className={`text-[9px] font-bold ${isSelected ? 'text-purple-500' : 'text-gray-400'}`}>{player.position}</span>
                            </button>
                          )
                        })}
                        {getTeamRoster(futureTradeFrom).length === 0 && (
                          <p className="text-gray-400 text-sm italic py-2">No players on roster.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team B Side */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Team B</label>
                    <select
                      value={futureTradeTo || ''}
                      onChange={(e) => {
                        setFutureTradeTo(Number(e.target.value) || null)
                        setSelectedFuturePicksTo([])
                        setSelectedPlayersTo([])
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
                    >
                      <option value="">Select team...</option>
                      {teams.filter(t => t.id !== futureTradeFrom).map(team => (
                        <option key={team.id} value={team.id}>{team.name} ({team.owner})</option>
                      ))}
                    </select>
                  </div>

                  {futureTradeTo && (
                    <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
                      <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 block">
                        Picks to send → {futureTradeFrom ? teams.find(t => t.id === futureTradeFrom)?.name : '...'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getTeamFuturePicks(futureTradeTo).map(pick => {
                          const isSelected = selectedFuturePicksTo.includes(pick.key)
                          const isTraded = pick.currentOwner !== pick.originalOwner
                          const roundShort = pick.round.replace(' Rounder', '')
                          return (
                            <button
                              key={pick.key}
                              onClick={() => toggleFuturePickSelectionTo(pick.key)}
                              className={`group relative px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-[10px] text-gray-400 font-bold">{pick.year}</span>
                              <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{roundShort}</span>
                              {isTraded && (
                                <span className="text-[9px] text-amber-600 font-medium">via {pick.originalOwner}</span>
                              )}
                              {pick.notes.length > 0 && (
                                <div className="flex gap-0.5">
                                  {pick.notes.map((n, i) => (
                                    <span key={i} className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[8px] font-bold border border-amber-200">{n}</span>
                                  ))}
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      {getTeamFuturePicks(futureTradeTo).length === 0 && (
                        <p className="text-gray-400 text-sm italic py-2">No future picks available.</p>
                      )}
                      <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider mt-4 mb-2 block">Players to send</label>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 fancy-scroll">
                        {getTeamRoster(futureTradeTo).map(player => {
                          const isSelected = selectedPlayersTo.includes(player.name)
                          return (
                            <button
                              key={player.name}
                              onClick={() => togglePlayerSelectionTo(player.name)}
                              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                            >
                              <span>{player.name}</span>
                              <span className={`text-[9px] font-bold ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>{player.position}</span>
                            </button>
                          )
                        })}
                        {getTeamRoster(futureTradeTo).length === 0 && (
                          <p className="text-gray-400 text-sm italic py-2">No players on roster.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Note + Execute */}
              {futureTradeFrom && futureTradeTo && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Trade Note (optional — auto-generated if left blank)</label>
                    <textarea
                      value={futureTradeNote}
                      onChange={(e) => setFutureTradeNote(e.target.value)}
                      placeholder="e.g. Zack trades Calvin Ridley to Dedon for 2026 1st round pick"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                      rows={2}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">This will be saved as footnote #{footnotes.length > 0 ? Math.max(...footnotes.map(f => typeof f.id === 'number' ? f.id : 0)) + 1 : 1} in the Future Picks tab</p>
                  </div>
                  {(() => {
                    const nameA = teams.find(t => t.id === futureTradeFrom)?.name
                    const nameB = teams.find(t => t.id === futureTradeTo)?.name
                    const picksSentA = getTeamFuturePicks(futureTradeFrom).filter(p => selectedFuturePicks.includes(p.key))
                    const picksSentB = getTeamFuturePicks(futureTradeTo).filter(p => selectedFuturePicksTo.includes(p.key))
                    const sideA = computeTradeSideValue(selectedPlayersFrom, picksSentA, PLAYER_VALUE_MAP, DRAFT_YEAR)
                    const sideB = computeTradeSideValue(selectedPlayersTo, picksSentB, PLAYER_VALUE_MAP, DRAFT_YEAR)
                    const verdict = getTradeVerdict(sideA.total, sideB.total, nameA, nameB)
                    if (!verdict) return null
                    const totalBoth = sideA.total + sideB.total
                    const shareA = totalBoth > 0 ? (sideA.total / totalBoth) * 100 : 50
                    const unknowns = [...sideA.unknownPlayers, ...sideB.unknownPlayers]
                    return (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                          <span>Fleece-o-Meter</span>
                          <span className="normal-case font-normal tracking-normal">KTC value · picks estimated</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-purple-600 font-semibold">{nameA} sends {sideA.total.toLocaleString()}</span>
                          <span className="text-blue-600 font-semibold">{nameB} sends {sideB.total.toLocaleString()}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-blue-200 overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-l-full transition-all duration-300" style={{ width: `${shareA}%` }} />
                        </div>
                        <div className={`text-sm font-medium rounded-lg border px-3 py-2 ${VERDICT_STYLES[verdict.severity]}`}>
                          {verdict.label}
                          {verdict.severity !== 'even' && (
                            <span className="font-normal"> ({verdict.winner} comes out ahead by {verdict.diff.toLocaleString()} KTC)</span>
                          )}
                        </div>
                        {unknowns.length > 0 && (
                          <p className="text-[10px] text-gray-400">Not in KTC top 300 (counted as 0): {unknowns.join(', ')}</p>
                        )}
                      </div>
                    )
                  })()}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="text-purple-600 font-semibold">{teams.find(t => t.id === futureTradeFrom)?.name}</span>
                      <span className="text-gray-400">sends {selectedFuturePicks.length + selectedPlayersFrom.length} asset{selectedFuturePicks.length + selectedPlayersFrom.length !== 1 ? 's' : ''}</span>
                      <ArrowRightLeft size={16} className="text-gray-300" />
                      <span className="text-blue-600 font-semibold">{teams.find(t => t.id === futureTradeTo)?.name}</span>
                      <span className="text-gray-400">sends {selectedFuturePicksTo.length + selectedPlayersTo.length} asset{selectedFuturePicksTo.length + selectedPlayersTo.length !== 1 ? 's' : ''}</span>
                    </div>
                    <button
                      onClick={isLoggedIn ? handleFuturePickTrade : onRequestLogin}
                      disabled={selectedFuturePicks.length + selectedPlayersFrom.length === 0 && selectedFuturePicksTo.length + selectedPlayersTo.length === 0}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl font-medium text-white text-sm transition-all shadow-sm disabled:shadow-none flex-shrink-0"
                    >
                      {isLoggedIn ? 'Execute Trade' : 'Sign in to Trade'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Future Picks Per-Team Overview (2026-2028) */}
            <h3 className="text-lg font-bold tracking-tight text-gray-900 mt-8 mb-4">Future Picks by Team (2026–2028)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map(team => {
                const futurePicks = getTeamFuturePicks(team.id)

                return (
                  <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${team.bg} ${team.color}`}>
                          <team.icon size={12} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-xs leading-tight">{team.name}</span>
                          <span className="text-[9px] text-gray-500 font-medium">({team.owner})</span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-purple-100 rounded text-purple-600 font-medium">{futurePicks.length} picks</span>
                    </div>
                    <div className="p-2 max-h-72 overflow-y-auto fancy-scroll">
                      <div className="space-y-1">
                        {futurePicks.length === 0 ? (
                          <p className="text-gray-400 text-xs italic p-2">No future picks</p>
                        ) : (
                          futurePicks.map(pick => {
                            const isTraded = pick.currentOwner !== pick.originalOwner
                            const roundShort = pick.round.replace(' Rounder', '')
                            return (
                              <div
                                key={pick.key}
                                className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 font-mono w-10">{pick.year}</span>
                                  <span className="font-medium text-gray-700">{roundShort}</span>
                                </div>
                                {isTraded && (
                                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] border border-amber-100 font-bold whitespace-nowrap">
                                    via {pick.originalOwner}
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'futurePicks' && (
          <FutureDraftPicks pickData={futurePickData} footnotes={footnotes} setFootnotes={setFootnotes} canEdit={isLoggedIn} />
        )}

        {activeTab === 'upload' && <UploadPage onFileUpload={handleFileUpload} />}
      </main>
      {hoveredProspect && (
        <CollegeStatsTooltip
          prospect={hoveredProspect}
          style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-100%)' }}
        />
      )}
      {showDraftCenter && isDraftActive && (
        <DraftCenter
          mode={isMockDraft ? 'mock' : 'real'}
          teams={teams}
          prospects={prospects}
          draftedPlayers={draftedPlayers}
          draftOrder={draftOrder}
          draftPicks={draftPicks}
          mockTeamId={mockTeamId}
          timeRemaining={timeRemaining}
          isPaused={isPaused}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          onPauseToggle={handlePauseDraft}
          onEndMock={handleEndMockDraft}
          onRestart={() => {
            setDraftOrder([])
            setDraftedPlayers({})
            setTimeRemaining(120)
          }}
          onUserMockPick={handleUserMockPick}
          onAdminDraft={handleUserMockPick}
          onMinimize={() => setShowDraftCenter(false)}
          getTeamById={getTeamById}
        />
      )}
      {hypeMode && (
        <DraftHype
          mode={hypeMode}
          onStart={beginDraft}
          onCancel={() => setHypeMode(null)}
          teams={teams}
          needsTeamSelect={hypeMode === 'mock' && !userTeam}
          selectedTeamId={mockTeamId}
          onSelectTeam={setMockTeamId}
        />
      )}
      {celebration && (
        <DraftPickCelebration
          player={celebration.player}
          detail={celebration.detail}
          team={celebration.team}
          pickLabel={celebration.pickLabel}
          fit={celebration.fit}
          onClose={() => setCelebration(null)}
        />
      )}
      {tradeToast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto z-[190] sm:max-w-sm">
          <div className="animate-toast-in rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-green-100 p-1.5 text-green-700">
                <Check size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">Trade executed</p>
                <p className="mt-0.5 text-xs text-gray-600 leading-snug">{tradeToast.note}</p>
                <p className="mt-1 text-[11px] font-medium text-amber-600">
                  Logged as footnote #{tradeToast.footnoteId} · view in Future Picks
                </p>
                {tradeToast.vacatedTeams.length > 0 && (
                  <button
                    onClick={() => { setActiveTab('teams'); setTradeToast(null) }}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    <ArrowRightLeft size={11} />
                    {tradeToast.vacatedTeams.map(v => `${v.name} has ${v.count} open starter slot${v.count !== 1 ? 's' : ''}`).join(', ')} — fix lineup
                  </button>
                )}
              </div>
              <button
                onClick={() => setTradeToast(null)}
                className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
