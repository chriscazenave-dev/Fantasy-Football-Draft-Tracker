import { getDb, readJsonBody, verifyToken } from './_authLib.js'

const LEAGUE_ID = 'default'
const MAX_STATE_BYTES = 1_000_000

const STATE_SHAPE = {
  lineups: isPlainObject,
  rosters: isPlainObject,
  prospects: Array.isArray,
  draftedPlayers: isPlainObject,
  draftOrder: Array.isArray,
  futurePickData: isPlainObject,
  footnotes: isPlainObject,
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateState(state) {
  if (!isPlainObject(state)) return 'Missing state.'
  for (const key of Object.keys(state)) {
    const check = STATE_SHAPE[key]
    if (!check) return `Unexpected field "${key}" in state.`
    if (state[key] !== undefined && !check(state[key])) return `Invalid value for "${key}".`
  }
  return null
}

async function publishUpdate(version, updatedBy) {
  const key = process.env.ABLY_API_KEY
  if (!key) return
  try {
    await fetch('https://rest.ably.io/channels/league-state/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(key).toString('base64')}`,
      },
      body: JSON.stringify({ name: 'update', data: { version, updatedBy } }),
    })
  } catch {
    // realtime notification is best-effort; clients also poll on focus
  }
}

export default async function handler(req, res) {
  const sql = getDb()
  if (!sql) {
    return res.status(500).json({ error: 'Database is not configured. Set DATABASE_URL.' })
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT state, version FROM league_state WHERE id = ${LEAGUE_ID}`
      if (!rows[0]) return res.status(200).json({ state: null, version: 0 })
      return res.status(200).json({ state: rows[0].state, version: Number(rows[0].version) })
    } catch {
      return res.status(500).json({ error: 'Could not load league data. Try again shortly.' })
    }
  }

  if (req.method === 'PUT') {
    const secret = process.env.AUTH_SECRET
    const auth = String(req.headers.authorization ?? '')
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    const session = token && secret ? verifyToken(token, secret) : null
    if (!session) {
      return res.status(401).json({ error: 'You must be signed in to save league changes.' })
    }

    const body = await readJsonBody(req)
    const validationError = validateState(body.state)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const serialized = JSON.stringify(body.state)
    if (Buffer.byteLength(serialized, 'utf8') > MAX_STATE_BYTES) {
      return res.status(413).json({ error: 'League state is too large to save.' })
    }

    const baseVersion = Number(body.baseVersion)
    if (!Number.isInteger(baseVersion) || baseVersion < 0) {
      return res.status(400).json({ error: 'Missing baseVersion.' })
    }

    let version
    try {
      const existing = await sql`SELECT state, version FROM league_state WHERE id = ${LEAGUE_ID}`
      const currentVersion = existing[0] ? Number(existing[0].version) : 0
      if (baseVersion !== currentVersion) {
        return res.status(409).json({ error: 'League data changed since you loaded it. Refresh and try again.', version: currentVersion })
      }

      if (!session.isAdmin && existing[0]) {
        const currentState = existing[0].state ?? {}
        if (JSON.stringify(body.state.prospects ?? null) !== JSON.stringify(currentState.prospects ?? null)) {
          return res.status(403).json({ error: 'Only admins can modify the prospect list.' })
        }
      }

      const rows = await sql`
        INSERT INTO league_state (id, state, version, updated_by, updated_at)
        VALUES (${LEAGUE_ID}, ${serialized}::jsonb, 1, ${session.username}, now())
        ON CONFLICT (id) DO UPDATE
          SET state = EXCLUDED.state,
              version = league_state.version + 1,
              updated_by = EXCLUDED.updated_by,
              updated_at = now()
          WHERE league_state.version = ${baseVersion}
        RETURNING version
      `
      if (!rows[0]) {
        return res.status(409).json({ error: 'League data changed since you loaded it. Refresh and try again.' })
      }
      version = Number(rows[0].version)
    } catch {
      return res.status(500).json({ error: 'Could not save league data. Try again shortly.' })
    }

    await publishUpdate(version, session.username)
    return res.status(200).json({ version })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ error: 'Method not allowed' })
}
