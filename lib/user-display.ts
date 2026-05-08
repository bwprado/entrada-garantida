/** Display initials from a person name, phone string, or fallback. */
export function getInitials(value: string): string {
  const normalized = value.trim()
  if (!normalized) return 'AA'

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }

  const letters = normalized.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (letters.length >= 2) {
    return letters.slice(0, 2).toUpperCase()
  }

  const digits = normalized.replace(/\D/g, '')
  if (digits.length >= 2) {
    return digits.slice(-2)
  }

  return normalized.slice(0, 2).toUpperCase()
}
