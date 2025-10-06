import { useState, useEffect, useCallback } from 'react'

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

export function useTypingStats(typedText: string, displayText: string) {
  const [stats, setStats] = useState<TypingStats>(initialStats)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (typedText.length === 0) {
      setStats(initialStats)
      setStartTime(null)
      return
    }

    // Start timer on first character
    if (startTime === null) {
      setStartTime(Date.now())
    }

    // Calculate stats
    const totalChars = typedText.length
    let correctChars = 0
    let errors = 0

    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === displayText[i]) {
        correctChars++
      } else {
        errors++
      }
    }

    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100

    // Calculate WPM (assuming average word length of 5 characters)
    let wpm = 0
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60 // minutes
      if (timeElapsed > 0) {
        wpm = Math.round((correctChars / 5) / timeElapsed)
      }
    }

    setStats({
      wpm,
      accuracy,
      errors,
      correctChars,
      totalChars,
    })
  }, [typedText, displayText, startTime])

  const reset = useCallback(() => {
    setStats(initialStats)
    setStartTime(null)
  }, [])

  return { stats, reset }
}
