const TOKEN_KEY = 'dynasty_auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function decodePayload(token) {
  try {
    const payloadB64 = token.split('.')[0]
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getSession() {
  const token = getToken()
  if (!token) return null
  const payload = decodePayload(token)
  if (!payload || typeof payload.exp !== 'number') return null
  if (Date.now() / 1000 >= payload.exp) {
    clearToken()
    return null
  }
  return {
    username: payload.username,
    name: payload.name,
    team: payload.team,
    isAdmin: !!payload.isAdmin,
    mustChangePassword: !!payload.mustChangePassword,
  }
}

async function postJson(url, body, headers = {}) {
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Something went wrong. Please try again.')
  }
  if (!data?.token) {
    throw new Error('Request failed. Please try again.')
  }

  setToken(data.token)
  return getSession()
}

export async function login(username, password) {
  return postJson('/api/login', { username, password })
}

export async function changePassword(currentPassword, newPassword) {
  const token = getToken()
  return postJson('/api/change-password', { currentPassword, newPassword }, { Authorization: `Bearer ${token}` })
}
