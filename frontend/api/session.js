import { clearSessionCookie, getTokenFromRequest, verifyToken } from './_authLib.js'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    clearSessionCookie(res)
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.AUTH_SECRET
  const token = getTokenFromRequest(req)
  const payload = token && secret ? verifyToken(token, secret) : null
  if (!payload) {
    return res.status(200).json({ session: null })
  }

  return res.status(200).json({
    session: {
      username: payload.username,
      name: payload.name,
      team: payload.team,
      isAdmin: !!payload.isAdmin,
      mustChangePassword: !!payload.mustChangePassword,
    },
  })
}
