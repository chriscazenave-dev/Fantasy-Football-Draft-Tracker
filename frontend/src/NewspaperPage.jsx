import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HomePage from './HomePage'
import PlayerValuesPage from './PlayerValuesPage'
import TeamWriteupsPage from './TeamWriteupsPage'

const PAGES = [
  { num: 1, roman: 'I', title: 'Front Page' },
  { num: 2, roman: 'II', title: 'The Value Ledger' },
  { num: 3, roman: 'III', title: 'The Franchise Reports' },
]

function PageNav({ page, goTo }) {
  const prev = PAGES.find(p => p.num === page - 1)
  const next = PAGES.find(p => p.num === page + 1)
  return (
    <div className="max-w-5xl mx-auto font-serif text-[#2b2418]">
      <div className="flex items-stretch justify-between gap-2 border-2 border-[#5a4a32] bg-[#efe6d0]">
        <button
          onClick={() => prev && goTo(prev.num)}
          disabled={!prev}
          className={`flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase tracking-widest border-r-2 border-[#c9bb9c] ${
            prev ? 'text-amber-800 hover:bg-[#e5d9bd]' : 'text-[#c9bb9c] cursor-default'
          }`}
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">{prev ? `Page ${prev.roman} · ${prev.title}` : 'Front Page'}</span>
          <span className="sm:hidden">{prev ? `Pg. ${prev.num}` : ''}</span>
        </button>

        <div className="flex items-center justify-center gap-3 py-2 flex-wrap">
          {PAGES.map(p => (
            <button
              key={p.num}
              onClick={() => goTo(p.num)}
              className={`text-[10px] uppercase tracking-[0.2em] px-2 py-1 border ${
                p.num === page
                  ? 'border-[#5a4a32] bg-[#5a4a32] text-[#f3ecdb] font-black'
                  : 'border-transparent text-[#8a7a5c] hover:text-amber-800 underline decoration-[#c9bb9c] underline-offset-4'
              }`}
            >
              <span className="hidden md:inline">{p.roman} · {p.title}</span>
              <span className="md:hidden">{p.roman}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => next && goTo(next.num)}
          disabled={!next}
          className={`flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase tracking-widest border-l-2 border-[#c9bb9c] ${
            next ? 'text-amber-800 hover:bg-[#e5d9bd]' : 'text-[#c9bb9c] cursor-default'
          }`}
        >
          <span className="hidden sm:inline">{next ? `Page ${next.roman} · ${next.title}` : 'Back Page'}</span>
          <span className="sm:hidden">{next ? `Pg. ${next.num}` : ''}</span>
          <ChevronRight size={14} />
        </button>
      </div>
      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#8a7a5c] mt-1.5">
        Page {page} of {PAGES.length}
      </p>
    </div>
  )
}

export default function NewspaperPage({ teams, draftedPlayers }) {
  const [page, setPage] = useState(1)

  const goTo = next => {
    if (next === page || next < 1 || next > PAGES.length) return
    setPage(next)
    window.scrollTo(0, 0)
  }

  const current = PAGES.find(p => p.num === page)
  const next = PAGES.find(p => p.num === page + 1)

  return (
    <div>
      <div className="mb-4">
        <PageNav page={page} goTo={goTo} />
      </div>

      <div>
        {page === 1 && <HomePage />}
        {page === 2 && <PlayerValuesPage teams={teams} draftedPlayers={draftedPlayers} />}
        {page === 3 && <TeamWriteupsPage />}
      </div>

      <div className="max-w-5xl mx-auto font-serif mt-6">
        {next ? (
          <button
            onClick={() => goTo(next.num)}
            className="group ml-auto flex items-center gap-2 border-2 border-[#5a4a32] bg-[#efe6d0] hover:bg-[#e5d9bd] px-4 py-2.5 text-[#2b2418]"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c]">Continued on</span>
            <span className="text-sm font-black uppercase tracking-widest">Page {next.roman} · {next.title}</span>
            <ChevronRight size={16} className="text-amber-800 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#8a7a5c]">
            — End of this edition · {current.title} —
          </p>
        )}
      </div>
    </div>
  )
}
