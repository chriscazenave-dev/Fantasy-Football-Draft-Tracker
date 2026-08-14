import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { OWNERS, ROUNDS, getOwnerColor } from './futurePicksData'
import TradeFootnotes, { FootnoteBadge } from './TradeFootnotes'

export default function FutureDraftPicks({ pickData, footnotes, setFootnotes, canEdit = true }) {
  const [expandedYears, setExpandedYears] = useState(() => {
    const currentYear = new Date().getFullYear()
    return new Set(Object.keys(pickData).map(Number).filter(year => year >= currentYear))
  })

  const toggleYear = (year) => {
    setExpandedYears(prev => {
      const next = new Set(prev)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return next
    })
  }

  const years = Object.keys(pickData).map(Number).sort()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-gray-900">Future Draft Picks</h3>
          <p className="text-sm text-gray-500 mt-1">Track pick ownership across years. Tap or hover footnote badges for trade details.</p>
        </div>
      </div>
      <div className="text-xs text-gray-500 italic bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
        Future draft picks. Protections/swaps/other details will be added with a footnote.
      </div>
      <div className="space-y-4">
        {years.map(year => {
          const isExpanded = expandedYears.has(year)
          const yearData = pickData[year]
          return (
            <div key={year} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button onClick={() => toggleYear(year)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                <span className="text-lg font-bold text-gray-900">{year}</span>
                <span className="text-xs text-gray-400 font-medium">{ROUNDS.length} rounds &middot; {OWNERS.length} teams</span>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <p className="sm:hidden px-4 pt-2 text-[10px] text-gray-400">Swipe sideways to see all teams &rarr;</p>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50/80">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 sticky left-0 bg-gray-50 z-10">Round</th>
                          {OWNERS.map(owner => <th key={owner} className="text-center px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{owner}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ROUNDS.map(round => (
                          <tr key={round} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap sticky left-0 bg-white z-10">{round}</td>
                            {(yearData[round] || []).map((pick, idx) => {
                              const isTraded = pick.owner !== OWNERS[idx]
                              return (
                                <td key={idx} className="px-2 py-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${isTraded ? getOwnerColor(pick.owner) + ' ring-1 ring-offset-1 ring-amber-300' : getOwnerColor(pick.owner)}`}>
                                      {pick.owner}
                                    </span>
                                    {pick.notes.length > 0 && (
                                      <div className="flex gap-0.5 flex-wrap justify-center">
                                        {pick.notes.map((noteId, noteIndex) => <FootnoteBadge key={`${noteId}-${noteIndex}`} noteId={noteId} footnotes={footnotes} />)}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <TradeFootnotes footnotes={footnotes} setFootnotes={setFootnotes} canEdit={canEdit} />
    </section>
  )
}
