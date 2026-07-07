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

// Builds the live draft board from the future-picks ownership grid for a given
// year. Standard (non-snake) order: each round runs through slotOrder, and the
// pick belongs to whoever currently owns that slot's pick in the grid.
export function generatePicksFromFutureData(yearData, rounds, slotOrder, owners, ownerToTeamId) {
  const picks = []
  let id = 1
  rounds.forEach((round, roundIdx) => {
    slotOrder.forEach((slotOwner, slotIdx) => {
      const colIdx = owners.indexOf(slotOwner)
      const cell = yearData?.[round]?.[colIdx]
      picks.push({
        id,
        round: roundIdx + 1,
        pickInRound: slotIdx + 1,
        originalTeamId: ownerToTeamId[slotOwner],
        currentTeamId: ownerToTeamId[cell?.owner] ?? ownerToTeamId[slotOwner],
      })
      id++
    })
  })
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

// Rough dynasty superflex roster targets per position
const POSITION_TARGETS = { QB: 3, RB: 6, WR: 7, TE: 3 }

// Realistic CPU pick: heavily favors the top of the board, nudged by
// positional need based on the team's current roster. Returns the chosen
// player plus a human-readable reason for the pick.
export function pickCpuPlayerSmart(prospects, draftedPlayers, team, rosterPlayers = [], rng = Math.random) {
  const available = prospects
    .filter(p => !draftedPlayers[p.id])
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
  if (available.length === 0) return null

  const counts = {}
  for (const p of rosterPlayers) counts[p.position] = (counts[p.position] || 0) + 1

  const candidates = available.slice(0, 6).map((player, idx) => {
    const target = POSITION_TARGETS[player.position] ?? 2
    const have = counts[player.position] || 0
    const need = Math.max(0, target - have) / target
    return { player, need, have, weight: (1 / Math.pow(idx + 1, 1.7)) * (1 + need) }
  })

  const total = candidates.reduce((sum, c) => sum + c.weight, 0)
  let roll = rng() * total
  let chosen = candidates[0]
  for (const c of candidates) {
    roll -= c.weight
    if (roll <= 0) {
      chosen = c
      break
    }
  }

  const { player, need, have } = chosen
  const rankTxt = player.rank ? `#${player.rank} overall` : 'a top-ranked prospect'
  const teamName = team?.name || 'This team'
  let reason
  if (player === available[0]) {
    reason = need > 0.3
      ? `${teamName} takes the best player on the board (${rankTxt}) who also fills a hole at ${player.position} (only ${have} rostered).`
      : `Best player available — ${rankTxt} was too good for ${teamName} to pass up.`
  } else if (need > 0.3) {
    reason = `${teamName} reaches slightly for need: thin at ${player.position} (${have} rostered), and ${player.name} (${rankTxt}) is the best ${player.position} left.`
  } else {
    reason = `${teamName} adds depth with ${player.name} (${rankTxt}), a strong value at this spot.`
  }
  return { player, reason }
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
