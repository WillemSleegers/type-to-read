// Local storage utilities for persisting app state

export interface ReadingSettings {
  wpm: number
  fontSize: number
  showORP: boolean
  usePunctuation: boolean
  useAnimation: boolean
  showProgress: boolean
}

export interface SavedText {
  id: string
  content: string
  title?: string
  createdAt: number
  lastReadAt?: number
  progress: number // 0-100
}

export interface ReadingStats {
  totalWordsRead: number
  totalReadingTime: number // milliseconds
  sessionsCount: number
  averageWPM: number
}

const SETTINGS_KEY = 'type-to-read-settings'
const SAVED_TEXTS_KEY = 'type-to-read-saved-texts'
const STATS_KEY = 'type-to-read-stats'
const CURRENT_TEXT_KEY = 'type-to-read-current'

// Settings
export function loadSettings(): ReadingSettings | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(SETTINGS_KEY)
  return stored ? JSON.parse(stored) : null
}

export function saveSettings(settings: ReadingSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Current text and position
export function loadCurrentText(): SavedText | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(CURRENT_TEXT_KEY)
  return stored ? JSON.parse(stored) : null
}

export function saveCurrentText(text: SavedText): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CURRENT_TEXT_KEY, JSON.stringify(text))
}

export function clearCurrentText(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CURRENT_TEXT_KEY)
}

// Saved texts library
export function loadSavedTexts(): SavedText[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(SAVED_TEXTS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveText(text: SavedText): void {
  if (typeof window === 'undefined') return
  const texts = loadSavedTexts()
  const index = texts.findIndex(t => t.id === text.id)
  if (index >= 0) {
    texts[index] = text
  } else {
    texts.push(text)
  }
  localStorage.setItem(SAVED_TEXTS_KEY, JSON.stringify(texts))
}

export function deleteText(id: string): void {
  if (typeof window === 'undefined') return
  const texts = loadSavedTexts().filter(t => t.id !== id)
  localStorage.setItem(SAVED_TEXTS_KEY, JSON.stringify(texts))
}

// Statistics
export function loadStats(): ReadingStats {
  if (typeof window === 'undefined') {
    return {
      totalWordsRead: 0,
      totalReadingTime: 0,
      sessionsCount: 0,
      averageWPM: 0,
    }
  }
  const stored = localStorage.getItem(STATS_KEY)
  return stored ? JSON.parse(stored) : {
    totalWordsRead: 0,
    totalReadingTime: 0,
    sessionsCount: 0,
    averageWPM: 0,
  }
}

export function updateStats(wordsRead: number, timeMs: number, wpm: number): void {
  if (typeof window === 'undefined') return
  const stats = loadStats()
  stats.totalWordsRead += wordsRead
  stats.totalReadingTime += timeMs
  stats.sessionsCount += 1
  stats.averageWPM = Math.round(
    (stats.averageWPM * (stats.sessionsCount - 1) + wpm) / stats.sessionsCount
  )
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function clearStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STATS_KEY)
}
