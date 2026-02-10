import { useState, useEffect, useRef } from 'react'
import { Upload, Users, ChevronDown, Check, X, UserCircle, ArrowRightLeft, Edit2, ListOrdered, Search, Shield, Zap, Flame, Star, Crown, Anchor, Target, Hexagon, Play, Pause, RotateCcw, Clock } from 'lucide-react'

const INITIAL_TEAMS = [
  { id: 1, name: 'Team Alpha', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 2, name: 'Team Beta', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 3, name: 'Team Gamma', icon: Flame, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 4, name: 'Team Delta', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 5, name: 'Team Epsilon', icon: Crown, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 6, name: 'Team Zeta', icon: Anchor, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 7, name: 'Team Eta', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 8, name: 'Team Theta', icon: Hexagon, color: 'text-cyan-500', bg: 'bg-cyan-50' },
]

const SAMPLE_PROSPECTS = [
  { id: 1, name: 'Marcus Johnson', position: 'QB', college: 'Alabama', collegeStats: { games: 39, completions: 812, attempts: 1198, passingYards: 10245, passingTDs: 87, interceptions: 14, rushingYards: 623, rushingTDs: 12 } },
  { id: 2, name: 'DeShawn Williams', position: 'RB', college: 'Ohio State', collegeStats: { games: 36, carries: 642, rushingYards: 3876, rushingTDs: 42, receptions: 87, receivingYards: 714, receivingTDs: 6, fumbles: 4 } },
  { id: 3, name: 'Tyler Smith', position: 'WR', college: 'LSU', collegeStats: { games: 38, receptions: 198, receivingYards: 3241, receivingTDs: 31, rushingYards: 145, rushingTDs: 2, yardsPerCatch: 16.4, drops: 7 } },
  { id: 4, name: 'Jordan Davis', position: 'TE', college: 'Georgia', collegeStats: { games: 40, receptions: 142, receivingYards: 1876, receivingTDs: 19, blocksGraded: 88.4, yardsPerCatch: 13.2, drops: 5, rushingTDs: 1 } },
  { id: 5, name: 'Chris Thompson', position: 'WR', college: 'USC', collegeStats: { games: 35, receptions: 176, receivingYards: 2854, receivingTDs: 26, rushingYards: 210, rushingTDs: 3, yardsPerCatch: 16.2, drops: 9 } },
  { id: 6, name: 'Andre Mitchell', position: 'RB', college: 'Michigan', collegeStats: { games: 37, carries: 589, rushingYards: 3412, rushingTDs: 36, receptions: 64, receivingYards: 528, receivingTDs: 4, fumbles: 6 } },
  { id: 7, name: 'Brandon Lee', position: 'QB', college: 'Clemson', collegeStats: { games: 34, completions: 724, attempts: 1105, passingYards: 9187, passingTDs: 72, interceptions: 18, rushingYards: 1241, rushingTDs: 19 } },
  { id: 8, name: 'Malik Brown', position: 'WR', college: 'Texas', collegeStats: { games: 36, receptions: 164, receivingYards: 2678, receivingTDs: 22, rushingYards: 98, rushingTDs: 1, yardsPerCatch: 16.3, drops: 6 } },
]

const NUM_ROUNDS = 3

function generateInitialPicks(teams, numRounds) {
  const picks = []
  let pickNumber = 1
  for (let round = 1; round <= numRounds; round++) {
    const teamOrder = round % 2 === 1 ? teams : [...teams].reverse()
    for (const team of teamOrder) {
      picks.push({
        id: pickNumber,
        round,
        pickInRound: pickNumber - (round - 1) * teams.length,
        originalTeamId: team.id,
        currentTeamId: team.id,
      })
      pickNumber++
    }
  }
  return picks
}

const STAT_LABELS = {
  games: 'Games',
  completions: 'Comp',
  attempts: 'Att',
  passingYards: 'Pass Yds',
  passingTDs: 'Pass TD',
  interceptions: 'INT',
  rushingYards: 'Rush Yds',
  rushingTDs: 'Rush TD',
  carries: 'Carries',
  receptions: 'Rec',
  receivingYards: 'Rec Yds',
  receivingTDs: 'Rec TD',
  fumbles: 'Fumbles',
  yardsPerCatch: 'Yds/Catch',
  drops: 'Drops',
  blocksGraded: 'Block Grade',
}

