import Image from 'next/image'
import Link from 'next/link'

import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem
} from '@/components/animations'
import { AuthenticatedHeaderActions } from '@/components/authenticated-header-actions'
import { HeroAccessCtas } from '@/components/home/hero-access-ctas'
import { OfertanteCtaSection } from '@/components/home/ofertante-cta-section'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getServerCurrentUser } from '@/lib/server-auth'
import {
  ArrowDown,
  Building2,
  FileText,
  Fingerprint,
  Handshake,
  Home,
  UsersRound
} from 'lucide-react'

export default async function LandingPage() {
  const user = await getServerCurrentUser()

  return (
    <div className="min-h-screen flex flex-col relative">
      {user ? (
        <Header
          floatingScrollExpand
          showLoginButton={false}
          actions={<AuthenticatedHeaderActions />}
        />
      ) : (
        <Header floatingScrollExpand />
      )}

      {/* Hero: overlap header so the image reaches the viewport top (header stays z-50 on top). */}
      <section className="relative h-[calc(100dvh-5rem)] flex flex-col overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/casas.png"
            alt="Conjunto habitacional da Aquisição Assistida"
            fill
            sizes="(max-width: 1920px) 100vw, 1920px"
            className="object-cover brightness-[0.65]"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 z-10 flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection delay={0} direction="up">
              <div className="inline-flex items-center gap-2 bg-white/95 text-secondary px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                <Fingerprint className="w-4 h-4" />
                Iniciativa oficial do Governo do Maranhão
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="up">
              <div className="flex justify-center">
                <Image
                  src="/logo-secid-contorno.png"
                  alt="Governo do Maranhão e SECID"
                  width={500}
                  height={170}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="up">
              <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg tracking-tight leading-tight">
                Aquisição Assistida para Sua Casa Própria
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.3} direction="up">
              <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
                Iniciativa de subsídio para famílias desalojadas pelas obras do
                PAC Rio Anil, em parceria com o Ministério das Cidades e Caixa
                Econômica Federal.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.4} direction="up">
              <div className="space-y-3">
                <HeroAccessCtas />
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-base bg-white/10 hover:bg-white/20 border-white text-white shadow-xl"
                  >
                    <Link href="/imoveis">Ver Imóveis Disponíveis</Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Scroll indicator */}
        <AnimatedSection
          delay={0.6}
          direction="up"
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer group">
            <span className="text-xs font-medium">Saiba mais</span>
            <ArrowDown className="size-6 animate-bounce" />
          </div>
        </AnimatedSection>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto"
            staggerDelay={0.15}
          >
            <StaggerItem className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2 tracking-tight">
                233
              </div>
              <div className="text-white/90 text-lg">
                Famílias Beneficiárias
              </div>
            </StaggerItem>
            <StaggerItem className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2 tracking-tight">
                R$ 200 mil
                <sup className="text-xl md:text-2xl font-semibold align-super ml-0.5">
                  *
                </sup>
              </div>
              <div className="text-white/90 text-lg">
                Valor Máximo do Imóvel
              </div>
              <p className="text-white/65 text-xs sm:text-sm mt-3 max-w-sm mx-auto leading-snug">
                *sujeito à avaliação pela Caixa Econômica Federal
              </p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <OfertanteCtaSection />

      {/* About Section - Asymmetric Layout */}
      <section className="py-20 md:py-34 bg-linear-to-br from-blue-300 via-primary/50 to-accent/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Image - Takes more space */}
            <AnimatedSection
              direction="left"
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-4/5 lg:aspect-3/4 rounded-2xl overflow-hidden shadow-brand-xl">
                <Image
                  src="/familia-feliz.png"
                  alt="Família feliz com casa própria"
                  fill
                  className="object-cover"
                />
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </AnimatedSection>

            {/* Content */}
            <div className="lg:col-span-7 space-y-8">
              <AnimatedSection direction="right">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Aquisição Assistida em foco: moradia digna e acesso ao crédito
                </h2>
              </AnimatedSection>

              <StaggerContainer className="space-y-6" staggerDelay={0.1}>
                <StaggerItem>
                  <div className="flex gap-5">
                    <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center shrink-0 shadow-brand-md">
                      <Home className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2 text-foreground">
                        Conceito
                      </h3>
                      <p className="text-muted-foreground leading-relaxed max-w-prose">
                        Aquisição assistida para{' '}
                        <strong className="text-foreground">
                          famílias desalojadas
                        </strong>{' '}
                        pelas obras do PAC Rio Anil, garantindo acesso à moradia
                        digna por meio de subsídio na compra de imóveis.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex gap-5">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-brand-md">
                      <UsersRound className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2 text-foreground">
                        Público-Alvo
                      </h3>
                      <p className="text-muted-foreground leading-relaxed max-w-prose">
                        <strong className="text-foreground">
                          233 famílias
                        </strong>{' '}
                        representadas por beneficiários já cadastrados, que
                        foram desalojadas pelas obras do PAC Rio Anil.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex gap-5">
                    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center shrink-0 shadow-brand-md">
                      <Fingerprint className="w-7 h-7 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2 text-foreground">
                        Validação
                      </h3>
                      <p className="text-muted-foreground leading-relaxed max-w-prose">
                        Os imóveis passam por{' '}
                        <strong className="text-foreground">
                          validação pela Administração Pública
                        </strong>
                        , e o valor final será o menor entre a avaliação da
                        Caixa e a oferta.
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Fluxograma Section - Masonry/Asymmetric Layout */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight text-foreground">
              Estruturação e Operacionalização
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A iniciativa é executada, coordenada e monitorada pela Secretaria
              de Estado de Cidades e Desenvolvimento Urbano (SECID)
            </p>
          </AnimatedSection>

          {/* Masonry-style Cards */}
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            staggerDelay={0.15}
          >
            {/* Card 1 - Preparation (taller) */}
            <StaggerItem className="flex w-full flex-col md:col-span-1 lg:row-span-2 lg:min-h-0">
              <Card
                variant="elevated"
                className="w-full border-2 border-secondary hover:border-secondary/70 bg-linear-to-br from-secondary/5 to-transparent lg:h-full lg:min-h-0"
              >
                <CardContent className="flex flex-col items-center pt-8 pb-8 text-center lg:h-full">
                  <div className="size-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-brand-md border-2 border-secondary">
                    <FileText className="size-8 text-secondary-foreground" />
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-secondary">
                    Preparação
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Criação da base legal e financeira necessária para execução
                    do programa
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Card 2 - Habilitation (same row band as Preparation) */}
            <StaggerItem className="flex w-full flex-col md:col-span-1 lg:row-span-2 lg:min-h-0">
              <Card
                variant="elevated"
                className="w-full border-primary border-2 bg-linear-to-br from-primary/20 to-transparent lg:h-full lg:min-h-0"
              >
                <CardContent className="flex flex-col items-center justify-center py-8 text-center lg:min-h-0 lg:flex-1 lg:py-0">
                  <div className="size-16 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-brand-md">
                    <Building2 className="size-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-primary">
                    Habilitação
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Credenciamento da oferta de imóveis junto aos proprietários
                    qualificados
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Card 3 - Operation (same row band as Preparation) */}
            <StaggerItem className="flex w-full flex-col md:col-span-1 lg:row-span-2 lg:min-h-0">
              <Card
                variant="elevated"
                className="w-full border-2 border-accent hover:border-accent/70 bg-linear-to-tr from-accent/20 to-transparent lg:h-full lg:min-h-0"
              >
                <CardContent className="flex flex-col items-center justify-center py-8 text-center lg:min-h-0 lg:flex-1 lg:py-0">
                  <div className="size-16 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-brand-md border-2 border-accent">
                    <Handshake className="size-8 text-accent-foreground" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-foreground">
                    Operacionalização
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Concessão do subsídio ao beneficiário final e formalização
                    da aquisição
                  </p>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Additional info cards in masonry style */}
            <StaggerItem className="w-full md:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-border bg-muted/50 p-5">
                  <div className="mb-1 text-3xl font-bold tracking-tight text-primary wrap-break-word">
                    R$ 200.000,00
                    <sup className="text-lg font-semibold align-super ml-0.5">
                      *
                    </sup>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Preço máximo do imóvel
                  </div>
                  <p className="text-muted-foreground/80 text-xs mt-2 leading-snug">
                    *sujeito à avaliação pela Caixa Econômica Federal
                  </p>
                </div>
                <div className="min-w-0 rounded-xl border border-border bg-muted/50 p-5">
                  <div className="mb-1 text-3xl font-bold tracking-tight text-secondary wrap-break-word">
                    180 dias
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Prazo médio de processamento
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <Link href="/" className="relative block h-48 w-full">
                <Image
                  src="/logo-secid-contorno.png"
                  alt="Governo do Maranhão e SECID"
                  fill
                  sizes="320px"
                  className="object-contain object-left"
                />
              </Link>
              <h3 className="font-bold mb-4 text-accent text-lg">
                Aquisição Assistida
              </h3>
              <p className="text-sm text-secondary-foreground/80 leading-relaxed max-w-xs">
                Iniciativa do Governo do Estado do Maranhão, em parceria com o
                Ministério das Cidades e Caixa Econômica Federal no âmbito do
                PAC Rio Anil.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-accent text-lg">
                Acesso Rápido
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Início
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login/beneficiario"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Login de Beneficiário
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login/ofertante"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Cadastro de Ofertante
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ofertante/imoveis"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Imóveis Disponíveis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Acessar Sistema
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-accent text-lg">Contato</h3>
              <p className="text-sm text-secondary-foreground/80 leading-relaxed">
                Dúvidas sobre a Aquisição Assistida?
                <br />
                Entre em contato com a SECID - Secretaria de Estado de Cidades e
                Desenvolvimento Urbano.
                <br />
                <a
                  href="mailto:aquisicao@secid.ma.gov.br"
                  className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors underline-offset-4 hover:underline"
                >
                  aquisicao@secid.ma.gov.br
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm text-secondary-foreground/60">
            <p>
              © {new Date().getFullYear()} Governo do Estado do Maranhão -
              SECID. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
