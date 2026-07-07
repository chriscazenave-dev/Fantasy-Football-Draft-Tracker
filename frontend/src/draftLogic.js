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

const pickTemplate = (templates, rng) => templates[Math.floor(rng() * templates.length)]

const BPA_TEMPLATES = [
  (t, p, rank) => `Best player available — ${rank} was too good for ${t} to pass up.`,
  (t, p, rank) => `${t} sticks to the board: ${p.name} is the ${rank} player and the clear pick here.`,
  (t, p, rank) => `No overthinking it — ${t} grabs ${p.name} (${rank}), the top name left.`,
  (t, p, rank) => `${t} takes the chalk. ${p.name} at ${rank} is the safest bet on the board.`,
]

const BPA_NEED_TEMPLATES = [
  (t, p, rank, have) => `${t} takes the best player on the board (${rank}) who also fills a hole at ${p.position} (only ${have} rostered).`,
  (t, p, rank, have) => `Dream scenario for ${t}: top player left (${rank}) at their thinnest spot — just ${have} ${p.position}s rostered.`,
  (t, p, rank, have) => `Value meets need — ${t} lands ${p.name} (${rank}) with only ${have} ${p.position}s in the room.`,
]

const NEED_TEMPLATES = [
  (t, p, rank, have) => `${t} reaches slightly for need: thin at ${p.position} (${have} rostered), and ${p.name} (${rank}) is the best ${p.position} left.`,
  (t, p, rank, have) => `${t} drafts for the depth chart — only ${have} ${p.position}s rostered, so ${p.name} (${rank}) is the call.`,
  (t, p, rank) => `Roster construction pick: ${t} can't leave the draft without a ${p.position}, and ${p.name} (${rank}) is the one.`,
]

const DEPTH_TEMPLATES = [
  (t, p, rank) => `${t} adds depth with ${p.name} (${rank}), a strong value at this spot.`,
  (t, p, rank) => `${t} takes the value: ${p.name} (${rank}) slid a touch and they caught him.`,
  (t, p, rank) => `Solid, unspectacular, correct — ${t} banks ${p.name} (${rank}) for the bench.`,
]

const REACH_TEMPLATES = [
  (t, p, rank) => `${t} falls in love with the tape and reaches for ${p.name} (${rank}) — bold, but they clearly had him higher.`,
  (t, p, rank) => `Off-script pick: ${t} passes on bigger names to take their guy, ${p.name} (${rank}).`,
  (t, p, rank) => `${t} zigs while everyone zags — ${p.name} (${rank}) was on nobody else's radar this early.`,
]

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

  const candidates = available.slice(0, 8).map((player, idx) => {
    const target = POSITION_TARGETS[player.position] ?? 2
    const have = counts[player.position] || 0
    const need = Math.max(0, target - have) / target
    return { player, idx, need, have, weight: (1 / Math.pow(idx + 1, 1.7)) * (1 + need) }
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

  const { player, idx, need, have } = chosen
  const rankTxt = player.rank ? `#${player.rank} overall` : 'a top-ranked prospect'
  const teamName = team?.name || 'This team'
  let templates
  if (player === available[0]) {
    templates = need > 0.3 ? BPA_NEED_TEMPLATES : BPA_TEMPLATES
  } else if (idx >= 3 && need <= 0.3) {
    templates = REACH_TEMPLATES
  } else if (need > 0.3) {
    templates = NEED_TEMPLATES
  } else {
    templates = DEPTH_TEMPLATES
  }
  const reason = pickTemplate(templates, rng)(teamName, player, rankTxt, have)
  return { player, reason }
}

// --- Trade value verdict (KTC-based) ---
const FUTURE_PICK_BASE_VALUES = {
  '1st Rounder': 5500,
  '2nd Rounder': 2600,
  '3rd Rounder': 1100,
  '4th Rounder': 450,
}
const FUTURE_YEAR_DISCOUNT = 0.92

export function getFuturePickValue(year, round, currentYear = 2026) {
  const base = FUTURE_PICK_BASE_VALUES[round] ?? 0
  const yearsOut = Math.max(0, year - currentYear)
  return Math.round(base * Math.pow(FUTURE_YEAR_DISCOUNT, yearsOut))
}

export function computeTradeSideValue(playerNames, picks, playerValueMap, currentYear = 2026) {
  let total = 0
  const unknownPlayers = []
  for (const name of playerNames) {
    const value = playerValueMap.get(name)
    if (value == null) {
      unknownPlayers.push(name)
    } else {
      total += value
    }
  }
  for (const pick of picks) {
    total += getFuturePickValue(pick.year, pick.round, currentYear)
  }
  return { total, unknownPlayers }
}

export function getTradeVerdict(valueSentByA, valueSentByB, nameA, nameB) {
  if (valueSentByA === 0 && valueSentByB === 0) return null
  const diff = valueSentByA - valueSentByB
  // The team that sends less value receives more — they win the trade
  const winner = diff > 0 ? nameB : nameA
  const loser = diff > 0 ? nameA : nameB
  const pct = Math.abs(diff) / Math.max(valueSentByA, valueSentByB, 1)
  let label
  let severity
  if (pct < 0.05) {
    label = 'Dead even. The accountants are satisfied.'
    severity = 'even'
  } else if (pct < 0.12) {
    label = `Fair trade — slight edge to ${winner}.`
    severity = 'fair'
  } else if (pct < 0.25) {
    label = `${winner} wins this trade.`
    severity = 'win'
  } else if (pct < 0.45) {
    label = `${winner} is fleecing ${loser}. Someone screenshot this.`
    severity = 'fleece'
  } else {
    label = `Grand larceny. ${winner} should be under league investigation.`
    severity = 'robbery'
  }
  return { diff: Math.abs(diff), pct, winner, loser, label, severity }
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
