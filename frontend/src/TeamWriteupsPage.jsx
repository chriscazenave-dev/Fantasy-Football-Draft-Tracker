import { POWER_RANKINGS, TEAM_WRITEUPS } from './paperContent'

export default function TeamWriteupsPage({ dateline }) {
  const today =
    dateline ||
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto font-serif text-[#2b2418]">
      {/* Page header */}
      <div className="border-y-4 border-double border-[#5a4a32] py-5 text-center bg-[#f3ecdb] px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8a7a5c] mb-2">The Dynasty Madness Times · Page Three</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          The Franchise Reports
        </h1>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest text-[#8a7a5c] border-t border-[#c9bb9c] pt-2 mx-auto max-w-2xl">
          <span>{today}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">All Eight Franchises · Full Writeups</span>
        </div>
      </div>

      <div className="py-8 px-4 max-w-3xl mx-auto space-y-12">
        {POWER_RANKINGS.map(entry => {
          const writeup = TEAM_WRITEUPS[entry.team]
          if (!writeup) return null
          return (
            <article key={entry.rank} className={entry.rank > 1 ? 'border-t-2 border-[#c9bb9c] pt-10' : ''}>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700 mb-2">
                Franchise Report · No. {entry.rank} · {entry.owner}
              </p>
              <h2 className="text-2xl md:text-4xl font-black leading-tight mb-2">{writeup.headline}</h2>
              <p className="text-xs italic text-[#8a7a5c] mb-5">{writeup.byline}</p>
              <div className="space-y-4 text-[15px] leading-relaxed text-justify">
                {writeup.body.map((para, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]'
                        : ''
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>
            </article>
          )
        })}
        <div className="border-2 border-[#5a4a32] p-4 text-center bg-[#efe6d0]">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">From the Editor</p>
          <p className="text-sm italic">Complaints about your franchise report may be submitted in writing to the Madness Times desk. Submissions are read aloud at the draft.</p>
        </div>
      </div>
    </div>
  )
}
