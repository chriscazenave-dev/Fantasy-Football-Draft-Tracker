import { readJsonBody } from './_authLib.js'

// Sleeper's public read-only API (no key required): https://docs.sleeper.com
const SLEEPER = 'https://api.sleeper.app/v1'
const PLAYERS_TTL_MS = 6 * 60 * 60 * 1000
const STATS_TTL_MS = 60 * 1000

let playersCache = null
let playersCacheAt = 0
const statsCache = new Map()

const DST_ABBREVS = {
  cardinals: 'ARI', falcons: 'ATL', ravens: 'BAL', bills: 'BUF', panthers: 'CAR',
  bears: 'CHI', bengals: 'CIN', browns: 'CLE', cowboys: 'DAL', broncos: 'DEN',
  lions: 'DET', packers: 'GB', texans: 'HOU', colts: 'IND', jaguars: 'JAX',
  chiefs: 'KC', raiders: 'LV', chargers: 'LAC', rams: 'LAR', dolphins: 'MIA',
  vikings: 'MIN', patriots: 'NE', saints: 'NO', giants: 'NYG', jets: 'NYJ',
  eagles: 'PHI', steelers: 'PIT', '49ers': 'SF', seahawks: 'SEA', buccaneers: 'TB',
  titans: 'TEN', commanders: 'WAS',
}

function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\b(jr|sr|ii|iii|iv|v)\b\.?$/g, '')
    .replace(/[^a-z0-9]/g, '')
}

async function getPlayersIndex() {
  const now = Date.now()
  if (playersCache && now - playersCacheAt < PLAYERS_TTL_MS) return playersCache
  const resp = await fetch(`${SLEEPER}/players/nfl`)
  if (!resp.ok) throw new Error('sleeper players fetch failed')
  const players = await resp.json()
  const index = new Map()
  for (const [id, p] of Object.entries(players)) {
    if (!p || !p.full_name) continue
    const key = `${normalizeName(p.full_name)}|${p.position ?? ''}`
    const existing = index.get(key)
    // Prefer active players when two share a name and position
    if (!existing || (p.status === 'Active' && existing.status !== 'Active')) {
      index.set(key, { id, status: p.status })
    }
  }
  playersCache = index
  playersCacheAt = now
  return index
}

function toBoundedInt(value, min, max) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
}

async function getStats(season, week) {
  const cacheKey = `${season}|${week}`
  const cached = statsCache.get(cacheKey)
  if (cached && Date.now() - cached.at < STATS_TTL_MS) return cached.data
  const resp = await fetch(`${SLEEPER}/stats/nfl/regular/${season}/${week}`)
  if (!resp.ok) throw new Error('sleeper stats fetch failed')
  const data = await resp.json()
  statsCache.set(cacheKey, { data, at: Date.now() })
  return data
}

function resolvePlayerId(player, index) {
  const position = String(player.position ?? '')
  if (position === 'D/ST' || position === 'DEF') {
    const nickname = String(player.name ?? '').replace(/\s*d\/st$/i, '').trim().toLowerCase()
    return DST_ABBREVS[nickname] ?? null
  }
  return index.get(`${normalizeName(player.name)}|${position}`)?.id ?? null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = await readJsonBody(req)
  const players = Array.isArray(body.players) ? body.players : []
  if (players.length === 0) {
    return res.status(400).json({ error: 'Provide a players array of { name, position }.' })
  }

  if (body.season != null && toBoundedInt(body.season, 2000, 2100) === null) {
    return res.status(400).json({ error: 'season must be a 4-digit year.' })
  }
  if (body.week != null && toBoundedInt(body.week, 1, 18) === null) {
    return res.status(400).json({ error: 'week must be an integer between 1 and 18.' })
  }

  try {
    let season = toBoundedInt(body.season, 2000, 2100)
    let week = toBoundedInt(body.week, 1, 18)
    if (!season || !week) {
      const stateResp = await fetch(`${SLEEPER}/state/nfl`)
      const state = stateResp.ok ? await stateResp.json() : {}
      const inSeason = state.season_type === 'regular' && Number(state.week) >= 1
      if (inSeason) {
        season = season || Number(state.season)
        week = week || Math.min(18, Number(state.week))
      } else {
        // Off-season: show the final week of the most recent completed season
        season = season || (Number(state.season || new Date().getFullYear()) - 1)
        week = week || 18
      }
    }
    season = toBoundedInt(season, 2000, 2100)
    week = toBoundedInt(week, 1, 18)
    if (!season || !week) {
      return res.status(502).json({ error: 'Could not determine a valid season/week.' })
    }

    const [index, stats] = await Promise.all([getPlayersIndex(), getStats(season, week)])

    const points = {}
    for (const player of players) {
      if (!player?.name) continue
      const id = resolvePlayerId(player, index)
      const stat = id ? stats[id] : null
      points[player.name] = stat && typeof stat.pts_ppr === 'number' ? stat.pts_ppr : null
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res.status(200).json({ season, week, scoring: 'ppr', points })
  } catch {
    return res.status(502).json({ error: 'Could not load live stats from Sleeper. Try again shortly.' })
  }
}
