export function useTextProcessing(
  text: string,
  includePeriods: boolean,
  includePunctuation: boolean,
  includeCapitalization: boolean
) {
  let processed = text

  if (!includePunctuation) {
    processed = processed.replace(/[^\w\s.]/g, '')
  }

  if (!includePeriods) {
    processed = processed.replace(/\./g, '')
  }

  if (!includeCapitalization) {
    processed = processed.toLowerCase()
  }

  // Remove leading spaces after newlines AND remove newlines entirely for typing
  processed = processed.replace(/\n +/g, ' ').replace(/\n/g, ' ')

  // Collapse multiple spaces (can occur after punctuation removal)
  processed = processed.replace(/ {2,}/g, ' ')

  return processed
}
