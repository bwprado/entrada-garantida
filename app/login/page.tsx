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
  AnimatedSection,
  StaggerContainer,
  StaggerItem
} from '@/components/animations'
import { ArrowLeft, Building2, Fingerprint, UsersRound } from 'lucide-react'

export default function LoginHubPage() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 flex justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl space-y-8">
          <AnimatedSection direction="down" delay={0}>
            <Button variant="ghost" asChild className="self-start -ml-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o início
              </Link>
            </Button>
          </AnimatedSection>

          <AnimatedSection className="text-center space-y-3" delay={0.1}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Acesso ao sistema
            </h1>
            <p className="text-muted-foreground text-lg">
              Escolha como você acessa o Aquisição Assistida
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="grid gap-5 sm:grid-cols-3"
            staggerDelay={0.1}
          >
            <StaggerItem>
              <Card
                variant="bordered"
                className="h-full hover:border-primary/40 transition-colors group"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <UsersRound className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl tracking-tight">
                    Beneficiário
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    CPF e celular cadastrados na Aquisição Assistida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full shadow-brand-sm">
                    <Link href="/login/beneficiario">Entrar</Link>
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card
                variant="bordered"
                className="h-full hover:border-primary/40 transition-colors group"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary/15 transition-colors">
                    <Building2 className="w-7 h-7 text-secondary" />
                  </div>
                  <CardTitle className="text-xl tracking-tight">
                    Ofertante
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Proprietários que ofertam imóveis na Aquisição Assistida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full shadow-brand-sm">
                    <Link href="/login/ofertante">Entrar</Link>
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card
                variant="bordered"
                className="h-full hover:border-primary/40 transition-colors group"
              >
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/25 transition-colors">
                    <Fingerprint className="w-7 h-7 text-secondary" />
                  </div>
                  <CardTitle className="text-xl tracking-tight">
                    Administração
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Acesso SECID
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full shadow-brand-sm"
                  >
                    <Link href="/login/admin">Entrar</Link>
                  </Button>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>

          <AnimatedSection className="text-center" delay={0.5}>
            <p className="text-sm text-muted-foreground">
              Precisa de ajuda?{' '}
              <Link
                href="/"
                className="text-primary hover:underline font-medium"
              >
                Entre em contato
              </Link>
            </p>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
