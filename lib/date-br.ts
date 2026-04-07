/**
 * Parse birth date typed as DD-MM-YYYY (Brazilian day-first order) to ISO YYYY-MM-DD.
 */
export function parseDataNascimentoBrParaIso(value: string): string | null {
  const m = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const d = new Date(year, month - 1, day)
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null
  }
  const yMax = new Date().getFullYear()
  if (year < 1900 || year > yMax) return null
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}
