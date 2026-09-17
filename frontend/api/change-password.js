import { getDb, getTokenFromRequest, hashPassword, makeToken, readJsonBody, sessionPayload, setSessionCookie, verifyPassword, verifyToken } from './_authLib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.AUTH_SECRET
  const sql = getDb()
  if (!secret || !sql) {
    return res.status(500).json({ error: 'Auth is not configured yet. Set AUTH_SECRET and DATABASE_URL.' })
  }

  const token = getTokenFromRequest(req)
  const session = token ? verifyToken(token, secret) : null
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to change your password.' })
  }

  const body = await readJsonBody(req)
  const currentPassword = String(body.currentPassword ?? '')
  const newPassword = String(body.newPassword ?? '')

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' })
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'New password must be different from the current one.' })
  }

  let rows
  try {
    rows = await sql`
      SELECT username, display_name, team_name, is_admin, must_change_password, password_hash
      FROM draft_tracker_users WHERE username = ${session.username}
    `
  } catch {
    return res.status(500).json({ error: 'Could not reach the user database. Try again shortly.' })
  }

  const user = rows[0]
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' })
  }

  try {
    await sql`
      UPDATE draft_tracker_users
      SET password_hash = ${hashPassword(newPassword)}, must_change_password = false
      WHERE username = ${user.username}
    `
  } catch {
    return res.status(500).json({ error: 'Could not update the password. Try again shortly.' })
  }

  const payload = sessionPayload({ ...user, must_change_password: false })
  setSessionCookie(res, makeToken(payload, secret))
  return res.status(200).json({ ...payload })
}
