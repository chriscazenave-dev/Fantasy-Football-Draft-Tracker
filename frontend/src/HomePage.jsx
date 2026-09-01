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
  kicker: 'Week 1 · 2026 Season Kickoff Edition',
  headline: 'KICKOFF',
  deck: 'Eight franchises, one champion to dethrone, and a Week 1 slate with no interest in easing anybody into September. The Madness Times has filed the season preview, the power rankings, and the arguments you will pretend not to read before setting your lineup.',
  byline: 'By The Madness Times Season Desk',
  body: [
    'The 2026 season opens with the defending champion still wearing the crown and seven challengers insisting this is the year the crown becomes available. The Evil Empire brings back Patrick Mahomes, Saquon Barkley, Puka Nacua, Jaxon Smith-Njigba, and Brock Purdy in the OP, which is a fairly rude way to begin a title defense.',
    'The draft recap fits in one breath: Hoidus’ Hemmroid took Jeremiyah Love at 1.01, Team caz answered with Fernando Mendoza at 1.02, and Sam Bowlin walked away with eight rookies while Perri Prevost collected seven. The wire was busy on the eve of kickoff too, with Team caz, Whatever who cares, and Hoidus all adding names before the games began.',
    'Now the title race gets a schedule and a scoreboard. Below: the Week 1 matchup desk, the four urgent stories, and the power rankings that will age beautifully or embarrassingly. Settle in, pick your winners, and proceed to the Big Board whenever you need to remember who was supposed to be good.',
  ],
}

