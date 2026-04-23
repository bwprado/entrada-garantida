import type { Doc } from '@/convex/_generated/dataModel'

const LABELS: Record<Doc<'documents'>['tipo'], string> = {
  matricula: 'Certidão de matrícula',
  iptu: 'IPTU / certidão negativa de IPTU',
  certidao_tributos: 'Certidão de tributos',
  certidao_indisponibilidade: 'Certidão de indisponibilidade',
  certidao_condominio: 'Certidão do condomínio',
  rg: 'RG / identificação',
  comp_estado_civil: 'Comprovante de estado civil',
  comp_residencia: 'Comprovante de residência',
  habite_se: 'Habite-se',
  foto_imovel: 'Foto do imóvel',
  plantas: 'Plantas / croqui',
  outro: 'Outro documento'
}

export function documentTipoLabel(
  tipo: Doc<'documents'>['tipo']
): string {
  return LABELS[tipo] ?? tipo
}
