"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { TextInputDialog } from "@/components/text-input-dialog"
import { TypingSettings } from "@/components/typing-settings"
import { TypingStatsDisplay } from "@/components/typing-stats-display"
import { TextRenderer } from "@/components/text-renderer"
import { useTypingStats } from "@/hooks/use-typing-stats"
import { useTextProcessing } from "@/hooks/use-text-processing"
import { loadSettings, saveSettings } from "@/lib/storage"
import { DEFAULT_TEXT } from "@/lib/constants"

export function TypingReader() {
  // Settings
  const [fontSize, setFontSize] = useState(24)
  const [includePunctuation, setIncludePunctuation] = useState(true)
  const [includeCapitalization, setIncludeCapitalization] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Text state
  const [text, setText] = useState(DEFAULT_TEXT)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

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
  const displayText = useTextProcessing(text, includePunctuation, includeCapitalization)

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
      includePunctuation,
      includeCapitalization,
    })
  }, [fontSize, includePunctuation, includeCapitalization, settingsLoaded])

  // Reset typed text when display text changes
  useEffect(() => {
    setTypedText("")
    resetStats()
  }, [displayText, resetStats])

  // Handle Esc key to stop typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTyping) {
        e.preventDefault()
        setIsTyping(false)
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTyping])

  const handleTextSubmit = useCallback((newText: string) => {
    setText(newText)
    setTypedText("")
    resetStats()
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [resetStats])

  const handleRestart = useCallback(() => {
    setTypedText("")
    setIsTyping(false)
    resetStats()
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
      {/* Header */}
      <div className="fixed top-0 right-0 p-4 flex gap-2 z-10">
        <TypingSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          includePunctuation={includePunctuation}
          onIncludePunctuationChange={setIncludePunctuation}
          includeCapitalization={includeCapitalization}
          onIncludeCapitalizationChange={setIncludeCapitalization}
        />
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 pt-20">
        <div className="w-full max-w-4xl">
          {settingsLoaded && (
            <>
              {/* Stats display */}
              <TypingStatsDisplay
                typedLength={typedText.length}
                totalLength={displayText.length}
                isFinished={isFinished}
                stats={stats}
                fontSize={fontSize}
              />

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
                  isTyping={isTyping}
                />
              </div>
            </>
          )}

          {/* Controls */}
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

          {/* Hidden input */}
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
