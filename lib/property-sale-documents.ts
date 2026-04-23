/** Per-property sale / validation documents (must stay in sync with Convex). */
export const PROPERTY_SALE_DOCUMENT_TIPOS = [
  'matricula',
  'iptu',
  'certidao_tributos',
  'certidao_indisponibilidade',
  'certidao_condominio'
] as const

export type PropertySaleDocumentTipo =
  (typeof PROPERTY_SALE_DOCUMENT_TIPOS)[number]

export const PROPERTY_SALE_DOCUMENT_ITEMS: {
  tipo: PropertySaleDocumentTipo
  title: string
  description: string
}[] = [
  {
    tipo: 'matricula',
    title: 'Certidão de matrícula',
    description:
      'Arquivo da matrícula atualizada (não confunda com o número informado na etapa anterior).'
  },
  {
    tipo: 'iptu',
    title: 'Certidão negativa de IPTU',
    description: 'Certidão atualizada.'
  },
  {
    tipo: 'certidao_tributos',
    title: 'Certidão de tributos',
    description: 'Certidão de débitos tributários municipal/estadual conforme exigência do programa.'
  },
  {
    tipo: 'certidao_indisponibilidade',
    title: 'Certidão de indisponibilidade',
    description: 'Certidão de indisponibilidade de bens ou equivalente exigida pelo programa.'
  },
  {
    tipo: 'certidao_condominio',
    title: 'Certidão do condomínio',
    description:
      'Quando aplicável: certidão de quitação ou situação regular com o condomínio.'
  }
]

const SHORT_LABEL: Record<PropertySaleDocumentTipo, string> = {
  matricula: 'certidão de matrícula',
  iptu: 'IPTU',
  certidao_tributos: 'certidão de tributos',
  certidao_indisponibilidade: 'certidão de indisponibilidade',
  certidao_condominio: 'certidão do condomínio'
}

export function propertySaleDocShortLabel(tipo: PropertySaleDocumentTipo): string {
  return SHORT_LABEL[tipo]
}
