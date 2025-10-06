import { useMemo } from 'react'

export function useTextProcessing(
  text: string,
  includePunctuation: boolean,
  includeCapitalization: boolean
) {
  return useMemo(() => {
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

    return processed
  }, [text, includePunctuation, includeCapitalization])
}
