import { useState, useRef } from 'react'

export interface TypingStats {
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
}

const initialStats: TypingStats = {
  wpm: 0,
  accuracy: 100,
  errors: 0,
  correctChars: 0,
  totalChars: 0,
}

export function useTypingStats() {
  const [stats, setStats] = useState<TypingStats>(initialStats)
  const [startTime, setStartTime] = useState<number | null>(null)
  const errorPositions = useRef<Set<number>>(new Set())

  const updateStats = (typedText: string, displayText: string) => {
    if (typedText.length === 0) {
      setStats(initialStats)
      setStartTime(null)
      errorPositions.current.clear()
      return
    }

    const now = Date.now()
    let currentStartTime = startTime
    if (currentStartTime === null) {
      currentStartTime = now
      setStartTime(now)
    }

    const totalChars = typedText.length
    let correctChars = 0

    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === displayText[i]) {
        correctChars++
      } else {
        errorPositions.current.add(i)
      }
    }

    const errors = errorPositions.current.size
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100

    let wpm = 0
    const timeElapsed = (now - currentStartTime) / 1000 / 60
    if (timeElapsed > 0) {
      wpm = Math.round((correctChars / 5) / timeElapsed)
    }

    setStats({ wpm, accuracy, errors, correctChars, totalChars })
  }

  const reset = () => {
    setStats(initialStats)
    setStartTime(null)
    errorPositions.current.clear()
  }

  return { stats, updateStats, reset }
}
