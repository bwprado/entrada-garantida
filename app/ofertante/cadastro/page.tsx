'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMaskito } from '@maskito/react'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  ShieldCheck,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  FormFooter,
  FormHeader,
  MultiStepFormContent,
  NextButton,
  PreviousButton
} from '@/components/multi-step-viewer'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  MultiStepFormProvider,
  useMultiStepForm,
  type StepFieldConfig
} from '@/hooks/use-multi-step-viewer'
import { useConvexAuth } from 'convex/react'

import { useAuth } from '@/lib/auth-context'
import { parseDataNascimentoBrParaIso } from '@/lib/date-br'
import {
  cepMaskOptions,
  cpfMaskOptions,
  dataNascimentoBrMaskOptions,
  phoneMaskOptions
} from '@/lib/masks'
import {
  estadoCivilLabels,
  ofertanteCadastroSchema,
  ofertanteCadastroStep1Fields,
  ofertanteCadastroStep2Fields,
  onlyDigits,
  otpVerifySchema,
  type OfertanteCadastroFormValues
} from '@/lib/schemas/ofertante-cadastro'
import { mergeRefs } from '@/lib/utils'

function CadastroFooter({
  otpSent,
  submitting,
  onSendCode,
  onVerify
}: {
  otpSent: boolean
  submitting: boolean
  onSendCode: () => void
  onVerify: () => void
}) {
  const { isLast, isFirst } = useMultiStepForm()

  if (!isLast) {
    return (
      <FormFooter className="border-t pt-4 mt-2">
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-between sm:items-center">
          <PreviousButton>
            <ChevronLeft className="size-4" />
            Anterior
          </PreviousButton>
          <NextButton>
            Próximo
            <ChevronRight className="size-4" />
          </NextButton>
        </div>
      </FormFooter>
    )
  }

  return (
    <FormFooter className="border-t pt-4 mt-2">
      <div className="flex w-full flex-col gap-3">
        {!isFirst && (
          <PreviousButton className="w-full sm:w-auto">
            <ChevronLeft className="size-4" />
            Anterior
          </PreviousButton>
        )}
        {!otpSent ? (
          <Button
            type="button"
            className="w-full sm:ms-auto sm:w-auto"
            disabled={submitting}
            onClick={() => void onSendCode()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              'Criar cadastro e enviar código'
            )}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full sm:ms-auto sm:w-auto"
            disabled={submitting}
            onClick={() => void onVerify()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verificando…
              </>
            ) : (
              'Verificar e concluir'
            )}
          </Button>
        )}
      </div>
    </FormFooter>
  )
}

function OtpSentReset({ setOtpSent }: { setOtpSent: (v: boolean) => void }) {
  const { currentStep, totalSteps } = useMultiStepForm()
  useEffect(() => {
    if (currentStep < totalSteps - 1) setOtpSent(false)
  }, [currentStep, totalSteps, setOtpSent])
  return null
}

