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
  return { username: payload.username }
}

export async function login(username, password) {
  let res
  try {
    res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch {
    throw new Error('Could not reach the login server. Check your connection and try again.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Incorrect username or password.')
  }
  if (!data?.token) {
    throw new Error('Login failed. Please try again.')
  }

  setToken(data.token)
  return getSession()
}
