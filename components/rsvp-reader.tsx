"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Settings, RotateCcw, Keyboard, Rewind } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { TextInputDialog } from "@/components/text-input-dialog"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { loadSettings, saveSettings } from "@/lib/storage"
import {
  DEFAULT_TEXT,
  DEFAULT_WPM,
  SENTENCE_END_DELAY,
  COMMA_DELAY,
  LONG_WORD_DELAY,
  VERY_LONG_WORD_DELAY,
  SHORT_WORD_DELAY,
  LONG_WORD_THRESHOLD,
  VERY_LONG_WORD_THRESHOLD,
  SHORT_WORD_THRESHOLD,
} from "@/lib/constants"

interface ProcessedWord {
  text: string
  delay: number // milliseconds
}

const getInitialWords = (): ProcessedWord[] => {
  const baseDelay = 60000 / DEFAULT_WPM
  const rawWords = DEFAULT_TEXT.split(/\s+/).filter((word) => word.length > 0)

  return rawWords.map((word) => {
    let delay = baseDelay

    // Add delay for punctuation
    if (word.match(/[.!?]$/)) {
      delay *= SENTENCE_END_DELAY
    } else if (word.match(/[,;:]$/)) {
      delay *= COMMA_DELAY
    }

    // Adjust for word length
    if (word.length > LONG_WORD_THRESHOLD) {
      delay *= LONG_WORD_DELAY
    } else if (word.length > VERY_LONG_WORD_THRESHOLD) {
      delay *= VERY_LONG_WORD_DELAY
    }

    if (word.length <= SHORT_WORD_THRESHOLD) {
      delay *= SHORT_WORD_DELAY
    }

    return {
      text: word,
      delay: Math.round(delay),
    }
  })
}

