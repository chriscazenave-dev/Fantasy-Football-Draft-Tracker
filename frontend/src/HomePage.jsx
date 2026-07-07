import { useState } from 'react'
import { Trophy, Medal, ArrowLeft } from 'lucide-react'

const POWER_RANKINGS = [
  {
    rank: 1,
    team: 'Whatever who cares',
    owner: 'Sam Bowlin',
    blurb:
      'The name says apathy; the roster says dynasty. Hurts, Gibbs, and a somehow-still-vintage Christian McCaffrey headline the highest-projected starting lineup in the league, with Jaxson Dart quietly cooking in the superflex. Runner-up last year, and this time the silver medal is not on the menu.',
  },
  {
    rank: 2,
    team: 'Team Faircloth',
    owner: 'Zachary Faircloth & Steven Lambou',
    blurb:
      "Burrow under center, Ashton Jeanty and De'Von Achane in the backfield, Brock Bowers at tight end. This is what happens when a franchise drafts like it has a plan. The scary part is the core is young enough that the window stays open for years.",
  },
  {
    rank: 3,
    team: 'The Evil Empire',
    owner: 'jmo morgan',
    blurb:
      'The defending champs return with Mahomes, Barkley, and Puka Nacua, plus Brock Purdy stashed in the OP slot like a second dessert. The crown is heavy, the target is on the helmet, and a healthy Malik Nabers could be the most terrifying midseason boost in league history.',
  },
  {
    rank: 4,
    team: 'Suave Shaheed',
    owner: 'Nick Casey',
    blurb:
      "Josh Allen to Ja'Marr Chase is a cheat code, and Jaxon Smith-Njigba became a top-five wideout while nobody was watching. Third place last year with the smoothest team name in the league. If the RB2 spot (Tyrone Tracy Jr., bless him) gets solved, this team is a title threat.",
  },
  {
    rank: 5,
    team: 'Team caz',
    owner: 'chris caz',
    blurb:
      'Drake Maye graduated from "interesting" to "franchise QB," and Bijan Robinson plus Breece Hall is the best young RB duo on paper. The problem is the paper also lists Aaron Rodgers as the superflex starter in the year of our lord 2026. Ceiling of a contender, floor of a podcast.',
  },
  {
    rank: 6,
    team: 'Teddy Bongwater',
    owner: 'Dylan McElroy',
    blurb:
      'Jefferson and CeeDee are elite, Jonathan Taylor still runs angry, and Jayden Daniels lurks like a plot twist waiting for his cue. But Dak Prescott in a superflex league is a lifestyle choice, and the tight end room is Kyle Pitts and prayers. Sneaky dangerous. Emphasis on sneaky.',
  },
  {
    rank: 7,
    team: 'Cheznovs Abduction',
    owner: 'Austin Dedon',
    blurb:
      'Lamar AND Herbert is a genuinely great QB room. Unfortunately the abduction apparently took the running backs too, because Blake Corum is your RB1. The quarterbacks can only carry so much, Austin. We checked the math.',
  },
  {
    rank: 8,
    team: "Hoidus' Hemmroid",
    owner: 'Perri Prevost',
    blurb:
      'A.J. Brown and Drake London deserve better than this. The wideout room is legitimate; everything behind it plays like a group project the night before the deadline. Cam Skattebo as your RB1 is a bold strategy, the kind of bold usually followed by a top-two rookie pick.',
  },
]

