"use client"

import { useState, useRef, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { InfoDialog } from "@/components/info-dialog"
import { TextInputDialog } from "@/components/text-input-dialog"
import { TypingSettings } from "@/components/typing-settings"
import { TextRenderer } from "@/components/text-renderer"
import { useTypingStats } from "@/hooks/use-typing-stats"
import { useTextProcessing } from "@/hooks/use-text-processing"
import { loadSettings, saveSettings } from "@/lib/storage"
import { DEFAULT_TEXT, LINE_HEIGHT_RATIO } from "@/lib/constants"

const DEFAULT_SETTINGS = {
  fontSize: 24,
  includePeriods: true,
  includePunctuation: true,
  includeCapitalization: true,
}

export function TypingReader() {
  const [settings, setSettings] = useState(() => loadSettings() ?? DEFAULT_SETTINGS)
  const {
    fontSize,
    includePeriods,
    includePunctuation,
    includeCapitalization,
  } = settings
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Text state
  const [text, setText] = useState(DEFAULT_TEXT)
  const [typedText, setTypedText] = useState("")

  // Track displayText changes to reset typedText
  const [prevDisplayText, setPrevDisplayText] = useState<string | null>(null)

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Calculate line height based on explicit line-height ratio
  const lineHeight = fontSize * LINE_HEIGHT_RATIO

  // Process text based on settings
  const displayText = useTextProcessing(
    text,
    includePeriods,
    includePunctuation,
    includeCapitalization,
  )

  // Calculate stats
  const { stats, updateStats, reset: resetStats } = useTypingStats()
  const isFinished =
    typedText.length === displayText.length && displayText.length > 0

  // Container height: 3 lines while typing, 2 lines when finished
  const containerHeight = isFinished ? lineHeight * 2 : lineHeight * 3

  // Reset typed text when display text changes
  if (prevDisplayText !== null && prevDisplayText !== displayText) {
    setTypedText("")
    resetStats()
  }
  if (prevDisplayText !== displayText) {
    setPrevDisplayText(displayText)
  }

  // Save settings when they change
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Auto-focus textarea when clicking anywhere on the page
  useEffect(() => {
    const handleClick = () => {
      if (
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "BUTTON"
      ) {
        inputRef.current?.focus()
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const handleTextSubmit = (newText: string) => {
    setText(newText)
    setTypedText("")
    resetStats()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleRestart = () => {
    setTypedText("")
    resetStats()
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Only allow typing up to the length of the display text
    if (value.length <= displayText.length) {
      setTypedText(value)
      // Normalize non-breaking spaces (Safari) for comparison only
      updateStats(value.replace(/\u00A0/g, " "), displayText)
    }
  }

  return (
    <div
      className="h-dvh flex flex-col relative overflow-hidden"
    >
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
        <InfoDialog onClose={() => inputRef.current?.focus()} />
        <TypingSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          fontSize={fontSize}
          onFontSizeChange={(v) => setSettings((s) => ({ ...s, fontSize: v }))}
          includePeriods={includePeriods}
          onIncludePeriodsChange={(v) =>
            setSettings((s) => ({ ...s, includePeriods: v }))
          }
          includePunctuation={includePunctuation}
          onIncludePunctuationChange={(v) =>
            setSettings((s) => ({ ...s, includePunctuation: v }))
          }
          includeCapitalization={includeCapitalization}
          onIncludeCapitalizationChange={(v) =>
            setSettings((s) => ({ ...s, includeCapitalization: v }))
          }
          onClose={() => inputRef.current?.focus()}
        />
        <ThemeToggle onToggle={() => inputRef.current?.focus()} />
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center p-8 pt-20 sm:pt-24 md:pt-32 lg:pt-40">
        <div className="w-full max-w-4xl">
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
              height: `${containerHeight}px`,
            }}
            onClick={() => inputRef.current?.focus()}
          >
            <TextRenderer
              typedText={typedText.replace(/\u00A0/g, " ")}
              displayText={displayText}
              isFinished={isFinished}
              fontSize={fontSize}
              lineHeight={lineHeight}
            />
          </div>

          {/* Performance stats (only when finished) */}
          {isFinished && (
            <div
              className="font-mono animate-in fade-in slide-in-from-top-4 duration-300 mt-8"
              style={{ fontSize: `${fontSize}px` }}
            >
              <span className="inline-block whitespace-nowrap">
                <span className="text-muted-foreground">WPM: </span>
                <span className="font-semibold">{stats.wpm}</span>
              </span>{" "}
              <span className="inline-block whitespace-nowrap">
                <span className="text-muted-foreground">Accuracy: </span>
                <span className="font-semibold">
                  {stats.accuracy.toFixed(1)}%
                </span>
              </span>{" "}
              <span className="inline-block whitespace-nowrap">
                <span className="text-muted-foreground">Errors: </span>
                <span className="font-semibold text-destructive">
                  {stats.errors}
                </span>
              </span>
            </div>
          )}

          {/* Hidden input */}
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleTyping}
            className="sr-only"
            aria-label="Type the displayed text"
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
