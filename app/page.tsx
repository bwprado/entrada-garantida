import Image from 'next/image'
import Link from 'next/link'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  Building2,
  FileText,
  Handshake,
  Home,
  Shield,
  Users
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="relative py-20 md:py-32 overflow-hidden h-[calc(100vh-80px)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/casas.png"
            alt="Conjunto habitacional da Aquisição Assistida"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover antialiased brightness-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center h-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/95 text-program-blue-dark px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
              <Shield className="w-4 h-4" />
              Iniciativa oficial do Governo do Maranhão
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white drop-shadow-lg">
              Aquisição Assistida para Sua Casa Própria
            </h2>
            <p className="text-xl text-white/95 mb-8 text-pretty leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Iniciativa Aquisição Assistida para famílias desalojadas pelas
              obras do PAC Rio Anil, em parceria com o Ministério das Cidades e
              Caixa Econômica Federal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="text-base bg-program-green-primary hover:bg-program-green-hover text-white shadow-xl"
              >
                <Link href="/login/beneficiario">
                  Sou beneficiário
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base bg-white/95 hover:bg-white border-white text-program-blue-dark shadow-xl"
              >
                <Link href="/imoveis">Ver Imóveis Disponíveis</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer group">
            <span className="text-sm font-medium">Saiba mais</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center group-hover:border-white transition-colors">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce group-hover:bg-white transition-colors"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-program-blue-dark via-program-teal-gradient to-program-blue-dark text-white h-[200px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-program-yellow-accent mb-2">
                233
              </div>
              <div className="text-white/90">Famílias Beneficiárias</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-program-yellow-accent mb-2">
                R$ 200 mil
              </div>
              <div className="text-white/90">Valor Máximo do Imóvel</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white h-[calc(100vh-200px-80px)]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/familia-feliz.png"
                  alt="Família feliz com casa própria"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-program-blue-dark">
                  Aquisição Assistida em foco: moradia digna e acesso ao crédito
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-program-yellow-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-program-blue-dark" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                        Conceito
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Aquisição assistida para{' '}
                        <strong>famílias desalojadas</strong> pelas obras do PAC
                        Rio Anil, garantindo acesso à moradia digna por meio de
                        subsidição na compra de imóveis.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-program-green-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                        Público-Alvo
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong>233 famílias</strong> representadas por
                        beneficiários já cadastrados, que foram desalojadas
                        pelas obras do PAC Rio Anil.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-program-blue-dark rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                        Validação
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Os imóveis passam por{' '}
                        <strong>validação pela Administração Pública</strong>, e
                        o valor final será o menor entre a avaliação da Caixa e
                        a oferta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white h-[calc(100vh-80px)]">
        <div className="container m-auto px-4 h-full">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-program-blue-dark">
              Fluxograma: Estruturação e Operacionalização
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A iniciativa é executada, coordenada e monitorada pela Secretaria
              de Estado de Cidades e Desenvolvimento Urbano (SECID)
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 border-program-blue-dark shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-program-blue-dark rounded-full flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-center text-program-blue-dark">
                    Preparação
                  </h4>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Criação da base legal e financeira
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-program-pink-accent shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-program-pink-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-center text-program-pink-accent">
                    Habilitação
                  </h4>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Credenciamento da oferta de imóveis
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-program-yellow-accent shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-program-yellow-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Handshake className="w-8 h-8 text-program-blue-dark" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-center text-program-yellow-accent">
                    Operacionalização
                  </h4>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Concessão do subsídio ao beneficiário final
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-program-green-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/conjunto-habitacional.jpg"
            alt="Conjunto habitacional"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Tem um Imóvel para Vender?
            </h3>
            <p className="text-lg mb-8 opacity-95 leading-relaxed">
              Cadastre seu imóvel e faça parte desta iniciativa que vai
              transformar a vida de famílias maranhenses desalojadas
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base bg-white text-[#22c55e] hover:bg-gray-100 shadow-xl"
            >
              <Link href="/ofertante/cadastro">
                <Building2 className="w-5 h-5 mr-2" />
                Cadastrar Imóvel
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 bg-program-blue-dark text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="relative mb-4 h-28 w-28">
                <Image
                  src="/secid-squared.png"
                  alt="Governo do Maranhão e SECID"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <h4 className="font-bold mb-4 text-program-yellow-accent">
                Aquisição Assistida
              </h4>
              <p className="text-sm text-white/80 leading-relaxed">
                Iniciativa do Governo do Estado do Maranhão, em parceria com o
                Ministério das Cidades e Caixa Econômica Federal no âmbito do
                PAC Rio Anil, para facilitar o acesso à moradia digna para
                famílias maranhenses de baixa renda beneficiárias do PAC.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-program-yellow-accent">
                Acesso Rápido
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/beneficiario/cadastro"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Cadastro de Beneficiário
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ofertante/cadastro"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Cadastro de Ofertante
                  </Link>
                </li>
                <li>
                  <Link
                    href="/imoveis"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Imóveis Disponíveis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Acessar Sistema
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-program-yellow-accent">
                Contato
              </h4>
              <p className="text-sm text-white/80 leading-relaxed">
                Dúvidas sobre a Aquisição Assistida?
                <br />
                Entre em contato com a SECID - Secretaria de Estado de Cidades e
                Desenvolvimento Urbano.
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>
              © 2025 Governo do Estado do Maranhão - SECID. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
