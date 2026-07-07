import { useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'

const CONFETTI_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#eab308']

// Deterministic pseudo-random scatter so the component stays pure
const rand = (i, salt) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const CONFETTI_PIECES = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  left: rand(i, 1) * 100,
  delay: rand(i, 2) * 0.6,
  duration: 1.8 + rand(i, 3) * 1.4,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + rand(i, 4) * 6,
}))

function Confetti() {
  const pieces = CONFETTI_PIECES
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// Celebratory overlay shown when the user drafts a player in a mock draft.
// Surfaces a quick scouting snapshot and what the player adds to the roster.
export default function DraftPickCelebration({ player, detail, team, pickLabel, fit, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const stat = (label, value) =>
    value == null || value === '' ? null : (
      <div className="flex flex-col items-center rounded-xl bg-gray-50 px-3 py-2 border border-gray-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
    )

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <Confetti />
      <div
        className="animate-celebrate-pop relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/5 p-1.5 text-gray-500 hover:bg-black/10 hover:text-gray-900 transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 px-6 py-6 text-center text-white">
          <div className="mb-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-purple-200">
            <Sparkles size={14} /> The pick is in {pickLabel ? `· ${pickLabel}` : ''}
          </div>
          <h2 className="text-3xl font-black leading-tight">{detail?.fullName || player?.name}</h2>
          <p className="mt-1 text-sm font-semibold text-purple-100">
            {player?.position}
            {player?.nflTeam ? ` · ${player.nflTeam}` : ''}
            {player?.rank ? ` · #${player.rank} overall` : ''}
          </p>
          {team && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
              {team.icon && <team.icon size={14} />}
              To {team.name}
            </div>
          )}
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-3 gap-2">
            {stat('Age', detail?.age)}
            {stat('College', detail?.college)}
            {stat('KTC', detail?.ktcValue?.toLocaleString?.())}
            {stat('Rookie Rk', detail?.ktcRookieRank != null ? `#${detail.ktcRookieRank}` : null)}
            {stat('Draft', detail?.draftCapital)}
            {stat('Proj Yr1', detail?.projPtsYear1)}
          </div>

          {fit && (
            <div className="rounded-xl border border-purple-100 bg-purple-50/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500 mb-1">What he adds</p>
              <p className="text-sm text-gray-700 leading-relaxed">{fit}</p>
            </div>
          )}

          {detail?.scoutingReport && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Scouting report</p>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{detail.scoutingReport}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-black py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
          >
            Back to the board
          </button>
        </div>
      </div>
    </div>
  )
}
