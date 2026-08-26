import Ably from 'ably'
import { verifyToken } from './_authLib.js'

export default async function handler(req, res) {
  const key = process.env.ABLY_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'Realtime is not configured. Set ABLY_API_KEY.' })
  }
  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    const token = bearerToken || req.query?.token
    const session = token && process.env.AUTH_SECRET ? verifyToken(token, process.env.AUTH_SECRET) : null
    const isAuthenticated = !!session
    const client = new Ably.Rest({ key })
    const tokenRequest = await client.auth.createTokenRequest({
      clientId: isAuthenticated ? `user:${session.username}` : 'league-member',
      capability: JSON.stringify(
        isAuthenticated
          ? { 'league-state': ['subscribe'], 'draft-room': ['subscribe', 'publish', 'presence'] }
          : { 'league-state': ['subscribe'], 'draft-room': ['subscribe'] }
      ),
    })
    return res.status(200).json(tokenRequest)
  } catch {
    return res.status(500).json({ error: 'Could not create realtime token.' })
  }
}
