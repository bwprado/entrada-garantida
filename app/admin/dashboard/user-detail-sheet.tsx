'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  beneficiaryFaixaRendaLabelPt,
  beneficiarySexoLabelPt,
  beneficiaryTipoRendaLabelPt
} from '@/lib/beneficiary-profile-labels-pt'
import { normalizePhone } from '@/lib/normalize-phone'
import { userStatusLabelPt } from '@/lib/user-status-label'
import { fetchAddressByCEP } from '@/lib/validation'

function formatCPF(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatAddressLine(p: {
  endereco?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  complemento?: string
}) {
  const parts = [
    p.endereco,
    p.numero,
    p.complemento,
    p.bairro,
    p.cidade,
    p.estado
  ].filter(Boolean)
  return parts.join(', ')
}

const sexoValues = ['feminino', 'masculino', 'nao_informado'] as const
const racaValues = [
  'branca',
  'preta',
  'parda',
  'amarela',
  'indigena',
  'nao_informado'
] as const
const tipoRendaValues = [
  'clt',
  'autonomo',
  'servidor_publico',
  'aposentado',
  'bpc',
  'outros',
  'nao_informado'
] as const
const rendaFaixaValues = ['ate_2', '2_4', '4_6', '6_8', 'acima_8'] as const

/** Import-backed profile fields stay optional: validate format only when filled. */
const editSchema = z
  .object({
    nome: z.string(),
    telefone: z.string(),
    email: z.string(),
    rg: z.string(),
    nomeMae: z.string().optional(),
    sexo: z.enum(sexoValues).optional(),
    raca: z.enum(racaValues).optional(),
    profissao: z.string(),
    empregador: z.string().optional(),
    ramoAtividade: z.string().optional(),
    tipoRenda: z.enum(tipoRendaValues).optional(),
    rendaFamiliarFaixa: z.enum(rendaFaixaValues).optional(),
    pessoasFamilia: z.number().optional(),
    nomeResponsavelFamiliar: z.string().optional(),
    nomePai: z.string().optional(),
    mesesAluguelSocial: z.number().optional(),
    possuiIdosoFamilia: z.boolean(),
    chefiaFeminina: z.boolean(),
    cep: z.string(),
    endereco: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string(),
    complemento: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const nomeT = data.nome.trim()
    if (nomeT.length > 0 && nomeT.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nome muito curto',
        path: ['nome']
      })
    }
    const tel = data.telefone.trim()
    if (tel.length > 0 && !normalizePhone(data.telefone).isValid()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Telefone inválido',
        path: ['telefone']
      })
    }
    const emailT = data.email.trim()
    if (
      emailT.length > 0 &&
      !z.string().email().safeParse(emailT).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'E-mail inválido',
        path: ['email']
      })
    }
    const rgT = data.rg.trim()
    if (rgT.length > 0 && rgT.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RG inválido se informado',
        path: ['rg']
      })
    }
    const profT = data.profissao.trim()
    if (profT.length > 0 && profT.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Profissão inválida se informada',
        path: ['profissao']
      })
    }
    const cepDigits = data.cep.replace(/\D/g, '')
    if (data.cep.trim().length > 0 && cepDigits.length !== 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CEP deve ter 8 dígitos se informado',
        path: ['cep']
      })
    }
    const endT = data.endereco.trim()
    if (endT.length > 0 && endT.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Endereço inválido se informado',
        path: ['endereco']
      })
    }
    const uf = data.estado.trim().toUpperCase()
    if (data.estado.trim().length > 0 && uf.length !== 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'UF deve ter 2 letras se informada',
        path: ['estado']
      })
    }
    const pf = data.pessoasFamilia
    if (
      pf !== undefined &&
      (!Number.isFinite(pf) || pf < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Número inválido se informado',
        path: ['pessoasFamilia']
      })
    }
    const meses = data.mesesAluguelSocial
    if (
      meses !== undefined &&
      (!Number.isFinite(meses) || meses < 0 || !Number.isInteger(meses))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe um número inteiro ≥ 0 ou deixe em branco',
        path: ['mesesAluguelSocial']
      })
    }
  })

type EditFormValues = z.infer<typeof editSchema>

