import { v } from 'convex/values'

import {
  PROPERTY_SALE_DOCUMENT_TIPOS,
  type PropertySaleDocumentTipo,
  propertySaleDocShortLabel
} from '../lib/property-sale-documents'

export { PROPERTY_SALE_DOCUMENT_TIPOS, type PropertySaleDocumentTipo }

/** Convex args validator for property-scoped sale document tipo. */
export const propertySaleDocumentTipo = v.union(
  v.literal('matricula'),
  v.literal('iptu'),
  v.literal('certidao_tributos'),
  v.literal('certidao_indisponibilidade'),
  v.literal('certidao_condominio')
)

export function isPropertySaleDocumentTipo(
  t: string
): t is PropertySaleDocumentTipo {
  return (PROPERTY_SALE_DOCUMENT_TIPOS as readonly string[]).includes(t)
}

export function missingSaleDocumentMessage(missing: PropertySaleDocumentTipo[]) {
  if (missing.length === 0) return ''
  const parts = missing.map((t) => propertySaleDocShortLabel(t))
  return `Envie os documentos obrigatórios do imóvel: ${parts.join(', ')}.`
}
