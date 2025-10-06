// Local storage utilities for persisting app state

export interface TypingSettings {
  fontSize: number
  includePeriods: boolean
  includePunctuation: boolean
  includeCapitalization: boolean
}

const SETTINGS_KEY = 'type-to-read-settings'

export function loadSettings(): TypingSettings | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(SETTINGS_KEY)
  return stored ? JSON.parse(stored) : null
}

export function saveSettings(settings: TypingSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
