'use client'

import {
  BeneficiaryFields,
  CommonFields,
  ProfileLayout
} from '@/components/profile'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { cepMaskOptions } from '@/lib/masks'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaskito } from '@maskito/react'
import { useMutation, useQuery } from 'convex/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const perfilBeneficiarioSchema = z.object({
  // Common fields (admin only)
  nome: z.string().min(3, 'Nome completo é obrigatório'),
  nomeSocial: z.string().optional(),
  cpf: z.string().min(14, 'CPF inválido'),
  telefone: z.string().min(14, 'Celular inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),

  // Address (editable by beneficiary)
  cep: z.string().min(9, 'CEP inválido'),
  endereco: z.string().min(3, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'UF inválida'),
  empreendimento: z.string().optional(),

  // Profile fields
  rg: z.string().min(3, 'RG é obrigatório'),
  nomeResponsavelFamiliar: z.string().optional(),
  nomeMae: z.string().optional(),
  nomePai: z.string().optional(),
  sexo: z.enum(['feminino', 'masculino', 'nao_informado']),
  identidadeGenero: z.enum([
    'cisgenero',
    'transgenero',
    'nao_binario',
    'outro',
    'nao_informado'
  ]),
  raca: z.enum([
    'branca',
    'preta',
    'parda',
    'amarela',
    'indigena',
    'nao_informado'
  ]),
  deficiencias: z.array(z.string()),
  profissao: z.string().min(2, 'Profissão é obrigatória'),
  empregador: z.string().optional(),
  ramoAtividade: z.string().optional(),
  tipoRenda: z.enum([
    'clt',
    'autonomo',
    'servidor_publico',
    'aposentado',
    'bpc',
    'outros',
    'nao_informado'
  ]),
  rendaFamiliarFaixa: z.enum(['ate_2', '2_4', '4_6', '6_8', 'acima_8']),
  pessoasFamilia: z.number().min(1, 'Mínimo 1 pessoa'),
  mesesAluguelSocial: z.number().min(0),
  possuiIdosoFamilia: z.boolean(),
  chefiaFeminina: z.boolean(),

  // Contact
  telefoneFixo: z.string().optional(),
  telefoneRecado: z.string().optional(),
  falarCom: z.string().optional(),
  aceitaComunicacoes: z.boolean()
})

type PerfilBeneficiarioFormData = z.infer<typeof perfilBeneficiarioSchema>
export default function BeneficiarioPerfilPage() {
  const cepRef = useMaskito({ options: cepMaskOptions })
  const query = useQuery(api.users.getCurrentUserWithProfile)
  const user = query?.user as Doc<'users'>
  const profile = query?.profile as Doc<'beneficiaryProfiles'>
  const properties = query?.properties as Doc<'properties'>[]
  const updateProfile = useMutation(api.users.updateBeneficiaryProfile)
  const updateBasicInfo = useMutation(api.users.updateUserBasicInfo)

  const form = useForm<PerfilBeneficiarioFormData>({
    resolver: zodResolver(perfilBeneficiarioSchema),
    defaultValues: {
      nome: '',
      nomeSocial: '',
      cpf: '',
      telefone: '',
      email: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      empreendimento: '',
      rg: '',
      nomeResponsavelFamiliar: '',
      nomeMae: '',
      nomePai: '',
      sexo: 'nao_informado',
      identidadeGenero: 'nao_informado',
      raca: 'nao_informado',
      deficiencias: ['nao_possui'],
      profissao: '',
      empregador: '',
      ramoAtividade: '',
      tipoRenda: 'nao_informado',
      rendaFamiliarFaixa: 'ate_2',
      pessoasFamilia: 1,
      mesesAluguelSocial: 0,
      possuiIdosoFamilia: false,
      chefiaFeminina: false,
      telefoneFixo: '',
      telefoneRecado: '',
      falarCom: '',
      aceitaComunicacoes: false
    }
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (user && profile) {
      form.reset({
        nome: user.nome,
        nomeSocial: user.nome || '',
        cpf: user.cpf,
        telefone: user.phone,
        email: user.email || '',
        cep: profile.cep,
        endereco: profile.endereco,
        numero: profile.numero,
        complemento: profile.complemento || '',
        bairro: profile.bairro,
        cidade: profile.cidade,
        estado: profile.estado,
        empreendimento: profile.empreendimento || '',
        rg: profile.rg,
        nomeResponsavelFamiliar: profile.nomeResponsavelFamiliar || '',
        nomeMae: profile.nomeMae || '',
        nomePai: profile.nomePai || '',
        sexo: profile.sexo,
        identidadeGenero: profile.identidadeGenero,
        raca: profile.raca,
        deficiencias: profile.deficiencias,
        profissao: profile.profissao,
        empregador: profile.empregador || '',
        ramoAtividade: profile.ramoAtividade || '',
        tipoRenda: profile.tipoRenda,
        rendaFamiliarFaixa: profile.rendaFamiliarFaixa,
        pessoasFamilia: profile.pessoasFamilia,
        mesesAluguelSocial: profile.mesesAluguelSocial || 0,
        possuiIdosoFamilia: profile.possuiIdosoFamilia,
        chefiaFeminina: profile.chefiaFeminina,
        telefoneFixo: profile.telefoneFixo || '',
        telefoneRecado: profile.telefoneRecado || '',
        falarCom: profile.falarCom || '',
        aceitaComunicacoes: profile.aceitaComunicacoes
      })
    }
  }, [user, profile, form])

  const onSubmit = async (data: PerfilBeneficiarioFormData) => {
    try {
      if (!user?._id) {
        toast.error('Usuário não encontrado')
        return
      }

      // Update profile data (beneficiary can only edit specific fields)
      await updateProfile({
        userId: user._id,
        // Address (editable by beneficiary)
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        empreendimento: data.empreendimento,
        // Contact (editable by beneficiary)
        email: data.email || undefined,
        telefoneFixo: data.telefoneFixo,
        telefoneRecado: data.telefoneRecado,
        falarCom: data.falarCom,
        aceitaComunicacoes: data.aceitaComunicacoes
      })

      // Update basic info (only nomeSocial can be updated by beneficiary)
      if (data.nomeSocial !== user.nome) {
        await updateBasicInfo({
          userId: user._id,
          nomeSocial: data.nome || undefined
        })
      }

      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil. Tente novamente.')
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'beneficiary') {
    return null
  }

  return (
    <Form {...form}>
      <ProfileLayout
        title="Meu Perfil"
        description="Atualize suas informações pessoais e de contato. Alguns campos só podem ser editados por administradores."
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={form.formState.isSubmitting}
        backHref="/beneficiario/dashboard"
        backLabel="Voltar ao Dashboard"
      >
        <div className="space-y-8">
          <CommonFields control={form.control} isAdmin={false} />

          <div className="border-t pt-6" />

          <BeneficiaryFields control={form.control} isAdmin={false} />

          <div className="border-t pt-6" />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CEP */}
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input {...field} ref={cepRef} placeholder="00000-000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={2} placeholder="UF" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cidade */}
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Endereço */}
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número */}
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bairro */}
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Complemento */}
              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </ProfileLayout>
    </Form>
  )
}
