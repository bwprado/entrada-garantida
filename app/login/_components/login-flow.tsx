'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { Textarea } from '@/components/ui/textarea'
import { useAuth, type LoginPersona } from '@/lib/auth-context'
import { cpfMaskOptions, phoneMaskOptions } from '@/lib/masks'
import { normalizePhone } from '@/lib/normalize-phone'
import { mergeRefs } from '@/lib/utils'
import { useMaskito } from '@maskito/react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Phone,
  Shield,
  User
} from 'lucide-react'
import { api } from '@/convex/_generated/api'
import { useConvex } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useForm, type FieldPath, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import Image from 'next/image'

type Step =
  | 'phone'
  | 'otp'
  | 'register'
  | 'data-validation'
  | 'data-error'
  | 'secid-contact'
  | 'terms'
const digits = (s: string) => s.replace(/\D/g, '')

export type LoginFlowProps = {
  variant: LoginPersona
  /** e.g. `/login` — show "Outros tipos de acesso" when set */
  hubHref?: string
}

const phoneRequestBeneficiarySchema = z.object({
  cpf: z.string().refine((v) => digits(v).length === 11, 'CPF inválido'),
  telefone: z
    .string()
    .refine(
      (v) => digits(v).length >= 10 && digits(v).length <= 11,
      'Celular inválido'
    )
})

const phoneRequestPhoneOnlySchema = z.object({
  telefone: z
    .string()
    .refine(
      (v) => digits(v).length >= 10 && digits(v).length <= 11,
      'Celular inválido'
    )
})

const registerOfertanteSchema = z.object({
  nome: z.string().trim().min(3, 'Informe seu nome completo')
})

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Digite os 6 dígitos do código')
    .regex(/^\d+$/, 'Use apenas números')
})

const reportDataErrorSchema = z.object({
  mensagemErro: z
    .string()
    .trim()
    .min(1, 'Descreva qual informação está incorreta')
})

const loginFormValuesSchema = z.object({
  cpf: z.string(),
  telefone: z.string(),
  nome: z.string(),
  otp: z.string(),
  mensagemErro: z.string()
})

type LoginFormValues = z.infer<typeof loginFormValuesSchema>

const loginFormKeys: (keyof LoginFormValues)[] = [
  'cpf',
  'telefone',
  'nome',
  'otp',
  'mensagemErro'
]

function applyZodErrors(
  form: UseFormReturn<LoginFormValues>,
  zodError: z.ZodError
) {
  for (const issue of zodError.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && (loginFormKeys as string[]).includes(key)) {
      form.setError(key as FieldPath<LoginFormValues>, {
        message: issue.message
      })
    }
  }
}

