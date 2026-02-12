import { useState } from 'react'
import { FileText, Plus, X, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import { OWNERS, ROUNDS, getOwnerColor } from './futurePicksData'

export default function FutureDraftPicks({ pickData, setPickData, footnotes, setFootnotes }) {
  const [expandedYears, setExpandedYears] = useState(() => {
    const years = Object.keys(pickData).map(Number)
    return new Set(years)
  })
  const [hoveredNote, setHoveredNote] = useState(null)
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  const toggleYear = (year) => {
    setExpandedYears(prev => {
      const next = new Set(prev)
      if (next.has(year)) {
        next.delete(year)
      } else {
        next.add(year)
      }
      return next
    })
  }

  const handleAddFootnote = () => {
    if (!newNoteText.trim()) return
    const nextId = footnotes.length > 0 ? Math.max(...footnotes.map(f => typeof f.id === 'number' ? f.id : 0)) + 1 : 1
    setFootnotes(prev => [...prev, { id: nextId, text: newNoteText.trim() }])
    setNewNoteText('')
    setShowAddNote(false)
  }

  const handleNoteHover = (noteId, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPos({ top: rect.top - 8, left: rect.left + rect.width / 2 })
    setHoveredNote(noteId)
  }

  const handleNoteLeave = () => {
    setHoveredNote(null)
  }

  const getFootnoteText = (noteId) => {
    const fn = footnotes.find(f => f.id === noteId || String(f.id) === String(noteId))
    return fn ? fn.text : ''
  }

  const years = Object.keys(pickData).map(Number).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Future Draft Picks</h2>
          <p className="text-sm text-gray-500 mt-1">Track pick ownership across years. Hover footnote badges for trade details.</p>
        </div>
      </div>

      <div className="text-xs text-gray-500 italic bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        Future draft picks. Protections/swaps/other details will be added with a footnote.
      </div>

      {/* Year Sections */}
      <div className="space-y-4">
        {years.map(year => {
          const isExpanded = expandedYears.has(year)
          const yearData = pickData[year]

          return (
            <div key={year} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleYear(year)}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                <span className="text-lg font-bold text-gray-900">{year}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {ROUNDS.length} rounds &middot; {OWNERS.length} teams
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50/80">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Round</th>
                          {OWNERS.map(owner => (
                            <th key={owner} className="text-center px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {owner}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ROUNDS.map(round => {
                          const roundPicks = yearData[round] || []
                          return (
                            <tr key={round} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">{round}</td>
                              {roundPicks.map((pick, idx) => {
                                const isTraded = pick.owner !== OWNERS[idx]
                                return (
                                  <td key={idx} className="px-2 py-3 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                          isTraded
                                            ? getOwnerColor(pick.owner) + ' ring-1 ring-offset-1 ring-amber-300'
                                            : getOwnerColor(pick.owner)
                                        }`}
                                      >
                                        {pick.owner}
                                      </span>
                                      {pick.notes.length > 0 && (
                                        <div className="flex gap-0.5 flex-wrap justify-center">
                                          {pick.notes.map((noteId, nIdx) => (
                                            <span
                                              key={nIdx}
                                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold cursor-help border border-amber-200 hover:bg-amber-200 transition-colors"
                                              onMouseEnter={(e) => handleNoteHover(noteId, e)}
                                              onMouseLeave={handleNoteLeave}
                                            >
                                              {noteId}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footnotes Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <FileText size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Trade Footnotes</h3>
              <p className="text-xs text-gray-500">{footnotes.length} recorded trades</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
          >
            <Plus size={14} />
            Add Subnote
          </button>
        </div>

        {showAddNote && (
          <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">New Trade Note</label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="e.g. Sam trades Player X to Nick for 2027 2nd round pick - 1.15.26"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <button
                  onClick={handleAddFootnote}
                  disabled={!newNoteText.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowAddNote(false); setNewNoteText('') }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              This will be assigned footnote #{footnotes.length > 0 ? Math.max(...footnotes.map(f => typeof f.id === 'number' ? f.id : 0)) + 1 : 1}
            </p>
          </div>
        )}

        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {footnotes.map(fn => (
              <div key={fn.id} className="flex gap-3 items-start py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 flex-shrink-0">
                  {fn.id}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{fn.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footnote Tooltip */}
      {hoveredNote !== null && (
        <div
          className="fixed z-[100] max-w-sm bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 pointer-events-none"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-amber-500 text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
              {hoveredNote}
            </span>
            <p className="text-xs leading-relaxed">{getFootnoteText(hoveredNote)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
