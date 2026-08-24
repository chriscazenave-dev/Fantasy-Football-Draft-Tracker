import { useState } from 'react'
import { Trophy, Medal, ArrowLeft } from 'lucide-react'
import { POWER_RANKINGS, TEAM_WRITEUPS } from './paperContent'


const ARTICLES = [
  {
    id: 'schefter',
    kicker: 'LEAGUE INSIDER',
    headline: 'Sources: Evil Empire "Fully Expects" to Repeat, League Office Braces for Another Insufferable Year',
    byline: 'By Adam Schefter, Senior Dynasty Insider',
    body: [
      'Sources close to the situation tell me that The Evil Empire, fresh off its 2025 championship, has been sending the trophy emoji in the league chat "at a rate that concerns everyone involved." Per sources, jmo morgan spent the offseason doing exactly nothing, because when you roster Patrick Mahomes, Saquon Barkley, and Puka Nacua, nothing is a strategy.',
      'League sources confirm the real story is the return of Malik Nabers at full strength. One rival GM, speaking on condition of anonymity because "he will screenshot this," described the situation as "genuinely unfair" and "the kind of thing a commissioner should look into."',
      'Meanwhile, sources say Whatever who cares has privately told confidants that second place "will not happen again." When reached for comment, Sam Bowlin replied "whatever," which sources describe as "on brand."',
    ],
  },
  {
    id: 'rookies',
    kicker: 'DRAFT SEASON',
    headline: 'The 2026 Rookie Class Is Loaded at the Top, and This League Is About to Fight Over It',
    byline: 'By The Madness Times Scouting Bureau',
    body: [
      'Start with the consensus 1.01: Jeremiyah Love, the Notre Dame running back Arizona took third overall in April. Scouts have compared his contact balance to prime Alvin Kamara, and landing in a Cardinals offense desperate for a workhorse makes him the rare rookie projected for legitimate RB1 volume from Week 1. In this room, the manager holding the first pick should expect trade calls hourly.',
      'The superflex twist is Fernando Mendoza, the Indiana quarterback the Raiders made the first overall pick of the draft. In a league that starts two QBs, a day-one NFL starter is dynasty gold, and Ty Simpson going to the Rams as the heir behind Matthew Stafford gives this class a second premium passer. The wideout tier is deep too: Jordyn Tyson to the Saints, Makai Lemon to the Eagles, and Carnell Tate to the Titans all landed in offenses with immediate target vacancies.',
      'Deeper sleepers the Madness Times desk is monitoring: Kenyon Sadiq, the Oregon tight end the Jets grabbed early, and Penn State\'s bruising backfield export Kaytron Allen. The mock draft simulator in the Prospects tab now carries all 113 names with full projections. Practice accordingly, because this rookie draft will decide the 2027 standings.',
    ],
  },
  {
    id: 'bigcat',
    kicker: 'HOT TAKE CENTRAL',
    headline: "The Bottom of This League Is Electric Factory: A Loving Roast of Cheznovs Abduction and Hoidus' Hemmroid",
    byline: 'By Big Cat, Barstool Dynasty Desk',
    body: [
      'Folks. FOLKS. Austin Dedon woke up, looked at a superflex dynasty league, and said "give me Lamar Jackson AND Justin Herbert." Awesome. Love it. Then he looked at his running back room and said "Blake Corum, that\'s a starter." That\'s not a fantasy team, that\'s a trust fall with no one standing behind you.',
      "And Hoidus' Hemmroid. First of all, the name. Spelled wrong, medically inaccurate, absolutely perfect. Perri has A.J. Brown, Drake London, and Mark Andrews, which sounds good until you realize the QB room is Jordan Love and a bag of Cam Wards. This roster is fully healthy and still projected last. That's the most electric thing I've ever seen.",
      "Vegas has both teams at +50000 to win the title. I'm hammering the under on wins, the over on league-chat excuses, and Teddy Bongwater to somehow be involved in the most cursed trade of the season. Book it.",
    ],
  },
  {
    id: 'analysis',
    kicker: 'FILM ROOM',
    headline: 'The Superflex Arms Race: Why the OP Slot Decides This League',
    byline: 'By The Madness Times Analytics Bureau',
    body: [
      'Look at the top of the standings projection and a pattern emerges: the teams that treat the OP (superflex) slot as a second quarterback are lapping the field. Team Faircloth trots out Burrow AND Trevor Lawrence. The Evil Empire pairs Mahomes with Brock Purdy. Whatever who cares hands the keys to rookie-no-more Jaxson Dart.',
      "Then there's Team caz, starting Aaron Rodgers, age redacted out of respect, and Teddy Bongwater flexing Jared Goff, which is fine in the way that lukewarm coffee is fine. The math is brutal: a bench QB scoring 12 a week beats a bench WR scoring 6, every week, forever.",
      'The trade deadline prediction from this desk: at least one desperate contender overpays for a mid QB by October. Our money is on the price being a 2027 first. It always is.',
    ],
  },
  {
    id: 'futures',
    kicker: 'THE LEDGER',
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
      <p className="text-xs italic text-[var(--ink-muted)] mb-6">{writeup.byline}</p>
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

export default function HomePage({ dateline }) {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const today =
    dateline ||
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto font-serif text-[var(--ink)]">
      {/* Masthead */}
      <div className="border-y-4 border-double border-[var(--rule-strong)] py-6 text-center bg-[var(--paper-2)] px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--ink-muted)] mb-2">Est. 2025 · All the takes fit to print</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          The Dynasty Madness Times
        </h1>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest text-[var(--ink-muted)] border-t border-[var(--rule)] pt-2 mx-auto max-w-2xl">
          <span>{today}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Dynasty Madness League</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Price: One 2027 Second</span>
        </div>
      </div>

      {/* 2025 finishers banner */}
      <div className="bg-[var(--paper-3)] border-b-2 border-[var(--rule)] px-4 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 font-bold">
          <Trophy size={15} className="text-amber-600" /> 2025 Champion: The Evil Empire
        </span>
        <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
          <Medal size={14} className="text-gray-500" /> Runner-up: Whatever who cares
        </span>
        <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
          <Medal size={14} className="text-amber-800" /> Third: Suave Shaheed
        </span>
      </div>

      {selectedTeam ? (
        <TeamWriteup team={selectedTeam} onBack={() => setSelectedTeam(null)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 px-4">
          {/* Articles column */}
          <div className="lg:col-span-2 space-y-10">
            {ARTICLES.map((article, idx) => (
              <article key={article.id} className={idx > 0 ? 'border-t-2 border-[var(--rule)] pt-8' : ''}>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700 mb-2">{article.kicker}</p>
                <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">{article.headline}</h2>
                <p className="text-xs italic text-[var(--ink-muted)] mb-4">{article.byline}</p>
                <div className="space-y-3 text-[15px] leading-relaxed text-justify">
                  {article.body.map((para, i) => (
                    <p key={i} className={i === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-[0.8]' : ''}>
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Power rankings column */}
          <aside className="lg:border-l-2 border-[var(--rule)] lg:pl-8">
            <div className="border-y-2 border-[var(--rule-strong)] py-2 mb-5 text-center">
              <h3 className="text-lg font-black uppercase tracking-[0.2em]">Power Rankings</h3>
              <p className="text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">Preseason Edition · The Madness Times Desk</p>
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
                      className="font-bold leading-tight text-left underline decoration-[var(--rule)] underline-offset-2 hover:text-amber-800 hover:decoration-amber-700"
                    >
                      {entry.team}
                    </button>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] mb-1">{entry.owner}</p>
                    <p className="text-[13px] leading-snug text-[var(--ink-soft)]">{entry.blurb}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 border-2 border-[var(--rule-strong)] p-4 text-center bg-[var(--paper-3)]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--ink-muted)] mb-1">Classified Ads</p>
              <p className="text-sm italic">WANTED: One (1) starting running back. Contact A. Dedon, Cheznovs Abduction. Will pay in quarterbacks.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