export default function OfertanteCadastroPage() {
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()
  const {
    registerOfertante,
    startPhoneSignIn,
    completePhoneSignIn,
    completeOnboarding
  } = useAuth()

  const [otpSent, setOtpSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [otpValue, setOtpValue] = useState('')

  // Ref to track current auth state for async operations
  const isAuthenticatedRef = useRef(isAuthenticated)
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  // Wait for auth state to propagate after signIn
  const waitForAuth = useCallback(async (maxWaitMs = 3000): Promise<boolean> => {
    if (isAuthenticatedRef.current) return true
    
    const start = Date.now()
    const checkInterval = 100
    
    while (Date.now() - start < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))
      if (isAuthenticatedRef.current) return true
    }
    
    return false
  }, [])

  const form = useForm<OfertanteCadastroFormValues>({
    resolver: zodResolver(ofertanteCadastroSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      telefone: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      profissao: '',
      estadoCivil: undefined,
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: 'MA'
    }
  })

  const { control, trigger, getValues } = form

  const phoneInputRef = useMaskito({ options: phoneMaskOptions })
  const cpfInputRef = useMaskito({ options: cpfMaskOptions })
  const cepInputRef = useMaskito({ options: cepMaskOptions })
  const dataNascimentoInputRef = useMaskito({
    options: dataNascimentoBrMaskOptions
  })

  const stepsFields = useMemo(
    (): StepFieldConfig[] => [
      {
        fields: [...ofertanteCadastroStep1Fields],
        component: (
          <>
            <Controller
              name="nome"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="nome">Nome completo *</FieldLabel>
                  <Input
                    id="nome"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="telefone"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="telefone">Celular *</FieldLabel>
                  <Input
                    ref={mergeRefs(field.ref, phoneInputRef)}
                    id="telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(98) 90000-0000"
                    aria-invalid={fieldState.invalid}
                    name={field.name}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Usado para login e verificação por SMS.
                  </FieldDescription>
                </Field>
              )}
            />
          </>
        )
      },
      {
        fields: [...ofertanteCadastroStep2Fields],
        component: (
          <>
            <Controller
              name="cpf"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="cpf">CPF *</FieldLabel>
                  <Input
                    ref={mergeRefs(field.ref, cpfInputRef)}
                    id="cpf"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    aria-invalid={fieldState.invalid}
                    name={field.name}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="rg"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="rg">RG *</FieldLabel>
                  <Input
                    id="rg"
                    autoComplete="off"
                    placeholder="Número do RG"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="dataNascimento"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="dataNascimento">
                    Data de nascimento *
                  </FieldLabel>
                  <Input
                    ref={mergeRefs(field.ref, dataNascimentoInputRef)}
                    id="dataNascimento"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday"
                    placeholder="DD/MM/AAAA"
                    aria-invalid={fieldState.invalid}
                    name={field.name}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                  <FieldDescription>
                    Formato DD/MM/AAAA (dia-mês-ano).
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="profissao"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="profissao">Profissão *</FieldLabel>
                  <Input
                    id="profissao"
                    autoComplete="organization-title"
                    placeholder="Sua profissão"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="estadoCivil"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel>Estado civil *</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="estadoCivil"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(estadoCivilLabels) as [
                          keyof typeof estadoCivilLabels,
                          string
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FieldLabel htmlFor="cep">CEP *</FieldLabel>
                  <Input
                    ref={mergeRefs(field.ref, cepInputRef)}
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    aria-invalid={fieldState.invalid}
                    name={field.name}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
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
                  <FieldLabel htmlFor="endereco">Logradouro *</FieldLabel>
                  <Input
                    id="endereco"
                    autoComplete="street-address"
                    placeholder="Rua, avenida…"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="numero"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="numero">Número *</FieldLabel>
                    <Input
                      id="numero"
                      autoComplete="off"
                      placeholder="Nº"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="complemento"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                    <Input
                      id="complemento"
                      autoComplete="off"
                      placeholder="Apto, bloco…"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="bairro"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="gap-1 col-span-full"
                >
                  <FieldLabel htmlFor="bairro">Bairro *</FieldLabel>
                  <Input
                    id="bairro"
                    autoComplete="off"
                    placeholder="Bairro"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="cidade"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="cidade">Cidade *</FieldLabel>
                    <Input
                      id="cidade"
                      autoComplete="address-level2"
                      placeholder="Cidade"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="estado"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor="estado">UF *</FieldLabel>
                    <Input
                      id="estado"
                      autoComplete="off"
                      maxLength={2}
                      placeholder="MA"
                      className="uppercase"
                      aria-invalid={fieldState.invalid}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </>
        )
      },
      {
        fields: [],
        component: (
          <div className="space-y-4">
            <Field className="gap-1">
              <FieldLabel>Verificação por SMS</FieldLabel>
              <FieldDescription>
                {otpSent
                  ? 'Digite o código de 6 dígitos enviado ao seu celular.'
                  : 'Na próxima etapa, criaremos seu cadastro e enviaremos um código por SMS para confirmar o número.'}
              </FieldDescription>
            </Field>
            {otpSent && (
              <Field className="gap-1 items-center">
                <FieldLabel htmlFor="otp">Código SMS *</FieldLabel>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={otpValue}
                  onChange={setOtpValue}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {otpValue.length !== 6 && otpValue.length > 0 && (
                  <FieldError errors={['O código deve ter 6 dígitos']} />
                )}
              </Field>
            )}
          </div>
        )
      }
    ],
    [
      control,
      cepInputRef,
      cpfInputRef,
      phoneInputRef,
      dataNascimentoInputRef,
      otpSent,
      otpValue
    ]
  )

  async function handleSendCode() {
    const ok = await trigger([...ofertanteCadastroStep1Fields])
    if (!ok) {
      toast.error('Corrija os dados da primeira etapa.')
      return
    }
    const ok2 = await trigger([...ofertanteCadastroStep2Fields])
    if (!ok2) {
      toast.error('Corrija os dados da segunda etapa.')
      return
    }

    setSubmitting(true)
    const nome = getValues('nome')
    const telefone = getValues('telefone')

    const reg = await registerOfertante(telefone, nome)
    if (!reg.success) {
      toast.error(reg.error ?? 'Não foi possível cadastrar')
      setSubmitting(false)
      return
    }

    const otpResult = await startPhoneSignIn(telefone, 'ofertante')
    if (!otpResult.success) {
      toast.error(otpResult.error ?? 'Erro ao enviar código')
      setSubmitting(false)
      return
    }

    setOtpSent(true)
    toast.success('Código enviado por SMS.')
    setSubmitting(false)
  }

  async function handleVerify() {
    const parsed = otpVerifySchema.safeParse({ otp: otpValue })
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors.otp?.[0]
      toast.error(first ?? 'Código inválido')
      return
    }

    setSubmitting(true)
    const telefone = getValues('telefone')
    const signInResult = await completePhoneSignIn(
      telefone,
      parsed.data.otp,
      'ofertante'
    )
    if (!signInResult.success) {
      console.log('meu erro é aqui 2', signInResult.error)
      toast.error(signInResult.error ?? 'Código inválido')
      setSubmitting(false)
      return
    }

    // Wait for auth state to propagate before calling mutations
    const authReady = await waitForAuth()
    if (!authReady) {
      toast.error('Erro de autenticação. Por favor, tente novamente.')
      setSubmitting(false)
      return
    }

    const v = getValues()
    const ec = v.estadoCivil
    if (ec === undefined) {
      toast.error('Estado civil inválido')
      setSubmitting(false)
      return
    }

    const dataIso = parseDataNascimentoBrParaIso(v.dataNascimento)
    if (!dataIso) {
      toast.error('Data de nascimento inválida')
      setSubmitting(false)
      return
    }

    const ob = await completeOnboarding({
      nome: v.nome,
      cpf: onlyDigits(v.cpf),
      dataNascimento: dataIso,
      rg: v.rg.trim(),
      profissao: v.profissao.trim(),
      estadoCivil: ec,
      cep: onlyDigits(v.cep),
      endereco: v.endereco.trim(),
      numero: v.numero.trim(),
      complemento: v.complemento?.trim() || undefined,
      bairro: v.bairro.trim(),
      cidade: v.cidade.trim(),
      estado: v.estado.trim()
    })

    if (!ob.success) {
      toast.error(ob.error ?? 'Erro ao salvar dados')
      setSubmitting(false)
      return
    }

    toast.success('Cadastro concluído')
    router.replace('/ofertante/dashboard')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 py-6 px-4 sm:py-10">
        <div className="container mx-auto max-w-lg sm:max-w-xl">
          <Button variant="ghost" asChild className="mb-4 -ms-2">
            <Link href="/">
              <ChevronLeft className="mr-2 size-4" />
              Voltar para o início
            </Link>
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Cadastro de ofertante
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Preencha em etapas. Campos marcados com * são obrigatórios.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
            className="flex flex-col rounded-lg border bg-card p-4 sm:p-6 shadow-sm gap-4"
          >
            <MultiStepFormProvider
              stepsFields={stepsFields}
              onStepValidation={async (step) => {
                if (step.fields.length === 0) return true
                return form.trigger(step.fields as never)
              }}
            >
              <OtpSentReset setOtpSent={setOtpSent} />
              <MultiStepFormContent>
                <FormHeader />
                <StepFieldsWithIcon />
                <CadastroFooter
                  otpSent={otpSent}
                  submitting={submitting}
                  onSendCode={handleSendCode}
                  onVerify={handleVerify}
                />
              </MultiStepFormContent>
            </MultiStepFormProvider>
          </form>
        </div>
      </div>
    </div>
  )
}

function StepFieldsWithIcon() {
  const { currentStep, stepsFields } = useMultiStepForm()
  const step = stepsFields[currentStep]
  if (!step) return null

  const icons = [
    <User key="u" className="size-5 text-primary shrink-0" />,
    <ShieldCheck key="s" className="size-5 text-primary shrink-0" />,
    <Phone key="p" className="size-5 text-primary shrink-0" />
  ]

  const titles = ['Nome e celular', 'Dados pessoais e endereço', 'Verificação']

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icons[currentStep] ?? icons[0]}
        <span className="font-medium">{titles[currentStep] ?? 'Etapa'}</span>
      </div>
      <div key={currentStep} className="grid grid-cols-1 gap-4">
        {step.component}
      </div>
    </div>
  )
}
