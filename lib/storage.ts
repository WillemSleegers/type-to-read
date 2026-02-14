// Local storage utilities for persisting app state

export interface TypingSettings {
  fontSize: number
  includePeriods: boolean
  includePunctuation: boolean
  includeCapitalization: boolean
}

const SETTINGS_KEY = 'type-to-read-settings'

export function loadSettings(): TypingSettings | null {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function saveSettings(settings: TypingSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Silently fail (e.g. private browsing, quota exceeded)
  }
}
