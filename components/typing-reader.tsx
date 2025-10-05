"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Settings, RotateCcw } from "lucide-react"
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
import { loadSettings, saveSettings } from "@/lib/storage"
import { DEFAULT_TEXT } from "@/lib/constants"

interface TypingStats {
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
}

export function TypingReader() {
  const [fontSize, setFontSize] = useState(24)
  const [showErrors, setShowErrors] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [includePunctuation, setIncludePunctuation] = useState(true)
  const [includeCapitalization, setIncludeCapitalization] = useState(true)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [displayText, setDisplayText] = useState(DEFAULT_TEXT)
  const [typedText, setTypedText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    correctChars: 0,
    totalChars: 0,
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [containerWidth, setContainerWidth] = useState(896) // Default to max-w-4xl
  const [charWidth, setCharWidth] = useState(16) // Conservative default, will be measured
  const [charWidthMeasured, setCharWidthMeasured] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textDisplayRef = useRef<HTMLDivElement>(null)

  // Process text based on punctuation and capitalization settings
  useEffect(() => {
    let processed = text

    if (!includePunctuation) {
      // Remove all punctuation except periods and commas, preserve spaces
      processed = processed.replace(/[^\w\s.,]/g, '')
    }

    if (!includeCapitalization) {
      // Convert to lowercase
      processed = processed.toLowerCase()
    }

    // Remove leading spaces after newlines AND remove newlines entirely for typing
    // We'll break into our own lines based on width
    processed = processed.replace(/\n +/g, ' ').replace(/\n/g, ' ')

    setDisplayText(processed)

    // Reset typing state when text changes
    setTypedText("")
    setStartTime(null)
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
    })
  }, [text, includePunctuation, includeCapitalization])

  // Load saved settings on mount
  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const settings = loadSettings()
    if (settings) {
      setFontSize(settings.fontSize)
      if (settings.showORP !== undefined) {
        setShowErrors(settings.showORP) // Reuse showORP slot for showErrors
      }
      if (settings.usePunctuation !== undefined) {
        setIncludePunctuation(settings.usePunctuation)
      }
      if (settings.useAnimation !== undefined) {
        setIncludeCapitalization(settings.useAnimation) // Reuse useAnimation slot for includeCapitalization
      }
    }
    setSettingsLoaded(true)
  }, [])

  // Save settings when they change
  useEffect(() => {
    saveSettings({
      wpm: 0, // Not used in typing mode
      fontSize,
      showORP: showErrors,
      usePunctuation: includePunctuation,
      useAnimation: includeCapitalization,
      showProgress: true, // Always show progress in typing mode
    })
  }, [fontSize, showErrors, includePunctuation, includeCapitalization])

  // Calculate stats whenever typedText changes
  useEffect(() => {
    if (typedText.length === 0) return

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

  const handleTextSubmit = useCallback((newText: string) => {
    setText(newText)
    setTypedText("")
    setStartTime(null)
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
    })
    // Focus input after loading new text
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleRestart = () => {
    setTypedText("")
    setStartTime(null)
    setIsTyping(false)
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
    })
  }

  const handleStop = () => {
    setIsTyping(false)
    inputRef.current?.blur()
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Don't allow typing beyond the text length
    if (value.length > displayText.length) return

    setTypedText(value)
  }

  const isFinished = typedText.length === displayText.length && displayText.length > 0

  // Handle Esc key to stop typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop typing on Esc
      if (e.key === 'Escape' && isTyping) {
        e.preventDefault()
        handleStop()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTyping])

  // Measure container width on mount and resize
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }

      // Measure actual character width from rendered text if available
      if (textDisplayRef.current && settingsLoaded) {
        const spans = textDisplayRef.current.querySelectorAll('span')
        if (spans.length > 0) {
          let maxWidth = 0
          spans.forEach(span => {
            const rect = span.getBoundingClientRect()
            maxWidth = Math.max(maxWidth, rect.width)
          })
          if (maxWidth > 0) {
            setCharWidth(Math.ceil(maxWidth))
            setCharWidthMeasured(true)
          }
        }
      }
    }

    measure()
    window.addEventListener('resize', measure)
    // Also measure after a short delay to ensure DOM is ready
    setTimeout(measure, 100)
    return () => window.removeEventListener('resize', measure)
  }, [fontSize, isTyping, settingsLoaded])

  // Calculate how many characters fit per line using measured character width
  const charsPerLine = Math.floor(containerWidth / charWidth)

  // Break text into lines
  const lines: string[] = []
  const words = displayText.split(/\s+/)
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length <= charsPerLine) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  // Find which line we're currently typing on
  let charsSoFar = 0
  let currentTypingLine = 0

  for (let i = 0; i < lines.length; i++) {
    const nextChars = charsSoFar + lines[i].length
    const includeSpace = i < lines.length - 1 ? 1 : 0

    if (typedText.length <= nextChars) {
      currentTypingLine = i
      break
    }

    charsSoFar = nextChars + includeSpace
  }

  // After finishing line at index 1, scroll to show lines 1, 2, 3
  // Typing index 0: show lines 0, 1, 2 (scrollLine = 0)
  // Typing index 1: show lines 0, 1, 2 (scrollLine = 0)
  // Typing index 2: show lines 1, 2, 3 (scrollLine = 1) <- finished index 1, scroll now
  // Typing index 3: show lines 2, 3, 4 (scrollLine = 2) <- finished index 2, scroll again
  const scrollLine = currentTypingLine >= 2 ? currentTypingLine - 1 : 0


  // Show ALL lines and use transform to scroll
  const visibleText = lines.join('\n')
  // No offset needed - we're showing all lines and scrolling via transform
  const offset = 0

  // Render text with character-by-character highlighting
  const renderText = () => {
    // Track position in displayText (original text without our added newlines)
    let displayTextIndex = offset

    const textElements = visibleText.split('').map((char, idx) => {
      // If this is a newline we added, it corresponds to a space in displayText
      const isNewline = char === '\n'
      const actualChar = isNewline ? ' ' : char

      let className = "transition-all duration-150"

      if (displayTextIndex < typedText.length) {
        // Already typed - compare against actual character in displayText
        if (typedText[displayTextIndex] === displayText[displayTextIndex]) {
          className += " text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
        } else {
          className += " text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
        }
      } else if (displayTextIndex === typedText.length) {
        // Current character - pulse animation
        className += " bg-primary/20 border-b-2 border-primary animate-pulse"
      } else {
        // Not yet typed
        className += " text-muted-foreground"
      }

      const isSpace = actualChar === ' '
      const result = (
        <span key={`${displayTextIndex}-${idx}`} className={className}>
          {isNewline ? <br /> : isSpace ? '\u00A0' : char}
        </span>
      )

      displayTextIndex++
      return result
    })

    // Add FINISHED indicator when typing is complete
    if (isFinished) {
      textElements.push(
        <span key="finished" className="ml-4 text-green-600 dark:text-green-400 font-bold">
          {' '}FINISHED
        </span>
      )
    }

    return textElements
  }

  return (
    <div className="h-dvh flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 right-0 p-4 flex gap-2 z-10">
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
                Customize your typing experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={16}
                  max={48}
                  step={2}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="errors" className="cursor-pointer">
                  Highlight Errors
                </Label>
                <Switch
                  id="errors"
                  checked={showErrors}
                  onCheckedChange={setShowErrors}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="punctuation" className="cursor-pointer">
                  Include All Punctuation
                </Label>
                <Switch
                  id="punctuation"
                  checked={includePunctuation}
                  onCheckedChange={setIncludePunctuation}
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-4">
                When off, removes symbols like apostrophes and quotes (keeps periods and commas)
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="capitalization" className="cursor-pointer">
                  Include Capitalization
                </Label>
                <Switch
                  id="capitalization"
                  checked={includeCapitalization}
                  onCheckedChange={setIncludeCapitalization}
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-4">
                When off, converts all text to lowercase
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="cursor-pointer">
                  Sound Effects
                </Label>
                <Switch
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
        <div ref={containerRef} className="w-full max-w-4xl">
          {settingsLoaded && (
            <>
              {/* Word counter and stats - above text */}
              <div className="flex items-center justify-between mt-6 mb-8">
                <div className="font-mono text-primary" style={{ fontSize: `${fontSize}px` }}>
                  {typedText.length}/{displayText.length}
                </div>
                {isFinished && (
                  <div className="flex gap-4 font-mono" style={{ fontSize: `${fontSize}px` }}>
                    <div>
                      <span className="text-muted-foreground">WPM: </span>
                      <span className="font-semibold">{stats.wpm}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy: </span>
                      <span className="font-semibold">{stats.accuracy.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors: </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Text display - MonkeyType style with scrolling */}
              <div
                className="relative overflow-hidden"
                style={{
                  height: `${fontSize * 1.8 * 3}px`, // 3 lines visible
                }}
                onClick={() => inputRef.current?.focus()}
              >
                <div
                  ref={textDisplayRef}
                  className={`font-mono transition-all duration-300 ease-out whitespace-nowrap ${
                    isTyping ? 'cursor-text opacity-100' : 'opacity-70'
                  }`}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${fontSize * 1.8}px`,
                    transform: `translateY(-${scrollLine * (fontSize * 1.8)}px)`,
                    opacity: charWidthMeasured ? undefined : 0
                  }}
                >
                  {renderText()}
                </div>
              </div>
            </>
          )}

          {/* Controls - below text */}
          <div className="flex justify-center gap-3 mt-8">
            <Button
              onClick={handleRestart}
              variant="ghost"
              size="lg"
              disabled={typedText.length === 0}
              className="size-14"
            >
              <RotateCcw className="size-6" />
              <span className="sr-only">Restart</span>
            </Button>
            <TextInputDialog onTextSubmit={handleTextSubmit} />
          </div>

          {/* Hidden input - captures actual typing */}
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleTyping}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            className="sr-only"
            autoFocus
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  )
}