const TEAM_WRITEUPS = {
  'Whatever who cares': {
    headline: 'Whatever Who Cares Is One Rookie Pick Away From Not Caring All the Way to a Title',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'Sam Bowlin has assembled the most complete starting lineup in the league while projecting the energy of a man ordering the same sandwich every day. Jalen Hurts gives the offense a rushing floor no other QB room here can match, Jahmyr Gibbs is a top-three dynasty asset by any sane model, and Christian McCaffrey keeps aging like the contract says he is not allowed to.',
      'The superflex is the quiet story. Jaxson Dart went from "interesting stash" to legitimate weekly starter, and pairing him with Hurts means this team never punts a QB slot. The wide receiver room is deep rather than spectacular, which is exactly what a contending roster wants in a league where the flex spots decide October.',
      'The Madness Times projection: first place in the regular season, and the only real question is whether last year\'s runner-up finish left scar tissue. Sources describe the mood in the building as "whatever," which historically is when this franchise is most dangerous.',
    ],
  },
  'Team Faircloth': {
    headline: 'Team Faircloth Built a Contender on Purpose, Which Frankly Feels Like Cheating',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'Two general managers, one plan. Joe Burrow remains a top-five fantasy passer when upright, and the Zachary Faircloth and Steven Lambou braintrust surrounded him with the best young skill core in the league: Ashton Jeanty, De\'Von Achane, and Brock Bowers, three players who will all be first-round startup picks for the next half decade.',
      'Jeanty is the headline. After a rookie season that validated the hype, most projection systems have him top five among all running backs this year, and Achane gives the lineup a weekly ceiling that terrifies opposing managers. Trevor Lawrence in the OP slot is the kind of boring, correct decision this franchise specializes in.',
      'The path to a title runs through the champs, but no roster here is better positioned for the next three seasons. The Madness Times projection: second place now, first place soon, insufferable group-chat energy throughout.',
    ],
  },
  'The Evil Empire': {
    headline: 'The Evil Empire Ran It Back, Because When You Have Mahomes You Get to Do That',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'The defending champion did exactly nothing this offseason, and that was the right call. Patrick Mahomes, Saquon Barkley, and Puka Nacua is a championship spine, and Brock Purdy in the superflex means jmo morgan starts two playoff-caliber quarterbacks every single week.',
      'Barkley is the swing piece. The projection models split on whether he repeats as an elite RB1 or settles into very-good territory, but even the pessimistic case keeps this lineup top three. A fully healthy Malik Nabers returning to form is the kind of midseason upgrade other teams have to trade a first for.',
      'The Madness Times projection: the target is enormous, the roster is old in exactly zero important places, and the rest of the league spent the offseason forwarding each other trade proposals about it. Third in our rankings only because the two teams above added more this spring.',
    ],
  },
  'Suave Shaheed': {
    headline: 'Suave Shaheed Has the Best QB-WR Battery in the League and One Very Loud Problem',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      "Josh Allen throwing to Ja'Marr Chase is the single best two-player combination any manager here can put on a lineup card. Add Jaxon Smith-Njigba, who quietly finished as a top-five receiver last season and projects even better in year four, and Nick Casey owns the league's scariest passing-game core.",
      'The problem wears a running back jersey. Tyrone Tracy Jr. as the RB2 is survivable in September and a liability in December, and every projection system agrees the gap between this team and the top three is exactly one starting running back wide.',
      'The Madness Times projection: fourth, with the highest trade-deadline urgency in the league. If a real RB2 arrives by November, this team can beat anyone in a three-week playoff sprint. The front office knows it, and more importantly, so does everyone trying to overcharge them.',
    ],
  },
  'Team caz': {
    headline: 'Team Caz Is Half Championship Core, Half Science Experiment',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'Drake Maye made the leap. That is the headline for chris caz, whose young quarterback finished last season as a legitimate QB1 and projects top eight this year. Bijan Robinson and Breece Hall might be the best young running back pairing in the league on paper, the kind of duo that wins titles when the passing game cooperates.',
      'The passing game does not entirely cooperate. Aaron Rodgers occupying the superflex in 2026 is a choice that the analytics desk has flagged, circled, and forwarded to legal. Every week Rodgers starts is a week this roster gives back points the Robinson-Hall backfield worked hard to bank.',
      'The Madness Times projection: fifth, with the widest range of outcomes in the league. A midseason QB2 upgrade turns this into a genuine contender. Standing pat turns it into a very entertaining podcast about what could have been.',
    ],
  },
  'Teddy Bongwater': {
    headline: 'Teddy Bongwater Is Sneaky Good, Which Is the Most On-Brand Thing Possible',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'Justin Jefferson and CeeDee Lamb on the same fantasy roster should be illegal, and Dylan McElroy pairs them with Jonathan Taylor, who continues to run like the contract year never ended. When Jayden Daniels is at full strength, this team quietly owns three of the forty best players in football.',
      'The issues are structural. Dak Prescott as the weekly QB in a superflex league is a floor play with no ceiling, and the tight end room is Kyle Pitts plus the concept of hope. The projection models see a team that beats bad rosters comfortably and loses to good ones by exactly one lineup spot.',
      'The Madness Times projection: sixth, but nobody in the top four wants this team in their playoff bracket. A healthy Daniels for the stretch run changes the entire calculus, and the rest of the league knows it.',
    ],
  },
  'Cheznovs Abduction': {
    headline: 'Cheznovs Abduction Has Two Franchise QBs and a Missing Persons Report at Running Back',
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'Austin Dedon looked at a superflex dynasty league and correctly concluded that quarterbacks win it. Lamar Jackson and Justin Herbert is the best pure QB room in the league, full stop, and in this format that guarantees a competitive floor every single week.',
      'Everything else got abducted. Blake Corum as the RB1 is a depth chart, not a plan, and the receiver room needs at least one more difference-maker before this roster scores with the contenders. The projections are unanimous: elite at the two most valuable positions, thin everywhere else.',
      'The Madness Times projection: seventh, but with the single most tradeable surplus in the league. One bold move flipping QB depth for a real running back changes this team\'s trajectory overnight. The front office has the assets. The question is nerve.',
    ],
  },
  "Hoidus' Hemmroid": {
    headline: "Hoidus' Hemmroid: Great Receivers, Rough Everything Else, Perfect Name",
    byline: 'By The Madness Times Franchise Desk',
    body: [
      'Start with the good: A.J. Brown, Drake London, and Mark Andrews is a receiving core that most rebuilding teams would trade three firsts for. Perri Prevost owns real, tradeable, blue-chip assets, and any rebuild that starts from here is a short one.',
      'Now the rest. The quarterback room is Jordan Love and a collection of hopes, which in a superflex league is like showing up to a knife fight with a strongly worded letter. Cam Skattebo as the RB1 is a fun story and a projection-model horror film at the same time.',
      'The Madness Times projection: eighth, with a clear fork in the road. Sell the veteran wideouts and own the next two rookie drafts, or hold and hover around sixth forever. The Madness Times editorial board endorses the teardown, and we say that with love.',
    ],
  },
}

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

