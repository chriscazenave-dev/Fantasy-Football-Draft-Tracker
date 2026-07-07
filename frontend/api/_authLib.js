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
