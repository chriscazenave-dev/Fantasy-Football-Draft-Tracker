import { useMemo, useState } from 'react'
import { Trophy, Medal, ArrowLeft, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { POWER_RANKINGS, TEAM_WRITEUPS } from './paperContent'
import { ROOKIE_PROSPECTS } from './leagueData'
import { ROOKIE_DETAILS } from './rookieDetailData'
import { ROOKIE_PROFILES } from './rookieProfileData'
import RookieProfile from './RookieProfile'

const BOARD_SIZE = 75
const POSITION_FILTERS = ['All', 'QB', 'RB', 'WR', 'TE']

const LEAD_STORY = {
  kicker: 'The 2026 Rookie Draft · Extra Edition',
  headline: 'DRAFT DAY',
  deck: 'Eight franchises, one loaded rookie class, and a big board the whole league has been arguing about since April. The Madness Times filed a full dossier on all 75 names — tap any prospect to read it.',
  byline: 'By The Madness Times Scouting Bureau',
  body: [
    'It is finally here. After an April draft that reshaped half the league, a summer of trade chatter, and a full training camp of depth-chart reshuffling, the Dynasty Madness rookie draft opens today with the most talked-about class since this league started keeping records. The board is 75 deep in this edition, every name carries a live KeepTradeCut superflex value, and the consensus at the top has not budged: Jeremiyah Love is the 1.01, and everyone else is negotiating.',
    'What has moved is everything underneath him. Camp reporting turned Carnell Tate into the class\u2019s premier receiver bet, pushed Jadarian Price into the first tier of running backs, and dropped a hamstring-shortened Jordyn Tyson a few rungs on a board that punishes uncertainty in August. The quarterback question is the one that decides this room: in a format that starts two, Fernando Mendoza and Ty Simpson are worth more here than any model built for one-QB leagues will ever tell you.',
    'Below is the Big Board, refreshed off live market data this morning, followed by the rest of today\u2019s paper. Every prospect on it is clickable: college career, per-season production, combine numbers, draft-night context, camp notes with dates and sources, what the beat writers are saying, where he actually sits on his depth chart, and the honest case for and against him. Read before you pick. Or do not, and let the rest of us enjoy it.',
  ],
}

const ARTICLES = [
  {
    id: 'schefter',
    kicker: 'League Insider',
    headline: 'Sources: Evil Empire "Fully Expects" to Repeat, League Office Braces for Another Insufferable Year',
    byline: 'By Adam Schefter, Senior Dynasty Insider',
    body: [
      'Sources close to the situation tell me that The Evil Empire, fresh off its 2025 championship, has been sending the trophy emoji in the league chat "at a rate that concerns everyone involved." Per sources, jmo morgan spent the offseason doing exactly nothing, because when you roster Patrick Mahomes, Saquon Barkley, and Puka Nacua, nothing is a strategy.',
      'League sources confirm the real story is the return of Malik Nabers at full strength. One rival GM, speaking on condition of anonymity because "he will screenshot this," described the situation as "genuinely unfair" and "the kind of thing a commissioner should look into."',
      'Meanwhile, sources say Whatever who cares has privately told confidants that second place "will not happen again." When reached for comment, Sam Bowlin replied "whatever," which sources describe as "on brand."',
    ],
  },
  {
    id: 'bigcat',
    kicker: 'Hot Take Central',
    headline: "The Bottom of This League Is Electric Factory: A Loving Roast of Cheznovs Abduction and Hoidus' Hemmroid",
    byline: 'By Big Cat, Barstool Dynasty Desk',
    body: [
      'Folks. FOLKS. Austin Dedon woke up, looked at a superflex dynasty league, and said "give me Lamar Jackson AND Justin Herbert." Awesome. Love it. Then he looked at his running back room and said "Blake Corum, that\'s a starter." That\'s not a fantasy team, that\'s a trust fall with no one standing behind you.',
      "And Hoidus' Hemmroid. First of all, the name. Spelled wrong, medically inaccurate, absolutely perfect. Perri has A.J. Brown, Drake London, and Mark Andrews, which sounds good until you realize the QB room is Jordan Love and a bag of Cam Wards. This roster is fully healthy and still projected last. That's the most electric thing I've ever seen.",
      'Vegas has both teams at +50000 to win the title. I\'m hammering the under on wins, the over on league-chat excuses, and Teddy Bongwater to somehow be involved in the most cursed trade of the season. Book it. And yes, both of these rosters are picking early today, which is the only mercy the schedule offers them.',
    ],
  },
  {
    id: 'analysis',
    kicker: 'Film Room',
    headline: 'The Superflex Arms Race: Why the OP Slot Decides This League',
    byline: 'By The Madness Times Analytics Bureau',
    body: [
      'Look at the top of the standings projection and a pattern emerges: the teams that treat the OP (superflex) slot as a second quarterback are lapping the field. Team Faircloth trots out Burrow AND Trevor Lawrence. The Evil Empire pairs Mahomes with Brock Purdy. Whatever who cares hands the keys to rookie-no-more Jaxson Dart.',
      "Then there's Team caz, starting Aaron Rodgers, age redacted out of respect, and Teddy Bongwater flexing Jared Goff, which is fine in the way that lukewarm coffee is fine. The math is brutal: a bench QB scoring 12 a week beats a bench WR scoring 6, every week, forever.",
      'Which is exactly why the rookie quarterbacks on today\u2019s board are priced the way they are. A day-one NFL starter in a two-QB format is not a luxury pick, it is an appreciating asset, and the manager who lets one slide two rounds past his market value is the manager who calls in October asking what it costs to fix the problem. It costs a first. It always costs a first.',
    ],
  },
  {
    id: 'futures',
    kicker: 'The Ledger',
    headline: 'Future Picks Are the Real Currency, and Half This League Is Already in Debt',
    byline: 'By The Madness Times Business Desk',
    body: [
      'Forget the rosters for a second and read the ledger. The future picks board shows a league quietly splitting into lenders and borrowers: the contenders keep shipping out 2027 and 2028 firsts for right-now help, and the rebuilders keep cashing them like bonds that pay out in Jeremiyah Loves.',
      'The analytics on this are unambiguous. In superflex dynasty formats, a future first inside a loaded class returns more value than all but the top fifteen veterans, and the 2027 class is already drawing "generational at quarterback" chatter from the college scouting desks. Every first traded this summer is a loan against a market that only goes up.',
      "The Madness Times advice column, condensed: if you are winning now, spend, because flags fly forever. If you are not, hoard picks and let someone else's impatience fund your dynasty. And if you are not sure which one you are, check the power rankings on this very page. We ranked you. You know.",
    ],
  },
]

function TeamWriteup({ team, onBack }) {
  const writeup = TEAM_WRITEUPS[team.team]
  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900 mb-6"
      >
        <ArrowLeft size={14} /> Back to the front page
      </button>
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700 mb-2">
        Franchise Report · No. {team.rank} · {team.owner}
      </p>
      <h2 className="text-3xl md:text-4xl font-black leading-tight mb-2">{writeup.headline}</h2>
      <p className="text-xs italic text-[#8a7a5c] mb-6">{writeup.byline}</p>
      <div className="space-y-4 text-[15px] leading-relaxed text-justify">
        {writeup.body.map((para, i) => (
          <p key={i} className={i === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]' : ''}>
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}

function BoardRow({ entry, onSelect }) {
  const { prospect, detail, profile } = entry
  const trend = detail?.ktcRookieTrend30 ?? 0
  return (
    <li className="flex gap-2.5 border-b border-[#e0d5b8] py-2 last:border-0">
      <span className="text-xl font-black text-[#c9bb9c] leading-none w-7 flex-shrink-0 text-right tabular-nums pt-0.5">
        {prospect.rank}
      </span>
      <div className="min-w-0 flex-1">
        <button
          onClick={() => onSelect(prospect.id)}
          className="text-left font-bold leading-tight underline decoration-[#c9bb9c] underline-offset-2 hover:text-amber-800 hover:decoration-amber-700"
        >
          {detail?.fullName || prospect.name}
        </button>
        <p className="text-[10px] uppercase tracking-wider text-[#8a7a5c]">
          {prospect.position} · {prospect.nflTeam}
          {detail?.draftCapital ? ` · ${detail.draftCapital.replace('Round ', 'Rd ').replace('Pick ', 'Pk ')}` : ''}
        </p>
        {profile?.subhead && <p className="text-[12px] leading-snug text-[#4a3f2c] mt-0.5">{profile.subhead}</p>}
      </div>
      <div className="text-right flex-shrink-0 w-16">
        <p className="text-[13px] font-black tabular-nums">{detail?.ktcValue?.toLocaleString() || '—'}</p>
        {trend !== 0 && (
          <p className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${trend > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend > 0 ? `+${trend}` : trend}
          </p>
        )}
      </div>
    </li>
  )
}

export default function HomePage({ dateline, initialRookieId, onRookieViewed }) {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [localRookieId, setLocalRookieId] = useState(null)
  const [positionFilter, setPositionFilter] = useState('All')
  const selectedRookieId = localRookieId ?? initialRookieId ?? null

  const board = useMemo(
    () =>
      [...ROOKIE_PROSPECTS]
        .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
        .slice(0, BOARD_SIZE)
        .map(prospect => ({
          prospect,
          detail: ROOKIE_DETAILS[prospect.id] || null,
          profile: ROOKIE_PROFILES[prospect.id] || null,
        })),
    [],
  )

  const filteredBoard = useMemo(
    () => (positionFilter === 'All' ? board : board.filter(e => e.prospect.position === positionFilter)),
    [board, positionFilter],
  )

  const movers = useMemo(() => {
    const withTrend = board.filter(e => (e.detail?.ktcRookieTrend30 ?? 0) !== 0)
    const risers = [...withTrend].sort((a, b) => b.detail.ktcRookieTrend30 - a.detail.ktcRookieTrend30).slice(0, 4)
    const fallers = [...withTrend].sort((a, b) => a.detail.ktcRookieTrend30 - b.detail.ktcRookieTrend30).slice(0, 4)
    return { risers, fallers }
  }, [board])

  const selectedIndex = board.findIndex(e => e.prospect.id === selectedRookieId)
  const selected = selectedIndex >= 0 ? board[selectedIndex] : null
  const prev = selectedIndex > 0 ? board[selectedIndex - 1] : null
  const next = selectedIndex >= 0 && selectedIndex < board.length - 1 ? board[selectedIndex + 1] : null

  const openRookie = id => {
    setLocalRookieId(id)
    setSelectedTeam(null)
    window.scrollTo(0, 0)
  }

  const closeRookie = () => {
    setLocalRookieId(null)
    onRookieViewed?.()
    window.scrollTo(0, 0)
  }

  const today =
    dateline ||
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const profiledCount = board.filter(e => e.profile).length

  return (
    <div className="max-w-5xl mx-auto font-serif text-[#2b2418]">
      {/* Masthead */}
      <div className="border-y-4 border-double border-[#5a4a32] py-6 text-center bg-[#f3ecdb] px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8a7a5c] mb-2">Est. 2025 · All the takes fit to print</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          The Dynasty Madness Times
        </h1>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest text-[#8a7a5c] border-t border-[#c9bb9c] pt-2 mx-auto max-w-2xl">
          <span>{today}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-black text-amber-800">Draft Day Extra</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Price: One 2027 Second</span>
        </div>
      </div>

      {/* 2025 finishers banner */}
      <div className="bg-[#efe6d0] border-b-2 border-[#c9bb9c] px-4 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 font-bold">
          <Trophy size={15} className="text-amber-600" /> 2025 Champion: The Evil Empire
        </span>
        <span className="flex items-center gap-1.5 text-[#5a4a32]">
          <Medal size={14} className="text-gray-500" /> Runner-up: Whatever who cares
        </span>
        <span className="flex items-center gap-1.5 text-[#5a4a32]">
          <Medal size={14} className="text-amber-800" /> Third: Suave Shaheed
        </span>
      </div>

      {selected ? (
        <RookieProfile
          profile={selected.profile}
          prospect={selected.prospect}
          detail={selected.detail}
          boardRank={selected.prospect.rank}
          onBack={closeRookie}
          onPrev={prev ? () => openRookie(prev.prospect.id) : undefined}
          onNext={next ? () => openRookie(next.prospect.id) : undefined}
          prevName={prev ? prev.detail?.fullName || prev.prospect.name : undefined}
          nextName={next ? next.detail?.fullName || next.prospect.name : undefined}
        />
      ) : selectedTeam ? (
        <TeamWriteup team={selectedTeam} onBack={() => setSelectedTeam(null)} />
      ) : (
        <>
          {/* DRAFT DAY banner */}
          <div className="border-b-4 border-double border-[#5a4a32] px-4 py-8 text-center bg-[#f7f1e1]">
            <p className="text-[11px] md:text-xs font-black tracking-[0.4em] uppercase text-amber-700 mb-3">
              {LEAD_STORY.kicker}
            </p>
            <h2
              className="text-[3.6rem] leading-[0.85] sm:text-7xl md:text-[8.5rem] font-black uppercase tracking-tighter"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Draft Day
            </h2>
            <p className="mt-4 text-[15px] md:text-lg max-w-3xl mx-auto leading-snug font-semibold">{LEAD_STORY.deck}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest text-[#5a4a32] border-t border-[#c9bb9c] pt-3 max-w-2xl mx-auto">
              <span><strong className="font-black">{BOARD_SIZE}</strong> prospects ranked</span>
              <span><strong className="font-black">{profiledCount}</strong> full dossiers filed</span>
              <span>Values live from KeepTradeCut</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 px-4">
            {/* Lead + board */}
            <div className="lg:col-span-2 space-y-8">
              <article>
                <p className="text-xs italic text-[#8a7a5c] mb-4">{LEAD_STORY.byline}</p>
                <div className="space-y-3 text-[15px] leading-relaxed text-justify">
                  {LEAD_STORY.body.map((para, i) => (
                    <p
                      key={i}
                      className={i === 0 ? 'first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-[0.75]' : ''}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </article>

              {/* The Big Board */}
              <section className="border-t-2 border-[#5a4a32] pt-6">
                <div className="border-y-2 border-[#5a4a32] py-2 mb-4 text-center">
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em]">The Big Board · Top {BOARD_SIZE}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">
                    Tap a name for the full dossier · KTC superflex value, 30-day trend
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {POSITION_FILTERS.map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPositionFilter(pos)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-2 ${
                        positionFilter === pos
                          ? 'border-[#5a4a32] bg-[#5a4a32] text-[#f3ecdb]'
                          : 'border-[#c9bb9c] text-[#8a7a5c] hover:border-[#5a4a32] hover:text-amber-800'
                      }`}
                    >
                      {pos === 'All' ? 'All Positions' : pos}
                    </button>
                  ))}
                  <span className="ml-auto text-[10px] uppercase tracking-widest text-[#8a7a5c]">
                    {filteredBoard.length} listed
                  </span>
                </div>

                <ol className="sm:columns-2 sm:gap-8">
                  {filteredBoard.map(entry => (
                    <BoardRow key={entry.prospect.id} entry={entry} onSelect={openRookie} />
                  ))}
                </ol>
                <p className="text-[11px] italic text-[#8a7a5c] mt-4">
                  Board refreshed the morning of the draft. The full 100-plus name board, mock draft simulator and live
                  pick tracker live in the Prospects tab.
                </p>
              </section>

              {/* Rest of the paper */}
              <section className="border-t-2 border-[#5a4a32] pt-6 space-y-10">
                <div className="border-y-2 border-[#5a4a32] py-2 text-center">
                  <h3 className="text-lg font-black uppercase tracking-[0.2em]">Elsewhere in Today&rsquo;s Edition</h3>
                </div>
                {ARTICLES.map((article, idx) => (
                  <article key={article.id} className={idx > 0 ? 'border-t border-[#c9bb9c] pt-8' : ''}>
                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700 mb-2">{article.kicker}</p>
                    <h4 className="text-2xl md:text-3xl font-black leading-tight mb-2">{article.headline}</h4>
                    <p className="text-xs italic text-[#8a7a5c] mb-4">{article.byline}</p>
                    <div className="space-y-3 text-[15px] leading-relaxed text-justify">
                      {article.body.map((para, i) => (
                        <p key={i} className={i === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]' : ''}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="lg:border-l-2 border-[#c9bb9c] lg:pl-8 space-y-8">
              {/* Top of the board teaser */}
              <div>
                <div className="border-y-2 border-[#5a4a32] py-2 mb-4 text-center">
                  <h3 className="text-lg font-black uppercase tracking-[0.2em]">The First Round</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Who gets called first</p>
                </div>
                <ol className="space-y-3">
                  {board.slice(0, 8).map(entry => (
                    <li key={entry.prospect.id} className="flex gap-3">
                      <span className="text-2xl font-black text-[#c9bb9c] leading-none w-7 flex-shrink-0 text-right tabular-nums">
                        {entry.prospect.rank}
                      </span>
                      <div className="min-w-0">
                        <button
                          onClick={() => openRookie(entry.prospect.id)}
                          className="font-bold leading-tight text-left underline decoration-[#c9bb9c] underline-offset-2 hover:text-amber-800 hover:decoration-amber-700"
                        >
                          {entry.detail?.fullName || entry.prospect.name}
                        </button>
                        <p className="text-[10px] uppercase tracking-wider text-[#8a7a5c]">
                          {entry.prospect.position} · {entry.prospect.nflTeam} · KTC {entry.detail?.ktcValue?.toLocaleString() || '—'}
                        </p>
                        {entry.profile?.comp && (
                          <p className="text-[12px] leading-snug text-[#4a3f2c]">{entry.profile.comp}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Camp movers */}
              <div className="border-2 border-[#5a4a32] p-4 bg-[#efe6d0]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-3 text-center">
                  Camp Movers · Last 30 Days
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-800 mb-1">Rising</p>
                <ul className="mb-3 space-y-1">
                  {movers.risers.map(entry => (
                    <li key={entry.prospect.id} className="flex justify-between gap-2 text-[13px]">
                      <button
                        onClick={() => openRookie(entry.prospect.id)}
                        className="text-left underline decoration-[#c9bb9c] underline-offset-2 hover:text-amber-800 truncate"
                      >
                        {entry.detail?.fullName || entry.prospect.name}
                      </button>
                      <span className="font-black text-green-800 tabular-nums whitespace-nowrap">
                        +{entry.detail.ktcRookieTrend30}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-800 mb-1">Sliding</p>
                <ul className="space-y-1">
                  {movers.fallers.map(entry => (
                    <li key={entry.prospect.id} className="flex justify-between gap-2 text-[13px]">
                      <button
                        onClick={() => openRookie(entry.prospect.id)}
                        className="text-left underline decoration-[#c9bb9c] underline-offset-2 hover:text-amber-800 truncate"
                      >
                        {entry.detail?.fullName || entry.prospect.name}
                      </button>
                      <span className="font-black text-red-800 tabular-nums whitespace-nowrap">
                        {entry.detail.ktcRookieTrend30}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] italic text-[#8a7a5c] mt-3 leading-snug">
                  Movement in KTC rookie rank since late July, when camps opened.
                </p>
              </div>

              {/* Power rankings */}
              <div>
                <div className="border-y-2 border-[#5a4a32] py-2 mb-5 text-center">
                  <h3 className="text-lg font-black uppercase tracking-[0.2em]">Power Rankings</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Draft-Day Edition · The Madness Times Desk</p>
                </div>
                <ol className="space-y-5">
                  {POWER_RANKINGS.map(entry => (
                    <li key={entry.rank} className="flex gap-3">
                      <span className="text-3xl font-black text-[#c9bb9c] leading-none w-8 flex-shrink-0 text-right">{entry.rank}</span>
                      <div>
                        <button
                          onClick={() => {
                            setSelectedTeam(entry)
                            window.scrollTo(0, 0)
                          }}
                          className="font-bold leading-tight text-left underline decoration-[#c9bb9c] underline-offset-2 hover:text-amber-800 hover:decoration-amber-700"
                        >
                          {entry.team}
                        </button>
                        <p className="text-[10px] uppercase tracking-wider text-[#8a7a5c] mb-1">{entry.owner}</p>
                        <p className="text-[13px] leading-snug text-[#4a3f2c]">{entry.blurb}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-2 border-[#5a4a32] p-4 text-center bg-[#efe6d0]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">Classified Ads</p>
                <p className="text-sm italic">
                  WANTED: One (1) starting running back. Contact A. Dedon, Cheznovs Abduction. Will pay in quarterbacks.
                </p>
              </div>

              <div className="border-t-2 border-[#c9bb9c] pt-3 text-center">
                <button
                  onClick={() => openRookie(board[0]?.prospect.id)}
                  className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-amber-800 hover:text-amber-900"
                >
                  Start at No. 1 on the board
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
