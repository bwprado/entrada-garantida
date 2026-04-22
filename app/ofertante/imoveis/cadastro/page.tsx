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
import { MultiStepFormProvider } from '@/hooks/use-multi-step-viewer'
import { useAuth } from '@/lib/auth-context'
import {
  brlCurrencyMaskOptions,
  cepMaskOptions,
  formatBrlCurrency,
  parseBrlCurrency
} from '@/lib/masks'
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
import { format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import { Id } from '@/convex/_generated/dataModel'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_PHOTOS = 5

function toValidDate(value: unknown): Date | undefined {
  if (value == null || value === '') return undefined
  if (value instanceof Date) return isValid(value) ? value : undefined
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return isValid(d) ? d : undefined
  }
  return undefined
}

function dateToUtcStartMs(d: Date): number {
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
  compartimentos: 1,
  filesIds: []
} as DefaultValues<PropertyOfertanteFormValues>

function ImovelCadastroPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyIdParam = searchParams.get('propertyId') as
    | Id<'properties'>
    | null
  const isEdit = Boolean(propertyIdParam)

  const { user, isAuthenticated, isLoading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [isFetchingCEP, setIsFetchingCEP] = useState(false)

  const existingProperty = useQuery(
    api.properties.getByIdForOwner,
    propertyIdParam ? { id: propertyIdParam } : 'skip'
  )

  const createProperty = useMutation(api.properties.create)
  const updateProperty = useMutation(api.properties.update)
  const addPropertyImages = useMutation(api.documents.addPropertyImages)
  const deletePropertyImage = useMutation(
    api.documents.deletePropertyImage
  ).withOptimisticUpdate((localStore, args) => {
    const currentFiles = localStore.getQuery(api.r2.getFileUrlAndMetadata, {
      fileIds: form.getValues('filesIds') ?? []
    })
    if (currentFiles !== undefined) {
      localStore.setQuery(
        api.r2.getFileUrlAndMetadata,
        { fileIds: form.getValues('filesIds') ?? [] },
        currentFiles.filter((file) => file._id !== args.fileId)
      )
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
      return
    }
    if (!existingProperty) return
    reset({
      titulo: existingProperty.titulo,
      descricao: existingProperty.descricao ?? '',
      cep: formatCepForInput(existingProperty.cep),
      endereco: existingProperty.endereco,
      compartimentos: existingProperty.compartimentos,
      tamanho: existingProperty.tamanho,
      data_construcao: new Date(existingProperty.dataConstrucao),
      matricula: existingProperty.matricula,
      inscricao_imobiliaria: existingProperty.inscricaoImobiliaria,
      valor_venda: existingProperty.valorVenda,
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

    try {
      if (isEdit && propertyIdParam) {
        if (existingProperty && existingProperty.status !== 'draft') {
          toast.error('Apenas imóveis em rascunho podem ser editados.')
          return
        }
        if (!existingProperty) {
          toast.error('Imóvel não encontrado.')
          return
        }
        await updateProperty({
          propertyId: existingProperty._id,
          titulo: rest.titulo,
          descricao: rest.descricao?.trim() ? rest.descricao : undefined,
          cep: rest.cep ?? '',
          endereco: rest.endereco,
          compartimentos: rest.compartimentos,
          tamanho: rest.tamanho,
          dataConstrucao: dateToUtcStartMs(rest.data_construcao),
          matricula: rest.matricula,
          inscricaoImobiliaria: rest.inscricao_imobiliaria,
          valorVenda: rest.valor_venda
        })
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

      const cepDigitsCreate = (rest.cep ?? '').replace(/\D/g, '')
      const cepArgCreate =
        cepDigitsCreate.length === 8 ? cepDigitsCreate : undefined
      const result = await createProperty({
        ofertanteId: user._id,
        titulo: rest.titulo,
        descricao: rest.descricao?.trim() ? rest.descricao : undefined,
        cep: cepArgCreate,
        endereco: rest.endereco,
        compartimentos: rest.compartimentos,
        tamanho: rest.tamanho,
        dataConstrucao: dateToUtcStartMs(rest.data_construcao),
        matricula: rest.matricula,
        inscricaoImobiliaria: rest.inscricao_imobiliaria,
        valorVenda: rest.valor_venda
      })

      if (!result.success || !result.propertyId) {
        toast.error(
          result.errors?.join(' ') ?? 'Não foi possível criar o imóvel'
        )
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
      router.push('/ofertante/dashboard')
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    for (const file of files) {
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
    await deletePropertyImage({ fileId })
    form.setValue(
      'filesIds',
      form.getValues('filesIds')?.filter((id) => id !== fileId) ?? []
    )
    toast.success('Arquivo excluído com sucesso')
  }

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
      fields: ['compartimentos', 'tamanho', 'data_construcao'] as const,
      component: (
        <>
          <Controller
            name="compartimentos"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1 col-span-full"
              >
                <FieldLabel htmlFor="compartimentos">
                  Quantidade de compartimentos *
                </FieldLabel>
                <Input
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  id="compartimentos"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  min={1}
                  step={1}
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
                  placeholder="Total de ambientes (quartos, salas, cozinha...)"
                />
                <FieldDescription>
                  Soma de todos os compartimentos do imóvel (quartos, salas,
                  cozinhas, etc.).
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
                            className="absolute end-1 top-1/2 -translate-y-1/2 rounded-full"
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
                          if (d && isValid(d)) {
                            form.setValue('data_construcao', d, {
                              shouldDirty: true,
                              shouldValidate: true
                            })
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
                  Inscrição imobiliária *
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
                  value={
                    field.value !== undefined &&
                    field.value !== null &&
                    !Number.isNaN(field.value)
                      ? formatBrlCurrency(field.value)
                      : ''
                  }
                  onChange={(e) => {
                    const n = parseBrlCurrency(e.target.value)
                    field.onChange(
                      n === undefined || Number.isNaN(n) ? undefined : n
                    )
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="R$ 0,00"
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
                PNG, JPEG ou GIF. Até {MAX_PHOTOS} imagens, máx.{' '}
                {MAX_PHOTO_BYTES / (1024 * 1024)} MB cada.
              </FieldDescription>
              <R2FileUploader
                multiple={true}
                filesIds={field.value}
                handleUploadFiles={handleUploadFiles}
                handleDeleteFile={handleDeleteFile}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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

  const canEdit = !isEdit || existingProperty?.status === 'draft'

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
                  Este imóvel não está em rascunho; os dados não podem ser
                  alterados por aqui.
                </>
              ) : (
                <>
                  Preencha em etapas. Campos marcados com * são obrigatórios.
                </>
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
                onStepValidation={async (step) =>
                  form.trigger(step.fields as never)
                }
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
