const CONVEX_PREFIX = /^Uncaught ConvexError:\s*/i

export function getUserErrorMessage(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : ''

  if (!raw) return 'Erro inesperado'

  let cleaned = raw.trim()

  while (CONVEX_PREFIX.test(cleaned)) {
    cleaned = cleaned.replace(CONVEX_PREFIX, '').trim()
  }

  return cleaned || 'Erro inesperado'
}
