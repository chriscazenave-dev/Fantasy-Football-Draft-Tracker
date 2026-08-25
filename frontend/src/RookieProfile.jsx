import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MEASURABLE_ROWS = [
  ['height', 'Height'],
  ['weight', 'Weight'],
  ['age', 'Age'],
  ['armLength', 'Arm'],
  ['forty', '40-Yard'],
  ['tenSplit', '10-Yd Split'],
  ['vertical', 'Vertical'],
  ['broad', 'Broad'],
  ['threeCone', '3-Cone'],
  ['shuttle', 'Shuttle'],
  ['bench', 'Bench'],
]

function Rule({ label }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8a7a5c] whitespace-nowrap">{label}</span>
      <span className="h-px flex-1 bg-[#c9bb9c]" />
    </div>
  )
}

function Trend({ value }) {
  if (value == null || value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[#8a7a5c]">
        <Minus size={12} /> Flat
      </span>
    )
  }
  const up = value > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${up ? 'text-green-700' : 'text-red-700'}`}>
      <Icon size={12} />
      {up ? '+' : ''}
      {value} spots
    </span>
  )
}

export default function RookieProfile({ profile, prospect, detail, boardRank, onBack, onPrev, onNext, prevName, nextName }) {
  const p = profile || {}
  const name = p.name || detail?.fullName || prospect?.name
  const position = p.position || prospect?.position
  const nflTeam = p.nflTeamName || prospect?.nflTeam
  const measurables = { ...(p.measurables || {}) }
  if (!measurables.height && detail?.height) measurables.height = detail.height
  if (!measurables.weight && detail?.weight) measurables.weight = `${detail.weight} lbs`
  if (!measurables.age && detail?.age) measurables.age = String(detail.age)
  const measurableRows = MEASURABLE_ROWS.filter(([key]) => measurables[key])

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900"
        >
          <ArrowLeft size={14} /> Back to the front page
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={!onPrev}
            title={prevName ? `Previous: ${prevName}` : undefined}
            className={`flex items-center gap-1 border-2 border-[#5a4a32] px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
              onPrev ? 'text-amber-800 hover:bg-[#e5d9bd]' : 'border-[#c9bb9c] text-[#c9bb9c] cursor-default'
            }`}
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            title={nextName ? `Next: ${nextName}` : undefined}
            className={`flex items-center gap-1 border-2 border-[#5a4a32] px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
              onNext ? 'text-amber-800 hover:bg-[#e5d9bd]' : 'border-[#c9bb9c] text-[#c9bb9c] cursor-default'
            }`}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Player masthead */}
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700 mb-2">
        Prospect Dossier · No. {boardRank} on the Big Board · {position} · {nflTeam}
      </p>
      <h2 className="text-3xl md:text-5xl font-black leading-[0.95] uppercase tracking-tight mb-3">{name}</h2>
      {p.headline && <h3 className="text-xl md:text-2xl font-black leading-tight mb-2">{p.headline}</h3>}
      {p.subhead && <p className="text-[15px] italic text-[#5a4a32] mb-4 leading-snug">{p.subhead}</p>}

      <div className="flex flex-wrap gap-x-6 gap-y-1 border-y-2 border-[#5a4a32] py-2 text-[12px] uppercase tracking-wider text-[#5a4a32] mb-6">
        {p.college && <span><strong className="font-black">College:</strong> {p.college}{p.classYear ? ` (${p.classYear})` : ''}</span>}
        {p.hometown && <span><strong className="font-black">Hometown:</strong> {p.hometown}</span>}
        {(p.draftPick || detail?.draftCapital) && (
          <span><strong className="font-black">Drafted:</strong> {p.draftPick || detail.draftCapital}</span>
        )}
      </div>

      {/* Market box */}
      <div className="border-2 border-[#5a4a32] bg-[#efe6d0] p-4 mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-3 text-center">The Market · KeepTradeCut Superflex</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-black tabular-nums">{detail?.ktcValue?.toLocaleString() || '—'}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">KTC Value</p>
          </div>
          <div>
            <p className="text-2xl font-black tabular-nums">{detail?.ktcRookieRank ? `#${detail.ktcRookieRank}` : '—'}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Rookie Rank</p>
          </div>
          <div>
            <p className="text-2xl font-black tabular-nums">{detail?.ktcOverallRank ? `#${detail.ktcOverallRank}` : '—'}</p>
            <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Overall Dynasty</p>
          </div>
          <div>
            <p className="text-sm font-black pt-2"><Trend value={detail?.ktcRookieTrend30} /></p>
            <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">30-Day Trend</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#c9bb9c] flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11px] uppercase tracking-wider text-[#5a4a32]">
          {detail?.ktcTier && <span>KTC Tier {detail.ktcTier}</span>}
          {detail?.fpEcrRank && <span>FantasyPros ECR #{detail.fpEcrRank}</span>}
          {detail?.ktcRookieAdp && <span>Rookie ADP {detail.ktcRookieAdp}</span>}
          {detail?.projPtsYear1 && <span>Proj. Yr 1: {detail.projPtsYear1} pts</span>}
        </div>
      </div>

      {!profile && (
        <p className="border-2 border-dashed border-[#c9bb9c] p-4 text-sm italic text-[#8a7a5c]">
          The Madness Times scouting bureau has not filed a full dossier on this prospect yet. Market data above is live.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {p.collegeCareer?.length > 0 && (
            <>
              <Rule label="The College Years" />
              <div className="space-y-4 text-[15px] leading-relaxed text-justify">
                {p.collegeCareer.map((para, i) => (
                  <p
                    key={i}
                    className={i === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]' : ''}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </>
          )}

          {p.collegeStats?.length > 0 && (
            <>
              <Rule label="By the Numbers" />
              <table className="w-full text-[13px] border-2 border-[#5a4a32]">
                <thead>
                  <tr className="bg-[#efe6d0] border-b-2 border-[#5a4a32]">
                    <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-widest">Season</th>
                    <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-widest">Team</th>
                    <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-widest">Production</th>
                  </tr>
                </thead>
                <tbody>
                  {p.collegeStats.map((row, i) => (
                    <tr key={i} className="border-b border-[#c9bb9c] last:border-0 align-top">
                      <td className="px-3 py-1.5 font-black whitespace-nowrap">{row.season}</td>
                      <td className="px-3 py-1.5 whitespace-nowrap text-[#5a4a32]">{row.team}</td>
                      <td className="px-3 py-1.5 tabular-nums">{row.line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {p.draftDayStory?.length > 0 && (
            <>
              <Rule label="Draft Night" />
              <div className="space-y-4 text-[15px] leading-relaxed text-justify">
                {p.draftDayStory.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </>
          )}

          {p.whyTheyDraftedHim?.length > 0 && (
            <>
              <Rule label={`Why ${nflTeam || 'The Team'} Wanted Him`} />
              <ul className="space-y-2 text-[15px] leading-relaxed">
                {p.whyTheyDraftedHim.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-700 font-black">§</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {p.campNotes?.length > 0 && (
            <>
              <Rule label="From Training Camp" />
              <div className="space-y-3">
                {p.campNotes.map((note, i) => (
                  <div key={i} className="border-l-4 border-[#c9bb9c] pl-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      {note.date}{note.source ? ` · ${note.source}` : ''}
                    </p>
                    <p className="text-[14px] leading-snug">{note.note}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {p.beatQuotes?.length > 0 && (
            <>
              <Rule label="What They're Saying" />
              <div className="space-y-5">
                {p.beatQuotes.map((q, i) => (
                  <blockquote key={i} className="border-y border-[#c9bb9c] py-3">
                    <p className="text-[17px] font-semibold italic leading-snug">&ldquo;{q.quote}&rdquo;</p>
                    <footer className="text-[11px] uppercase tracking-widest text-[#8a7a5c] mt-2">— {q.attribution}</footer>
                  </blockquote>
                ))}
              </div>
            </>
          )}

          {p.fantasyOutlook?.length > 0 && (
            <>
              <Rule label="The Fantasy Outlook" />
              <div className="space-y-4 text-[15px] leading-relaxed text-justify">
                {p.fantasyOutlook.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </>
          )}

          {p.bottomLine && (
            <div className="mt-8 border-2 border-[#5a4a32] bg-[#efe6d0] p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">The Bottom Line</p>
              <p className="text-[15px] font-semibold leading-snug">{p.bottomLine}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:border-l-2 border-[#c9bb9c] lg:pl-6 space-y-6">
          {measurableRows.length > 0 && (
            <div className="border-2 border-[#5a4a32]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-center bg-[#5a4a32] text-[#f3ecdb] py-1.5">The Tape Measure</p>
              <dl className="divide-y divide-[#e0d5b8]">
                {measurableRows.map(([key, label]) => (
                  <div key={key} className="flex justify-between px-3 py-1.5 text-[13px]">
                    <dt className="text-[#8a7a5c] uppercase tracking-wider text-[11px] pt-0.5">{label}</dt>
                    <dd className="font-black tabular-nums">{measurables[key]}</dd>
                  </div>
                ))}
              </dl>
              {measurables.combineNote && (
                <p className="px-3 py-2 text-[12px] italic leading-snug border-t-2 border-[#5a4a32] bg-[#f3ecdb]">
                  {measurables.combineNote}
                </p>
              )}
            </div>
          )}

          {p.depthChart && (
            <div className="border-2 border-[#5a4a32] p-3 bg-[#efe6d0]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">Depth Chart Standing</p>
              <p className="text-[13px] leading-snug">{p.depthChart}</p>
            </div>
          )}

          {p.whyHeCouldSucceed?.length > 0 && (
            <div className="border-2 border-green-800/60 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800 mb-2">Why He Hits</p>
              <ul className="space-y-2 text-[13px] leading-snug">
                {p.whyHeCouldSucceed.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-800 font-black">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.whyHeCouldFail?.length > 0 && (
            <div className="border-2 border-red-800/60 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-800 mb-2">Why He Busts</p>
              <ul className="space-y-2 text-[13px] leading-snug">
                {p.whyHeCouldFail.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-800 font-black">−</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.comp && (
            <div className="border-2 border-[#5a4a32] p-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">Pro Comparison</p>
              <p className="text-[13px] leading-snug font-semibold">{p.comp}</p>
            </div>
          )}

          {detail?.scoutingReport && (
            <div className="border-t-2 border-[#c9bb9c] pt-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">Wire Report</p>
              <p className="text-[12px] leading-snug italic">{detail.scoutingReport}</p>
            </div>
          )}

          {p.sources?.length > 0 && (
            <div className="border-t-2 border-[#c9bb9c] pt-3">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">Sourcing</p>
              <ul className="space-y-1">
                {p.sources.map((src, i) => (
                  <li key={i} className="truncate">
                    <a
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-800 underline decoration-[#c9bb9c] hover:decoration-amber-700"
                    >
                      {src.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-10 flex items-center justify-between gap-3 border-t-2 border-[#5a4a32] pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900"
        >
          <ArrowLeft size={14} /> Back to the front page
        </button>
        {onNext && (
          <button
            onClick={onNext}
            className="group flex items-center gap-2 border-2 border-[#5a4a32] bg-[#efe6d0] hover:bg-[#e5d9bd] px-3 py-2"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c]">Next dossier</span>
            <span className="text-xs font-black uppercase tracking-widest">{nextName}</span>
            <ChevronRight size={14} className="text-amber-800 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </div>
  )
}
