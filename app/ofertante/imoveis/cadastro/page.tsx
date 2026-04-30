'use client'

import Link from 'next/link'

import { R2FileUploader } from '@/components/design/r2-file-uploader'
import {
  FormFooter,
  FormHeader,
  MultiStepFormContent,
  NextButton,
  PreviousButton,
  StepFields,
  SubmitButton
} from '@/components/multi-step-viewer'
import { AmenityToggle } from '@/components/property/amenity-toggle'
import { RoomCounter } from '@/components/property/room-counter'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { MultiStepFormProvider } from '@/hooks/use-multi-step-viewer'
import { useAuth } from '@/lib/auth-context'
import {
  brlCurrencyMaskOptions,
  cepMaskOptions,
  formatBrlCurrency,
  parseBrlCurrency
} from '@/lib/masks'
import {
  AMENITY_CONFIG,
  AMENITY_DEFAULTS,
  MAX_PROPERTY_PHOTOS,
  ROOM_COUNT_LIMITS,
  ROOM_DEFAULTS,
  type AmenityType,
  type RoomType
} from '@/lib/property-limits'
import {
  PROPERTY_SALE_DOCUMENT_ITEMS,
  PROPERTY_SALE_DOCUMENT_TIPOS,
  type PropertySaleDocumentTipo
} from '@/lib/property-sale-documents'
import {
  propertyOfertanteFormSchema,
  type PropertyOfertanteFormValues
} from '@/lib/schemas/property-ofertante'
import { cn, mergeRefs } from '@/lib/utils'
import { fetchAddressByCEP } from '@/lib/validation'
import { useUploadFile } from '@convex-dev/r2/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaskito } from '@maskito/react'
import { useMutation, useQuery } from 'convex/react'
import { format, isValid, subYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building,
  Calendar as CalendarIcon,
  Car,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  Dumbbell,
  FileText,
  Flame,
  Loader2,
  Sofa,
  Star,
  Sun,
  TreePine,
  WashingMachine,
  Waves,
  Wifi,
  X
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  Controller,
  useForm,
  useWatch,
  type DefaultValues
} from 'react-hook-form'
import { toast } from 'sonner'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

function toValidDate(value: unknown): Date | undefined {
  if (value == null || value === '') return undefined
  if (value instanceof Date) return isValid(value) ? value : undefined
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return isValid(d) ? d : undefined
  }
  return undefined
}

