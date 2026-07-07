import { useState } from 'react'
import App from './App'
import Login from './Login'
import ChangePassword from './ChangePassword'
import { getSession, clearToken } from './auth'

export default function AuthGate() {
  const [session, setSession] = useState(() => getSession())
  const [showLogin, setShowLogin] = useState(false)

  if (session?.mustChangePassword) {
    return <ChangePassword session={session} onSuccess={setSession} />
  }

  if (!session && showLogin) {
    return (
      <Login
        onSuccess={(s) => { setSession(s); setShowLogin(false) }}
        onCancel={() => setShowLogin(false)}
      />
    )
  }

  const handleLogout = () => {
    clearToken()
    setSession(null)
  }

  return (
    <App
      session={session}
      onLogout={session ? handleLogout : null}
      onRequestLogin={() => setShowLogin(true)}
    />
  )
}
