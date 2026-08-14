import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'

function getFootnoteValueSummary(footnote) {
  const snapshot = footnote?.valueSnapshot
  if (!snapshot) return null
  const verdict = snapshot.verdict?.label || 'No KTC value available'
  return `${snapshot.teamA}: ${snapshot.valueSentByA.toLocaleString()} · ${snapshot.teamB}: ${snapshot.valueSentByB.toLocaleString()} · ${verdict} · ${snapshot.date}`
}

function FootnoteTooltip({ noteId, footnote, position }) {
  const valueSummary = getFootnoteValueSummary(footnote)
  return (
    <span
      className="fixed z-[100] w-64 -translate-x-1/2 -translate-y-full rounded-xl bg-gray-900 px-3 py-2 text-left text-white shadow-2xl pointer-events-none"
      style={{ top: position.top, left: position.left }}
    >
      <span className="block text-xs leading-relaxed">{footnote?.text || ''}</span>
      {valueSummary && <span className="mt-1 block border-t border-gray-700 pt-1 text-[11px] leading-snug text-amber-200">Value at time: {valueSummary}</span>}
      <span className="sr-only">Footnote {noteId}</span>
    </span>
  )
}

export function FootnoteBadge({ noteId, footnotes, large = false }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const footnote = footnotes.find(fn => fn.id === noteId || String(fn.id) === String(noteId))
  const showAt = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({ top: rect.top - 8, left: Math.max(132, Math.min(window.innerWidth - 132, rect.left + rect.width / 2)) })
    setShowTooltip(true)
  }
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold cursor-help border border-amber-200 hover:bg-amber-200 transition-colors ${
        large ? 'min-w-[28px] h-7 text-xs' : 'w-4 h-4 text-[8px]'
      }`}
      onMouseEnter={showAt}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={e => { e.stopPropagation(); showAt(e) }}
    >
      {noteId}
      {showTooltip && footnote && <FootnoteTooltip noteId={noteId} footnote={footnote} position={tooltipPosition} />}
    </span>
  )
}

export default function TradeFootnotes({ footnotes, setFootnotes, canEdit = true }) {
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')

  const handleAddFootnote = () => {
    if (!newNoteText.trim()) return
    const nextId = footnotes.length > 0 ? Math.max(...footnotes.map(f => typeof f.id === 'number' ? f.id : 0)) + 1 : 1
    setFootnotes(prev => [...prev, { id: nextId, text: newNoteText.trim() }])
    setNewNoteText('')
    setShowAddNote(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl"><FileText size={20} className="text-amber-600" /></div>
          <div>
            <h3 className="font-semibold text-gray-900">Trade Footnotes</h3>
            <p className="text-xs text-gray-500">{footnotes.length} recorded trades</p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-all shadow-sm"
          >
            <Plus size={14} />
            Add Subnote
          </button>
        )}
      </div>

      {showAddNote && (
        <div className="px-6 py-4 bg-amber-50/50 border-b border-amber-100">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">New Trade Note</label>
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="e.g. Sam trades Player X to Nick for 2027 2nd round pick - 1.15.26"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                rows={2}
              />
            </div>
            <div className="flex flex-col justify-end gap-2">
              <button onClick={handleAddFootnote} disabled={!newNoteText.trim()} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-medium rounded-lg transition-all shadow-sm">Save</button>
              <button onClick={() => { setShowAddNote(false); setNewNoteText('') }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-all">Cancel</button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">This will be assigned footnote #{footnotes.length > 0 ? Math.max(...footnotes.map(f => typeof f.id === 'number' ? f.id : 0)) + 1 : 1}</p>
        </div>
      )}

      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {footnotes.map(fn => (
            <div key={fn.id} className="flex gap-3 items-start py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
              <FootnoteBadge noteId={fn.id} footnotes={footnotes} large />
              <div className="min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{fn.text}</p>
                {getFootnoteValueSummary(fn) && (
                  <p className="mt-1 inline-flex max-w-full rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium leading-snug text-emerald-700 border border-emerald-100">
                    Value at time of trade: {getFootnoteValueSummary(fn)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
