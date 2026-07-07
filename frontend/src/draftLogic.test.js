import { describe, it, expect } from 'vitest'
import { generateInitialPicks, formatTime, filterProspects, pickCpuPlayer } from './draftLogic'

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
