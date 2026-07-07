import {
  clearLoginFailures,
  ensureThrottleTable,
  getClientIp,
  getDb,
  isThrottled,
  makeToken,
  readJsonBody,
  recordLoginFailure,
  sessionPayload,
  verifyPasswordOrDummy,
} from './_authLib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.AUTH_SECRET
  const sql = getDb()
  if (!secret || !sql) {
    return res.status(500).json({ error: 'Login is not configured yet. Set AUTH_SECRET and DATABASE_URL.' })
  }

  const body = await readJsonBody(req)
  const username = String(body.username ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  const ip = getClientIp(req)

  let rows
  try {
    await ensureThrottleTable(sql)
    if (await isThrottled(sql, username, ip)) {
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' })
    }
    rows = await sql`
      SELECT username, display_name, team_name, is_admin, must_change_password, password_hash
      FROM draft_tracker_users WHERE username = ${username}
    `
  } catch {
    return res.status(500).json({ error: 'Could not reach the user database. Try again shortly.' })
  }

  const user = rows[0]
  if (!verifyPasswordOrDummy(password, user?.password_hash)) {
    try {
      await recordLoginFailure(sql, username, ip)
    } catch {
      // ignore throttle bookkeeping errors; still deny the attempt
    }
    return res.status(401).json({ error: 'Incorrect username or password.' })
  }

  try {
    await clearLoginFailures(sql, username)
  } catch {
    // non-fatal
  }

  const payload = sessionPayload(user)
  const token = makeToken(payload, secret)
  return res.status(200).json({ token, ...payload })
}
