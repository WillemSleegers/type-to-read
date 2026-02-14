"use client"

import { useRef, useEffect, useState } from 'react'

interface TextRendererProps {
  typedText: string
  displayText: string
  isFinished: boolean
  fontSize: number
  lineHeight: number
}

export function TextRenderer({
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

  // When finished, scroll to show last 2 lines
  useEffect(() => {
    if (isFinished && containerRef.current) {
      const totalHeight = containerRef.current.scrollHeight
      const linesToShow = 2
      const targetOffset = Math.max(0, totalHeight - (lineHeight * linesToShow))
      setScrollOffset(targetOffset)
    }
  }, [isFinished, lineHeight])

  // Recalculate scroll on window resize to handle text reflow
  useEffect(() => {
    const handleResize = () => {
      if (isFinished && containerRef.current) {
        const totalHeight = containerRef.current.scrollHeight
        const linesToShow = 2
        const targetOffset = Math.max(0, totalHeight - (lineHeight * linesToShow))
        setScrollOffset(targetOffset)
      } else if (!isFinished && typedText.length > 0) {
        const currentCharIndex = typedText.length
        const charRef = charRefs.current[currentCharIndex]
        if (charRef) {
          const offsetTop = charRef.offsetTop
          const currentLine = Math.floor(offsetTop / lineHeight)

          if (currentLine >= 2) {
            const targetVisualY = lineHeight
            const offset = offsetTop - targetVisualY
            setScrollOffset(Math.max(0, offset))
          } else {
            setScrollOffset(0)
          }
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isFinished, lineHeight, typedText.length])

  // Reset scroll when font size/line height changes
  useEffect(() => {
    setScrollOffset(0)
  }, [lineHeight])

  // Clear refs array when displayText changes
  useEffect(() => {
    charRefs.current = []
  }, [displayText])

  // Function to update scroll based on a character index
  const updateScroll = (charIndex: number) => {
    if (isFinished) return

    const charRef = charRefs.current[charIndex]
    if (charRef) {
      const offsetTop = charRef.offsetTop
      const currentLine = Math.floor(offsetTop / lineHeight)

      if (currentLine >= 2) {
        const targetVisualY = lineHeight
        const offset = offsetTop - targetVisualY
        setScrollOffset(Math.max(0, offset))
      } else {
        setScrollOffset(0)
      }
    }
  }

  const elements: React.JSX.Element[] = []
  let charIndex = 0

  const parts = displayText.split(' ')

  parts.forEach((word, wordIdx) => {
    const wordChars: React.JSX.Element[] = []

    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      let className = "transition-all duration-150"

      if (charIndex < typedText.length) {
        if (typedText[charIndex] === displayText[charIndex]) {
          className += " text-success bg-success-bg"
        } else {
          className += " text-destructive bg-destructive-bg"
        }
      } else if (charIndex === typedText.length) {
        className += " bg-primary/20 border-b-2 border-primary animate-pulse"
      } else {
        className += " text-muted-foreground"
      }

      const currentIndex = charIndex
      wordChars.push(
        <span
          key={currentIndex}
          ref={el => {
            charRefs.current[currentIndex] = el
            if (el && currentIndex === typedText.length) {
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

    elements.push(
      <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
        {wordChars}
      </span>
    )

    if (wordIdx < parts.length - 1) {
      let spaceClassName = "transition-all duration-150"

      if (charIndex < typedText.length) {
        if (typedText[charIndex] === ' ') {
          spaceClassName += " text-success bg-success-bg"
        } else {
          spaceClassName += " text-destructive bg-destructive-bg"
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

  if (isFinished) {
    elements.push(
      <span
        key="finished"
        className="ml-4 text-success font-bold animate-in fade-in zoom-in-50 duration-300"
      >
        FINISHED
      </span>
    )
  }

  return (
    <div
      ref={containerRef}
      className="font-mono transition-all duration-300 ease-out opacity-70"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: '1.5',
        transform: `translateY(-${scrollOffset}px)`,
        wordWrap: 'break-word',
        whiteSpace: 'normal',
      }}
    >
      {elements}
    </div>
  )
}