const ARTICLES = [
  {
    id: 'week1',
    kicker: 'Week 1 Preview',
    headline: 'Four Games, Eight Opinions, One Chance to Pretend the Projections Are Science',
    byline: 'By The Madness Times Game Desk',
    body: [
      'Team caz opens against Suave Shaheed in the matchup of young firepower and established swagger. Chris caz starts Drake Maye, Bijan Robinson, Breece Hall, Amon-Ra St. Brown, Rashee Rice, Sam LaPorta, DeVonta Smith, Jameson Williams, Sam Darnold in the OP, and Texans D/ST; Nick Casey answers with Josh Allen, Chase Brown, Travis Etienne Jr., Ja’Marr Chase, Parker Washington, Jake Ferguson, Emeka Egbuka, D’Andre Swift, Bo Nix in the OP, and Seahawks D/ST. The desk picks Suave Shaheed, because Josh Allen and Ja’Marr Chase are still allowed to be on the same card.',
      'Whatever who cares meets Hoidus’ Hemmroid, with Sam Bowlin’s runner-up roster sending Jalen Hurts, Jahmyr Gibbs, Christian McCaffrey, George Pickens, Ladd McConkey, Tyler Warren, Bucky Irving, Davante Adams, Jaxson Dart in the OP, and Rams D/ST. Perri Prevost counters with Jordan Love, Kenneth Walker III, Jeremiyah Love, Drake London, A.J. Brown, Mark Andrews, Cam Skattebo, Javonte Williams, C.J. Stroud in the OP, and Vikings D/ST. The pick is Whatever who cares, whose eight-player class and veteran lineup have fewer reasons to apologize in Week 1.',
      'The Evil Empire then receives Cheznovs Abduction in the first title-defense checkpoint. The champion starts Patrick Mahomes, Saquon Barkley, Kyren Williams, Puka Nacua, Jaxon Smith-Njigba, Tucker Kraft, Jaylen Waddle, Tee Higgins, Brock Purdy in the OP, and Eagles D/ST; Austin Dedon sends Lamar Jackson, James Cook III, Bhayshul Tuten, Nico Collins, Zay Flowers, Trey McBride, David Montgomery, MarShawn Lloyd, Justin Herbert in the OP, and an empty D/ST slot. The desk picks The Evil Empire, though Cheznovs finally having James Cook III makes this less of a public service announcement than it used to be.',
      'Teddy Bongwater closes the page against Team Faircloth, with Dylan McElroy starting Jayden Daniels, Jonathan Taylor, Rico Dowdle, CeeDee Lamb, Justin Jefferson, Colston Loveland, Tetairoa McMillan, Garrett Wilson, Dak Prescott in the OP, and Steelers D/ST. Zachary Faircloth and Steven Lambou counter with Joe Burrow, Derrick Henry, De’Von Achane, Chris Olave, DJ Moore, Brock Bowers, Ashton Jeanty, Omarion Hampton, Caleb Williams in the OP, and no D/ST. The pick is Teddy Bongwater by the smallest possible margin: Faircloth has the terrifying skill group, but an empty defense is still an empty defense.',
    ],
  },
  {
    id: 'schefter',
    kicker: 'League Insider',
    headline: 'Sources: Evil Empire Quietly Expects to Repeat, Which Is Somehow More Insufferable',
    byline: 'By Adam Schefter, Senior Dynasty Insider',
    body: [
      'Sources close to the defending champion tell me The Evil Empire had a quiet offseason, which is what happens when Patrick Mahomes, Saquon Barkley, Puka Nacua, and Jaxon Smith-Njigba are already in the building. Per sources, jmo morgan did not confuse activity with improvement. The league calls this “patience”; the rest of us call it deeply annoying.',
      'The core is not merely those four names. Brock Purdy occupies the OP, Jaylen Waddle and Tee Higgins flank the receiver room, and the Week 1 card includes Kyren Williams, Tucker Kraft, and Eagles D/ST. Sources say the roster has enough quality to make every opponent feel like it has already lost one coin flip.',
      'The Malik Nabers situation has also changed: he is on the active roster now after his IR-adjacent limbo, while Jayden Higgins and Dont’e Thornton Jr. are the players actually parked on IR. One rival GM described this as “the cleanest injury bulletin in the league,” then declined to explain what that meant. Sources say the repeat watch is fully operational.',
    ],
  },
  {
    id: 'bigcat',
    kicker: 'Hot Take Central',
    headline: "Cheznovs Found the Running Backs, Hoidus Found the 1.01, and Both Found Week 1 Trouble",
    byline: 'By Big Cat, Barstool Dynasty Desk',
    body: [
      'Folks. FOLKS. Austin Dedon finally has running backs. James Cook III is in the building, and the room is 15 deep now, which is the fantasy equivalent of buying every lottery ticket and still starting Bhayshul Tuten at RB2. Lamar Jackson and Justin Herbert is awesome. Nico Collins, Zay Flowers, Trey McBride, also awesome. No D/ST starting Week 1? Less awesome.',
      'And Hoidus’ Hemmroid has a rebuild that is at least honest about what it is. Perri drafted seven rookies, including the 1.01 Jeremiyah Love, and then put Love directly into the RB2 slot for Week 1. Jordan Love, C.J. Stroud, A.J. Brown, Drake London, and Mark Andrews are the veteran safety rails. The rookie is still driving the bus.',
      'I am picking Hoidus to be more dangerous by the end of the year and Cheznovs to be more dangerous if Austin finds a defense before kickoff. For this Week 1 game, though, the projections say Whatever who cares over Hoidus and Evil Empire over Cheznovs. I hate that the boring answer is probably right. I hate it even more because the bottom of this league is now genuinely interesting.',
    ],
  },
  {
    id: 'analysis',
    kicker: 'Film Room',
    headline: 'The Superflex Arms Race: Why the OP Slot Decides This League',
    byline: 'By The Madness Times Analytics Bureau',
    body: [
      'The OP slot is not theoretical anymore; it has eight actual Week 1 occupants. Brock Purdy takes it for The Evil Empire, Jaxson Dart for Whatever who cares, Bo Nix for Suave Shaheed, Dak Prescott for Teddy Bongwater, Caleb Williams for Team Faircloth, Sam Darnold for Team caz, C.J. Stroud for Hoidus’ Hemmroid, and Justin Herbert for Cheznovs Abduction.',
      'That is the entire league treating the superflex slot as a quarterback slot, which is exactly what a superflex league hopes to see and exactly what a bench quarterback fears. Purdy and Herbert bookend the list with championship and chaos energy; Dart, Nix, Williams, Darnold, Stroud, and Dak give the middle of the slate eight different arguments to have in the group chat.',
      'The roster math matters because the OP does not exist in isolation. Hurts and Daniels start at QB for Whatever who cares and Teddy, while Maye, Burrow, Allen, Mahomes, and Love make the first quarterback slot just as consequential. In Week 1, the team that gets two usable passers is not guaranteed a win, but the team that leaves points on the quarterback table is volunteering for a difficult afternoon.',
    ],
  },
  {
    id: 'futures',
    kicker: 'The Ledger',
    headline: 'Post-Draft Ledger: Perri and Sam Cashed Their Picks, Then the Wire Started Moving',
    byline: 'By The Madness Times Business Desk',
    body: [
      'The draft is over, the picks have been converted into players, and the ledger now has two particularly loud entries. Perri Prevost cashed the 1.01 for Jeremiyah Love and completed a seven-man class; Sam Bowlin walked away with eight rookies, a haul large enough to require its own filing cabinet.',
      'The rebuilders did not merely collect names. Hoidus’ Hemmroid added Germie Bernard, Ty Simpson, KC Concepcion, Chris Bell, Zachariah Branch, and Kenyon Sadiq around Love, while Whatever who cares added Omar Cooper Jr., Jordyn Tyson, Jadarian Price, Makai Lemon, Antonio Williams, Emmett Johnson, Demond Claiborne, and Seth McGowan. The future is now distributed in several inconvenient places.',
      'Then came the eve-of-Week-1 wire. Team caz added Barion Brown, Malachi Fields, and Caleb Douglas while dropping Troy Franklin and Patriots D/ST; Whatever who cares added Tank Dell, Chris Brooks, Brian Robinson Jr., and Jordan James while dropping Dalton Schultz and Lions D/ST; Hoidus added Zavion Thomas and dropped Elic Ayomanor. The advice from the business desk is simple: if you hear the wire move, check whether your title odds just moved with it.',
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
          <span className="hidden sm:inline font-black text-amber-800">Week 1 Kickoff</span>
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
          {/* KICKOFF banner */}
          <div className="border-b-4 border-double border-[#5a4a32] px-4 py-8 text-center bg-[#f7f1e1]">
            <p className="text-[11px] md:text-xs font-black tracking-[0.4em] uppercase text-amber-700 mb-3">
              {LEAD_STORY.kicker}
            </p>
            <h2
              className="text-[3.6rem] leading-[0.85] sm:text-7xl md:text-[8.5rem] font-black uppercase tracking-tighter"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Kickoff
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
                  WANTED: One (1) starting defense. Contact Team Faircloth. Quarterbacks and tight ends available for negotiation.
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
