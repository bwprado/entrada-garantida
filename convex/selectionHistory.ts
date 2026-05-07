import type { Doc } from './_generated/dataModel'

/** Open interest line: pending and not closed yet. */
export function isSelectionActivePending(row: Doc<'selectionsHistory'>): boolean {
  return row.removidoEm === undefined && row.outcome === 'pending'
}
