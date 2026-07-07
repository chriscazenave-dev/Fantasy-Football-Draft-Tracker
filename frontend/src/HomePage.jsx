import { Trophy, Medal } from 'lucide-react'

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
      'Burrow under center, Ashton Jeanty and De\'Von Achane in the backfield, Brock Bowers at tight end — this is what happens when a franchise drafts like it has a plan. The only red flag: nobody in the building has remembered to roster a defense. Details, apparently, are for other people.',
  },
  {
    rank: 3,
    team: 'The Evil Empire',
    owner: 'jmo morgan',
    blurb:
      'The defending champs return with Mahomes, Barkley, and Puka Nacua, plus Brock Purdy stashed in the OP slot like a second dessert. The crown is heavy, the target is on the helmet, and Malik Nabers coming off IR mid-season could be the most terrifying in-season pickup in league history.',
  },
  {
    rank: 4,
    team: 'Suave Shaheed',
    owner: 'Nick Casey',
    blurb:
      'Josh Allen to Ja\'Marr Chase is a cheat code, and Jaxon Smith-Njigba became a top-five wideout while nobody was watching. Third place last year with the smoothest team name in the league. If the RB2 spot (Tyrone Tracy Jr., bless him) gets solved, this team is a title threat.',
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
      'Jefferson and CeeDee are elite, Jonathan Taylor still runs angry, and Jayden Daniels lurks on IR like a plot twist. But Dak Prescott in a superflex league is a lifestyle choice, and the tight end room is Kyle Pitts and prayers. Sneaky dangerous. Emphasis on sneaky.',
  },
  {
    rank: 7,
    team: 'Cheznovs Abduction',
    owner: 'Austin Dedon',
    blurb:
      'Lamar AND Herbert is a genuinely great QB room. Unfortunately the abduction apparently took the running backs too, because Blake Corum is your RB1 and the D/ST slot is literally empty. You cannot start "Empty" in Week 1, Austin. We checked the rules.',
  },
  {
    rank: 8,
    team: "Hoidus' Hemmroid",
    owner: 'Perri Prevost',
    blurb:
      'A.J. Brown and Drake London deserve better than this. The good news: no one is on IR. The bad news: that\'s because the whole roster plays like it\'s already on IR. Cam Skattebo as your RB1 is a bold strategy — the kind of bold usually followed by a top-two rookie pick.',
  },
]

const ARTICLES = [
  {
    id: 'schefter',
    kicker: 'LEAGUE INSIDER',
    headline: 'Sources: Evil Empire "Fully Expects" to Repeat, League Office Braces for Another Insufferable Year',
    byline: 'By Adam Schefter, Senior Dynasty Insider',
    body: [
      'Sources close to the situation tell me that The Evil Empire, fresh off its 2025 championship, has been sending the trophy emoji in the league chat "at a rate that concerns everyone involved." Per sources, jmo morgan spent the offseason doing exactly nothing — because when you roster Patrick Mahomes, Saquon Barkley, and Puka Nacua, nothing is a strategy.',
      'League sources confirm the real story is the IR: Malik Nabers and Tucker Kraft are both stashed and both expected back. One rival GM, speaking on condition of anonymity because "he will screenshot this," described the situation as "genuinely unfair" and "the kind of thing a commissioner should look into."',
      'Meanwhile, sources say Whatever who cares has privately told confidants that second place "will not happen again." When reached for comment, Sam Bowlin replied "whatever," which sources describe as "on brand."',
    ],
  },
  {
    id: 'bigcat',
    kicker: 'HOT TAKE CENTRAL',
    headline: "The Bottom of This League Is Electric Factory: A Loving Roast of Cheznovs Abduction and Hoidus' Hemmroid",
    byline: 'By Big Cat, Barstool Dynasty Desk',
    body: [
      "Folks. FOLKS. Austin Dedon woke up, looked at a superflex dynasty league, and said \"give me Lamar Jackson AND Justin Herbert.\" Awesome. Love it. Then he looked at his running back room and said \"Blake Corum, that's a starter.\" And THEN — and this is my favorite part — he just... didn't roster a defense. The D/ST slot says \"Empty.\" That's not a fantasy team, that's a cry for help.",
      "And Hoidus' Hemmroid. First of all, the name — spelled wrong, medically inaccurate, absolutely perfect. Perri has A.J. Brown, Drake London, and Mark Andrews, which sounds good until you realize the QB room is Jordan Love and a bag of Cam Wards. Zero players on IR though, which means this roster is 100% healthy and still projected last. That's the most electric thing I've ever seen.",
      'Vegas has both teams at +50000 to win the title. I\'m hammering the under on wins, the over on league-chat excuses, and Teddy Bongwater to somehow be involved in the most cursed trade of the season. Book it.',
    ],
  },
  {
    id: 'analysis',
    kicker: 'FILM ROOM',
    headline: 'The Superflex Arms Race: Why the OP Slot Decides This League',
    byline: 'By The Gazette Analytics Bureau',
    body: [
      'Look at the top of the standings projection and a pattern emerges: the teams that treat the OP (superflex) slot as a second quarterback are lapping the field. Team Faircloth trots out Burrow AND Trevor Lawrence. The Evil Empire pairs Mahomes with Brock Purdy. Whatever who cares hands the keys to rookie-no-more Jaxson Dart.',
      'Then there\'s Team caz, starting Aaron Rodgers — age redacted out of respect — and Teddy Bongwater flexing Jared Goff, which is fine in the way that lukewarm coffee is fine. In a league that starts ten and stashes two on IR, the math is brutal: a bench QB scoring 12 a week beats a bench WR scoring 6, every week, forever.',
      'The trade deadline prediction from this desk: at least one desperate contender overpays for a mid QB by October. Our money is on the price being a 2027 first. It always is.',
    ],
  },
]

export default function HomePage({ dateline }) {
  const today =
    dateline ||
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto font-serif text-[#2b2418]">
      {/* Masthead */}
      <div className="border-y-4 border-double border-[#5a4a32] py-6 text-center bg-[#f3ecdb] px-4">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#8a7a5c] mb-2">Est. 2025 · All the takes fit to print</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          The Dynasty Gazette
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
            <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">Preseason Edition · The Gazette Desk</p>
          </div>
          <ol className="space-y-5">
            {POWER_RANKINGS.map(entry => (
              <li key={entry.rank} className="flex gap-3">
                <span className="text-3xl font-black text-[#c9bb9c] leading-none w-8 flex-shrink-0 text-right">{entry.rank}</span>
                <div>
                  <p className="font-bold leading-tight">{entry.team}</p>
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
    </div>
  )
}
