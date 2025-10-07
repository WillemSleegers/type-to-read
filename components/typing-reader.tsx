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
  const initializedRef = useRef(false)

  // Calculate line height based on explicit line-height ratio
  const lineHeight = fontSize * 1.5

  // Process text based on settings
  const displayText = useTextProcessing(text, includePeriods, includePunctuation, includeCapitalization)

  // Calculate stats
  const { stats, reset: resetStats } = useTypingStats(typedText, displayText)
  const isFinished = typedText.length === displayText.length && displayText.length > 0

  // Container height: 3 lines while typing, 2 lines when finished
  const containerHeight = isFinished ? lineHeight * 2 : lineHeight * 3

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

      {/* Top right - Restart, Settings and Theme */}
      <div className="fixed top-0 right-0 p-4 flex gap-2 z-10">
        <Button
          onClick={handleRestart}
          variant="ghost"
          size="icon"
          disabled={typedText.length === 0}
        >
          <RotateCcw className="size-4" />
          <span className="sr-only">Restart</span>
        </Button>
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
      <div className="flex flex-col items-center p-8 pt-20 sm:pt-24 md:pt-32 lg:pt-40">
        <div className="w-full max-w-4xl">
          {settingsLoaded && (
            <>
              {/* Character count */}
              <div className="mb-8">
                <div
                  className="font-mono text-primary transition-all duration-200"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {typedText.length}/{displayText.length}
                </div>
              </div>

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

          {/* Performance stats (only when finished) */}
          {isFinished && (
            <div
              className="font-mono animate-in fade-in slide-in-from-top-4 duration-300 mt-8"
              style={{ fontSize: `${fontSize}px` }}
            >
              <span className="inline-block whitespace-nowrap">
                <span className="text-muted-foreground">WPM: </span>
                <span className="font-semibold">{stats.wpm}</span>
              </span>
              {' '}
              <span className="inline-block whitespace-nowrap">
                <span className="text-muted-foreground">Accuracy: </span>
                <span className="font-semibold">{stats.accuracy.toFixed(1)}%</span>
              </span>
              {' '}
              <span className="inline-block whitespace-nowrap">
                <span className="text-muted-foreground">Errors: </span>
                <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
              </span>
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
