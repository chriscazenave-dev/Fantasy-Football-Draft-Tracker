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
      QB: 'Patrick Mahomes',
      RB1: 'Kyren Williams',
      RB2: 'Saquon Barkley',
      WR1: 'Puka Nacua',
      WR2: 'Tee Higgins',
      TE: 'Oronde Gadsden',
      FLEX1: 'Travis Etienne Jr.',
      FLEX2: 'Quinshon Judkins',
      OP: 'Brock Purdy',
      'D/ST': 'Jaguars D/ST',
    },
    ir: ['Malik Nabers', 'Tucker Kraft'],
  },
  2: {
    starters: {
      QB: 'Jalen Hurts',
      RB1: 'Jahmyr Gibbs',
      RB2: 'Christian McCaffrey',
      WR1: 'Davante Adams',
      WR2: 'George Pickens',
      TE: 'Tyler Warren',
      FLEX1: 'Bucky Irving',
      FLEX2: 'Ladd McConkey',
      OP: 'Jaxson Dart',
      'D/ST': 'Lions D/ST',
    },
    ir: ['James Conner', 'Trey Benson'],
  },
  3: {
    starters: {
      QB: 'Josh Allen',
      RB1: 'Chase Brown',
      RB2: 'Tyrone Tracy Jr.',
      WR1: "Ja'Marr Chase",
      WR2: 'Jaxon Smith-Njigba',
      TE: 'George Kittle',
      FLEX1: 'Emeka Egbuka',
      FLEX2: 'Michael Wilson',
      OP: 'Bo Nix',
      'D/ST': 'Broncos D/ST',
    },
    ir: ['Dylan Sampson', 'Joe Mixon'],
  },
  4: {
    starters: {
      QB: 'Dak Prescott',
      RB1: 'Josh Jacobs',
      RB2: 'Jonathan Taylor',
      WR1: 'Justin Jefferson',
      WR2: 'CeeDee Lamb',
      TE: 'Kyle Pitts Sr.',
      FLEX1: 'Tetairoa McMillan',
      FLEX2: 'Rico Dowdle',
      OP: 'Jared Goff',
      'D/ST': 'Saints D/ST',
    },
    ir: ['Jerome Ford', 'Jayden Daniels'],
  },
  5: {
    starters: {
      QB: 'Joe Burrow',
      RB1: 'Ashton Jeanty',
      RB2: "De'Von Achane",
      WR1: 'Chris Olave',
      WR2: 'DJ Moore',
      TE: 'Brock Bowers',
      FLEX1: 'Omarion Hampton',
      FLEX2: 'Derrick Henry',
      OP: 'Trevor Lawrence',
      'D/ST': null,
    },
    ir: ['Brandon Aiyuk', 'Anthony Richardson Sr.'],
  },
  6: {
    starters: {
      QB: 'Drake Maye',
      RB1: 'Breece Hall',
      RB2: 'Bijan Robinson',
      WR1: 'Amon-Ra St. Brown',
      WR2: 'DeVonta Smith',
      TE: 'Sam LaPorta',
      FLEX1: 'Mike Evans',
      FLEX2: 'Rome Odunze',
      OP: 'Aaron Rodgers',
      'D/ST': 'Texans D/ST',
    },
    ir: ['Deshaun Watson', 'Tyreek Hill'],
  },
  7: {
    starters: {
      QB: 'Jordan Love',
      RB1: 'Cam Skattebo',
      RB2: 'Kenneth Walker III',
      WR1: 'Drake London',
      WR2: 'A.J. Brown',
      TE: 'Mark Andrews',
      FLEX1: "D'Andre Swift",
      FLEX2: 'Brian Thomas Jr.',
      OP: 'Cam Ward',
      'D/ST': 'Colts D/ST',
    },
    ir: [],
  },
  8: {
    starters: {
      QB: 'Lamar Jackson',
      RB1: 'Blake Corum',
      RB2: 'James Cook III',
      WR1: 'Nico Collins',
      WR2: 'Zay Flowers',
      TE: 'Trey McBride',
      FLEX1: 'Courtland Sutton',
      FLEX2: 'Marvin Harrison Jr.',
      OP: 'Justin Herbert',
      'D/ST': null,
    },
    ir: ['MarShawn Lloyd', 'Braelon Allen'],
  },
}
