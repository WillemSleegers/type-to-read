"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { TextInputDialog } from "@/components/text-input-dialog"
import { TypingSettings } from "@/components/typing-settings"
import { TextRenderer } from "@/components/text-renderer"
import { useTypingStats } from "@/hooks/use-typing-stats"
import { useTextProcessing } from "@/hooks/use-text-processing"
import { loadSettings, saveSettings } from "@/lib/storage"
import { DEFAULT_TEXT } from "@/lib/constants"

export function TypingReader() {
  // Settings
  const [fontSize, setFontSize] = useState(24)
  const [includePeriods, setIncludePeriods] = useState(true)
  const [includePunctuation, setIncludePunctuation] = useState(true)
  const [includeCapitalization, setIncludeCapitalization] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Text state
  const [text, setText] = useState(DEFAULT_TEXT)
  const [typedText, setTypedText] = useState("")

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const measurementRef = useRef<HTMLSpanElement>(null)
  const initializedRef = useRef(false)

  // Measure actual line height
  const [lineHeight, setLineHeight] = useState(fontSize * 1.8) // fallback

  useEffect(() => {
    if (measurementRef.current) {
      const height = measurementRef.current.offsetHeight
      setLineHeight(height)
    }
  }, [fontSize])

  // Process text based on settings
  const displayText = useTextProcessing(text, includePeriods, includePunctuation, includeCapitalization)

  // Calculate stats
  const { stats, reset: resetStats } = useTypingStats(typedText, displayText)
  const isFinished = typedText.length === displayText.length && displayText.length > 0

  // Container height for 3 lines using measured line height
  const containerHeight = lineHeight * 3

  // Load settings on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const settings = loadSettings()
    if (settings) {
      setFontSize(settings.fontSize)
      setIncludePeriods(settings.includePeriods ?? true)
      setIncludePunctuation(settings.includePunctuation)
      setIncludeCapitalization(settings.includeCapitalization)
    }
    setSettingsLoaded(true)
  }, [])

  // Save settings when they change
  useEffect(() => {
    if (!settingsLoaded) return
    saveSettings({
      fontSize,
      includePeriods,
      includePunctuation,
      includeCapitalization,
    })
  }, [fontSize, includePeriods, includePunctuation, includeCapitalization, settingsLoaded])

  // Reset typed text when display text changes
  useEffect(() => {
    setTypedText("")
    resetStats()
  }, [displayText, resetStats])

  // Auto-focus textarea when clicking anywhere on the page
  useEffect(() => {
    const handleClick = () => {
      if (document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA' &&
          document.activeElement?.tagName !== 'BUTTON') {
        inputRef.current?.focus()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleTextSubmit = useCallback((newText: string) => {
    setText(newText)
    setTypedText("")
    resetStats()
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [resetStats])

  const handleRestart = useCallback(() => {
    setTypedText("")
    resetStats()
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [resetStats])

  const handleTyping = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Only allow typing up to the length of the display text
    if (value.length <= displayText.length) {
      setTypedText(value)
    }
  }, [displayText.length])

  return (
    <div className="h-dvh flex flex-col relative overflow-hidden">
      {/* Top left - Load text */}
      <div className="fixed top-0 left-0 p-4 z-10">
        <TextInputDialog
          onTextSubmit={handleTextSubmit}
          textButton
          onClose={() => inputRef.current?.focus()}
        />
      </div>

      {/* Top right - Settings and Theme */}
      <div className="fixed top-0 right-0 p-4 flex gap-2 z-10">
        <TypingSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          includePeriods={includePeriods}
          onIncludePeriodsChange={setIncludePeriods}
          includePunctuation={includePunctuation}
          onIncludePunctuationChange={setIncludePunctuation}
          includeCapitalization={includeCapitalization}
          onIncludeCapitalizationChange={setIncludeCapitalization}
          onClose={() => inputRef.current?.focus()}
        />
        <ThemeToggle onToggle={() => inputRef.current?.focus()} />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center p-8 pt-32">
        <div className="w-full max-w-4xl">
          {settingsLoaded && (
            <>
              {/* Character count */}
              <div className="mt-6 mb-8">
                <div
                  className="font-mono text-primary transition-all duration-200"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {typedText.length}/{displayText.length}
                </div>
              </div>

              {/* Hidden measurement element */}
              <span
                ref={measurementRef}
                className="font-mono absolute opacity-0 pointer-events-none"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: 'normal',
                }}
                aria-hidden="true"
              >
                M
              </span>

              {/* Text display */}
              <div
                className="relative overflow-hidden"
                style={{
                  height: `${containerHeight}px`, // 3 lines visible
                }}
                onClick={() => inputRef.current?.focus()}
              >
                <TextRenderer
                  typedText={typedText}
                  displayText={displayText}
                  isFinished={isFinished}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                />
              </div>

            </>
          )}

          {/* Restart button */}
          <div className="flex justify-center mt-8">
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
          </div>

          {/* Performance stats (only when finished) */}
          {isFinished && (
            <div
              className="flex flex-col items-center gap-2 font-mono animate-in fade-in slide-in-from-top-4 duration-300 mt-8"
              style={{ fontSize: `${fontSize}px` }}
            >
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

          {/* Hidden input */}
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleTyping}
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
