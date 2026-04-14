'use client'

type TextItem = { str: string; transform: number[] }

/** Extract reading-order plain text from a PDF (browser / client only). */
export async function extractPdfPlainText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const { getDocument, GlobalWorkerOptions, version } = pdfjs
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

  const doc = await getDocument({ data: new Uint8Array(data) }).promise
  const pageTexts: string[] = []

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    const items = content.items.filter(
      (it): it is TextItem =>
        typeof it === 'object' &&
        it !== null &&
        'str' in it &&
        typeof (it as TextItem).str === 'string' &&
        'transform' in it &&
        Array.isArray((it as TextItem).transform)
    ) as TextItem[]

    const withPos = items
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5]
      }))
      .filter((it) => it.str.trim().length > 0)

    const yTol = 4
    type LineCluster = { y: number; parts: { x: number; str: string }[] }
    const clusters: LineCluster[] = []

    for (const it of withPos) {
      let cluster = clusters.find((c) => Math.abs(c.y - it.y) < yTol)
      if (!cluster) {
        cluster = { y: it.y, parts: [] }
        clusters.push(cluster)
      }
      cluster.parts.push({ x: it.x, str: it.str })
    }

    clusters.sort((a, b) => b.y - a.y)
    const pageLines = clusters.map((c) =>
      c.parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join('\t')
    )
    pageTexts.push(pageLines.join('\n'))
  }

  return pageTexts.join('\n')
}
