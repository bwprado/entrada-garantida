/**
 * Parse birth date typed as DD/MM/AAAA or DD-MM-AAAA (day first) to ISO YYYY-MM-DD.
 */
export function parseDataNascimentoBrParaIso(value: string): string | null {
  const m = value.trim().match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/)
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

/** ISO YYYY-MM-DD → display DD/MM/AAAA for forms and masks. */
export function formatIsoDateToDataNascimentoBr(iso: string): string {
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ""
  return `${m[3]}/${m[2]}/${m[1]}`
}
