import type { Doc } from '@/convex/_generated/dataModel'

type SelectionOutcome = NonNullable<Doc<'selectionsHistory'>['outcome']>

export function resolveSelectionOutcome(
  selection: Doc<'selectionsHistory'>
): SelectionOutcome {
  return selection.outcome
}

export function selectionOutcomeLabelPt(outcome: SelectionOutcome): string {
  switch (outcome) {
    case 'pending':
      return 'Pendente'
    case 'withdrawn':
      return 'Retirado pelo beneficiário'
    case 'rejected':
      return 'Rejeitado'
    case 'sold':
      return 'Vendido'
    default:
      return outcome
  }
}
