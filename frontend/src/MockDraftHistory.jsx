import { useState } from 'react'
import { History, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'

export default function MockDraftHistory({ history, teams, prospects, onClear }) {
  const [expanded, setExpanded] = useState(null)

  if (!history || history.length === 0) return null

  const getTeam = (teamId) => teams.find(t => t.id === teamId)
  const getProspect = (playerId) => prospects.find(p => p.id === playerId)

  return (
    <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-purple-500/10 rounded-lg">
          <History size={16} className="text-purple-500" />
        </div>
        <h3 className="font-semibold text-sm text-gray-900">Past Mock Drafts</h3>
        <span className="px-2 py-0.5 bg-white rounded-full text-xs text-gray-500 border border-gray-200">
          {history.length}
        </span>
        <button
          onClick={onClear}
          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={12} />
          Clear history
        </button>
      </div>
      <div className="space-y-2">
        {history.map((entry) => {
          const isOpen = expanded === entry.id
          const yourTeam = getTeam(entry.mockTeamId)
          return (
            <div key={entry.id} className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left"
              >
                {isOpen ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
                <span className="text-sm font-medium text-gray-900">
                  {new Date(entry.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
                {yourTeam && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                    Drafting as {yourTeam.name}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">{entry.picks.length} picks</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                    {entry.picks.map((pick) => {
                      const prospect = getProspect(pick.playerId)
                      const team = getTeam(pick.teamId)
                      const isYours = entry.mockTeamId && pick.teamId === entry.mockTeamId
                      return (
                        <div key={pick.pickNumber} title={pick.reason || undefined} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 ${isYours ? 'bg-purple-50' : ''}`}>
                          <span className="text-gray-400 font-mono w-7 flex-shrink-0">{pick.pickNumber}.</span>
                          <span className="font-medium text-gray-800 truncate">{prospect?.name || 'Unknown'}</span>
                          <span className="text-gray-400 flex-shrink-0">{prospect?.position}</span>
                          <span className={`ml-auto truncate flex-shrink-0 ${isYours ? 'text-purple-700 font-semibold' : 'text-gray-500'}`}>{team?.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