export function LoginFlow({ variant, hubHref }: LoginFlowProps) {
  const router = useRouter()
  const convex = useConvex()
  const {
    user,
    assertBeneficiaryAndPrepareOtp,
    startPhoneSignIn,
    completePhoneSignIn,
    registerOfertante: registerOfertanteFn,
    acceptTerms,
    confirmData,
    reportDataError
  } = useAuth()

  const [step, setStep] = useState<Step>('phone')
  const [telefoneMascarado, setTelefoneMascarado] = useState('')
  const [beneficiaryPhoneE164, setBeneficiaryPhoneE164] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null)

  const form = useForm<LoginFormValues>({
    defaultValues: {
      cpf: '',
      telefone: '',
      nome: '',
      otp: '',
      mensagemErro: ''
    },
    mode: 'onSubmit'
  })

  const otpWatch = form.watch('otp')

  const cpfInputRef = useMaskito({ options: cpfMaskOptions })
  const phoneInputRef = useMaskito({ options: phoneMaskOptions })

  // Beneficiário: after session loads from phone/otp, advance to the right step
  useEffect(() => {
    if (!user || user.role !== 'beneficiary' || variant !== 'beneficiary')
      return
    if (step !== 'phone' && step !== 'otp') return

    setUserData(user as Record<string, unknown>)
    if (user.dadosComErro) {
      setStep('secid-contact')
      return
    }
    if (!user.dadosValidados) {
      setStep('data-validation')
      return
    }
    if (!user.termoAceitoEm) {
      setStep('terms')
      return
    }
    redirectToDashboard('beneficiary')
  }, [user, step, variant])

  // Ofertante / Admin: redirect when already signed in on this flow
  useEffect(() => {
    if (!user || variant === 'beneficiary') return
    if (variant === 'ofertante' && user.role === 'ofertante') {
      if (!user.onboardingCompleto) {
        router.replace('/ofertante/onboarding')
      } else {
        router.replace('/ofertante/dashboard')
      }
      return
    }
    if (variant === 'admin' && user.role === 'admin') {
      router.replace('/admin/dashboard')
      return
    }
    if (
      (variant === 'ofertante' && user.role !== 'ofertante') ||
      (variant === 'admin' && user.role !== 'admin')
    ) {
      setError('Este acesso não corresponde ao seu perfil cadastrado.')
    }
  }, [user, variant, router])

  // Countdown for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'beneficiary':
        router.push('/beneficiario/dashboard')
        break
      case 'ofertante':
        router.push('/ofertante/dashboard')
        break
      case 'construtor':
        router.push('/construtor/dashboard')
        break
      default:
        router.push('/')
    }
  }

  const handleRequestOTP = async () => {
    setIsLoading(true)
    setError('')
    form.clearErrors()
    const values = form.getValues()

    if (variant === 'beneficiary') {
      const parsed = phoneRequestBeneficiarySchema.safeParse({
        cpf: values.cpf,
        telefone: values.telefone
      })
      if (!parsed.success) {
        applyZodErrors(form, parsed.error)
        setIsLoading(false)
        return
      }
      const assert = await assertBeneficiaryAndPrepareOtp(
        parsed.data.cpf,
        parsed.data.telefone
      )
      if (!assert.success || !assert.phoneE164) {
        setError(assert.error ?? 'Não foi possível validar seus dados')
        if (
          assert.error?.includes('não corresponde') ||
          assert.error?.includes('atualizar')
        ) {
          setStep('secid-contact')
        }
        setIsLoading(false)
        return
      }
      setBeneficiaryPhoneE164(assert.phoneE164)
      const otp = await startPhoneSignIn(assert.phoneE164, 'beneficiary')
      if (otp.success) {
        setTelefoneMascarado(otp.telefoneMascarado ?? '')
        setStep('otp')
        setCountdown(60)
      } else {
        setError(otp.error ?? 'Erro ao enviar código')
      }
      setIsLoading(false)
      return
    }

    if (variant === 'ofertante') {
      const parsed = phoneRequestPhoneOnlySchema.safeParse({
        telefone: values.telefone
      })
      if (!parsed.success) {
        applyZodErrors(form, parsed.error)
        setIsLoading(false)
        return
      }
      const info = await convex.query(api.users.getLoginInfoByTelefone, {
        telefone: values.telefone
      })
      if (!info.ok) {
        setError('Telefone inválido')
        setIsLoading(false)
        return
      }
      if (!info.exists) {
        const n = normalizePhone(values.telefone)
        setTelefoneMascarado(n.isValid() ? n.display() : values.telefone)
        setStep('register')
        setIsLoading(false)
        return
      }
      if (info.role !== 'ofertante') {
        setError(
          'Este telefone já está cadastrado para outro tipo de usuário. Use o login correspondente.'
        )
        setIsLoading(false)
        return
      }
      const otp = await startPhoneSignIn(values.telefone, 'ofertante')
      if (otp.success) {
        setTelefoneMascarado(otp.telefoneMascarado ?? '')
        setStep('otp')
        setCountdown(60)
      } else {
        setError(otp.error ?? 'Erro ao enviar código')
      }
      setIsLoading(false)
      return
    }

    // admin
    const parsed = phoneRequestPhoneOnlySchema.safeParse({
      telefone: values.telefone
    })
    if (!parsed.success) {
      applyZodErrors(form, parsed.error)
      setIsLoading(false)
      return
    }
    const otp = await startPhoneSignIn(values.telefone, 'admin')
    if (otp.success) {
      setTelefoneMascarado(otp.telefoneMascarado ?? '')
      setStep('otp')
      setCountdown(60)
    } else {
      setError(otp.error ?? 'Erro ao enviar código')
    }
    setIsLoading(false)
  }

  const handleRegisterOfertante = async () => {
    setIsLoading(true)
    setError('')
    form.clearErrors()

    const values = form.getValues()
    const parsed = registerOfertanteSchema.safeParse({ nome: values.nome })
    if (!parsed.success) {
      applyZodErrors(form, parsed.error)
      setIsLoading(false)
      return
    }

    const result = await registerOfertanteFn(values.telefone, parsed.data.nome)
    if (result.success) {
      const otpResult = await startPhoneSignIn(values.telefone, 'ofertante')
      if (otpResult.success) {
        setTelefoneMascarado(otpResult.telefoneMascarado || '')
        setStep('otp')
        setCountdown(60)
      } else {
        setError(otpResult.error || 'Erro ao enviar código')
      }
    } else {
      setError(result.error || 'Erro ao cadastrar')
    }

    setIsLoading(false)
  }

  const handleVerifyOTP = async () => {
    setIsLoading(true)
    setError('')
    form.clearErrors()

    const values = form.getValues()
    const parsed = otpSchema.safeParse({ otp: values.otp })
    if (!parsed.success) {
      applyZodErrors(form, parsed.error)
      setIsLoading(false)
      return
    }

    if (variant === 'beneficiary') {
      const phone =
        beneficiaryPhoneE164 ||
        (() => {
          const n = normalizePhone(values.telefone)
          return n.isValid() ? n.save() : ''
        })()
      if (!phone) {
        setError('Telefone inválido. Solicite um novo código.')
        setIsLoading(false)
        return
      }
      const result = await completePhoneSignIn(
        phone,
        parsed.data.otp,
        'beneficiary'
      )
      if (!result.success) {
        setError(result.error || 'Código inválido')
      }
      // Next steps: useEffect when user loads
    } else if (variant === 'ofertante') {
      const result = await completePhoneSignIn(
        values.telefone,
        parsed.data.otp,
        'ofertante'
      )
      if (!result.success) {
        setError(result.error || 'Código inválido')
      } else {
        toast.success('Login realizado')
      }
    } else {
      const result = await completePhoneSignIn(
        values.telefone,
        parsed.data.otp,
        'admin'
      )
      if (!result.success) {
        setError(result.error || 'Código inválido')
      } else {
        toast.success('Login realizado')
      }
    }

    setIsLoading(false)
  }

  const handleConfirmData = async () => {
    setIsLoading(true)
    setError('')

    const result = await confirmData()

    if (result.success) {
      setStep('terms')
    } else {
      setError(result.error || 'Erro ao confirmar dados')
    }

    setIsLoading(false)
  }

  const handleReportDataError = async () => {
    form.clearErrors()
    const values = form.getValues()
    const parsed = reportDataErrorSchema.safeParse({
      mensagemErro: values.mensagemErro
    })
    if (!parsed.success) {
      applyZodErrors(form, parsed.error)
      return
    }

    setIsLoading(true)
    setError('')

    const result = await reportDataError(parsed.data.mensagemErro)

    if (result.success) {
      setStep('secid-contact')
    } else {
      setError(result.error || 'Erro ao reportar problema')
    }

    setIsLoading(false)
  }

  const handleAcceptTerms = async () => {
    setIsLoading(true)
    setError('')

    const result = await acceptTerms()

    if (result.success) {
      router.push('/imoveis')
    } else {
      setError(result.error || 'Erro ao aceitar termos')
    }

    setIsLoading(false)
  }

  const formatAddress = (data: Record<string, unknown>) => {
    const parts = [
      data.endereco,
      data.numero,
      data.bairro,
      data.cidade,
      data.estado
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-sm my-auto space-y-4">
          <Image
            src="/logo.svg"
            alt="Aquisição Assistida"
            width={150}
            height={150}
            className="mx-auto mb-8"
          />
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="link"
              asChild
              className="text-sm text-muted-foreground"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o início
              </Link>
            </Button>
            {hubHref ? (
              <Button variant="link" asChild className="text-sm">
                <Link href={hubHref}>Outros tipos de acesso</Link>
              </Button>
            ) : null}
          </div>

          <Form {...form}>
            {step === 'phone' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {variant === 'beneficiary' && 'Beneficiário'}
                    {variant === 'ofertante' && 'Ofertante'}
                    {variant === 'admin' && 'Administração'}
                  </CardTitle>
                  <CardDescription>
                    {variant === 'beneficiary' &&
                      'Informe CPF e celular cadastrados na Aquisição Assistida'}
                    {variant === 'ofertante' &&
                      'Entre com seu celular ou cadastre-se para ofertar um imóvel'}
                    {variant === 'admin' &&
                      'Acesso exclusivo para administradores da SECID'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {variant === 'beneficiary' && (
                    <>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          void handleRequestOTP()
                        }}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="off"
                                  placeholder="000.000.000-00"
                                  disabled={isLoading}
                                  {...field}
                                  ref={mergeRefs(field.ref, cpfInputRef)}
                                />
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
                              <FormLabel>Celular</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel-national"
                                  placeholder="(00) 00000-0000"
                                  disabled={isLoading}
                                  {...field}
                                  ref={mergeRefs(field.ref, phoneInputRef)}
                                />
                              </FormControl>
                              <FormDescription>
                                Digite o mesmo celular cadastrado na Aquisição
                                Assistida
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Receber código'
                          )}
                        </Button>
                      </form>

                      <div className="mt-6 pt-6 border-t space-y-3">
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          Problemas com seus dados?
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setStep('secid-contact')}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Entrar em contato com SECID
                        </Button>
                      </div>
                    </>
                  )}

                  {variant === 'ofertante' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <Home className="w-4 h-4 inline mr-1" />É proprietário
                          de um imóvel? Cadastre-se para ofertar sua propriedade
                          na Aquisição Assistida.
                        </p>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          void handleRequestOTP()
                        }}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Celular</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel-national"
                                  placeholder="(00) 00000-0000"
                                  disabled={isLoading}
                                  {...field}
                                  ref={mergeRefs(field.ref, phoneInputRef)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Continuar'
                          )}
                        </Button>
                      </form>
                    </div>
                  )}

                  {variant === 'admin' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Acesso exclusivo para administradores da SECID.
                        </p>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          void handleRequestOTP()
                        }}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Celular</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel-national"
                                  placeholder="(00) 00000-0000"
                                  disabled={isLoading}
                                  {...field}
                                  ref={mergeRefs(field.ref, phoneInputRef)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Receber código'
                          )}
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Register Step (New Ofertante) */}
            {step === 'register' && variant === 'ofertante' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    Cadastro de Ofertante
                  </CardTitle>
                  <CardDescription>
                    Informe seu nome para completar o cadastro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      void handleRegisterOfertante()
                    }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite seu nome completo"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Código será enviado para: {telefoneMascarado}
                      </p>
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        'Cadastrar e receber código'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setStep('phone')
                        setError('')
                      }}
                      disabled={isLoading}
                    >
                      Voltar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Verificação</CardTitle>
                  <CardDescription>
                    Enviamos um código para o telefone {telefoneMascarado}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      void handleVerifyOTP()
                    }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                          <FormLabel className="self-start">
                            Código de 6 dígitos
                          </FormLabel>
                          <FormControl>
                            <InputOTP
                              maxLength={6}
                              value={field.value}
                              onChange={field.onChange}
                              disabled={isLoading}
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otpWatch.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        'Verificar'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={countdown > 0 || isLoading}
                      onClick={() => {
                        if (countdown > 0) return
                        form.setValue('otp', '')
                        setError('')
                        void handleRequestOTP()
                      }}
                    >
                      {countdown > 0
                        ? `Reenviar em ${countdown}s`
                        : 'Reenviar código'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Data Validation (Beneficiary only) */}
            {step === 'data-validation' &&
              userData &&
              variant === 'beneficiary' && (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                      Confirme seus dados
                    </CardTitle>
                    <CardDescription>
                      Verifique se suas informações estão corretas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-medium">
                            {String(userData.nome ?? '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">CPF</p>
                          <p className="font-medium">
                            {String(userData.cpf ?? '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Celular
                          </p>
                          <p className="font-medium">
                            {String(userData.phone ?? '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Endereço
                          </p>
                          <p className="font-medium">
                            {formatAddress(userData)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={handleConfirmData}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Meus dados estão corretos
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setStep('data-error')}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Há informações incorretas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Data Error Report */}
            {step === 'data-error' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    Reportar Erro nos Dados
                  </CardTitle>
                  <CardDescription>
                    Informe quais dados estão incorretos para que a SECID possa
                    atualizá-los
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      void handleReportDataError()
                    }}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="mensagemErro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do problema</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: Meu endereço está errado. O correto é: Rua das Flores, 123, Centro..."
                              disabled={isLoading}
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Descreva claramente qual informação está incorreta e
                            qual é o valor correto.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                    <div className="space-y-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Enviar solicitação de correção'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setStep('data-validation')
                          form.setValue('mensagemErro', '')
                          setError('')
                        }}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Voltar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* SECID Contact */}
            {step === 'secid-contact' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Entre em Contato</CardTitle>
                  <CardDescription>
                    É necessário atualizar seus dados para continuar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2">
                      Secretaria de Estado de Cidades e Desenvolvimento Urbano
                      (SECID)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Entre em contato com a SECID para atualizar seus dados
                      cadastrais.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Endereço:</strong> Av. dos Holandeses, s/n -
                        Quadra 33 - Calhau, São Luís - MA
                      </p>
                      <p>
                        <strong>Telefone:</strong> (98) 3198-5300
                      </p>
                      <p>
                        <strong>Email:</strong> secid@ma.gov.br
                      </p>
                      <p>
                        <strong>Horário:</strong> Segunda a Sexta, 8h às 18h
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('phone')
                      setError('')
                      form.setValue('mensagemErro', '')
                    }}
                    className="w-full"
                  >
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Terms (Beneficiary only) */}
            {step === 'terms' && variant === 'beneficiary' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Termo de Ciência</CardTitle>
                  <CardDescription>
                    Leia atentamente as regras da Aquisição Assistida
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-64 overflow-y-auto border rounded-lg p-4 text-sm text-muted-foreground">
                    <h3 className="font-bold text-foreground mb-2">
                      TERMO DE CIÊNCIA E MANIFESTAÇÃO DE INTERESSE
                    </h3>
                    <p className="mb-3">
                      Ao participar da Aquisição Assistida, você declara estar
                      ciente de que:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        O subsídio de até R$ 20.000,00 (vinte mil reais) é
                        destinado exclusivamente à entrada do imóvel.
                      </li>
                      <li>
                        O valor máximo do imóvel a ser adquirido é de R$
                        200.000,00 (duzentos mil reais).
                      </li>
                      <li>
                        A seleção do imóvel será feita pelo beneficiário entre
                        as opções disponíveis e validadas pela Administração
                        Pública.
                      </li>
                      <li>
                        O valor final do imóvel será o menor valor entre a
                        avaliação da CAIXA e o preço ofertado pelo vendedor.
                      </li>
                      <li>
                        É obrigatório possuir renda familiar bruta mensal de até
                        2 (dois) salários mínimos.
                      </li>
                      <li>
                        O beneficiário não pode possuir imóvel registrado em seu
                        nome ou de seu cônjuge/companheiro.
                      </li>
                      <li>
                        A aprovação do financiamento junto à CAIXA é condição
                        para a efetivação da aquisição.
                      </li>
                      <li>
                        Informações falsas ou incompletas podem resultar no
                        cancelamento do cadastro e em penalidades legais.
                      </li>
                    </ul>
                    <p className="mt-4 font-bold">
                      Ao aceitar este termo, você manifesta seu interesse em
                      participar da Aquisição Assistida e declara estar ciente
                      de todas as regras acima.
                    </p>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleAcceptTerms}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Aceito os termos'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = '/'
                      }}
                      disabled={isLoading}
                    >
                      Não aceito
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </Form>
        </div>
      </div>
    </div>
  )
}
