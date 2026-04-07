import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ArrowLeft, Home, Shield, User } from 'lucide-react'

export default function LoginHubPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-3xl space-y-6">
          <Button variant="ghost" asChild className="self-start -ml-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o início
            </Link>
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Acesso ao sistema</h1>
            <p className="text-muted-foreground">
              Escolha como você acessa o Aquisição Assistida
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <User className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Beneficiário</CardTitle>
                <CardDescription>
                  CPF e celular cadastrados no programa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/login/beneficiario">Entrar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <Home className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Ofertante</CardTitle>
                <CardDescription>
                  Proprietários que ofertam imóveis no programa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/login/ofertante">Entrar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Administração</CardTitle>
                <CardDescription>Acesso SECID</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/login/admin">Entrar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
