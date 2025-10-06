import { useMemo } from 'react'

export function useTextProcessing(
  text: string,
  includePeriods: boolean,
  includePunctuation: boolean,
  includeCapitalization: boolean
) {
  return useMemo(() => {
    let processed = text

    if (!includePunctuation) {
      // Remove all punctuation except periods (handled separately)
      processed = processed.replace(/[^\w\s.]/g, '')
    }

    if (!includePeriods) {
      // Remove periods
      processed = processed.replace(/\./g, '')
    }

    if (!includeCapitalization) {
      // Convert to lowercase
      processed = processed.toLowerCase()
    }

    // Remove leading spaces after newlines AND remove newlines entirely for typing
    // We'll break into our own lines based on width
    processed = processed.replace(/\n +/g, ' ').replace(/\n/g, ' ')

    return processed
  }, [text, includePeriods, includePunctuation, includeCapitalization])
}
