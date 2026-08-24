import { Moon, Sun } from 'lucide-react'

export default function SettingsPage({ theme, onToggleTheme }) {
  const isDark = theme === 'dark'

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-500">Preferences are saved on this device.</p>
        </div>

        <div className="px-6 md:px-8 py-6 flex items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Dark mode</p>
              <p className="text-xs text-gray-500 max-w-sm">
                Swap the newsprint for a late-edition palette that is easier on the eyes at night.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Dark mode"
            onClick={onToggleTheme}
            className={`relative shrink-0 w-14 h-8 rounded-full border transition-colors duration-200 ${
              isDark
                ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)]'
                : 'bg-gray-200 border-gray-300'
            }`}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200 ${
                isDark ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
