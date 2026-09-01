import { getDb, getTokenFromRequest, readJsonBody, verifyToken } from './_authLib.js'

const LEAGUE_ID = 'default'

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
    const token = getTokenFromRequest(req)
    const session = token && secret ? verifyToken(token, secret) : null
    if (!session) {
      return res.status(401).json({ error: 'You must be signed in to save league changes.' })
    }

    const body = await readJsonBody(req)
    if (!body.state || typeof body.state !== 'object') {
      return res.status(400).json({ error: 'Missing state.' })
    }

    let version
    try {
      const rows = await sql`
        INSERT INTO league_state (id, state, version, updated_by, updated_at)
        VALUES (${LEAGUE_ID}, ${JSON.stringify(body.state)}::jsonb, 1, ${session.username}, now())
        ON CONFLICT (id) DO UPDATE
          SET state = EXCLUDED.state,
              version = league_state.version + 1,
              updated_by = EXCLUDED.updated_by,
              updated_at = now()
        RETURNING version
      `
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
