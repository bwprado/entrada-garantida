import type { Doc } from '@/convex/_generated/dataModel'

type Profile = Doc<'beneficiaryProfiles'>

const SEXO: Record<Profile['sexo'], string> = {
  feminino: 'Feminino',
  masculino: 'Masculino',
  nao_informado: 'Não Informado'
}

const TIPO_RENDA: Record<Profile['tipoRenda'], string> = {
  clt: 'CLT',
  autonomo: 'Autônomo',
  servidor_publico: 'Servidor público',
  aposentado: 'Aposentado',
  bpc: 'BPC',
  outros: 'Outros',
  nao_informado: 'Não Informado'
}

const FAIXA_RENDA: Record<Profile['rendaFamiliarFaixa'], string> = {
  ate_2: 'Até 2 salários mínimos',
  '2_4': '2 a 4 salários mínimos',
  '4_6': '4 a 6 salários mínimos',
  '6_8': '6 a 8 salários mínimos',
  acima_8: 'Acima de 8 salários mínimos'
}

/** Convex slug → texto legível no admin / relatórios. */
export function beneficiarySexoLabelPt(sexo: Profile['sexo']): string {
  return SEXO[sexo] ?? String(sexo)
}

export function beneficiaryTipoRendaLabelPt(tipo: Profile['tipoRenda']): string {
  return TIPO_RENDA[tipo] ?? String(tipo)
}

export function beneficiaryFaixaRendaLabelPt(
  faixa: Profile['rendaFamiliarFaixa']
): string {
  return FAIXA_RENDA[faixa] ?? String(faixa)
}