export function RSVPReader() {
  const [wpm, setWpm] = useState(DEFAULT_WPM)
  const [fontSize, setFontSize] = useState(60)
  const [showORP, setShowORP] = useState(true)
  const [usePunctuation, setUsePunctuation] = useState(true)
  const [useAnimation, setUseAnimation] = useState(true)
  const [showProgress, setShowProgress] = useState(false)
  const [words, setWords] = useState<ProcessedWord[]>(getInitialWords)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [hasText, setHasText] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [timeProgress, setTimeProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const rewindIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const readingStartTimeRef = useRef<number>(0)
  const hasStartedReadingRef = useRef(false)

  const baseDelay = 60000 / wpm
  // Animation should be fast enough to not interfere with reading (max 25% of base delay)
  const animationDuration = Math.min(150, Math.floor(baseDelay * 0.25))

  // Process text with intelligent delays based on punctuation and word length
  const processText = useCallback(
    (text: string) => {
      const rawWords = text.split(/\s+/).filter((word) => word.length > 0)

      const processed: ProcessedWord[] = rawWords.map((word) => {
        let delay = baseDelay

        if (usePunctuation) {
          // Add delay for punctuation
          if (word.match(/[.!?]$/)) {
            delay *= SENTENCE_END_DELAY
          } else if (word.match(/[,;:]$/)) {
            delay *= COMMA_DELAY
          }

          // Adjust for word length
          if (word.length > LONG_WORD_THRESHOLD) {
            delay *= LONG_WORD_DELAY
          } else if (word.length > VERY_LONG_WORD_THRESHOLD) {
            delay *= VERY_LONG_WORD_DELAY
          }

          // Short words can be faster
          if (word.length <= SHORT_WORD_THRESHOLD) {
            delay *= SHORT_WORD_DELAY
          }
        }

        return {
          text: word,
          delay: Math.round(delay),
        }
      })

      return processed
    },
    [baseDelay, usePunctuation]
  )

  // Calculate total reading time for all words
  const getTotalReadingTime = useCallback((wordList: ProcessedWord[]) => {
    return wordList.reduce((total, word) => total + word.delay, 0)
  }, [])

  const handleTextSubmit = useCallback(
    (text: string) => {
      const processed = processText(text)
      setWords(processed)
      setCurrentIndex(0)
      setIsReading(false)
      setHasText(true)
      setTimeProgress(0)
    },
    [processText]
  )

  // Load saved settings on mount - only runs once
  const initializedRef = useRef(false)
  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return
    initializedRef.current = true

    const settings = loadSettings()
    if (settings) {
      setWpm(settings.wpm)
      setFontSize(settings.fontSize)
      setShowORP(settings.showORP)
      setUsePunctuation(settings.usePunctuation)
      if (settings.useAnimation !== undefined) {
        setUseAnimation(settings.useAnimation)
      }
      if (settings.showProgress !== undefined) {
        setShowProgress(settings.showProgress)
      }
    }
  }, [])

  // Save settings when they change
  useEffect(() => {
    saveSettings({
      wpm,
      fontSize,
      showORP,
      usePunctuation,
      useAnimation,
      showProgress,
    })
  }, [wpm, fontSize, showORP, usePunctuation, useAnimation, showProgress])

  // Reading loop with dynamic delays
  useEffect(() => {
    if (isReading) {
      hasStartedReadingRef.current = true

      if (currentIndex < words.length) {
        const currentWord = words[currentIndex]
        intervalRef.current = setTimeout(() => {
          setCurrentIndex((prev) => {
            if (prev >= words.length - 1) {
              setIsReading(false)
              return prev
            }
            return prev + 1
          })
        }, currentWord.delay)
      }
    } else {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isReading, currentIndex, words])

  // Time-based progress bar that updates smoothly
  useEffect(() => {
    if (isReading && words.length > 0) {
      // Calculate elapsed time from words we've already read
      const elapsedTime = words.slice(0, currentIndex).reduce((total, word) => total + word.delay, 0)
      const totalTime = getTotalReadingTime(words)

      readingStartTimeRef.current = Date.now() - elapsedTime

      // Update progress smoothly every 50ms
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - readingStartTimeRef.current
        const progress = Math.min(100, (elapsed / totalTime) * 100)
        setTimeProgress(progress)
      }, 50)
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      // When paused, set progress to current word position
      if (words.length > 0) {
        const elapsed = words.slice(0, currentIndex + 1).reduce((total, word) => total + word.delay, 0)
        const totalTime = getTotalReadingTime(words)
        setTimeProgress((elapsed / totalTime) * 100)
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isReading, currentIndex, words, getTotalReadingTime])

  // Update words when settings change (but not when words themselves change)
  const prevSettingsRef = useRef({ baseDelay, usePunctuation })
  useEffect(() => {
    const prevSettings = prevSettingsRef.current
    const settingsChanged =
      prevSettings.baseDelay !== baseDelay ||
      prevSettings.usePunctuation !== usePunctuation

    if (settingsChanged && words.length > 0) {
      const rawText = words.map((w) => w.text).join(" ")
      const processed = processText(rawText)
      setWords(processed)
      prevSettingsRef.current = { baseDelay, usePunctuation }
    }
  }, [baseDelay, usePunctuation, words, processText])

  const handlePointerDown = () => {
    if (hasText && currentIndex < words.length) {
      setIsReading(true)
    }
  }

  const handlePointerUp = () => {
    setIsReading(false)
  }

  const handlePointerLeave = () => {
    setIsReading(false)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsReading(false)
    setTimeProgress(0)
  }

  const handleRewindStart = () => {
    // Rewind one word immediately
    setCurrentIndex((prev) => Math.max(0, prev - 1))

    // Then continue rewinding while held
    rewindIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev <= 0) {
          if (rewindIntervalRef.current) {
            clearInterval(rewindIntervalRef.current)
            rewindIntervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 100) // Rewind speed: 10 words per second
  }

  const handleRewindStop = () => {
    if (rewindIntervalRef.current) {
      clearInterval(rewindIntervalRef.current)
      rewindIntervalRef.current = null
    }
  }

  const handleSpaceDown = () => {
    // Don't start reading if any dialog is open
    if (settingsOpen || showKeyboardHelp) return

    if (hasText && currentIndex < words.length) {
      setIsReading(true)
    }
  }

  const handleSpaceUp = () => {
    setIsReading(false)
  }

  const skipBackward = () => {
    // Don't skip if any dialog is open
    if (settingsOpen || showKeyboardHelp) return
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const skipForward = () => {
    // Don't skip if any dialog is open
    if (settingsOpen || showKeyboardHelp) return
    setCurrentIndex((prev) => Math.min(words.length - 1, prev + 1))
  }

  const handleRestartWrapper = () => {
    // Don't restart if any dialog is open
    if (settingsOpen || showKeyboardHelp) return
    handleRestart()
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSpaceDown: handleSpaceDown,
    onSpaceUp: handleSpaceUp,
    onLeft: skipBackward,
    onRight: skipForward,
    onRestart: handleRestartWrapper,
    onSettings: () => setSettingsOpen(true),
    onKeyboard: () => setShowKeyboardHelp(true),
  })

  const currentWord = words[currentIndex]?.text || ""

  // Calculate ORP (Optimal Recognition Point) - usually slightly left of center
  const getORPIndex = (word: string) => {
    if (word.length <= 1) return 0
    if (word.length <= 5) return 1
    if (word.length <= 9) return 2
    return 3
  }

  const renderWordWithORP = () => {
    if (!showORP || !currentWord) return currentWord

    const orpIndex = getORPIndex(currentWord)
    return (
      <>
        <span className="text-muted-foreground">
          {currentWord.slice(0, orpIndex)}
        </span>
        <span className="text-primary">{currentWord[orpIndex]}</span>
        <span>{currentWord.slice(orpIndex + 1)}</span>
      </>
    )
  }

  const isFinished = currentIndex >= words.length - 1 && words.length > 0

  return (
    <div className="h-dvh flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 right-0 p-4 flex gap-2 z-10">
        <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Keyboard className="h-5 w-5" />
              <span className="sr-only">Keyboard shortcuts</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Control your reading experience with your keyboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hold to read</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  Space
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Previous word</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  ←
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Next word</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  →
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Restart from beginning</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  R
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Open settings</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  S
                </kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Keyboard shortcuts help</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                  K
                </kbd>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Customize your reading experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="wpm">Reading Speed: {wpm} WPM</Label>
                <Slider
                  id="wpm"
                  min={100}
                  max={1000}
                  step={50}
                  value={[wpm]}
                  onValueChange={(value) => setWpm(value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Typical range: 250-600 WPM
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={24}
                  max={120}
                  step={4}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="orp" className="cursor-pointer">
                  Highlight ORP (Optimal Recognition Point)
                </Label>
                <Switch
                  id="orp"
                  checked={showORP}
                  onCheckedChange={setShowORP}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="punctuation" className="cursor-pointer">
                  Smart Punctuation Pauses
                </Label>
                <Switch
                  id="punctuation"
                  checked={usePunctuation}
                  onCheckedChange={setUsePunctuation}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="animation" className="cursor-pointer">
                  Word Transition Animation
                </Label>
                <Switch
                  id="animation"
                  checked={useAnimation}
                  onCheckedChange={setUseAnimation}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="progress" className="cursor-pointer">
                  Show Progress Bar
                </Label>
                <Switch
                  id="progress"
                  checked={showProgress}
                  onCheckedChange={setShowProgress}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ThemeToggle />
      </div>

      {/* Main reading area */}
      <div
        className={`flex-1 flex items-center justify-center select-none ${!isFinished ? 'cursor-pointer' : ''}`}
        onPointerDown={!isFinished ? handlePointerDown : undefined}
        onPointerUp={!isFinished ? handlePointerUp : undefined}
        onPointerLeave={!isFinished ? handlePointerLeave : undefined}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="w-full h-full flex flex-col justify-center">
            <div className="text-center w-full px-4">
              {/* Main word display */}
              <div className="min-h-[120px] flex items-center justify-center">
                <p
                  className={`font-bold tracking-tight ${
                    useAnimation && hasStartedReadingRef.current ? "animate-in fade-in zoom-in-50" : ""
                  }`}
                  style={{
                    fontSize: `${fontSize}px`,
                    animationDuration: useAnimation && hasStartedReadingRef.current
                      ? `${animationDuration}ms`
                      : undefined,
                  }}
                  key={currentIndex}
                >
                  {renderWordWithORP()}
                </p>
              </div>

              {/* Instruction text */}
              <div className="h-6 mt-2">
                {!isReading && (
                  <p className="text-muted-foreground">
                    {isFinished ? "Finished!" : "Touch and hold to read"}
                  </p>
                )}
              </div>

              {/* Progress bar - always reserve space to prevent layout shift */}
              <div className="space-y-2 mt-8">
                <div className="text-sm text-muted-foreground h-5">
                  {showProgress && (
                    <>
                      {currentIndex + 1} / {words.length} ({timeProgress.toFixed(0)}%)
                    </>
                  )}
                </div>
                <div className="max-w-md mx-auto h-2">
                  {showProgress && (
                    <div className="h-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-[width] duration-100 ease-linear"
                        style={{
                          width: `${timeProgress}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom controls - Rewind, Restart, and Clear */}
              <div className="h-10 flex items-center justify-center mt-8">
                {!isReading && (
                  <div
                    className="flex gap-3 justify-center"
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="lg"
                      disabled={currentIndex === 0}
                      onPointerDown={handleRewindStart}
                      onPointerUp={handleRewindStop}
                      onPointerLeave={handleRewindStop}
                      className="size-14"
                    >
                      <Rewind className="size-6" />
                      <span className="sr-only">Rewind</span>
                    </Button>
                    <Button
                      onClick={handleRestart}
                      variant="ghost"
                      size="lg"
                      disabled={currentIndex === 0}
                      className="size-14"
                    >
                      <RotateCcw className="size-6" />
                      <span className="sr-only">Restart</span>
                    </Button>
                    <TextInputDialog onTextSubmit={handleTextSubmit} />
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>

    </div>
  )
}
