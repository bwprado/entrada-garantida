/**
 * Parser for "ANEXO I" style listagens: tabular rows with CPF dotted format,
 * multi-line cells (name, address, second phone line).
 */

const CPF_IN_LINE = /\d{3}\.\d{3}\.\d{3}-\d{2}/
const PAGE_MARKER = /--\s*\d+\s+of\s+\d+\s*--/gi

export type AnexoIParsedRow = {
  linha: number
  cpf: string
  nome: string
  telefoneDigits: string
}

function cleanCPFDigits(s: string): string {
  return s.replace(/\D/g, '')
}

function lineHasCpf(line: string): boolean {
  return CPF_IN_LINE.test(line)
}

function pickBestPhoneDigits(raw: string): string {
  const chunks = raw.split(/\/\/+/).map((s) => s.trim()).filter(Boolean)
  const tryChunk = (chunk: string): string | null => {
    const withSpaces = chunk.replace(/\s+/g, ' ').trim()
    const candidates = withSpaces.match(/\d[\d\s\-/.]*\d|\d{10,}/g) ?? []
    for (const c of candidates) {
      const d = c.replace(/\D/g, '')
      if (d.length >= 10 && d.length <= 11) return d
      if (d.length === 12 && d.startsWith('55')) return d.slice(2, 13)
      if (d.length === 13 && d.startsWith('55')) return d.slice(2, 13)
    }
    return null
  }
  for (const ch of chunks) {
    const hit = tryChunk(ch)
    if (hit) return hit
  }
  for (const ch of chunks) {
    const d = ch.replace(/\D/g, '')
    if (d.length >= 9 && d.length <= 11) return d
  }
  const all = raw.replace(/\D/g, '')
  if (all.length >= 10) return all.slice(0, 11)
  return all
}

function looksLikePhoneFragment(s: string): boolean {
  const t = s.trim()
  if (!t) return false
  const firstTab = t.split(/\t+/)[0] ?? t
  const d = firstTab.replace(/\D/g, '')
  if (d.length < 4) return false
  const letters = firstTab.replace(/[\d\s\-/.]/g, '').length
  return letters <= 2
}

function collectTelefone(
  dataCells: string[],
  cpfIdx: number,
  suffixLines: string[]
): string {
  const parts: string[] = []
  const col = dataCells[cpfIdx + 2]?.trim() ?? ''
  if (col) parts.push(col)

  for (const sline of suffixLines) {
    const firstSeg = (sline.split(/\t+/)[0] ?? '').trim()
    if (!firstSeg) continue
    if (looksLikePhoneFragment(firstSeg)) parts.push(firstSeg)
    else break
  }

  return pickBestPhoneDigits(parts.join(' '))
}

function isShortOrdemCell(cell: string | undefined): boolean {
  const t = cell?.trim() ?? ''
  return /^\d{1,3}$/.test(t)
}

function parseNomeAndLinha(
  block: string[],
  dataLineIdx: number,
  dataCells: string[]
): { linha: number; nome: string } {
  const c0 = dataCells[0]?.trim() ?? ''
  const c1 = dataCells[1]?.trim() ?? ''

  if (dataLineIdx === 0 && isShortOrdemCell(c0)) {
    const orNum = parseInt(c0, 10)
    return { linha: Number.isFinite(orNum) ? orNum : 0, nome: c1 }
  }

  if (dataLineIdx > 0) {
    const prefix = block.slice(0, dataLineIdx)
    const firstTabs = prefix[0]?.split(/\t+/) ?? []
    const orNum = parseInt(firstTabs[0]?.trim() ?? '', 10)
    const linha = Number.isFinite(orNum) ? orNum : 0
    const nomeStart = (firstTabs.slice(1).join(' ') || '').trim()
    const restPrefix = prefix
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean)
    let nome = [nomeStart, ...restPrefix].filter(Boolean).join(' ').trim()
    if (isShortOrdemCell(c0)) {
      nome = [nome, c1].filter(Boolean).join(' ').trim()
    }
    return { linha, nome }
  }

  const orNum = parseInt(c0, 10)
  return {
    linha: Number.isFinite(orNum) ? orNum : 0,
    nome: c1
  }
}

function parseBlock(block: string[]): AnexoIParsedRow | null {
  const dataLineIdx = block.findIndex((l) => lineHasCpf(l))
  if (dataLineIdx < 0) return null

  const dataLine = block[dataLineIdx]
  const suffix = block.slice(dataLineIdx + 1)
  const cpfMatch = dataLine.match(CPF_IN_LINE)
  if (!cpfMatch) return null
  const cpf = cleanCPFDigits(cpfMatch[0])

  const dataCells = dataLine.split(/\t+/).filter((c) => c.length > 0)
  const cpfIdx = dataCells.findIndex((c) => CPF_IN_LINE.test(c))
  if (cpfIdx < 0) return null

  const { linha, nome } = parseNomeAndLinha(block, dataLineIdx, dataCells)
  const telefoneDigits = collectTelefone(dataCells, cpfIdx, suffix)

  return { linha, cpf, nome, telefoneDigits }
}

function findHeaderEndIndex(lines: string[]): number {
  const idx = lines.findIndex(
    (l) =>
      /BENEFICI[ÁA]RIO/i.test(l) &&
      /CPF/i.test(l) &&
      /TELEFONE/i.test(l)
  )
  return idx >= 0 ? idx : -1
}

/**
 * Parse plain text from ANEXO I–style PDF extraction into rows.
 * Returns empty array if the header signature is not found.
 */
export function parseAnexoIListagemPlainText(fullText: string): AnexoIParsedRow[] {
  const normalized = fullText.replace(PAGE_MARKER, '\n').replace(/\r\n/g, '\n')
  const lines = normalized
    .split(/\n/)
    .map((l) => l.replace(/\s+$/g, ''))
    .filter((l) => l.trim().length > 0)

  const headerEnd = findHeaderEndIndex(lines)
  const bodyStart = headerEnd >= 0 ? headerEnd + 1 : 0
  const bodyLines = lines.slice(bodyStart)

  const cpfLineIndices: number[] = []
  bodyLines.forEach((l, i) => {
    if (lineHasCpf(l)) cpfLineIndices.push(i)
  })

  if (cpfLineIndices.length === 0) return []

  const blocks: string[][] = []
  for (let k = 0; k < cpfLineIndices.length; k++) {
    const start = cpfLineIndices[k]
    const endExclusive =
      k + 1 < cpfLineIndices.length ? cpfLineIndices[k + 1] : bodyLines.length
    blocks.push(bodyLines.slice(start, endExclusive))
  }

  for (let k = 0; k < blocks.length - 1; k++) {
    if (blocks[k].length < 2) continue
    const cells = blocks[k][0].split(/\t+/).filter((c) => c.length > 0)
    const orCurr = parseInt(cells[0]?.trim() ?? '', 10) || 0
    const rest = blocks[k].slice(1)
    const m = rest[0]?.match(/^\s*(\d{1,3})\s*	/)
    if (!m) continue
    const n = parseInt(m[1], 10)
    if (!(n > orCurr && n < 1000)) continue
    blocks[k] = [blocks[k][0]]
    blocks[k + 1] = rest.concat(blocks[k + 1])
  }

  const rows: AnexoIParsedRow[] = []
  for (const block of blocks) {
    const parsed = parseBlock(block)
    if (parsed) rows.push(parsed)
  }

  return rows
}