export default function HomePage({ dateline }) {
  const [selectedTeam, setSelectedTeam] = useState(null)
  const today =
    dateline ||
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

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
          <span className="hidden sm:inline">Dynasty Madness League</span>
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

      {selectedTeam ? (
        <TeamWriteup team={selectedTeam} onBack={() => setSelectedTeam(null)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 px-4">
          {/* Articles column */}
          <div className="lg:col-span-2 space-y-10">
            {ARTICLES.map((article, idx) => (
              <article key={article.id} className={idx > 0 ? 'border-t-2 border-[#c9bb9c] pt-8' : ''}>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700 mb-2">{article.kicker}</p>
                <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">{article.headline}</h2>
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
          </div>

          {/* Power rankings column */}
          <aside className="lg:border-l-2 border-[#c9bb9c] lg:pl-8">
            <div className="border-y-2 border-[#5a4a32] py-2 mb-5 text-center">
              <h3 className="text-lg font-black uppercase tracking-[0.2em]">Power Rankings</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Preseason Edition · The Madness Times Desk</p>
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
            <div className="mt-8 border-2 border-[#5a4a32] p-4 text-center bg-[#efe6d0]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a5c] mb-1">Classified Ads</p>
              <p className="text-sm italic">WANTED: One (1) starting running back. Contact A. Dedon, Cheznovs Abduction. Will pay in quarterbacks.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
