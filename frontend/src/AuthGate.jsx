import { useEffect, useState } from 'react'
import App from './App'
import Login from './Login'
import ChangePassword from './ChangePassword'
import { fetchSession, logout } from './auth'

export default function AuthGate() {
  const [session, setSession] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    let active = true
    fetchSession().then((s) => {
      if (active && s) setSession(s)
    })
    return () => {
      active = false
    }
  }, [])

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
    logout()
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
