'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthActions } from '@convex-dev/auth/react'
import { Building2, Loader2, UsersRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSelectedPropertiesHomeHref } from '@/lib/app-links'

type TestRole = 'beneficiary' | 'ofertante'

const providerByRole: Record<TestRole, string> = {
  beneficiary: 'password_test_beneficiary',
  ofertante: 'password_test_ofertante'
}

export default function HiddenTestLoginPage() {
  const router = useRouter()
  const { signIn } = useAuthActions()
  const [selectedRole, setSelectedRole] = useState<TestRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedRole) {
      setError('Escolha o tipo de acesso para continuar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signIn(providerByRole[selectedRole], {
        flow: 'signIn',
        email: email.trim().toLowerCase(),
        password
      })
      router.replace(getSelectedPropertiesHomeHref(selectedRole))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao autenticar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-muted/20 px-4 py-10">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Acesso de testes
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha o fluxo e entre com e-mail e senha.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card
            className={`cursor-pointer border transition-colors ${
              selectedRole === 'beneficiary'
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/40'
            }`}
            onClick={() => setSelectedRole('beneficiary')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersRound className="size-4" />
                Beneficiário
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Login para contas de teste de beneficiário.
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer border transition-colors ${
              selectedRole === 'ofertante'
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/40'
            }`}
            onClick={() => setSelectedRole('ofertante')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4" />
                Ofertante
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Login para contas de teste de ofertante.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="test-email">E-mail</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Senha</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
