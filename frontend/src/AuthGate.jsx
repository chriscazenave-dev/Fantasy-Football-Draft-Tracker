import { useState } from 'react'
import App from './App'
import Login from './Login'
import ChangePassword from './ChangePassword'
import { getSession, clearToken } from './auth'

export default function AuthGate() {
  const [session, setSession] = useState(() => getSession())

  if (!session) {
    return <Login onSuccess={setSession} />
  }

  if (session.mustChangePassword) {
    return <ChangePassword session={session} onSuccess={setSession} />
  }

  const handleLogout = () => {
    clearToken()
    setSession(null)
  }

  return <App session={session} onLogout={handleLogout} />
}
