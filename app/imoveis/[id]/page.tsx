import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Heart,
  Share2,
  Building2,
  CheckCircle2,
  Calendar,
  DollarSign
} from "lucide-react"

export default function ImovelDetalhesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/imoveis">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o catálogo
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative h-96 bg-muted">
                  <img
                    src="/modern-apartment-building.png"
                    alt="Residencial Jardim das Flores"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-background/80 hover:bg-background">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-4 left-4">Disponível</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 p-4">
                  <div className="h-20 bg-muted rounded-lg overflow-hidden">
                    <img
                      src="/modern-apartment-building.png"
                      alt="Foto 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="h-20 bg-muted rounded-lg overflow-hidden">
                    <img
                      src="/modern-apartment-complex.png"
                      alt="Foto 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="h-20 bg-muted rounded-lg overflow-hidden">
                    <img
                      src="/modern-city-townhouses.png"
                      alt="Foto 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="h-20 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    <span className="text-sm font-medium">+5 fotos</span>
                  </div>
                </div>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        Residencial Jardim das Flores
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Rua das Flores, 123 - Cohama, São Luís - MA</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        R$ 185.000
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Apartamento
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bed className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quartos</p>
                        <p className="font-semibold">2</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bath className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Banheiros
                        </p>
                        <p className="font-semibold">1</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vagas</p>
                        <p className="font-semibold">1</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Maximize className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Área</p>
                        <p className="font-semibold">65m²</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Descrição</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Apartamento moderno e bem localizado no bairro Cohama,
                      próximo a escolas, supermercados e transporte público. O
                      empreendimento conta com área de lazer completa, incluindo
                      piscina, churrasqueira, playground e salão de festas.
                      Unidade com 2 quartos, sala, cozinha, banheiro e área de
                      serviço. Acabamento de primeira qualidade com piso
                      porcelanato, janelas com vidro temperado e portas em
                      madeira de lei.
                    </p>
                  </div>

                  <Separator />

                  {/* Características */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Características</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Piscina</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Churrasqueira</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Playground</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Salão de Festas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Portaria 24h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Elevador</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Academia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-sm">Área Verde</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Localização */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">Localização</h3>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Mapa da localização
                      </p>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <strong>Endereço:</strong> Rua das Flores, 123 - Cohama,
                        São Luís - MA
                      </p>
                      <p className="text-muted-foreground">
                        <strong>CEP:</strong> 65074-000
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Construtor Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <CardTitle>Sobre o Construtor</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">Construtora ABC Ltda</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Empresa com mais de 15 anos de experiência no mercado
                        imobiliário maranhense, com diversos empreendimentos
                        entregues.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">CNPJ</p>
                          <p className="font-medium">12.345.678/0001-00</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Empreendimentos
                          </p>
                          <p className="font-medium">12 no programa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Solicitar Imóvel */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Este Imóvel</CardTitle>
                  <CardDescription>
                    Faça sua solicitação para este imóvel através do programa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Valor do Imóvel
                      </span>
                      <span className="font-bold">R$ 185.000</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subsídio Estimado
                      </span>
                      <span className="font-bold text-secondary">
                        R$ 37.000
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Valor Final</span>
                      <span className="text-xl font-bold text-primary">
                        R$ 148.000
                      </span>
                    </div>
                  </div>

                  <Button size="lg" className="w-full">
                    Solicitar Imóvel
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    Você precisa estar cadastrado e aprovado no programa para
                    solicitar este imóvel
                  </p>
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Informações Adicionais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">
                        Previsão de Entrega
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dezembro de 2025
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Financiamento</p>
                      <p className="text-sm text-muted-foreground">
                        Disponível através do programa
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1">Status</p>
                      <p className="text-sm text-muted-foreground">
                        Aprovado pelo programa
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dúvidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dúvidas?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Entre em contato com nossa equipe para mais informações
                    sobre este imóvel ou sobre o programa.
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    Falar com Atendimento
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Governo do Estado do Maranhão. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