function dateToUtcStartMs(d: Date | undefined): number | undefined {
  if (!d) return undefined
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatCepForInput(cep: string | undefined): string {
  if (!cep) return ''
  const d = cep.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

const emptyFormDefaults: DefaultValues<PropertyOfertanteFormValues> = {
  titulo: '',
  descricao: '',
  cep: '',
  endereco: '',
  valor_venda: '',
  ...ROOM_DEFAULTS,
  ...AMENITY_DEFAULTS,
  filesIds: []
} as DefaultValues<PropertyOfertanteFormValues>

type StagedSaleDocMap = Partial<Record<PropertySaleDocumentTipo, Id<'files'>>>

function PropertySaleDocumentRow({
  tipo,
  title,
  description,
  propertyId,
  fileId,
  mode,
  uploadFile,
  syncToFiles,
  completeSaleDoc,
  deleteSaleDoc,
  deleteOrphanFile,
  onStagedChange
}: {
  tipo: PropertySaleDocumentTipo
  title: string
  description: string
  propertyId: Id<'properties'> | null
  fileId: Id<'files'> | null | undefined
  mode: 'edit' | 'create'
  uploadFile: (file: File) => Promise<string>
  syncToFiles: (args: {
    r2Key: string
    name: string
    contentType: string
    size: number
  }) => Promise<Id<'files'>>
  completeSaleDoc: (args: {
    propertyId: Id<'properties'>
    tipo: PropertySaleDocumentTipo
    r2Key: string
    nomeOriginal: string
    contentType: string
    size: number
  }) => Promise<unknown>
  deleteSaleDoc: (args: { fileId: Id<'files'> }) => Promise<unknown>
  deleteOrphanFile: (args: { fileId: Id<'files'> }) => Promise<unknown>
  onStagedChange: (
    t: PropertySaleDocumentTipo,
    id: Id<'files'> | undefined
  ) => void
}) {
  const handleUploadFiles = async (files: File[]) => {
    for (const file of files) {
      const r2Key = await uploadFile(file)
      if (mode === 'edit' && propertyId) {
        await completeSaleDoc({
          propertyId,
          tipo,
          r2Key,
          nomeOriginal: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size
        })
      } else {
        const id = await syncToFiles({
          r2Key,
          name: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size
        })
        onStagedChange(tipo, id)
      }
    }
    toast.success('Documento enviado')
  }

  const handleDeleteFile = async (id: Id<'files'>) => {
    if (mode === 'edit') {
      await deleteSaleDoc({ fileId: id })
    } else {
      onStagedChange(tipo, undefined)
      try {
        await deleteOrphanFile({ fileId: id })
      } catch (e) {
        onStagedChange(tipo, id)
        toast.error(e instanceof Error ? e.message : 'Erro ao excluir arquivo')
        return
      }
    }
    toast.success('Arquivo excluído com sucesso')
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <R2FileUploader
        multiple={false}
        filesIds={fileId ? [fileId] : []}
        handleUploadFiles={handleUploadFiles}
        handleDeleteFile={handleDeleteFile}
      />
    </div>
  )
}

function ImovelCadastroPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyIdParam = searchParams.get(
    'propertyId'
  ) as Id<'properties'> | null
  const isEdit = Boolean(propertyIdParam)

  const { user, isAuthenticated, isLoading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [isFetchingCEP, setIsFetchingCEP] = useState(false)
  const [stagedSaleDocFileIds, setStagedSaleDocFileIds] =
    useState<StagedSaleDocMap>({})

  const existingProperty = useQuery(
    api.properties.getByIdForOwner,
    propertyIdParam ? { id: propertyIdParam } : 'skip'
  )

  const saleDocFileIds = useQuery(
    api.documents.getPropertySaleDocumentFileIds,
    isEdit && propertyIdParam ? { propertyId: propertyIdParam } : 'skip'
  )

  const createProperty = useMutation(api.properties.create)
  const updateProperty = useMutation(api.properties.update)
  const addPropertyImages = useMutation(api.documents.addPropertyImages)
  const completePropertySaleDocumentFromUpload = useMutation(
    api.documents.completePropertySaleDocumentFromUpload
  )
  const deletePropertySaleDocumentByFileId = useMutation(
    api.documents.deletePropertySaleDocumentByFileId
  )
  const attachPropertySaleDocumentFromUploadedFile = useMutation(
    api.documents.attachPropertySaleDocumentFromUploadedFile
  )
  const deletePropertyImage = useMutation(
    api.documents.deletePropertyImage
  ).withOptimisticUpdate((localStore, args) => {
    const nextIds = (form.getValues('filesIds') ?? []).filter(
      (id) => id !== args.fileId
    )
    const prevIds = [...nextIds, args.fileId]
    const fromList = localStore.getQuery(api.r2.getFileUrlAndMetadata, {
      fileIds: prevIds
    })
    if (fromList !== undefined) {
      localStore.setQuery(
        api.r2.getFileUrlAndMetadata,
        { fileIds: nextIds },
        fromList.filter((file) => file._id !== args.fileId)
      )
    }
    const fromSingle = localStore.getQuery(api.r2.getFileUrlAndMetadata, {
      fileIds: [args.fileId]
    })
    if (fromSingle !== undefined) {
      localStore.setQuery(api.r2.getFileUrlAndMetadata, { fileIds: [] }, [])
    }
  })
  const syncToFiles = useMutation(api.r2.syncToFiles)
  const uploadFile = useUploadFile(api.r2)
  const valorVendaMaskRef = useMaskito({ options: brlCurrencyMaskOptions })
  const cepInputRef = useMaskito({ options: cepMaskOptions })

  const form = useForm<PropertyOfertanteFormValues>({
    resolver: zodResolver(propertyOfertanteFormSchema),
    defaultValues: emptyFormDefaults
  })

  const { handleSubmit, control, reset, setValue } = form

  const cepWatched = useWatch({ control, name: 'cep', defaultValue: '' })

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user?.role === 'ofertante' &&
      !user.onboardingCompleto
    ) {
      router.push('/ofertante/onboarding')
    }
  }, [isAuthenticated, isLoading, user, router])

  useEffect(() => {
    const cepClean = (cepWatched ?? '').replace(/\D/g, '')
    if (cepClean.length !== 8) return

    let cancelled = false
    setIsFetchingCEP(true)
    void (async () => {
      try {
        const address = await fetchAddressByCEP(cepClean)
        if (cancelled || !address) return

        const cidadeUf =
          address.cidade && address.estado
            ? `${address.cidade}/${address.estado}`
            : address.cidade || address.estado || ''

        const parts = [address.logradouro, address.bairro, cidadeUf].filter(
          (p) => (p ?? '').trim().length > 0
        )
        if (parts.length === 0) return
        const line = parts.join(', ')
        setValue('endereco', line, {
          shouldDirty: true,
          shouldValidate: true
        })
      } finally {
        if (!cancelled) setIsFetchingCEP(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [cepWatched, setValue])

  useEffect(() => {
    if (!isEdit) {
      reset(emptyFormDefaults)
      setStagedSaleDocFileIds({})
      return
    }
    if (!existingProperty) return
    const ep = existingProperty as Record<string, unknown>
    reset({
      titulo: ep.titulo as string,
      descricao: (ep.descricao as string) ?? '',
      cep: formatCepForInput(ep.cep as string | undefined),
      endereco: ep.endereco as string,
      quartos: (ep.quartos as number) ?? 0,
      suites: (ep.suites as number) ?? 0,
      banheiros: (ep.banheiros as number) ?? 0,
      salasEstar: (ep.salasEstar as number) ?? 0,
      cozinhas: (ep.cozinhas as number) ?? 0,
      vagasGaragem: (ep.vagasGaragem as number) ?? 0,
      areasServico: (ep.areasServico as number) ?? 0,
      ruaPavimentada: (ep.ruaPavimentada as boolean) ?? false,
      garagem: (ep.garagem as boolean) ?? false,
      areaLavanderia: (ep.areaLavanderia as boolean) ?? false,
      portaria24h: (ep.portaria24h as boolean) ?? false,
      elevador: (ep.elevador as boolean) ?? false,
      piscina: (ep.piscina as boolean) ?? false,
      churrasqueira: (ep.churrasqueira as boolean) ?? false,
      academia: (ep.academia as boolean) ?? false,
      jardim: (ep.jardim as boolean) ?? false,
      varanda: (ep.varanda as boolean) ?? false,
      tamanho: ep.tamanho as number,
      data_construcao: existingProperty.dataConstrucao
        ? new Date(existingProperty.dataConstrucao)
        : undefined,
      matricula: existingProperty.matricula,
      inscricao_imobiliaria: existingProperty.inscricaoImobiliaria,
      valor_venda: formatBrlCurrency(existingProperty.valorVenda),
      filesIds: existingProperty.filesIds ?? []
    })
  }, [isEdit, existingProperty, reset])

  async function onSubmit(data: PropertyOfertanteFormValues) {
    if (!user) {
      toast.error('Sessão inválida. Faça login novamente.')
      return
    }

    setSubmitting(true)
    const { filesIds, ...rest } = data
    const parsedValorVenda = parseBrlCurrency(rest.valor_venda)

    try {
      if (parsedValorVenda === undefined || Number.isNaN(parsedValorVenda)) {
        toast.error('Informe um valor válido para venda')
        return
      }

      if (isEdit && propertyIdParam) {
        if (
          existingProperty &&
          existingProperty.status !== 'draft' &&
          existingProperty.status !== 'rejected'
        ) {
          toast.error(
            'Só é possível editar imóveis em rascunho ou com cadastro rejeitado.'
          )
          return
        }
        if (!existingProperty) {
          toast.error('Imóvel não encontrado.')
          return
        }
        if (saleDocFileIds === undefined) {
          toast.error('Aguarde o carregamento da documentação do imóvel.')
          return
        }
        if (
          !PROPERTY_SALE_DOCUMENT_TIPOS.every((t) => Boolean(saleDocFileIds[t]))
        ) {
          toast.error(
            'Envie os 5 documentos obrigatórios na última etapa (documentação para venda).'
          )
          return
        }
        await updateProperty({
          propertyId: existingProperty._id,
          titulo: rest.titulo,
          descricao: rest.descricao?.trim() ? rest.descricao : undefined,
          cep: rest.cep ?? '',
          endereco: rest.endereco,
          tamanho: rest.tamanho,
          dataConstrucao: dateToUtcStartMs(rest.data_construcao),
          matricula: rest.matricula,
          inscricaoImobiliaria: rest.inscricao_imobiliaria,
          valorVenda: parsedValorVenda,
          quartos: rest.quartos,
          suites: rest.suites,
          banheiros: rest.banheiros,
          salasEstar: rest.salasEstar,
          cozinhas: rest.cozinhas,
          vagasGaragem: rest.vagasGaragem,
          areasServico: rest.areasServico,
          ruaPavimentada: rest.ruaPavimentada,
          garagem: rest.garagem,
          areaLavanderia: rest.areaLavanderia,
          portaria24h: rest.portaria24h,
          elevador: rest.elevador,
          piscina: rest.piscina,
          churrasqueira: rest.churrasqueira,
          academia: rest.academia,
          jardim: rest.jardim,
          varanda: rest.varanda
        } as any)
        try {
          await addPropertyImages({
            filesIds,
            propertyId: existingProperty._id
          })
        } catch (uploadErr) {
          console.error(uploadErr)
          toast.error(
            'Dados salvos, mas houve falha ao atualizar as fotos. Tente de novo no cadastro.'
          )
          router.push('/ofertante/dashboard')
          return
        }
        toast.success('Imóvel atualizado com sucesso')
        reset(emptyFormDefaults)
        router.push('/ofertante/dashboard')
        return
      }

      if (
        !PROPERTY_SALE_DOCUMENT_TIPOS.every((t) =>
          Boolean(stagedSaleDocFileIds[t])
        )
      ) {
        toast.error(
          'Envie os 5 documentos obrigatórios na última etapa (documentação para venda).'
        )
        return
      }

      const cepDigitsCreate = (rest.cep ?? '').replace(/\D/g, '')
      const cepArgCreate =
        cepDigitsCreate.length === 8 ? cepDigitsCreate : undefined
      const result = await createProperty({
        ofertanteId: user._id,
        titulo: rest.titulo,
        descricao: rest.descricao?.trim() ? rest.descricao : undefined,
        cep: cepArgCreate,
        endereco: rest.endereco,
        tamanho: rest.tamanho,
        dataConstrucao: dateToUtcStartMs(rest.data_construcao),
        matricula: rest.matricula,
        inscricaoImobiliaria: rest.inscricao_imobiliaria,
        valorVenda: parsedValorVenda,
        quartos: rest.quartos,
        suites: rest.suites,
        banheiros: rest.banheiros,
        salasEstar: rest.salasEstar,
        cozinhas: rest.cozinhas,
        vagasGaragem: rest.vagasGaragem,
        areasServico: rest.areasServico,
        ruaPavimentada: rest.ruaPavimentada,
        garagem: rest.garagem,
        areaLavanderia: rest.areaLavanderia,
        portaria24h: rest.portaria24h,
        elevador: rest.elevador,
        piscina: rest.piscina,
        churrasqueira: rest.churrasqueira,
        academia: rest.academia,
        jardim: rest.jardim,
        varanda: rest.varanda
      } as any)

      if (!result.success || !result.propertyId) {
        toast.error(
          result.errors?.join(' ') ?? 'Não foi possível criar o imóvel'
        )
        return
      }

      try {
        for (const tipo of PROPERTY_SALE_DOCUMENT_TIPOS) {
          const fileId = stagedSaleDocFileIds[tipo]
          if (!fileId) {
            throw new Error(`Documento ausente: ${tipo}`)
          }
          await attachPropertySaleDocumentFromUploadedFile({
            propertyId: result.propertyId,
            tipo,
            fileId
          })
        }
      } catch (uploadErr) {
        console.error(uploadErr)
        toast.error(
          'Imóvel salvo como rascunho, mas houve falha ao vincular a documentação. Abra o cadastro e tente de novo.'
        )
        router.push('/ofertante/dashboard')
        return
      }

      try {
        await addPropertyImages({
          filesIds,
          propertyId: result.propertyId
        })
      } catch (uploadErr) {
        console.error(uploadErr)
        toast.error(
          'Imóvel salvo como rascunho, mas houve falha ao enviar algumas fotos. Tente adicionar imagens depois.'
        )
        router.push('/ofertante/dashboard')
        return
      }

      toast.success('Imóvel cadastrado com sucesso')
      reset()
      setStagedSaleDocFileIds({})
      router.push('/ofertante/dashboard')
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    const current = form.getValues('filesIds') ?? []
    const room = MAX_PROPERTY_PHOTOS - current.length
    if (room <= 0) {
      toast.message(`Limite de ${MAX_PROPERTY_PHOTOS} fotos atingido`)
      return
    }
    const batch = files.slice(0, room)
    if (files.length > batch.length) {
      toast.message(`Só é possível adicionar mais ${room} foto(s)`)
    }
    for (const file of batch) {
      const r2key = await uploadFile(file)

      const fileId = await syncToFiles({
        r2Key: r2key,
        name: file.name,
        contentType: file.type,
        size: file.size
      })

      form.setValue('filesIds', [...(form.getValues('filesIds') ?? []), fileId])
    }
  }

  const handleDeleteFile = async (fileId: Id<'files'>) => {
    const prevIds = form.getValues('filesIds') ?? []
    const nextIds = prevIds.filter((id) => id !== fileId)
    form.setValue('filesIds', nextIds)
    try {
      await deletePropertyImage({ fileId })
      toast.success('Arquivo excluído com sucesso')
    } catch (e) {
      form.setValue('filesIds', prevIds)
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir arquivo')
    }
  }

  const ROOM_ICON_MAP = {
    quartos: <BedDouble className="size-5" />,
    suites: <Star className="size-5" />,
    banheiros: <Bath className="size-5" />,
    salasEstar: <Sofa className="size-5" />,
    cozinhas: <CookingPot className="size-5" />,
    vagasGaragem: <Car className="size-5" />,
    areasServico: <WashingMachine className="size-5" />
  } as const

  const AMENITY_ICON_MAP = {
    ruaPavimentada: <Wifi className="size-5" />,
    garagem: <Car className="size-5" />,
    areaLavanderia: <WashingMachine className="size-5" />,
    portaria24h: <Wifi className="size-5" />,
    elevador: <Building className="size-5" />,
    piscina: <Waves className="size-5" />,
    churrasqueira: <Flame className="size-5" />,
    academia: <Dumbbell className="size-5" />,
    jardim: <TreePine className="size-5" />,
    varanda: <Sun className="size-5" />
  } as const

  const stepsFields = [
    {
      fields: ['titulo', 'descricao', 'cep', 'endereco'] as const,
      component: (
        <>
          <Controller
            name="titulo"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="titulo">Título do imóvel *</FieldLabel>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="titulo"
                  type="text"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="Ex.: Apartamento 2 quartos — Centro"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="descricao"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
                <Textarea
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="descricao"
                  rows={3}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="Destaques do imóvel..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="cep"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="imovel-cep">CEP</FieldLabel>
                <div className="relative">
                  <Input
                    ref={mergeRefs(field.ref, cepInputRef)}
                    id="imovel-cep"
                    name={field.name}
                    onBlur={field.onBlur}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="00000-000"
                    aria-busy={isFetchingCEP}
                    aria-invalid={fieldState.invalid}
                    className="pe-10"
                  />
                  {isFetchingCEP && (
                    <Loader2
                      className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                      aria-hidden
                    />
                  )}
                </div>
                <FieldDescription>
                  Digite o CEP para preencher o endereço automaticamente
                  (ViaCEP). Ajuste o texto abaixo para incluir número e
                  complemento, se necessário.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="endereco"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="endereco">Endereço completo *</FieldLabel>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="endereco"
                  type="text"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="Rua, número, bairro, cidade — UF"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </>
      )
    },
    {
      fields: ['tamanho', 'data_construcao'] as const,
      component: (
        <>
          <div className="col-span-full space-y-1">
            <h3 className="text-sm font-semibold">Ambientes</h3>
            <p className="text-xs text-muted-foreground">
              Informe a quantidade de cada tipo de ambiente do imóvel
            </p>
          </div>
          {(
            [
              { key: 'quartos' as RoomType, icon: ROOM_ICON_MAP.quartos },
              { key: 'suites' as RoomType, icon: ROOM_ICON_MAP.suites },
              { key: 'banheiros' as RoomType, icon: ROOM_ICON_MAP.banheiros },
              { key: 'salasEstar' as RoomType, icon: ROOM_ICON_MAP.salasEstar },
              { key: 'cozinhas' as RoomType, icon: ROOM_ICON_MAP.cozinhas },
              {
                key: 'vagasGaragem' as RoomType,
                icon: ROOM_ICON_MAP.vagasGaragem
              },
              {
                key: 'areasServico' as RoomType,
                icon: ROOM_ICON_MAP.areasServico
              }
            ] as const
          ).map(({ key, icon }) => (
            <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => (
                <RoomCounter
                  icon={icon}
                  label={ROOM_COUNT_LIMITS[key].label}
                  value={field.value ?? 0}
                  min={ROOM_COUNT_LIMITS[key].min}
                  max={ROOM_COUNT_LIMITS[key].max}
                  onChange={field.onChange}
                />
              )}
            />
          ))}
          <div className="col-span-full space-y-1 pt-2">
            <h3 className="text-sm font-semibold">Acessórios e Instalações</h3>
            <p className="text-xs text-muted-foreground">
              Selecione as características disponíveis no imóvel
            </p>
          </div>
          {(
            [
              {
                key: 'ruaPavimentada' as AmenityType,
                icon: AMENITY_ICON_MAP.ruaPavimentada
              },
              { key: 'garagem' as AmenityType, icon: AMENITY_ICON_MAP.garagem },
              {
                key: 'areaLavanderia' as AmenityType,
                icon: AMENITY_ICON_MAP.areaLavanderia
              },
              {
                key: 'portaria24h' as AmenityType,
                icon: AMENITY_ICON_MAP.portaria24h
              },
              {
                key: 'elevador' as AmenityType,
                icon: AMENITY_ICON_MAP.elevador
              },
              { key: 'piscina' as AmenityType, icon: AMENITY_ICON_MAP.piscina },
              {
                key: 'churrasqueira' as AmenityType,
                icon: AMENITY_ICON_MAP.churrasqueira
              },
              {
                key: 'academia' as AmenityType,
                icon: AMENITY_ICON_MAP.academia
              },
              { key: 'jardim' as AmenityType, icon: AMENITY_ICON_MAP.jardim },
              { key: 'varanda' as AmenityType, icon: AMENITY_ICON_MAP.varanda }
            ] as const
          ).map(({ key, icon }) => (
            <Controller
              key={key}
              name={key}
              control={control}
              render={({ field }) => (
                <AmenityToggle
                  icon={icon}
                  label={AMENITY_CONFIG[key].label}
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          ))}
          <Controller
            name="tamanho"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="tamanho">Tamanho (m²) *</FieldLabel>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="tamanho"
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  min={0}
                  step={0.01}
                  value={
                    field.value === undefined || field.value === null
                      ? ''
                      : field.value
                  }
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="Área em metros quadrados"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="data_construcao"
            control={control}
            render={({ field, fieldState }) => {
              const selectedDate = toValidDate(field.value)
              return (
                <Field
                  data-invalid={fieldState.invalid}
                  className="col-span-full"
                >
                  <FieldLabel>Data da construção *</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <Button
                          type="button"
                          variant="outline"
                          id="data_construcao"
                          className={cn(
                            'w-full justify-start text-start font-normal active:scale-none',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="size-4 shrink-0" />
                          {selectedDate ? (
                            <span>
                              {format(selectedDate, 'dd/MM/yyyy', {
                                locale: ptBR
                              })}
                            </span>
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                        {selectedDate && fieldState.isDirty && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute inset-e-1 top-1/2 -translate-y-1/2 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              form.resetField('data_construcao', {
                                defaultValue: undefined
                              })
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => {
                          if (!d || !isValid(d)) return
                          const now = new Date()
                          const boundary = subYears(now, 20)
                          const clamped =
                            d > now ? now : d < boundary ? boundary : d
                          form.setValue('data_construcao', clamped, {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                          if (d > now || d < boundary) {
                            toast.info(
                              'Data ajustada para limite válido (20 anos atrás ou hoje)'
                            )
                          }
                        }}
                        locale={ptBR}
                        defaultMonth={selectedDate ?? new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }}
          />
        </>
      )
    },
    {
      fields: ['matricula', 'inscricao_imobiliaria', 'valor_venda'] as const,
      component: (
        <>
          <Controller
            name="matricula"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="matricula">
                  Matrícula do imóvel *
                </FieldLabel>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="matricula"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="Número da matrícula"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="inscricao_imobiliaria"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="inscricao_imobiliaria">
                  Inscrição imobiliária
                </FieldLabel>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="inscricao_imobiliaria"
                  type="text"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="Número da inscrição"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="valor_venda"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="valor_venda">Valor de venda *</FieldLabel>
                <Input
                  ref={mergeRefs(field.ref, valorVendaMaskRef)}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="valor_venda"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  placeholder="R$ 0,00"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </>
      )
    },
    {
      fields: ['filesIds'] as const,
      component: (
        <Controller
          name="filesIds"
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel>Fotos do imóvel *</FieldLabel>
              <FieldDescription>
                PNG, JPEG ou GIF. Até {MAX_PROPERTY_PHOTOS} imagens, máx.{' '}
                {MAX_PHOTO_BYTES / (1024 * 1024)} MB cada. A primeira foto é a
                capa do anúncio; arraste as miniaturas para reordenar.
              </FieldDescription>
              <R2FileUploader
                multiple={true}
                filesIds={field.value}
                totalFileSlots={MAX_PROPERTY_PHOTOS}
                perPickMaxFiles={MAX_PROPERTY_PHOTOS}
                reorderable
                onReorderIds={(ids) => field.onChange(ids)}
                handleUploadFiles={handleUploadFiles}
                handleDeleteFile={handleDeleteFile}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )
    },
    {
      fields: [] as const,
      component: (
        <div className="col-span-full flex flex-col gap-4">
          <Field className="gap-1">
            <FieldLabel>Documentação para venda *</FieldLabel>
            <FieldDescription>
              Arquivos obrigatórios para análise do programa. A certidão de
              matrícula aqui é o arquivo (PDF ou imagem), não apenas o número
              informado na etapa anterior.
            </FieldDescription>
          </Field>
          {PROPERTY_SALE_DOCUMENT_ITEMS.map((item) => (
            <PropertySaleDocumentRow
              key={item.tipo}
              tipo={item.tipo}
              title={item.title}
              description={item.description}
              propertyId={isEdit && propertyIdParam ? propertyIdParam : null}
              fileId={
                isEdit
                  ? (saleDocFileIds?.[item.tipo] ?? null)
                  : stagedSaleDocFileIds[item.tipo]
              }
              mode={isEdit ? 'edit' : 'create'}
              uploadFile={uploadFile}
              syncToFiles={syncToFiles}
              completeSaleDoc={completePropertySaleDocumentFromUpload}
              deleteSaleDoc={deletePropertySaleDocumentByFileId}
              deleteOrphanFile={deletePropertyImage}
              onStagedChange={(t, id) => {
                setStagedSaleDocFileIds((prev) => {
                  const next = { ...prev }
                  if (id === undefined) {
                    delete next[t]
                  } else {
                    next[t] = id
                  }
                  return next
                })
              }}
            />
          ))}
        </div>
      )
    }
  ]

  if (isLoading || !isAuthenticated || !user?.onboardingCompleto) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isEdit && existingProperty === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isEdit && existingProperty === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-muted-foreground">
          Imóvel não encontrado ou você não tem permissão para editá-lo.
        </p>
        <Button asChild>
          <Link href="/ofertante/dashboard">Voltar ao painel</Link>
        </Button>
      </div>
    )
  }

  const canEdit =
    !isEdit ||
    existingProperty?.status === 'draft' ||
    existingProperty?.status === 'rejected'

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 py-6 px-4 sm:py-10">
        <div className="container mx-auto max-w-lg sm:max-w-xl">
          <Button variant="ghost" asChild className="mb-4 -ms-2">
            <Link href="/ofertante/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Voltar ao painel
            </Link>
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isEdit ? 'Editar imóvel' : 'Novo imóvel'}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {isEdit && !canEdit ? (
                <>
                  Este imóvel está em análise ou já foi aprovado; os dados não
                  podem ser alterados por aqui.
                </>
              ) : (
                <>Preencha em etapas. Campos marcados com * são obrigatórios.</>
              )}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col rounded-lg border bg-card p-4 sm:p-6 shadow-sm gap-4"
          >
            {canEdit ? (
              <MultiStepFormProvider
                stepsFields={[...stepsFields]}
                onStepValidation={async (step) => {
                  if (step.fields.length === 0) return true
                  return form.trigger(step.fields as never)
                }}
              >
                <MultiStepFormContent>
                  <FormHeader />
                  <StepFields />
                  <FormFooter className="border-t pt-4 mt-2">
                    <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-between sm:items-center">
                      <PreviousButton>
                        <ChevronLeft className="size-4" />
                        Anterior
                      </PreviousButton>
                      <div className="flex flex-col gap-3 w-full sm:flex-row sm:ms-auto sm:w-auto">
                        <NextButton>
                          Próximo
                          <ChevronRight className="size-4" />
                        </NextButton>
                        <SubmitButton
                          type="submit"
                          disabled={submitting}
                          className="bg-primary"
                        >
                          {submitting
                            ? 'Salvando…'
                            : isEdit
                              ? 'Salvar alterações'
                              : 'Salvar imóvel'}
                        </SubmitButton>
                      </div>
                    </div>
                  </FormFooter>
                </MultiStepFormContent>
              </MultiStepFormProvider>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Use o painel para acompanhar o status ou o anúncio público, se
                já aprovado.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NovoImovelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ImovelCadastroPageInner />
    </Suspense>
  )
}
