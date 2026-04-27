import Image from 'next/image'
import Link from 'next/link'

import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem
} from '@/components/animations'
import { AuthenticatedHeaderActions } from '@/components/authenticated-header-actions'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { getServerCurrentUser } from '@/lib/server-auth'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  Building2,
  FileText,
  Fingerprint,
  Handshake,
  Home,
  Sparkles,
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
      <section className="relative min-h-[calc(100dvh-5rem)] md:h-screen flex flex-col overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/casas.png"
            alt="Conjunto habitacional da Aquisição Assistida"
            fill
            sizes="100vw"
            className="object-cover brightness-[0.65]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex items-center justify-center py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection delay={0} direction="up">
              <div className="inline-flex items-center gap-2 bg-white/95 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg backdrop-blur-sm">
                <Fingerprint className="w-4 h-4" />
                Iniciativa oficial do Governo do Maranhão
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} direction="up">
              <div className="mb-8 flex justify-center">
                <Image
                  src="/logo-secid-contorno.png"
                  alt="Governo do Maranhão e SECID"
                  width={600}
                  height={170}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} direction="up">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-white drop-shadow-lg tracking-tight leading-tight">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-base shadow-brand-xl">
                  <Link href="/login/beneficiario">
                    Sou beneficiário
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base bg-white/95 hover:bg-white border-white text-secondary shadow-xl"
                >
                  <Link href="/imoveis">Ver Imóveis Disponíveis</Link>
                </Button>
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
            <span className="text-sm font-medium">Saiba mais</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center group-hover:border-white transition-colors">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce group-hover:bg-white transition-colors" />
            </div>
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
              </div>
              <div className="text-white/90 text-lg">
                Valor Máximo do Imóvel
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* About Section - Asymmetric Layout */}
      <section className="py-20 md:py-34 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Image - Takes more space */}
            <AnimatedSection
              direction="left"
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-brand-xl">
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
                    <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand-md">
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
                        digna por meio de subsidição na compra de imóveis.
                      </p>
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="flex gap-5">
                    <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand-md">
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
                    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand-md">
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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
            <StaggerItem className="md:col-span-1 lg:row-span-2 flex min-h-0 flex-col">
              <Card
                variant="bordered"
                className="h-full min-h-0 border-2 border-secondary hover:border-secondary/70 bg-gradient-to-br from-secondary/5 to-transparent"
              >
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center h-full">
                  <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mb-6 shadow-brand-md">
                    <FileText className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-secondary">
                    Preparação
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Criação da base legal e financeira necessária para execução
                    do programa
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 mt-auto">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      Lei de criação
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      Regulamentação
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      Alocação orçamentária
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Card 2 - Habilitation (same row band as Preparation) */}
            <StaggerItem className="md:col-span-1 lg:row-span-2 flex min-h-0 flex-col">
              <Card
                variant="elevated"
                className="h-full min-h-0 bg-gradient-to-br from-primary/10 to-primary/5"
              >
                <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-brand-md">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
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
            <StaggerItem className="md:col-span-1 lg:row-span-2 flex min-h-0 flex-col">
              <Card
                variant="default"
                className="h-full min-h-0 border-2 border-accent hover:border-accent/70"
              >
                <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mb-4 shadow-brand-md">
                    <Handshake className="w-8 h-8 text-accent-foreground" />
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
            <StaggerItem className="md:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-5 border border-border">
                  <div className="text-3xl font-bold text-primary mb-1 tracking-tight">
                    R$ 200.000,00
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Preço máximo do imóvel
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-5 border border-border">
                  <div className="text-3xl font-bold text-secondary mb-1 tracking-tight">
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

      {/* CTA Section */}
      <section className="py-20 md:py-34 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">
              Tem um Imóvel para Vender?
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-95 leading-relaxed max-w-2xl mx-auto">
              Cadastre seu imóvel e faça parte desta iniciativa que vai
              transformar a vida de famílias maranhenses desalojadas
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base bg-white text-secondary hover:bg-white/90 shadow-xl"
            >
              <Link href="/ofertante/cadastro">
                <Building2 className="w-5 h-5 mr-2" />
                Cadastrar Imóvel
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="relative mb-6 h-32 w-auto">
                <Image
                  src="/logo-secid-horizontal.png"
                  alt="Governo do Maranhão e SECID"
                  fill
                  sizes="200px"
                  className="object-contain object-left"
                />
              </div>
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
                    href="/beneficiario/cadastro"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Cadastro de Beneficiário
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ofertante/cadastro"
                    className="text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                  >
                    Cadastro de Ofertante
                  </Link>
                </li>
                <li>
                  <Link
                    href="/imoveis"
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
