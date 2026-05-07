import type { GenericId } from 'convex/values'
import type { MutationCtx } from './_generated/server'

/** Ensures both beneficiary and ofertante profiles exist for a test user row. */
export async function ensureTestUserProfiles(
  ctx: MutationCtx,
  userId: GenericId<'users'>,
  now: number
): Promise<void> {
  const user = await ctx.db.get(userId)
  if (!user) return

  if (!user.beneficiaryProfileId) {
    const profileId = await ctx.db.insert('beneficiaryProfiles', {
      userId,
      rg: '',
      nomeMae: '',
      nomePai: '',
      sexo: 'nao_informado',
      identidadeGenero: 'nao_informado',
      raca: 'nao_informado',
      deficiencias: ['nao_possui'],
      profissao: '',
      tipoRenda: 'nao_informado',
      rendaFamiliarFaixa: 'ate_2',
      pessoasFamilia: 1,
      mesesAluguelSocial: 0,
      possuiIdosoFamilia: false,
      chefiaFeminina: false,
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      empreendimento: '',
      dddTelefoneFixo: '',
      telefoneFixo: '',
      dddTelefoneRecado: '',
      telefoneRecado: '',
      falarCom: '',
      aceitaComunicacoes: false,
      criadoEm: now,
      atualizadoEm: now
    })
    await ctx.db.patch(userId, { beneficiaryProfileId: profileId })
  }

  const refreshed = await ctx.db.get(userId)
  if (!refreshed?.ofertanteProfileId) {
    const profileId = await ctx.db.insert('ofertanteProfiles', {
      userId,
      rg: '',
      dataNascimento: '',
      estadoCivil: 'solteiro',
      profissao: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      onboardingCompleto: false,
      documentosPendentes: ['rg', 'comp_residencia'],
      criadoEm: now,
      atualizadoEm: now
    })
    await ctx.db.patch(userId, { ofertanteProfileId: profileId })
  }
}