const emptyDefaults: EditFormValues = {
  nome: '',
  telefone: '',
  email: '',
  rg: '',
  nomeMae: '',
  sexo: undefined,
  raca: undefined,
  profissao: '',
  empregador: '',
  ramoAtividade: '',
  tipoRenda: undefined,
  rendaFamiliarFaixa: undefined,
  pessoasFamilia: undefined,
  nomeResponsavelFamiliar: '',
  nomePai: '',
  mesesAluguelSocial: undefined,
  possuiIdosoFamilia: false,
  chefiaFeminina: false,
  cep: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  complemento: ''
}

function buildDefaults(
  user: Doc<'users'> | undefined,
  profile: Doc<'beneficiaryProfiles'> | null
): EditFormValues {
  if (!user) return emptyDefaults
  return {
    nome: user.nome ?? '',
    telefone: user.phone ? normalizePhone(user.phone).display() : '',
    email: user.email ?? '',
    rg: profile?.rg ?? '',
    nomeMae: profile?.nomeMae ?? '',
    sexo: profile?.sexo as EditFormValues['sexo'] | undefined,
    raca: profile?.raca as EditFormValues['raca'] | undefined,
    profissao: profile?.profissao ?? '',
    empregador: profile?.empregador ?? '',
    ramoAtividade: profile?.ramoAtividade ?? '',
    tipoRenda: profile?.tipoRenda as EditFormValues['tipoRenda'] | undefined,
    rendaFamiliarFaixa: profile?.rendaFamiliarFaixa as
      | EditFormValues['rendaFamiliarFaixa']
      | undefined,
    pessoasFamilia: profile?.pessoasFamilia,
    nomeResponsavelFamiliar: profile?.nomeResponsavelFamiliar ?? '',
    nomePai: profile?.nomePai ?? '',
    mesesAluguelSocial: profile?.mesesAluguelSocial,
    possuiIdosoFamilia: profile?.possuiIdosoFamilia ?? false,
    chefiaFeminina: profile?.chefiaFeminina ?? false,
    cep: profile?.cep ? formatCepDisplay(profile.cep) : '',
    endereco: profile?.endereco ?? '',
    numero: profile?.numero ?? '',
    bairro: profile?.bairro ?? '',
    cidade: profile?.cidade ?? '',
    estado: profile?.estado ?? '',
    complemento: profile?.complemento ?? ''
  }
}

function formatCepDisplay(cep: string) {
  const d = cep.replace(/\D/g, '')
  if (d.length !== 8) return cep
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

function maskPhone(raw: string) {
  const v = raw.replace(/\D/g, '').slice(0, 11)
  if (v.length === 0) return ''
  if (v.length <= 2) return `(${v}`
  const ddd = v.slice(0, 2)
  const rest = v.slice(2)
  if (rest.length <= 4) return `(${ddd}) ${rest}`
  const isMobile = v.length === 11 || rest[0] === '9'
  if (isMobile) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`
  }
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4, 8)}`
}

function maskCep(raw: string) {
  const v = raw.replace(/\D/g, '').slice(0, 8)
  if (v.length > 5) return `${v.slice(0, 5)}-${v.slice(5)}`
  return v
}

/** Radix Select cannot use empty string; map to undefined in form state. */
const SELECT_UNSET = '__unset__' as const

export type UserDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: Id<'users'> | null
  previewNome?: string
  onDeleted?: () => void
  /** `none`: hide header menu + in-sheet delete (e.g. actions live in data table). */
  sheetActions?: 'dropdown' | 'none'
  /** Open focused on edit form (e.g. row action "Editar"). */
  initialMode?: 'view' | 'edit'
}

