import Ably from 'ably'
import { verifyToken } from './_authLib.js'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'Auth is not configured yet. Set AUTH_SECRET.' })
  }

  const auth = String(req.headers.authorization ?? '')
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const session = token ? verifyToken(token, secret) : null
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to use realtime updates.' })
  }

  const key = process.env.ABLY_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'Realtime is not configured. Set ABLY_API_KEY.' })
  }
  try {
    const client = new Ably.Rest({ key })
    const tokenRequest = await client.auth.createTokenRequest({
      clientId: String(session.username),
      capability: JSON.stringify({ 'league-state': ['subscribe'] }),
    })
    return res.status(200).json(tokenRequest)
  } catch {
    return res.status(500).json({ error: 'Could not create realtime token.' })
  }
}
