import { useState } from 'react'
import App from './App'
import Login from './Login'
import { getSession, clearToken } from './auth'

export default function AuthGate() {
  const [session, setSession] = useState(() => getSession())

  if (!session) {
    return <Login onSuccess={setSession} />
  }

  const handleLogout = () => {
    clearToken()
    setSession(null)
  }

  return <App username={session.username} onLogout={handleLogout} />
}
