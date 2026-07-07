import { useEffect, useMemo } from 'react'
import { X, Sparkles } from 'lucide-react'

const DEFAULT_CONFETTI_COLORS = ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#eab308']

// Confetti palettes keyed by each team's Tailwind accent class
const TEAM_CONFETTI_COLORS = {
  'text-red-500': ['#ef4444', '#b91c1c', '#fca5a5', '#ffffff'],
  'text-blue-500': ['#3b82f6', '#1d4ed8', '#93c5fd', '#ffffff'],
  'text-green-500': ['#22c55e', '#15803d', '#86efac', '#ffffff'],
  'text-yellow-500': ['#eab308', '#a16207', '#fde047', '#ffffff'],
  'text-purple-500': ['#a855f7', '#7e22ce', '#d8b4fe', '#ffffff'],
  'text-pink-500': ['#ec4899', '#be185d', '#f9a8d4', '#ffffff'],
  'text-orange-500': ['#f97316', '#c2410c', '#fdba74', '#ffffff'],
  'text-cyan-500': ['#06b6d4', '#0e7490', '#67e8f9', '#ffffff'],
}

// Celebration treatment scales with draft round: 1st rounders get the
// front-page blowout, 4th rounders get a golf clap.
const ROUND_THEMES = {
  1: { kicker: 'Front-page news · stop the presses', confettiCount: 110 },
  2: { kicker: 'The pick is in', confettiCount: 60 },
  3: { kicker: 'The pick is in · solid value', confettiCount: 35 },
  4: { kicker: 'The crowd politely applauds', confettiCount: 12 },
}

// Deterministic pseudo-random scatter so the component stays pure
const rand = (i, salt) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const makeConfettiPieces = (colors, count) =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: rand(i, 1) * 100,
    delay: rand(i, 2) * 0.6,
    duration: 1.8 + rand(i, 3) * 1.4,
    color: colors[i % colors.length],
    size: 6 + rand(i, 4) * 6,
  }))

function Confetti({ pieces }) {
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
  const round = parseInt(pickLabel, 10)
  const theme = ROUND_THEMES[round] || ROUND_THEMES[2]
  const confettiPieces = useMemo(() => {
    const colors = TEAM_CONFETTI_COLORS[team?.color] || DEFAULT_CONFETTI_COLORS
    return makeConfettiPieces(colors, theme.confettiCount)
  }, [team, theme])

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
      <Confetti pieces={confettiPieces} />
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
            <Sparkles size={14} /> {theme.kicker} {pickLabel ? `· ${pickLabel}` : ''}
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
