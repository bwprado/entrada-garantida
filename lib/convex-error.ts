const CONVEX_PREFIX = /^Uncaught ConvexError:\s*/i
const REQUEST_ID_PREFIX = /^\[Request ID:[^\]]+\]\s*/i
const GENERIC_SERVER_ERROR = /^Server Error$/i
const DEFAULT_AUTH_ERROR =
  'Não foi possível concluir o login. Verifique os dados e tente novamente.'

function cleanMessage(raw: string): string {
  let cleaned = raw.trim()

  while (CONVEX_PREFIX.test(cleaned)) {
    cleaned = cleaned.replace(CONVEX_PREFIX, '').trim()
  }

  while (REQUEST_ID_PREFIX.test(cleaned)) {
    cleaned = cleaned.replace(REQUEST_ID_PREFIX, '').trim()
  }

  return cleaned
}

function collectCandidates(error: unknown): string[] {
  const candidates: string[] = []
  const visited = new Set<unknown>()

  const visit = (value: unknown) => {
    if (value === null || value === undefined || visited.has(value)) return
    visited.add(value)

    if (typeof value === 'string') {
      candidates.push(value)
      return
    }

    if (value instanceof Error) {
      candidates.push(value.message)
      visit((value as Error & { cause?: unknown }).cause)
      return
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      visit(record.message)
      visit(record.shortMessage)
      visit(record.data)
      visit(record.details)
      visit(record.cause)
    }
  }

  visit(error)
  return candidates
}

export function getUserErrorMessage(error: unknown): string {
  const candidates = collectCandidates(error)
    .map((candidate) => cleanMessage(candidate))
    .filter(Boolean)

  const specificMessage = candidates.find(
    (candidate) => !GENERIC_SERVER_ERROR.test(candidate)
  )

  if (specificMessage) return specificMessage
  if (candidates.length > 0) return DEFAULT_AUTH_ERROR
  return 'Erro inesperado'
}
