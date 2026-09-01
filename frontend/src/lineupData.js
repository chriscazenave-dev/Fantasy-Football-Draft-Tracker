// Lineup slot definitions and initial lineups per team (from ESPN Week 1 screenshots)

export const STARTER_SLOTS = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX1', 'FLEX2', 'OP', 'D/ST']

export const SLOT_LABELS = {
  QB: 'QB',
  RB1: 'RB',
  RB2: 'RB',
  WR1: 'WR',
  WR2: 'WR',
  TE: 'TE',
  FLEX1: 'FLEX',
  FLEX2: 'FLEX',
  OP: 'OP',
  'D/ST': 'D/ST',
}

// Which player positions are eligible for each slot (OP is the superflex)
export const SLOT_ELIGIBILITY = {
  QB: ['QB'],
  RB1: ['RB'],
  RB2: ['RB'],
  WR1: ['WR'],
  WR2: ['WR'],
  TE: ['TE'],
  FLEX1: ['RB', 'WR', 'TE'],
  FLEX2: ['RB', 'WR', 'TE'],
  OP: ['QB', 'RB', 'WR', 'TE'],
  'D/ST': ['D/ST'],
}

export const MAX_IR = 2

// starters: map of slot -> player name (null = empty slot)
// ir: list of player names (max 2). Everyone else on the roster is on the bench.
export const INITIAL_LINEUPS = {
  1: {
    starters: {
      QB: "Patrick Mahomes",
      RB1: "Saquon Barkley",
      RB2: "Kyren Williams",
      WR1: "Puka Nacua",
      WR2: "Jaxon Smith-Njigba",
      TE: "Tucker Kraft",
      FLEX1: "Jaylen Waddle",
      FLEX2: "Tee Higgins",
      OP: "Brock Purdy",
      'D/ST': "Eagles D/ST",
    },
    ir: ["Jayden Higgins", "Dont'e Thornton Jr."],
  },
  2: {
    starters: {
      QB: "Jalen Hurts",
      RB1: "Jahmyr Gibbs",
      RB2: "Christian McCaffrey",
      WR1: "George Pickens",
      WR2: "Ladd McConkey",
      TE: "Tyler Warren",
      FLEX1: "Bucky Irving",
      FLEX2: "Davante Adams",
      OP: "Jaxson Dart",
      'D/ST': "Rams D/ST",
    },
    ir: ["Jordyn Tyson", "James Conner"],
  },
  3: {
    starters: {
      QB: "Josh Allen",
      RB1: "Chase Brown",
      RB2: "Travis Etienne Jr.",
      WR1: "Ja'Marr Chase",
      WR2: "Parker Washington",
      TE: "Jake Ferguson",
      FLEX1: "Emeka Egbuka",
      FLEX2: "D'Andre Swift",
      OP: "Bo Nix",
      'D/ST': "Seahawks D/ST",
    },
    ir: [],
  },
  4: {
    starters: {
      QB: "Jayden Daniels",
      RB1: "Jonathan Taylor",
      RB2: "Rico Dowdle",
      WR1: "CeeDee Lamb",
      WR2: "Justin Jefferson",
      TE: "Colston Loveland",
      FLEX1: "Tetairoa McMillan",
      FLEX2: "Garrett Wilson",
      OP: "Dak Prescott",
      'D/ST': "Steelers D/ST",
    },
    ir: [],
  },
  5: {
    starters: {
      QB: "Joe Burrow",
      RB1: "Derrick Henry",
      RB2: "De'Von Achane",
      WR1: "Chris Olave",
      WR2: "DJ Moore",
      TE: "Brock Bowers",
      FLEX1: "Ashton Jeanty",
      FLEX2: "Omarion Hampton",
      OP: "Caleb Williams",
      'D/ST': null,
    },
    ir: ["Ricky Pearsall", "Zach Charbonnet"],
  },
  6: {
    starters: {
      QB: "Drake Maye",
      RB1: "Bijan Robinson",
      RB2: "Breece Hall",
      WR1: "Amon-Ra St. Brown",
      WR2: "Rashee Rice",
      TE: "Sam LaPorta",
      FLEX1: "DeVonta Smith",
      FLEX2: "Jameson Williams",
      OP: "Sam Darnold",
      'D/ST': "Texans D/ST",
    },
    ir: [],
  },
  7: {
    starters: {
      QB: "Jordan Love",
      RB1: "Kenneth Walker III",
      RB2: "Jeremiyah Love",
      WR1: "Drake London",
      WR2: "A.J. Brown",
      TE: "Mark Andrews",
      FLEX1: "Cam Skattebo",
      FLEX2: "Javonte Williams",
      OP: "C.J. Stroud",
      'D/ST': "Vikings D/ST",
    },
    ir: ["Calvin Austin III"],
  },
  8: {
    starters: {
      QB: "Lamar Jackson",
      RB1: "James Cook III",
      RB2: "Bhayshul Tuten",
      WR1: "Nico Collins",
      WR2: "Zay Flowers",
      TE: "Trey McBride",
      FLEX1: "David Montgomery",
      FLEX2: "MarShawn Lloyd",
      OP: "Justin Herbert",
      'D/ST': null,
    },
    ir: ["Isaac Guerendo"],
  },
}