export function UserDetailSheet({
  open,
  onOpenChange,
  userId,
  previewNome,
  onDeleted,
  sheetActions = 'dropdown',
  initialMode = 'view'
}: UserDetailSheetProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [saving, setSaving] = useState(false)
  const [isFetchingCEP, setIsFetchingCEP] = useState(false)
  const hydratedEditSessionRef = useRef(false)

  const detail = useQuery(
    api.users.getUserDetailForAdmin,
    open && userId ? { userId } : 'skip'
  )

  const deleteBeneficiary = useMutation(api.users.adminDeleteBeneficiary)
  const deleteOfertante = useMutation(api.users.adminDeleteOfertante)
  const updateUserBasic = useMutation(api.users.updateUserBasicInfo)
  const updateBeneficiaryProfile = useMutation(
    api.users.updateBeneficiaryProfile
  )

  const beneficiaryProfile: Doc<'beneficiaryProfiles'> | null =
    detail?.user.role === 'beneficiary' && detail.profile
      ? (detail.profile as Doc<'beneficiaryProfiles'>)
      : null
  const ofertanteProfile: Doc<'ofertanteProfiles'> | null =
    detail?.user.role === 'ofertante' && detail.profile
      ? (detail.profile as Doc<'ofertanteProfiles'>)
      : null

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: emptyDefaults
  })

  useEffect(() => {
    if (!open) {
      setMode('view')
      setShowDeleteAlert(false)
      hydratedEditSessionRef.current = false
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setMode(initialMode)
      setShowDeleteAlert(false)
    }
  }, [open, initialMode])

  useEffect(() => {
    hydratedEditSessionRef.current = false
  }, [userId])

  useEffect(() => {
    if (!open || detail === undefined || detail === null || !detail.user) return

    if (mode === 'edit') {
      if (!hydratedEditSessionRef.current) {
        form.reset(buildDefaults(detail.user, beneficiaryProfile))
        hydratedEditSessionRef.current = true
      }
      return
    }

    form.reset(buildDefaults(detail.user, beneficiaryProfile))
  }, [
    open,
    mode,
    detail?.user?._id,
    beneficiaryProfile?._id,
    beneficiaryProfile?.atualizadoEm,
    detail?.user?.atualizadoEm,
    form
  ])

  const cepValue = form.watch('cep')
  useEffect(() => {
    if (mode !== 'edit') return
    const cleaned = cepValue?.replace(/\D/g, '')
    if (cleaned?.length !== 8) return
    let cancelled = false
    setIsFetchingCEP(true)
    fetchAddressByCEP(cleaned)
      .then((addr) => {
        if (cancelled || !addr) return
        form.setValue('endereco', addr.logradouro || form.getValues('endereco'))
        form.setValue('bairro', addr.bairro || form.getValues('bairro'))
        form.setValue('cidade', addr.cidade || form.getValues('cidade'))
        form.setValue('estado', addr.estado || form.getValues('estado'))
      })
      .finally(() => {
        if (!cancelled) setIsFetchingCEP(false)
      })
    return () => {
      cancelled = true
    }
  }, [cepValue, mode, form])

  const handleDelete = async () => {
    if (!userId || !detail?.user) return
    setDeleting(true)
    try {
      if (detail.user.role === 'beneficiary') {
        await deleteBeneficiary({ userId })
      } else {
        await deleteOfertante({ userId })
      }
      toast.success('Usuário excluído')
      setShowDeleteAlert(false)
      onOpenChange(false)
      onDeleted?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async (values: EditFormValues) => {
    if (!userId) return
    if (!beneficiaryProfile) {
      toast.error(
        'Este beneficiário não possui perfil cadastrado; não é possível salvar.'
      )
      return
    }

    const nomeT = values.nome.trim()
    const basicPayload: {
      userId: Id<'users'>
      nome?: string
      telefone?: string
      email?: string
    } = { userId }

    if (nomeT.length >= 2) basicPayload.nome = nomeT

    const telRaw = values.telefone.trim()
    if (telRaw.length > 0) {
      const phoneE164 = normalizePhone(values.telefone).save()
      if (!phoneE164) {
        toast.error('Telefone inválido')
        return
      }
      basicPayload.telefone = phoneE164
    }

    const emailT = values.email.trim()
    if (emailT.length > 0) basicPayload.email = emailT

    const profilePayload: {
      userId: Id<'users'>
      rg?: string
      nomeMae?: string
      nomeResponsavelFamiliar?: string
      nomePai?: string
      empregador?: string
      ramoAtividade?: string
      sexo?: (typeof sexoValues)[number]
      raca?: (typeof racaValues)[number]
      profissao?: string
      tipoRenda?: (typeof tipoRendaValues)[number]
      rendaFamiliarFaixa?: (typeof rendaFaixaValues)[number]
      pessoasFamilia?: number
      mesesAluguelSocial?: number
      possuiIdosoFamilia?: boolean
      chefiaFeminina?: boolean
      cep?: string
      endereco?: string
      numero?: string
      bairro?: string
      cidade?: string
      estado?: string
      complemento?: string
    } = { userId }

    let profileDirty = false

    const rgT = values.rg.trim()
    if (rgT.length >= 3) {
      profilePayload.rg = rgT
      profileDirty = true
    }

    const nomeMaeT = values.nomeMae?.trim()
    if (nomeMaeT) {
      profilePayload.nomeMae = nomeMaeT
      profileDirty = true
    }

    if (values.sexo !== undefined) {
      profilePayload.sexo = values.sexo
      profileDirty = true
    }

    if (values.raca !== undefined) {
      profilePayload.raca = values.raca
      profileDirty = true
    }

    const profT = values.profissao.trim()
    if (profT.length >= 2) {
      profilePayload.profissao = profT
      profileDirty = true
    }

    if (values.tipoRenda !== undefined) {
      profilePayload.tipoRenda = values.tipoRenda
      profileDirty = true
    }

    if (values.rendaFamiliarFaixa !== undefined) {
      profilePayload.rendaFamiliarFaixa = values.rendaFamiliarFaixa
      profileDirty = true
    }

    const pf = values.pessoasFamilia
    if (pf !== undefined && Number.isFinite(pf) && pf >= 1) {
      profilePayload.pessoasFamilia = pf
      profileDirty = true
    }

    const cepDigits = values.cep.replace(/\D/g, '')
    if (cepDigits.length === 8) {
      profilePayload.cep = cepDigits
      profileDirty = true
    }

    const endT = values.endereco.trim()
    if (endT.length >= 2) {
      profilePayload.endereco = endT
      profileDirty = true
    }

    const numT = values.numero.trim()
    if (numT.length > 0) {
      profilePayload.numero = numT
      profileDirty = true
    }

    const bairroT = values.bairro.trim()
    if (bairroT.length > 0) {
      profilePayload.bairro = bairroT
      profileDirty = true
    }

    const cidadeT = values.cidade.trim()
    if (cidadeT.length > 0) {
      profilePayload.cidade = cidadeT
      profileDirty = true
    }

    const uf = values.estado.trim().toUpperCase()
    if (uf.length === 2) {
      profilePayload.estado = uf
      profileDirty = true
    }

    const compT = values.complemento?.trim()
    if (compT) {
      profilePayload.complemento = compT
      profileDirty = true
    }

    if (beneficiaryProfile) {
      const nomeResp = (values.nomeResponsavelFamiliar ?? '').trim()
      if (
        nomeResp !== (beneficiaryProfile.nomeResponsavelFamiliar ?? '').trim()
      ) {
        profilePayload.nomeResponsavelFamiliar = nomeResp
        profileDirty = true
      }

      const nomePaiT = (values.nomePai ?? '').trim()
      if (nomePaiT !== (beneficiaryProfile.nomePai ?? '').trim()) {
        profilePayload.nomePai = nomePaiT
        profileDirty = true
      }

      const empT = (values.empregador ?? '').trim()
      if (empT !== (beneficiaryProfile.empregador ?? '').trim()) {
        profilePayload.empregador = empT
        profileDirty = true
      }

      const ramoT = (values.ramoAtividade ?? '').trim()
      if (ramoT !== (beneficiaryProfile.ramoAtividade ?? '').trim()) {
        profilePayload.ramoAtividade = ramoT
        profileDirty = true
      }

      const mesesVal = values.mesesAluguelSocial
      const prevMeses = beneficiaryProfile.mesesAluguelSocial
      if (
        mesesVal !== undefined &&
        Number.isFinite(mesesVal) &&
        mesesVal >= 0 &&
        Number.isInteger(mesesVal) &&
        mesesVal !== prevMeses
      ) {
        profilePayload.mesesAluguelSocial = mesesVal
        profileDirty = true
      }

      if (
        values.possuiIdosoFamilia !== beneficiaryProfile.possuiIdosoFamilia
      ) {
        profilePayload.possuiIdosoFamilia = values.possuiIdosoFamilia
        profileDirty = true
      }

      if (values.chefiaFeminina !== beneficiaryProfile.chefiaFeminina) {
        profilePayload.chefiaFeminina = values.chefiaFeminina
        profileDirty = true
      }
    }

    const hasBasicChange =
      basicPayload.nome !== undefined ||
      basicPayload.telefone !== undefined ||
      basicPayload.email !== undefined

    if (!hasBasicChange && !profileDirty) {
      toast.info('Nada para salvar — altere algum campo.')
      return
    }

    setSaving(true)
    try {
      const promises: Promise<unknown>[] = []
      if (hasBasicChange) promises.push(updateUserBasic(basicPayload))
      if (profileDirty) promises.push(updateBeneficiaryProfile(profilePayload))

      await Promise.all(promises)
      toast.success('Beneficiário atualizado')
      hydratedEditSessionRef.current = false
      setMode('view')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    hydratedEditSessionRef.current = false
    setMode('view')
  }

  const nome = detail?.user.nome ?? previewNome ?? 'Carregando…'
  const isBeneficiary = detail?.user.role === 'beneficiary'
  const canShowActions = !!detail?.user

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next && mode === 'edit' && saving) return
          onOpenChange(next)
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
          <SheetHeader className="pr-8 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="line-clamp-2">{nome}</SheetTitle>
                {detail?.user.role === 'beneficiary' && (
                  <Badge variant="secondary">Beneficiário</Badge>
                )}
                {detail?.user.role === 'ofertante' && (
                  <Badge variant="secondary">Ofertante</Badge>
                )}
              </div>
              {sheetActions === 'dropdown' &&
                canShowActions &&
                mode === 'view' && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Abrir ações</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isBeneficiary && (
                      <DropdownMenuItem
                        disabled={!beneficiaryProfile}
                        onSelect={() => setMode('edit')}
                      >
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {isBeneficiary && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      data-variant="destructive"
                      onSelect={() => setShowDeleteAlert(true)}
                    >
                      <Trash2 className="size-4" />
                      Excluir usuário
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <SheetDescription>
              {mode === 'edit'
                ? 'Edite os dados do beneficiário.'
                : 'Dados cadastrais do usuário selecionado.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
            {detail === undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando detalhes…
              </div>
            )}

            {detail === null && (
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar este usuário.
              </p>
            )}

            {detail?.user && mode === 'view' && (
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Conta</h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">CPF</dt>
                      <dd className="font-medium">
                        {formatCPF(detail.user.cpf)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Telefone</dt>
                      <dd className="font-medium">
                        {detail.user.phone
                          ? normalizePhone(detail.user.phone).display()
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">E-mail</dt>
                      <dd className="font-medium">
                        {detail.user.email ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">
                        {userStatusLabelPt(detail.user.status)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Cadastro</dt>
                      <dd className="font-medium">
                        {new Date(detail.user.criadoEm).toLocaleString('pt-BR')}
                      </dd>
                    </div>
                    {detail.user.dadosComErro && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">
                          Erro nos dados
                        </dt>
                        <dd className="text-destructive">
                          {detail.user.mensagemErroDados ?? 'Reportado'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                <Separator />

                {beneficiaryProfile && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold">
                      Perfil beneficiário
                    </h3>
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">RG</dt>
                        <dd className="font-medium">{beneficiaryProfile.rg}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">
                          Responsável familiar (chefe da família)
                        </dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.nomeResponsavelFamiliar ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Nome da mãe</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.nomeMae ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Nome do pai</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.nomePai ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Sexo</dt>
                        <dd className="font-medium">
                          {beneficiarySexoLabelPt(beneficiaryProfile.sexo)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Profissão</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.profissao}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Empregador</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.empregador ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Ramo de atividade
                        </dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.ramoAtividade ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Renda</dt>
                        <dd className="font-medium">
                          {beneficiaryTipoRendaLabelPt(
                            beneficiaryProfile.tipoRenda
                          )}{' '}
                          ·{' '}
                          {beneficiaryFaixaRendaLabelPt(
                            beneficiaryProfile.rendaFamiliarFaixa
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Família</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.pessoasFamilia} pessoa(s)
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Meses no aluguel social
                        </dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.mesesAluguelSocial ?? '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Possui idoso na família
                        </dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.possuiIdosoFamilia ? 'Sim' : 'Não'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Chefe de família é mulher
                        </dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.chefiaFeminina ? 'Sim' : 'Não'}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Endereço</dt>
                        <dd className="font-medium">
                          {formatAddressLine(beneficiaryProfile)}
                        </dd>
                        <dd className="text-muted-foreground">
                          CEP {beneficiaryProfile.cep}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}

                {ofertanteProfile && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Perfil ofertante</h3>
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">RG</dt>
                        <dd className="font-medium">{ofertanteProfile.rg}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Data nascimento
                        </dt>
                        <dd className="font-medium">
                          {ofertanteProfile.dataNascimento || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Estado civil</dt>
                        <dd className="font-medium">
                          {ofertanteProfile.estadoCivil}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Onboarding</dt>
                        <dd className="font-medium">
                          {ofertanteProfile.onboardingCompleto
                            ? 'Completo'
                            : 'Pendente'}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Endereço</dt>
                        <dd className="font-medium">
                          {formatAddressLine(ofertanteProfile)}
                        </dd>
                        <dd className="text-muted-foreground">
                          CEP {ofertanteProfile.cep}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}

                {detail.user.role === 'beneficiary' && !beneficiaryProfile && (
                  <p className="text-sm text-muted-foreground">
                    Perfil de beneficiário ainda não cadastrado.
                  </p>
                )}
                {detail.user.role === 'ofertante' && !ofertanteProfile && (
                  <p className="text-sm text-muted-foreground">
                    Perfil de ofertante ainda não cadastrado.
                  </p>
                )}
              </div>
            )}

            {detail?.user && mode === 'edit' && isBeneficiary && (
              <Form {...form}>
                <form
                  id="edit-beneficiary-form"
                  onSubmit={form.handleSubmit(handleSave, () =>
                    toast.error('Corrija os campos destacados.')
                  )}
                  className="space-y-6"
                >
                  <p className="text-xs text-muted-foreground">
                    Os campos vêm do cadastro/importação. Deixe em branco o que não
                    for alterar — apenas valores preenchidos serão gravados.
                  </p>
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold">Conta</h3>
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(98) 99999-9999"
                              maxLength={15}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(maskPhone(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@exemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Label
                        htmlFor="beneficiary-edit-cpf"
                        className="text-sm font-medium leading-none"
                      >
                        CPF
                      </Label>
                      <Input
                        id="beneficiary-edit-cpf"
                        value={formatCPF(detail.user.cpf)}
                        disabled
                        readOnly
                        className="mt-2"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        CPF não pode ser alterado.
                      </p>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold">Documentos</h3>
                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o RG" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nomeMae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da mãe (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome da mãe"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nomePai"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do pai</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do pai"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>

                  <Separator />

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold">Dados pessoais</h3>
                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select
                            value={field.value ?? SELECT_UNSET}
                            onValueChange={(v) =>
                              field.onChange(
                                v === SELECT_UNSET
                                  ? undefined
                                  : (v as EditFormValues['sexo'])
                              )
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SELECT_UNSET}>
                                — Não alterar
                              </SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                              <SelectItem value="masculino">
                                Masculino
                              </SelectItem>
                              <SelectItem value="nao_informado">
                                Não Informado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="raca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raça/Cor</FormLabel>
                          <Select
                            value={field.value ?? SELECT_UNSET}
                            onValueChange={(v) =>
                              field.onChange(
                                v === SELECT_UNSET
                                  ? undefined
                                  : (v as EditFormValues['raca'])
                              )
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SELECT_UNSET}>
                                — Não alterar
                              </SelectItem>
                              <SelectItem value="branca">Branca</SelectItem>
                              <SelectItem value="preta">Preta</SelectItem>
                              <SelectItem value="parda">Parda</SelectItem>
                              <SelectItem value="amarela">Amarela</SelectItem>
                              <SelectItem value="indigena">Indígena</SelectItem>
                              <SelectItem value="nao_informado">
                                Não Informado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão</FormLabel>
                          <FormControl>
                            <Input placeholder="Profissão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="empregador"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empregador</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Empresa ou instituição"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ramoAtividade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ramo de atividade</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Área de atuação"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tipoRenda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de renda</FormLabel>
                          <Select
                            value={field.value ?? SELECT_UNSET}
                            onValueChange={(v) =>
                              field.onChange(
                                v === SELECT_UNSET
                                  ? undefined
                                  : (v as EditFormValues['tipoRenda'])
                              )
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SELECT_UNSET}>
                                — Não alterar
                              </SelectItem>
                              <SelectItem value="clt">CLT</SelectItem>
                              <SelectItem value="autonomo">Autônomo</SelectItem>
                              <SelectItem value="servidor_publico">
                                Servidor público
                              </SelectItem>
                              <SelectItem value="aposentado">
                                Aposentado
                              </SelectItem>
                              <SelectItem value="bpc">BPC</SelectItem>
                              <SelectItem value="outros">Outros</SelectItem>
                              <SelectItem value="nao_informado">
                                Não Informado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rendaFamiliarFaixa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faixa de renda familiar</FormLabel>
                          <Select
                            value={field.value ?? SELECT_UNSET}
                            onValueChange={(v) =>
                              field.onChange(
                                v === SELECT_UNSET
                                  ? undefined
                                  : (v as EditFormValues['rendaFamiliarFaixa'])
                              )
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={SELECT_UNSET}>
                                — Não alterar
                              </SelectItem>
                              <SelectItem value="ate_2">
                                Até 2 salários
                              </SelectItem>
                              <SelectItem value="2_4">
                                2 a 4 salários
                              </SelectItem>
                              <SelectItem value="4_6">
                                4 a 6 salários
                              </SelectItem>
                              <SelectItem value="6_8">
                                6 a 8 salários
                              </SelectItem>
                              <SelectItem value="acima_8">
                                Acima de 8 salários
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pessoasFamilia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pessoas na família</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              value={
                                field.value === undefined ? '' : field.value
                              }
                              onChange={(e) => {
                                const raw = e.target.value
                                field.onChange(
                                  raw === ''
                                    ? undefined
                                    : (() => {
                                        const n = Number.parseInt(raw, 10)
                                        return Number.isNaN(n)
                                          ? undefined
                                          : n
                                      })()
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 border-t border-border pt-4">
                      <h4 className="text-sm font-semibold">
                        Composição familiar
                      </h4>
                      <FormField
                        control={form.control}
                        name="nomeResponsavelFamiliar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Responsável familiar (chefe da família)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome completo"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mesesAluguelSocial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Meses no programa aluguel social
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Ex.: 12"
                                value={
                                  field.value === undefined ? '' : field.value
                                }
                                onChange={(e) => {
                                  const raw = e.target.value
                                  field.onChange(
                                    raw === ''
                                      ? undefined
                                      : (() => {
                                          const n = Number.parseInt(raw, 10)
                                          return Number.isNaN(n)
                                            ? undefined
                                            : n
                                        })()
                                  )
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="possuiIdosoFamilia"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(c) =>
                                  field.onChange(c === true)
                                }
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer font-normal">
                                Possui idoso na família
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="chefiaFeminina"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start gap-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(c) =>
                                  field.onChange(c === true)
                                }
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer font-normal">
                                Chefe de família é mulher (chefia feminina)
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold">Endereço</h3>
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="99999-999"
                                maxLength={9}
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(maskCep(e.target.value))
                                }
                              />
                              {isFetchingCEP && (
                                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua / Avenida" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
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
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apto 101"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="cidade"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
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
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MA"
                                maxLength={2}
                                value={field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.toUpperCase().slice(0, 2)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>
                </form>
              </Form>
            )}
          </div>

          {canShowActions && (
            <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-4 py-3">
              {mode === 'view' ? (
                <>
                  {sheetActions === 'none' && isBeneficiary && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMode('edit')}
                      disabled={!beneficiaryProfile}
                      title={
                        !beneficiaryProfile
                          ? 'Perfil de beneficiário não cadastrado'
                          : undefined
                      }
                    >
                      Editar
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="min-w-20"
                  >
                    OK
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    form="edit-beneficiary-form"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Salvando…
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {sheetActions === 'dropdown' && (
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Serão removidos o cadastro, o
              perfil, documentos e sessões de autenticação de{' '}
              <strong>{detail?.user.nome ?? previewNome}</strong>
              {detail?.user.phone && (
                <> ({normalizePhone(detail.user.phone).display()})</>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Excluindo…
                </>
              ) : (
                'Excluir definitivamente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </>
  )
}
