import { memo, useMemo, useRef, useEffect, useState, useCallback } from 'react'

interface TextRendererProps {
  typedText: string
  displayText: string
  isFinished: boolean
  fontSize: number
  lineHeight: number
}

export const TextRenderer = memo(function TextRenderer({
  typedText,
  displayText,
  isFinished,
  fontSize,
  lineHeight,
}: TextRendererProps) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset scroll when text changes or when starting over
  useEffect(() => {
    if (typedText.length === 0) {
      setScrollOffset(0)
    }
  }, [typedText.length])

  // Reset scroll when font size/line height changes
  useEffect(() => {
    setScrollOffset(0)
  }, [lineHeight])

  // Clear refs array when displayText changes
  useEffect(() => {
    charRefs.current = []
  }, [displayText])

  // Function to update scroll based on a character index
  const updateScroll = useCallback((charIndex: number) => {
    const charRef = charRefs.current[charIndex]
    if (charRef) {
      const offsetTop = charRef.offsetTop

      // Determine which line the character is on using measured line height
      const currentLine = Math.floor(offsetTop / lineHeight)

      // Only scroll if we're on line 2 or beyond (0-indexed, so third line+)
      // Keep lines 0 and 1 visible without scrolling
      if (currentLine >= 2) {
        // Keep current char on visual line 1 (middle of 3-line view)
        const targetVisualY = lineHeight
        const offset = offsetTop - targetVisualY
        setScrollOffset(Math.max(0, offset))
      } else {
        setScrollOffset(0)
      }
    }
  }, [lineHeight])

  const renderedText = useMemo(() => {
    const elements: React.JSX.Element[] = []
    let charIndex = 0

    // Split by spaces to preserve word boundaries
    const parts = displayText.split(' ')

    parts.forEach((word, wordIdx) => {
      // Create a word wrapper that won't break
      const wordChars: React.JSX.Element[] = []

      for (let i = 0; i < word.length; i++) {
        const char = word[i]
        let className = "transition-all duration-150"

        if (charIndex < typedText.length) {
          // Already typed
          if (typedText[charIndex] === displayText[charIndex]) {
            className += " text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
          } else {
            className += " text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
          }
        } else if (charIndex === typedText.length) {
          // Current character
          className += " bg-primary/20 border-b-2 border-primary animate-pulse"
        } else {
          // Not yet typed
          className += " text-muted-foreground"
        }

        const currentIndex = charIndex
        wordChars.push(
          <span
            key={currentIndex}
            ref={el => {
              charRefs.current[currentIndex] = el
              // When the next character to type gets its ref set, update scroll
              if (el && currentIndex === typedText.length) {
                // Use RAF to ensure layout is complete
                requestAnimationFrame(() => updateScroll(currentIndex))
              }
            }}
            className={className}
          >
            {char}
          </span>
        )
        charIndex++
      }

      // Wrap word in a span that stays together
      elements.push(
        <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
          {wordChars}
        </span>
      )

      // Add space after word (except last word)
      if (wordIdx < parts.length - 1) {
        let spaceClassName = "transition-all duration-150"

        if (charIndex < typedText.length) {
          if (typedText[charIndex] === ' ') {
            spaceClassName += " text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
          } else {
            spaceClassName += " text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
          }
        } else if (charIndex === typedText.length) {
          spaceClassName += " bg-primary/20 border-b-2 border-primary animate-pulse"
        } else {
          spaceClassName += " text-muted-foreground"
        }

        elements.push(
          <span
            key={`space-${wordIdx}`}
            ref={el => {
              charRefs.current[charIndex] = el
            }}
            className={spaceClassName}
          >
            {'\u00A0'}
          </span>
        )
        charIndex++
      }
    })

    // Add FINISHED indicator when typing is complete
    if (isFinished) {
      elements.push(
        <span
          key="finished"
          className="ml-4 text-green-600 dark:text-green-400 font-bold animate-in fade-in zoom-in-50 duration-300"
        >
          FINISHED
        </span>
      )
    }

    return elements
  }, [typedText, displayText, isFinished, updateScroll])

  return (
    <div
      ref={containerRef}
      className="font-mono transition-all duration-300 ease-out opacity-70"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 'normal',
        transform: `translateY(-${scrollOffset}px)`,
        willChange: 'transform',
        wordWrap: 'break-word',
        whiteSpace: 'normal',
      }}
    >
      {renderedText}
    </div>
  )
})
