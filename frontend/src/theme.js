import { useCallback, useEffect, useState } from 'react'
import { loadStored, saveStored, STORAGE_KEYS } from './draftLogic'

export const THEMES = ['light', 'dark']

function systemPrefersDark() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function getInitialTheme() {
  const stored = loadStored(STORAGE_KEYS.theme, null)
  if (THEMES.includes(stored)) return stored
  return systemPrefersDark() ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    saveStored(STORAGE_KEYS.theme, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
