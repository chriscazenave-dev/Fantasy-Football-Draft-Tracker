import { useState } from 'react'
import { Users, Lock, User, Loader2 } from 'lucide-react'
import { login } from './auth'

export default function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const session = await login(username, password)
      onSuccess(session)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[#1d1d1f] font-sans px-4 selection:bg-blue-500/20">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-md mb-4">
            <Users size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dynasty<span className="text-gray-400"> Madness</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access the draft tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50/80 rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-medium py-2.5 rounded-lg shadow-sm hover:bg-gray-800 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
