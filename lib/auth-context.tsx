'use client'

import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { getUserErrorMessage } from '@/lib/convex-error'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode
} from 'react'

import { normalizePhone } from '@/lib/normalize-phone'

export type LoginPersona = 'beneficiary' | 'ofertante' | 'admin'

function providerIdForPersona(p: LoginPersona): string {
  switch (p) {
    case 'beneficiary':
      return 'phone_beneficiary'
    case 'ofertante':
      return 'phone_ofertante'
    case 'admin':
      return 'phone_admin'
    default:
      return 'phone_ofertante'
  }
}

type AuthContextValue = {
  user: UserWithProfile | null | undefined
  isLoading: boolean
  isAuthenticated: boolean
  logout: (redirectTo?: string) => Promise<void>
  assertBeneficiaryAndPrepareOtp: (
    cpf: string,
    telefone: string
  ) => Promise<{
    success: boolean
    telefoneMascarado?: string
    phoneE164?: string
    error?: string
  }>
  startPhoneSignIn: (
    telefoneOrE164: string,
    persona: LoginPersona
  ) => Promise<{
    success: boolean
    telefoneMascarado?: string
    error?: string
  }>
  completePhoneSignIn: (
    telefoneOrE164: string,
    code: string,
    persona: LoginPersona
  ) => Promise<{ success: boolean; error?: string }>
  registerOfertante: (
    telefone: string,
    nome: string
  ) => Promise<{ success: boolean; error?: string }>
  acceptTerms: () => Promise<{ success: boolean; error?: string }>
  confirmData: () => Promise<{ success: boolean; error?: string }>
  reportDataError: (
    mensagem: string
  ) => Promise<{ success: boolean; error?: string }>
  completeOnboarding: (args: {
    nome: string
    cpf: string
    dataNascimento: string
    rg?: string
    profissao?: string
    estadoCivil?:
      | 'solteiro'
      | 'casado'
      | 'divorciado'
      | 'viuvo'
      | 'uniao_estavel'
      | 'separado'
    cep: string
    endereco: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Extended user type that includes profile fields
export type UserWithProfile = Doc<'users'> & {
  onboardingCompleto?: boolean
  profile?: Doc<'ofertanteProfiles'> | Doc<'beneficiaryProfiles'> | Doc<'adminProfiles'> | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()
  const { signIn, signOut } = useAuthActions()
  const shouldFetchUser = !authLoading && isAuthenticated
  const userWithProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    shouldFetchUser ? {} : 'skip'
  )

  const assertMutation = useMutation(api.users.assertBeneficiaryCpfTelefone)
  const registerOfertanteMutation = useMutation(api.users.registerOfertante)
  const acceptTermsMutation = useMutation(api.users.acceptTerms)
  const confirmDataMutation = useMutation(api.users.confirmData)
  const reportDataErrorMutation = useMutation(api.users.reportDataError)
  const completeOfertanteOnboardingMutation = useMutation(
    api.users.completeOfertanteOnboarding
  )

  // Merge user and profile data, including onboardingCompleto from profile
  const user = useMemo((): UserWithProfile | null | undefined => {
    if (!shouldFetchUser) return null
    if (userWithProfile === undefined) return undefined
    if (userWithProfile === null) return null
    
    const { user: userData, profile } = userWithProfile
    
    // Merge onboardingCompleto from profile into user object
    // Only ofertanteProfiles has onboardingCompleto field
    let onboardingCompleto: boolean | undefined = undefined
    if (userData.role === 'ofertante' && profile) {
      // Type guard: profile is ofertanteProfiles which has onboardingCompleto
      onboardingCompleto = (profile as Doc<'ofertanteProfiles'>).onboardingCompleto ?? false
    }
    
    return {
      ...userData,
      onboardingCompleto,
      profile: profile || undefined
    }
  }, [shouldFetchUser, userWithProfile])

  const isLoading = useMemo(() => {
    if (authLoading) return true
    if (isAuthenticated && user === undefined) return true
    return false
  }, [authLoading, isAuthenticated, user])

  const logout = useCallback(
    async (redirectTo = '/login') => {
      await signOut()
      if (typeof window !== 'undefined') {
        window.location.assign(redirectTo)
      }
    },
    [signOut]
  )

  const assertBeneficiaryAndPrepareOtp = useCallback(
    async (cpf: string, telefone: string) => {
      try {
        return await assertMutation({ cpf, telefone })
      } catch (e) {
        return { success: false as const, error: getUserErrorMessage(e) }
      }
    },
    [assertMutation]
  )

  const startPhoneSignIn = useCallback(
    async (telefoneOrE164: string, persona: LoginPersona) => {
      const n = normalizePhone(telefoneOrE164)
      if (!n.isValid()) {
        return { success: false as const, error: 'Telefone inválido' }
      }
      const phone = n.save()
      try {
        await signIn(providerIdForPersona(persona), { phone })
        return {
          success: true as const,
          telefoneMascarado: n.display()
        }
      } catch (e) {
        return { success: false as const, error: getUserErrorMessage(e) }
      }
    },
    [signIn]
  )

  const completePhoneSignIn = useCallback(
    async (telefoneOrE164: string, code: string, persona: LoginPersona) => {
      const n = normalizePhone(telefoneOrE164)
      if (!n.isValid()) {
        return { success: false as const, error: 'Telefone inválido' }
      }
      const phone = n.save()
      try {
        await signIn(providerIdForPersona(persona), { phone, code })
        return { success: true as const }
      } catch (e) {
        return { success: false as const, error: getUserErrorMessage(e) }
      }
    },
    [signIn]
  )

  const registerOfertante = useCallback(
    async (telefone: string, nome: string) => {
      try {
        const res = await registerOfertanteMutation({ telefone, nome })
        if (!res.success) {
          return {
            success: false as const,
            error: res.error ?? 'Erro ao cadastrar'
          }
        }
        return { success: true as const }
      } catch (e) {
        return { success: false as const, error: getUserErrorMessage(e) }
      }
    },
    [registerOfertanteMutation]
  )

  const acceptTerms = useCallback(async () => {
    try {
      await acceptTermsMutation({})
      return { success: true as const }
    } catch (e) {
      return { success: false as const, error: getUserErrorMessage(e) }
    }
  }, [acceptTermsMutation])

  const confirmData = useCallback(async () => {
    try {
      await confirmDataMutation({})
      return { success: true as const }
    } catch (e) {
      return { success: false as const, error: getUserErrorMessage(e) }
    }
  }, [confirmDataMutation])

  const reportDataError = useCallback(
    async (mensagem: string) => {
      try {
        await reportDataErrorMutation({ mensagem })
        return { success: true as const }
      } catch (e) {
        return { success: false as const, error: getUserErrorMessage(e) }
      }
    },
    [reportDataErrorMutation]
  )

  const completeOnboarding = useCallback(
    async (args: {
      nome: string
      cpf: string
      dataNascimento: string
      rg?: string
      profissao?: string
      estadoCivil?:
        | 'solteiro'
        | 'casado'
        | 'divorciado'
        | 'viuvo'
        | 'uniao_estavel'
        | 'separado'
      cep: string
      endereco: string
      numero: string
      complemento?: string
      bairro: string
      cidade: string
      estado: string
    }) => {
      try {
        const res = await completeOfertanteOnboardingMutation(args)
        
        if (!res.success) {
          return {
            success: false as const,
            error: res.error ?? 'Erro ao completar cadastro'
          }
        }
        return { success: true as const }
      } catch (e) {
        return { success: false as const, error: getUserErrorMessage(e) }
      }
    },
    [completeOfertanteOnboardingMutation]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      logout,
      assertBeneficiaryAndPrepareOtp,
      startPhoneSignIn,
      completePhoneSignIn,
      registerOfertante,
      acceptTerms,
      confirmData,
      reportDataError,
      completeOnboarding
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      logout,
      assertBeneficiaryAndPrepareOtp,
      startPhoneSignIn,
      completePhoneSignIn,
      registerOfertante,
      acceptTerms,
      confirmData,
      reportDataError,
      completeOnboarding
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
