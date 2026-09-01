const LEGACY_TOKEN_KEY = 'dynasty_auth_token'

// The session token lives in an HttpOnly cookie managed by the server.
// Clean up tokens persisted by older versions of the app.
try {
  localStorage.removeItem(LEGACY_TOKEN_KEY)
} catch {
  // storage unavailable
}

function isLocalDev() {
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

const LOCAL_DEV_MESSAGE =
  'Sign-in is unavailable in local development. The /api auth endpoints only exist on the Vercel deployment (they need AUTH_SECRET and DATABASE_URL). Use "Continue without signing in" to browse the app.'

function toSession(data) {
  return {
    username: data.username,
    name: data.name,
    team: data.team,
    isAdmin: !!data.isAdmin,
    mustChangePassword: !!data.mustChangePassword,
  }
}

export async function fetchSession() {
  let res
  try {
    res = await fetch('/api/session')
  } catch {
    return null
  }
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return data?.session ? toSession(data.session) : null
}

export async function logout() {
  try {
    await fetch('/api/session', { method: 'DELETE' })
  } catch {
    // best effort; the cookie expires on its own
  }
}

async function postJson(url, body) {
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    if (isLocalDev()) throw new Error(LOCAL_DEV_MESSAGE)
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    if (isLocalDev() && !data) throw new Error(LOCAL_DEV_MESSAGE)
    throw new Error(data?.error || 'Something went wrong. Please try again.')
  }
  if (!data?.username) {
    throw new Error('Request failed. Please try again.')
  }

  return toSession(data)
}

export async function login(username, password) {
  return postJson('/api/login', { username, password })
}

export async function changePassword(currentPassword, newPassword) {
  return postJson('/api/change-password', { currentPassword, newPassword })
}
