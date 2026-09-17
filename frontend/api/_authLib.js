import crypto from 'node:crypto'
import { neon } from '@neondatabase/serverless'

export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

export function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function sign(payloadB64, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function makeToken(payload, secret) {
  const payloadB64 = base64url(JSON.stringify(payload))
  return `${payloadB64}.${sign(payloadB64, secret)}`
}

export function verifyToken(token, secret) {
  if (typeof token !== 'string') return null
  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return null
  if (!safeEqual(signature, sign(payloadB64, secret))) return null
  try {
    const payload = JSON.parse(Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    if (typeof payload.exp !== 'number' || Date.now() / 1000 >= payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function safeEqual(a, b) {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

const SCRYPT_KEYLEN = 64

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const parts = String(stored).split(':')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const [, salt, hash] = parts
  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return safeEqual(candidate, hash)
}

// Hash of an unguessable random value, used to equalize response timing
// when the username does not exist.
const DUMMY_PASSWORD_HASH = hashPassword(crypto.randomBytes(32).toString('hex'))

export function verifyPasswordOrDummy(password, stored) {
  if (stored) return verifyPassword(password, stored)
  verifyPassword(password, DUMMY_PASSWORD_HASH)
  return false
}

const THROTTLE_WINDOW_SECONDS = 15 * 60
const LOCKOUT_SECONDS = 15 * 60
const MAX_FAILURES_PER_USERNAME = 5
const MAX_FAILURES_PER_IP = 20

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

export async function ensureThrottleTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS draft_tracker_login_throttle (
      key TEXT PRIMARY KEY,
      fail_count INTEGER NOT NULL DEFAULT 0,
      window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
      locked_until TIMESTAMPTZ
    )
  `
}

export async function isThrottled(sql, username, ip) {
  const rows = await sql`
    SELECT key, fail_count, window_start, locked_until
    FROM draft_tracker_login_throttle
    WHERE key IN (${`user:${username}`}, ${`ip:${ip}`})
  `
  const now = Date.now()
  for (const row of rows) {
    if (row.locked_until && new Date(row.locked_until).getTime() > now) return true
    const windowFresh = new Date(row.window_start).getTime() > now - THROTTLE_WINDOW_SECONDS * 1000
    const limit = row.key.startsWith('user:') ? MAX_FAILURES_PER_USERNAME : MAX_FAILURES_PER_IP
    if (windowFresh && row.fail_count >= limit) return true
  }
  return false
}

export async function recordLoginFailure(sql, username, ip) {
  for (const [key, limit] of [
    [`user:${username}`, MAX_FAILURES_PER_USERNAME],
    [`ip:${ip}`, MAX_FAILURES_PER_IP],
  ]) {
    await sql`
      INSERT INTO draft_tracker_login_throttle (key, fail_count, window_start, locked_until)
      VALUES (${key}, 1, now(), NULL)
      ON CONFLICT (key) DO UPDATE SET
        fail_count = CASE
          WHEN draft_tracker_login_throttle.window_start < now() - make_interval(secs => ${THROTTLE_WINDOW_SECONDS})
          THEN 1
          ELSE draft_tracker_login_throttle.fail_count + 1
        END,
        window_start = CASE
          WHEN draft_tracker_login_throttle.window_start < now() - make_interval(secs => ${THROTTLE_WINDOW_SECONDS})
          THEN now()
          ELSE draft_tracker_login_throttle.window_start
        END,
        locked_until = CASE
          WHEN (CASE
            WHEN draft_tracker_login_throttle.window_start < now() - make_interval(secs => ${THROTTLE_WINDOW_SECONDS})
            THEN 1
            ELSE draft_tracker_login_throttle.fail_count + 1
          END) >= ${limit}
          THEN now() + make_interval(secs => ${LOCKOUT_SECONDS})
          ELSE NULL
        END
    `
  }
}

export async function clearLoginFailures(sql, username) {
  await sql`DELETE FROM draft_tracker_login_throttle WHERE key = ${`user:${username}`}`
}

export async function readJsonBody(req) {
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

export function sessionPayload(user) {
  return {
    username: user.username,
    name: user.display_name,
    team: user.team_name,
    isAdmin: user.is_admin,
    mustChangePassword: user.must_change_password,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }
}
