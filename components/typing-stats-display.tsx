import { memo } from 'react'
import { TypingStats } from '@/hooks/use-typing-stats'

interface TypingStatsDisplayProps {
  typedLength: number
  totalLength: number
  isFinished: boolean
  stats: TypingStats
  fontSize: number
}

export const TypingStatsDisplay = memo(function TypingStatsDisplay({
  typedLength,
  totalLength,
  isFinished,
  stats,
  fontSize,
}: TypingStatsDisplayProps) {
  return (
    <>
      <div className="mt-6 mb-8">
        <div
          className="font-mono text-primary transition-all duration-200"
          style={{ fontSize: `${fontSize}px` }}
        >
          {typedLength}/{totalLength}
        </div>
      </div>
      {isFinished && (
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-mono animate-in fade-in slide-in-from-top-4 duration-300 mt-8"
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="whitespace-nowrap">
            <span className="text-muted-foreground">WPM: </span>
            <span className="font-semibold">{stats.wpm}</span>
          </div>
          <div className="whitespace-nowrap">
            <span className="text-muted-foreground">Accuracy: </span>
            <span className="font-semibold">{stats.accuracy.toFixed(1)}%</span>
          </div>
          <div className="whitespace-nowrap">
            <span className="text-muted-foreground">Errors: </span>
            <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
          </div>
        </div>
      )}
    </>
  )
})
