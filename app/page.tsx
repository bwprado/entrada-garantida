import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  Home,
  Shield,
  Users
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <section className="relative py-20 md:py-32 overflow-hidden h-[calc(100vh-80px)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/casas.png"
            alt="Conjunto habitacional do Programa Entrada Garantida"
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
              Programa Oficial do Governo do Maranhão
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white drop-shadow-lg">
              Entrada Garantida para Sua Casa Própria
            </h2>
            <p className="text-xl text-white/95 mb-8 text-pretty leading-relaxed max-w-2xl mx-auto drop-shadow-md">
              Política de Subsídio Habitacional para Famílias de Baixa Renda.
              Subsídio de até R$ 20 mil para entrada do imóvel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="text-base bg-program-green-primary hover:bg-program-green-hover text-white shadow-xl">
                <Link href="/beneficiario/cadastro">
                  Quero me Cadastrar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base bg-white/95 hover:bg-white border-white text-program-blue-dark shadow-xl">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-program-yellow-accent mb-2">
                10.000
              </div>
              <div className="text-white/90">Famílias Contempladas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-program-yellow-accent mb-2">
                R$ 20 mil
              </div>
              <div className="text-white/90">Valor do Subsídio</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-program-yellow-accent mb-2">
                R$ 250 mil
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
                  O Programa em Foco: Moradia Digna e Acesso ao Crédito
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
                        Política pública estratégica para atender o{" "}
                        <strong>déficit habitacional</strong> do Maranhão,
                        removendo a principal barreira financeira para a casa
                        própria: a falta de recursos para a entrada.
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
                        Grupos familiares com{" "}
                        <strong>
                          renda mensal bruta de até 2 (dois) salários mínimos
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-program-blue-dark rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                        Cumulatividade
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        O subsídio é <strong>cumulativo</strong> com outros
                        benefícios, como o FGTS e subsídios federais (Minha Casa
                        Minha Vida).
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
              O programa é executado, coordenado e monitorado pela Secretaria de
              Estado de Monitoramento de Ações Governamentais (SEMAG)
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

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-program-blue-dark">
              Como Funciona o Programa
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Um processo simples e transparente para você conquistar sua casa
              própria
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-t-4 border-t-[#22c55e] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-program-green-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                  1. Cadastre-se
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Preencha seus dados e documentos necessários para participar
                  do programa
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#0c4a6e] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-program-blue-dark/10 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-program-blue-dark" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                  2. Escolha o Imóvel
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Navegue pelos imóveis disponíveis e escolha o que melhor
                  atende sua família
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#fbbf24] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-program-yellow-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-program-yellow-accent" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                  3. Análise
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Aguarde a análise da sua solicitação pela equipe do programa
                </p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-[#db2777] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-program-pink-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-program-pink-accent" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-program-blue-dark">
                  4. Aprovação
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Receba o subsídio e realize o sonho da casa própria
                </p>
              </CardContent>
            </Card>
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
              Você é Construtor ou Incorporador?
            </h3>
            <p className="text-lg mb-8 opacity-95 leading-relaxed">
              Cadastre seus empreendimentos e faça parte deste programa que vai
              transformar a vida de milhares de famílias maranhenses
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base bg-white text-[#22c55e] hover:bg-gray-100 shadow-xl">
              <Link href="/construtor/cadastro">
                <Building2 className="w-5 h-5 mr-2" />
                Cadastrar Empreendimento
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 bg-program-blue-dark text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-program-yellow-accent">
                Programa Entrada Garantida
              </h4>
              <p className="text-sm text-white/80 leading-relaxed">
                Iniciativa do Governo do Estado do Maranhão para facilitar o
                acesso à moradia digna para famílias maranhenses de baixa renda.
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
                    className="text-white/80 hover:text-white transition-colors">
                    Cadastro de Beneficiário
                  </Link>
                </li>
                <li>
                  <Link
                    href="/construtor/cadastro"
                    className="text-white/80 hover:text-white transition-colors">
                    Cadastro de Construtor
                  </Link>
                </li>
                <li>
                  <Link
                    href="/imoveis"
                    className="text-white/80 hover:text-white transition-colors">
                    Imóveis Disponíveis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-white/80 hover:text-white transition-colors">
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
                Dúvidas sobre o programa?
                <br />
                Entre em contato com a SEMAG - Secretaria de Estado de
                Monitoramento de Ações Governamentais.
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>
              © 2025 Governo do Estado do Maranhão - SEMAG. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
