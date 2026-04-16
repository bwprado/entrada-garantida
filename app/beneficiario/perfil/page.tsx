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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cepMaskOptions } from '@/lib/masks'
import { normalizePhone } from '@/lib/normalize-phone'
import { mergeRefs } from '@/lib/utils'
import { formatCPF } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaskito } from '@maskito/react'
import { useMutation, useQuery } from 'convex/react'
import { AlertCircle, ClipboardList, MapPin, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useFormState } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const perfilBeneficiarioSchema = z.object({
  // Common fields (admin only)
  nome: z.string().min(3, 'Nome completo é obrigatório'),
  nomeSocial: z.string().optional(),
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
  const updateProfile = useMutation(api.users.updateBeneficiaryProfile)

  const form = useForm<PerfilBeneficiarioFormData>({
    resolver: zodResolver(perfilBeneficiarioSchema),
    defaultValues: {
      nome: '',
      nomeSocial: '',
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

  const { isDirty } = useFormState({ control: form.control })

  // Populate form when data is loaded
  useEffect(() => {
    if (user && profile) {
      form.reset({
        nome: user.nome,
        nomeSocial: user.nome || '',
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

      await updateProfile({
        userId: user._id,
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        empreendimento: data.empreendimento,
        email: data.email || undefined,
        telefoneFixo: data.telefoneFixo,
        telefoneRecado: data.telefoneRecado,
        falarCom: data.falarCom,
        aceitaComunicacoes: data.aceitaComunicacoes,
        rg: data.rg,
        nomeResponsavelFamiliar: data.nomeResponsavelFamiliar,
        nomeMae: data.nomeMae,
        nomePai: data.nomePai,
        sexo: data.sexo,
        identidadeGenero: data.identidadeGenero,
        raca: data.raca,
        deficiencias: data.deficiencias as Doc<'beneficiaryProfiles'>['deficiencias'],
        profissao: data.profissao,
        empregador: data.empregador,
        ramoAtividade: data.ramoAtividade,
        tipoRenda: data.tipoRenda,
        rendaFamiliarFaixa: data.rendaFamiliarFaixa,
        pessoasFamilia: data.pessoasFamilia,
        mesesAluguelSocial: data.mesesAluguelSocial,
        possuiIdosoFamilia: data.possuiIdosoFamilia,
        chefiaFeminina: data.chefiaFeminina
      })

      form.reset(data)
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
        {isDirty && (
          <div
            role="alert"
            className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-50"
          >
            <AlertCircle
              className="size-5 shrink-0 text-amber-600 dark:text-amber-300"
              aria-hidden
            />
            <p>
              Você tem alterações não salvas. Use{' '}
              <span className="font-medium">Salvar Alterações</span> no fim do
              formulário para guardá-las.
            </p>
          </div>
        )}

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-lg bg-muted p-1 text-muted-foreground sm:grid-cols-3">
            <TabsTrigger
              value="basico"
              className="flex w-full items-center justify-center gap-2 py-2.5 sm:py-1.5"
            >
              <User className="size-4 shrink-0" aria-hidden />
              <span>Dados básicos</span>
            </TabsTrigger>
            <TabsTrigger
              value="cadastro"
              className="flex w-full items-center justify-center gap-2 py-2.5 sm:py-1.5"
            >
              <ClipboardList className="size-4 shrink-0" aria-hidden />
              <span>Cadastro</span>
            </TabsTrigger>
            <TabsTrigger
              value="endereco"
              className="flex w-full items-center justify-center gap-2 py-2.5 sm:py-1.5"
            >
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span>Endereço</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="basico"
            forceMount
            className="mt-6 space-y-6 outline-none data-[state=inactive]:hidden"
          >
            <CommonFields
              control={form.control as never}
              isAdmin={false}
              identifiersDisplay={{
                cpf: formatCPF(user.cpf),
                phone:
                  normalizePhone(user.phone).display() || '—'
              }}
            />
          </TabsContent>

          <TabsContent
            value="cadastro"
            forceMount
            className="mt-6 outline-none data-[state=inactive]:hidden"
          >
            <BeneficiaryFields control={form.control as never} />
          </TabsContent>

          <TabsContent
            value="endereco"
            forceMount
            className="mt-6 outline-none data-[state=inactive]:hidden"
          >
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Endereço</h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={mergeRefs(field.ref, cepRef)}
                          placeholder="00000-000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
          </TabsContent>
        </Tabs>
      </ProfileLayout>
    </Form>
  )
}
