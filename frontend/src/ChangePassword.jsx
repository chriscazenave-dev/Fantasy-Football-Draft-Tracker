import { useState } from 'react'
import { Users, Lock, Loader2, KeyRound } from 'lucide-react'
import { changePassword } from './auth'

export default function ChangePassword({ session, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const updated = await changePassword(currentPassword, newPassword)
      onSuccess(updated)
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
          <p className="text-sm text-gray-500 mt-1 text-center">
            Welcome{session?.name ? `, ${session.name}` : ''}! Set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50/80 rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
                placeholder="Enter your current password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition"
                placeholder="Repeat your new password"
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
            {loading ? 'Saving…' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
