import { describe, it, expect } from 'vitest'
import { generateInitialPicks, generatePicksFromFutureData, formatTime, filterProspects, pickCpuPlayer, getFuturePickValue, computeTradeSideValue, getTradeVerdict } from './draftLogic'
import { DRAFT_SLOT_ORDER, INITIAL_PICK_DATA, OWNER_TO_TEAM_ID, OWNERS, ROUNDS } from './futurePicksData'

const TEAMS = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' },
]

const PROSPECTS = [
  { id: 1, name: 'Jeremiyah Love', position: 'RB', nflTeam: 'DAL', college: 'Notre Dame' },
  { id: 2, name: 'Fernando Mendoza', position: 'QB', nflTeam: 'NYG', college: 'Indiana' },
  { id: 3, name: 'Jordyn Tyson', position: 'WR', nflTeam: 'NE', college: 'Arizona State' },
]

describe('generateInitialPicks', () => {
  it('creates teams * rounds picks with sequential ids', () => {
    const picks = generateInitialPicks(TEAMS, 3)
    expect(picks).toHaveLength(9)
    expect(picks.map(p => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('snakes the order in even rounds', () => {
    const picks = generateInitialPicks(TEAMS, 2)
    expect(picks.slice(0, 3).map(p => p.originalTeamId)).toEqual([1, 2, 3])
    expect(picks.slice(3).map(p => p.originalTeamId)).toEqual([3, 2, 1])
  })

  it('numbers picks within each round', () => {
    const picks = generateInitialPicks(TEAMS, 2)
    expect(picks[3].round).toBe(2)
    expect(picks[3].pickInRound).toBe(1)
  })
})

describe('formatTime', () => {
  it('formats minutes and zero-padded seconds', () => {
    expect(formatTime(120)).toBe('2:00')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(0)).toBe('0:00')
  })
})

describe('generatePicksFromFutureData', () => {
  const owners = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const slotOrder = [...owners]
  const ownerToTeamId = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8 }

  it('includes the 2026 Sam compensatory pick as 2.09', () => {
    const picks = generatePicksFromFutureData(INITIAL_PICK_DATA[2026], ROUNDS, DRAFT_SLOT_ORDER, OWNERS, OWNER_TO_TEAM_ID)

    expect(picks).toHaveLength(33)
    expect(picks[16]).toMatchObject({
      id: 17,
      round: 2,
      pickInRound: 9,
      originalTeamId: 2,
      currentTeamId: 2,
      isComp: true,
    })
    expect(picks[17]).toMatchObject({ id: 18, round: 3, pickInRound: 1 })
  })

  it('appends compensatory picks at the end of a round with contiguous ids', () => {
    const compPick = { owner: 'B', notes: [], comp: true, originalOwner: 'B' }
    const yearData = {
      '1st Rounder': owners.map(owner => ({ owner, notes: [] })),
      '2nd Rounder': [...owners.map(owner => ({ owner, notes: [] })), compPick],
    }

    const picks = generatePicksFromFutureData(yearData, ['1st Rounder', '2nd Rounder'], slotOrder, owners, ownerToTeamId)
    const comp = picks[16]

    expect(picks).toHaveLength(17)
    expect(picks.map(pick => pick.id)).toEqual(Array.from({ length: 17 }, (_, index) => index + 1))
    expect(comp).toMatchObject({ id: 17, round: 2, pickInRound: 9, isComp: true })
  })

  it('tracks original and current teams when a compensatory pick is traded', () => {
    const yearData = {
      '2nd Rounder': [
        ...owners.map(owner => ({ owner, notes: [] })),
        { owner: 'C', notes: [], comp: true, originalOwner: 'B' },
      ],
    }

    const picks = generatePicksFromFutureData(yearData, ['2nd Rounder'], slotOrder, owners, ownerToTeamId)

    expect(picks[8]).toMatchObject({
      pickInRound: 9,
      originalTeamId: 2,
      currentTeamId: 3,
      isComp: true,
    })
  })
})

describe('filterProspects', () => {
  it('returns everything with default filters', () => {
    expect(filterProspects(PROSPECTS, {})).toHaveLength(3)
  })

  it('filters by position', () => {
    const result = filterProspects(PROSPECTS, {}, { position: 'QB' })
    expect(result.map(p => p.name)).toEqual(['Fernando Mendoza'])
  })

  it('filters by drafted status', () => {
    const drafted = { 1: { teamId: 2 } }
    expect(filterProspects(PROSPECTS, drafted, { status: 'Drafted' }).map(p => p.id)).toEqual([1])
    expect(filterProspects(PROSPECTS, drafted, { status: 'Available' }).map(p => p.id)).toEqual([2, 3])
  })

  it('searches by name case-insensitively', () => {
    const result = filterProspects(PROSPECTS, {}, { query: 'tyson' })
    expect(result.map(p => p.name)).toEqual(['Jordyn Tyson'])
  })

  it('searches by college and NFL team', () => {
    expect(filterProspects(PROSPECTS, {}, { query: 'notre dame' })).toHaveLength(1)
    expect(filterProspects(PROSPECTS, {}, { query: 'nyg' })).toHaveLength(1)
  })

  it('combines position, status, and query filters', () => {
    const drafted = { 3: { teamId: 1 } }
    const result = filterProspects(PROSPECTS, drafted, { position: 'WR', status: 'Available', query: 'tyson' })
    expect(result).toHaveLength(0)
  })
})

describe('pickCpuPlayer', () => {
  it('returns null when everyone is drafted', () => {
    const drafted = { 1: {}, 2: {}, 3: {} }
    expect(pickCpuPlayer(PROSPECTS, drafted)).toBeNull()
  })

  it('picks from the top of the available board', () => {
    const player = pickCpuPlayer(PROSPECTS, { 1: {} }, 1, () => 0)
    expect(player.id).toBe(2)
  })

  it('never picks an already-drafted player', () => {
    for (let i = 0; i < 20; i++) {
      const player = pickCpuPlayer(PROSPECTS, { 2: {} })
      expect(player.id).not.toBe(2)
    }
  })
})

describe('trade verdict', () => {
  it('values future picks by round with a discount for later years', () => {
    expect(getFuturePickValue(2026, '1st Rounder')).toBe(5500)
    expect(getFuturePickValue(2027, '1st Rounder')).toBe(5060)
    expect(getFuturePickValue(2026, '4th Rounder')).toBe(450)
    expect(getFuturePickValue(2026, 'Unknown Round')).toBe(0)
  })

  it('totals players and picks, tracking unknown players', () => {
    const map = new Map([['Bijan Robinson', 9999]])
    const side = computeTradeSideValue(
      ['Bijan Robinson', 'Mystery Man'],
      [{ year: 2026, round: '2nd Rounder' }],
      map,
      2026
    )
    expect(side.total).toBe(9999 + 2600)
    expect(side.unknownPlayers).toEqual(['Mystery Man'])
  })

  it('returns null when nothing is selected', () => {
    expect(getTradeVerdict(0, 0, 'A', 'B')).toBeNull()
  })

  it('declares the team receiving more value the winner', () => {
    const v = getTradeVerdict(10000, 5000, 'A', 'B')
    expect(v.winner).toBe('B')
    expect(v.loser).toBe('A')
    expect(v.diff).toBe(5000)
    expect(v.severity).toBe('robbery')
  })

  it('calls a near-equal trade even', () => {
    const v = getTradeVerdict(10000, 9800, 'A', 'B')
    expect(v.severity).toBe('even')
  })
})
