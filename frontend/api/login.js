import crypto from 'node:crypto'

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function sign(payloadB64, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function safeEqual(a, b) {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.AUTH_SECRET
  const usersRaw = process.env.AUTH_USERS
  if (!secret || !usersRaw) {
    return res.status(500).json({ error: 'Login is not configured yet. Set AUTH_SECRET and AUTH_USERS.' })
  }

  let users
  try {
    users = JSON.parse(usersRaw)
  } catch {
    return res.status(500).json({ error: 'Login is misconfigured (AUTH_USERS is not valid JSON).' })
  }

  const body = await readJsonBody(req)
  const username = String(body.username ?? '').trim()
  const password = String(body.password ?? '')

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  const expected = Object.prototype.hasOwnProperty.call(users, username) ? String(users[username]) : null
  const ok = expected !== null && safeEqual(password, expected)
  if (!ok) {
    return res.status(401).json({ error: 'Incorrect username or password.' })
  }

  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }
  const payloadB64 = base64url(JSON.stringify(payload))
  const token = `${payloadB64}.${sign(payloadB64, secret)}`

  return res.status(200).json({ token, username })
}