function CollegeStatsTooltip({ prospect, style }) {
  if (!prospect?.collegeStats) return null
  const stats = prospect.collegeStats
  return (
    <div
      style={style}
      className="fixed z-[100] w-64 bg-white rounded-xl border border-gray-200 shadow-2xl p-4 pointer-events-none"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-900">{prospect.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 font-medium">{prospect.position}</span>
      </div>
      <div className="text-xs text-gray-500 mb-3 font-medium">{prospect.college} &middot; College Stats</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-xs text-gray-400">{STAT_LABELS[key] || key}</span>
            <span className="text-xs font-semibold text-gray-800">{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('prospects')
  const [prospects, setProspects] = useState(SAMPLE_PROSPECTS)
  const [hoveredProspect, setHoveredProspect] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [teams, setTeams] = useState(INITIAL_TEAMS)
  const [draftPicks, setDraftPicks] = useState(() => generateInitialPicks(INITIAL_TEAMS, NUM_ROUNDS))
  const [draftedPlayers, setDraftedPlayers] = useState({})
  const [draftOrder, setDraftOrder] = useState([])
  const [openDropdown, setOpenDropdown] = useState(null)
  const [filterPosition, setFilterPosition] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [editingTeamId, setEditingTeamId] = useState(null)
  const [editingTeamName, setEditingTeamName] = useState('')
  const [tradeFrom, setTradeFrom] = useState(null)
  const [tradeTo, setTradeTo] = useState(null)
  const [selectedPicks, setSelectedPicks] = useState([])
  const [isDraftActive, setIsDraftActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120)
  const timerRef = useRef(null)

  const tooltipWidth = 256

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

  const getCurrentPickNumber = () => draftOrder.length + 1
  const getCurrentPick = () => draftPicks.find(p => p.id === getCurrentPickNumber())

  const handleDraft = (playerId, teamId) => {
    const currentPick = getCurrentPick()
    setDraftedPlayers(prev => ({
      ...prev,
      [playerId]: teamId
    }))
    setDraftOrder(prev => [...prev, { playerId, teamId, pickNumber: currentPick?.id || prev.length + 1 }])
    setOpenDropdown(null)
    if (isDraftActive) {
      setTimeRemaining(120)
    }
  }

  const handleAutoPick = () => {
    const currentPick = getCurrentPick()
    if (!currentPick) return
    const availablePlayer = prospects.find(p => !draftedPlayers[p.id])
    if (availablePlayer) {
      handleDraft(availablePlayer.id, currentPick.currentTeamId)
    }
  }

  const handleStartDraft = () => {
    setIsDraftActive(true)
    setIsPaused(false)
    setTimeRemaining(120)
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

  useEffect(() => {
    if (timeRemaining === 0 && isDraftActive && !isPaused) {
      handleAutoPick()
    }
  }, [timeRemaining])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleUndraft = (playerId) => {
    setDraftedPlayers(prev => {
      const newState = { ...prev }
      delete newState[playerId]
      return newState
    })
    setDraftOrder(prev => prev.filter(d => d.playerId !== playerId))
  }

  const handleTeamNameEdit = (teamId) => {
    const team = getTeamById(teamId)
    setEditingTeamId(teamId)
    setEditingTeamName(team.name)
  }

  const handleTeamNameSave = () => {
    if (editingTeamName.trim()) {
      setTeams(prev => prev.map(t => 
        t.id === editingTeamId ? { ...t, name: editingTeamName.trim() } : t
      ))
    }
    setEditingTeamId(null)
    setEditingTeamName('')
  }

  const handleTrade = () => {
    if (!tradeFrom || !tradeTo || selectedPicks.length === 0) return
    
    setDraftPicks(prev => prev.map(pick => {
      if (selectedPicks.includes(pick.id)) {
        return { ...pick, currentTeamId: tradeTo }
      }
      return pick
    }))
    
    setTradeFrom(null)
    setTradeTo(null)
    setSelectedPicks([])
  }

  const togglePickSelection = (pickId) => {
    setSelectedPicks(prev => 
      prev.includes(pickId) 
        ? prev.filter(id => id !== pickId)
        : [...prev, pickId]
    )
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
      } catch (err) {
        alert('Error parsing file. Please ensure it is valid JSON or CSV.')
      }
    }
    reader.readAsText(file)
  }

  const filteredProspects = prospects.filter(p => {
    const posMatch = filterPosition === 'All' || p.position === filterPosition
    const statusMatch = filterStatus === 'All' || 
      (filterStatus === 'Drafted' && draftedPlayers[p.id]) ||
      (filterStatus === 'Available' && !draftedPlayers[p.id])
    return posMatch && statusMatch
  })

  const getProspectById = (playerId) => prospects.find(p => p.id === playerId)

  const getTeamRoster = (teamId) => {
    return Object.entries(draftedPlayers)
      .filter(([, tId]) => tId === teamId)
      .map(([playerId]) => {
        const prospect = getProspectById(Number(playerId))
        const draftInfo = draftOrder.find(d => d.playerId === Number(playerId))
        return { ...prospect, pickNumber: draftInfo?.pickNumber }
      })
  }

  const getTeamPicks = (teamId) => {
    return draftPicks.filter(p => p.currentTeamId === teamId)
  }

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-blue-500/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-md">
              <Users size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Fantasy Football<span className="text-gray-400">Draft Tracker</span></h1>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 backdrop-blur-md">
            {[
              { id: 'prospects', label: 'Prospects', icon: Users },
              { id: 'teams', label: 'Rosters', icon: UserCircle },
              { id: 'trades', label: 'Trades', icon: ArrowRightLeft },
              { id: 'upload', label: 'Data', icon: Upload }
            ].map((tab) => (
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
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
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
                <div className="ml-auto flex items-center gap-2">
                  {!isDraftActive ? (
                    <button
                      onClick={handleStartDraft}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                    >
                      <Play size={14} />
                      Start Draft
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handlePauseDraft}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg transition-all shadow-sm ${
                          isPaused ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={handleRestartDraft}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                      >
                        <RotateCcw size={14} />
                        Restart Draft
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
                {draftPicks.slice(0, 16).map((pick) => {
                  const team = getTeamById(pick.currentTeamId)
                  const originalTeam = getTeamById(pick.originalTeamId)
                  const isCurrentPick = pick.id === getCurrentPickNumber()
                  const isUsed = pick.id < getCurrentPickNumber()
                  const isTraded = pick.currentTeamId !== pick.originalTeamId
                  
                  return (
                    <div
                      key={pick.id}
                      className={`flex-shrink-0 w-24 p-3 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 ${
                        isCurrentPick 
                          ? 'bg-blue-500 shadow-lg shadow-blue-500/20 scale-105 ring-1 ring-black/5' 
                          : isUsed 
                            ? 'bg-gray-100 opacity-40 grayscale' 
                            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isCurrentPick ? 'text-white/90' : 'text-gray-400'}`}>PICK {pick.id}</span>
                      <div className={`p-1.5 rounded-full ${team?.bg} ${team?.color}`}>
                        <team.icon size={16} />
                      </div>
                      <div className="flex flex-col items-center">
                         <span className={`text-xs font-medium truncate max-w-full ${isCurrentPick ? 'text-white' : 'text-gray-700'}`}>
                          {team?.name.replace('Team ', '')}
                        </span>
                        {isTraded && (
                          <span className="text-[10px] text-amber-500 font-medium">from {originalTeam?.name.replace('Team ', '')}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-gray-50/80 p-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 px-3 py-1 bg-white rounded-lg border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter prospects..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-48 text-gray-900 placeholder-gray-400"
                />
              </div>
              
              <div className="h-6 w-px bg-gray-200"></div>

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
            <div className="bg-gray-50/80 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prospect</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">College</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProspects.map((prospect) => {
                    const draftedTeam = getTeamById(draftedPlayers[prospect.id])
                    const isDrafted = !!draftedTeam

                    return (
                      <tr
                        key={prospect.id}
                        className={`group transition-colors duration-200 ${
                          isDrafted ? 'bg-gray-100/50' : 'hover:bg-white'
                        }`}
                        onMouseEnter={(e) => handleProspectMouseEnter(prospect, e)}
                        onMouseLeave={handleProspectMouseLeave}
                      >
                        <td className="px-6 py-4">
                          <span className={`font-medium ${isDrafted ? 'text-gray-400' : 'text-gray-900'}`}>
                            {prospect.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-gray-600 border border-gray-200">
                            {prospect.position}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{prospect.college}</td>
                        <td className="px-6 py-4">
                          {isDrafted ? (
                            <span className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-xs font-medium border ${draftedTeam.bg} border-transparent ${draftedTeam.color.replace('text-', 'text-opacity-90 text-')}`}>
                              <draftedTeam.icon size={12} />
                              {draftedTeam.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isDrafted ? (
                            <button
                              onClick={() => handleUndraft(prospect.id)}
                              className="invisible group-hover:visible inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={14} />
                              Undraft
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
                                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                      {teams.map(team => (
                                        <button
                                          key={team.id}
                                          onClick={() => handleDraft(prospect.id, team.id)}
                                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group"
                                        >
                                          <div className={`p-1 rounded-full ${team.bg} ${team.color}`}>
                                            <team.icon size={12} />
                                          </div>
                                          {team.name}
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
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Team Rosters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map(team => {
                const roster = getTeamRoster(team.id)
                const teamPicks = getTeamPicks(team.id)
                
                return (
                  <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:border-gray-300 transition-colors">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className={`p-1.5 rounded-full ${team.bg} ${team.color}`}>
                             <team.icon size={16} />
                           </div>
                           {editingTeamId === team.id ? (
                            <input
                              type="text"
                              value={editingTeamName}
                              onChange={(e) => setEditingTeamName(e.target.value)}
                              onBlur={handleTeamNameSave}
                              onKeyDown={(e) => e.key === 'Enter' && handleTeamNameSave()}
                              className="bg-white text-gray-900 px-2 py-0.5 rounded border border-blue-500/50 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-gray-900">{team.name}</span>
                          )}
                        </div>
                        <button
                          onClick={() => editingTeamId === team.id ? handleTeamNameSave() : handleTeamNameEdit(team.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-md"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                        <span>{roster.length} Players</span>
                        <span>{teamPicks.filter(p => p.id >= getCurrentPickNumber()).length} Picks Left</span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      {roster.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl m-2">
                           <UserCircle size={24} className="mb-2 opacity-50" />
                           <p className="text-xs">No players drafted</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {roster.sort((a, b) => (a.pickNumber || 0) - (b.pickNumber || 0)).map(player => (
                            <div
                              key={player.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                              onMouseEnter={(e) => handleProspectMouseEnter(player, e)}
                              onMouseLeave={handleProspectMouseLeave}
                            >
                              <span className="text-gray-400 text-xs font-mono w-5">#{player.pickNumber}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{player.name}</div>
                                <div className="text-xs text-gray-500">{player.position} • {player.college}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Draft Picks & Trades</h2>
            
            {/* Trade Interface */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <ArrowRightLeft size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Trade Center</h3>
                  <p className="text-sm text-gray-500">Exchange draft picks between teams</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From Team</label>
                  <select
                    value={tradeFrom || ''}
                    onChange={(e) => {
                      setTradeFrom(Number(e.target.value) || null)
                      setSelectedPicks([])
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
                  >
                    <option value="">Select team...</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To Team</label>
                  <select
                    value={tradeTo || ''}
                    onChange={(e) => setTradeTo(Number(e.target.value) || null)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-shadow"
                  >
                    <option value="">Select team...</option>
                    {teams.filter(t => t.id !== tradeFrom).map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end h-full pb-0.5">
                   <button
                    onClick={handleTrade}
                    disabled={!tradeFrom || !tradeTo || selectedPicks.length === 0}
                    className="w-full px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl font-medium text-white transition-all shadow-sm disabled:shadow-none"
                  >
                    Execute Trade
                    {selectedPicks.length > 0 && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-md text-xs">{selectedPicks.length} picks</span>}
                  </button>
                </div>
              </div>
              
              {tradeFrom && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 block">Select picks to trade</label>
                  <div className="flex flex-wrap gap-2">
                    {getTeamPicks(tradeFrom)
                      .filter(p => p.id >= getCurrentPickNumber())
                      .map(pick => {
                        const originalTeam = getTeamById(pick.originalTeamId)
                        const isSelected = selectedPicks.includes(pick.id)
                        
                        return (
                          <button
                            key={pick.id}
                            onClick={() => togglePickSelection(pick.id)}
                            className={`group relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-500/20'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-xs text-gray-400 group-hover:text-gray-500">R{pick.round}</span>
                            <span className={`text-lg ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>#{pick.id}</span>
                            {pick.originalTeamId !== pick.currentTeamId && (
                               <div className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm" title={`Originally ${originalTeam?.name}`}>
                                <ArrowRightLeft size={10} className="text-amber-500" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                  </div>
                  {getTeamPicks(tradeFrom).filter(p => p.id >= getCurrentPickNumber()).length === 0 && (
                    <p className="text-gray-400 text-sm italic py-4">No remaining picks to trade available.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* All Teams Picks Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teams.map(team => {
                const teamPicks = getTeamPicks(team.id)
                
                return (
                  <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className={`p-1 rounded-full ${team.bg} ${team.color}`}>
                           <team.icon size={12} />
                         </div>
                         <span className="font-semibold text-gray-900">{team.name}</span>
                       </div>
                       <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">{teamPicks.length} picks</span>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                      <div className="space-y-1">
                        {teamPicks.map(pick => {
                          const originalTeam = getTeamById(pick.originalTeamId)
                          const isUsed = pick.id < getCurrentPickNumber()
                          const isTraded = pick.originalTeamId !== pick.currentTeamId
                          
                          return (
                            <div
                              key={pick.id}
                              className={`flex items-center justify-between text-xs p-2 rounded-lg ${
                                isUsed ? 'opacity-40 grayscale bg-gray-50' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-mono w-8">R{pick.round}</span>
                                <span className={`font-medium ${isUsed ? 'text-gray-400' : 'text-gray-700'}`}>Pick {pick.id}</span>
                              </div>
                              {isTraded && (
                                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] border border-amber-100">
                                  via {originalTeam?.name.split(' ')[1]}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto py-12">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
                <Upload size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Data</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Drag and drop your CSV or JSON file here to instantly populate your prospect list.
              </p>

              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 group-hover:border-blue-500/50 group-hover:bg-blue-50/30 transition-all duration-300">
                  <span className="inline-flex px-4 py-2 bg-black text-white font-medium rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                    Select File
                  </span>
                  <p className="mt-4 text-xs text-gray-400 uppercase tracking-wide">Supports CSV & JSON</p>
                </div>
              </div>

              <div className="mt-12 text-left bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Required Format
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-mono">CSV Example</p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto shadow-sm">
                      <code className="text-xs text-blue-600 font-mono block">name,position,college</code>
                      <code className="text-xs text-gray-500 font-mono block">Marcus Johnson,QB,Alabama</code>
                      <code className="text-xs text-gray-500 font-mono block">DeShawn Williams,RB,Ohio State</code>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-mono">JSON Example</p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto shadow-sm">
                      <pre className="text-xs text-gray-500 font-mono">
{`[
  { "name": "Marcus Johnson", "position": "QB", "college": "Alabama" },
  { "name": "Tyler Smith", "position": "WR", "college": "LSU" }
]`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {hoveredProspect && (
        <CollegeStatsTooltip
          prospect={hoveredProspect}
          style={{ top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-100%)' }}
        />
      )}
    </div>
  )
}

export default App
