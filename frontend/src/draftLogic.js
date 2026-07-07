export function generateInitialPicks(teams, numRounds) {
  const picks = []
  let pickNumber = 1
  for (let round = 1; round <= numRounds; round++) {
    const teamOrder = round % 2 === 1 ? teams : [...teams].reverse()
    for (const team of teamOrder) {
      picks.push({
        id: pickNumber,
        round,
        pickInRound: pickNumber - (round - 1) * teams.length,
        originalTeamId: team.id,
        currentTeamId: team.id,
      })
      pickNumber++
    }
  }
  return picks
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function filterProspects(prospects, draftedPlayers, { position = 'All', status = 'All', query = '' } = {}) {
  const q = query.trim().toLowerCase()
  return prospects.filter(p => {
    const posMatch = position === 'All' || p.position === position
    const statusMatch =
      status === 'All' ||
      (status === 'Drafted' && draftedPlayers[p.id]) ||
      (status === 'Available' && !draftedPlayers[p.id])
    const queryMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.nflTeam || '').toLowerCase().includes(q) ||
      (p.college || '').toLowerCase().includes(q)
    return posMatch && statusMatch && queryMatch
  })
}

export function pickCpuPlayer(prospects, draftedPlayers, poolSize = 5, rng = Math.random) {
  const available = prospects.filter(p => !draftedPlayers[p.id])
  if (available.length === 0) return null
  const pool = available.slice(0, poolSize)
  return pool[Math.floor(rng() * pool.length)]
}

export function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable (private mode, quota); state stays in memory
  }
}

export const STORAGE_KEYS = {
  draftState: 'dm_draft_state',
  mockHistory: 'dm_mock_history',
}
