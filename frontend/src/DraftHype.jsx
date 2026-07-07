import { useEffect, useRef } from 'react'
import { Play, X } from 'lucide-react'

const HYPE_TWEET_ID = '2074313706314289612'

function launchFirework(fireworks, width, height) {
  const hue = Math.floor(Math.random() * 360)
  const x = width * (0.15 + Math.random() * 0.7)
  const y = height * (0.1 + Math.random() * 0.4)
  const count = 60 + Math.floor(Math.random() * 40)
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2
    const speed = 2 + Math.random() * 4
    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      hue: hue + Math.random() * 40 - 20,
    })
  }
}

function Fireworks() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    const particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    launchFirework(particles, canvas.width, canvas.height)
    launchFirework(particles, canvas.width, canvas.height)
    const launcher = setInterval(() => {
      if (particles.length < 900) launchFirework(particles, canvas.width, canvas.height)
    }, 650)

    const tick = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.03
        p.vx *= 0.985
        p.vy *= 0.985
        p.life -= p.decay
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life
        ctx.fillStyle = `hsl(${p.hue}, 100%, ${50 + p.life * 20}%)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2 + p.life * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(launcher)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default function DraftHype({ mode, onStart, onCancel, teams = [], needsTeamSelect = false, selectedTeamId = null, onSelectTeam }) {
  const isMock = mode === 'mock'
  const startDisabled = needsTeamSelect && !selectedTeamId

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      <Fireworks />

      <button
        onClick={onCancel}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        title="Cancel"
      >
        <X size={20} />
      </button>

      <div className="relative z-10 min-h-full flex flex-col items-center justify-center gap-6 px-4 py-10 text-center">
        <div className="animate-bounce text-5xl md:text-7xl">🏈</div>
        <h1 className="font-serif text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(217,119,6,0.35)]">
          {isMock ? 'MOCK DRAFT TIME' : 'THE DRAFT IS HERE'}
        </h1>
        <p className="text-lg md:text-2xl font-bold text-amber-300/90 uppercase tracking-[0.3em]">
          {isMock ? 'Practice makes perfect, boys' : "Let's get the boys hype"}
        </p>

        <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-purple-500/20 bg-black">
          <iframe
            title="Draft hype video"
            src={`https://platform.twitter.com/embed/Tweet.html?id=${HYPE_TWEET_ID}&theme=dark&hideThread=true`}
            className="w-full h-[420px] bg-black"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        {needsTeamSelect && (
          <div className="w-full max-w-2xl">
            <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-3">Who are you drafting for?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => onSelectTeam?.(team.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-center transition-all ${
                    selectedTeamId === team.id
                      ? 'border-yellow-400 bg-yellow-400/20 text-white ring-2 ring-yellow-400/50 scale-105'
                      : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{team.name}</span>
                  <span className="text-[10px] opacity-70">({team.owner})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          disabled={startDisabled}
          className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xl font-black uppercase tracking-wider shadow-2xl shadow-amber-500/40 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Play size={24} className="group-hover:animate-pulse" fill="currentColor" />
          {startDisabled ? 'Pick Your Team First' : isMock ? 'Start Mock Draft' : 'Start The Draft'}
        </button>
      </div>
    </div>
  )
}
