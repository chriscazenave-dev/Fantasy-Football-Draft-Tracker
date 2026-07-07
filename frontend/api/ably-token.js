import Ably from 'ably'

export default async function handler(req, res) {
  const key = process.env.ABLY_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'Realtime is not configured. Set ABLY_API_KEY.' })
  }
  try {
    const client = new Ably.Rest({ key })
    const tokenRequest = await client.auth.createTokenRequest({
      clientId: 'league-member',
      capability: JSON.stringify({ 'league-state': ['subscribe'] }),
    })
    return res.status(200).json(tokenRequest)
  } catch {
    return res.status(500).json({ error: 'Could not create realtime token.' })
  }
}
