import { getToken } from './auth'

export async function fetchLeagueState() {
  const res = await fetch('/api/league-state')
  if (!res.ok) throw new Error('Could not load league data.')
  return res.json() // { state, version }
}

export async function saveLeagueState(state) {
  const token = getToken()
  const res = await fetch('/api/league-state', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ state }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Could not save league data.')
  return data // { version }
}

export async function fetchLivePoints(players, { season, week } = {}) {
  const res = await fetch('/api/live-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players, season, week }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Could not load live points.')
  return data // { season, week, scoring, points }
}
