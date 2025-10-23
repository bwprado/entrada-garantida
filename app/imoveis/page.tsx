"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  Home,
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Car,
  Maximize,
  Heart,
  ChevronDown
} from "lucide-react"
import { useState } from "react"

export default function ImoveisPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Encontre Seu Imóvel
            </h2>
            <p className="text-muted-foreground text-lg">
              Navegue pelos imóveis disponíveis no programa e escolha o que
              melhor atende sua família
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por localização, bairro ou tipo de imóvel..."
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" className="px-6">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col gap-6">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <Card>
                <CardContent className="">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-0 h-auto hover:bg-transparent">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Filtros</h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isFiltersOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-6">
                    <div className="grid grid-cols-3 grid-rows-2 gap-4">
                      {/* Tipo de Imóvel */}
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label>Tipo de Imóvel</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="apartamento">
                              Apartamento
                            </SelectItem>
                            <SelectItem value="casa">Casa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cidade */}
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label>Cidade</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todas">Todas</SelectItem>
                            <SelectItem value="sao-luis">São Luís</SelectItem>
                            <SelectItem value="imperatriz">
                              Imperatriz
                            </SelectItem>
                            <SelectItem value="caxias">Caxias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Bairro */}
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label>Bairro</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="cohama">Cohama</SelectItem>
                            <SelectItem value="turu">Turu</SelectItem>
                            <SelectItem value="renascenca">
                              Renascença
                            </SelectItem>
                            <SelectItem value="vinhais">Vinhais</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quartos */}
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label>Quartos</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualquer">Qualquer</SelectItem>
                            <SelectItem value="1">1 quarto</SelectItem>
                            <SelectItem value="2">2 quartos</SelectItem>
                            <SelectItem value="3">3 quartos</SelectItem>
                            <SelectItem value="4">4+ quartos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Vagas */}
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label>Vagas de Garagem</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualquer">Qualquer</SelectItem>
                            <SelectItem value="0">Sem vaga</SelectItem>
                            <SelectItem value="1">1 vaga</SelectItem>
                            <SelectItem value="2">2 vagas</SelectItem>
                            <SelectItem value="3">3+ vagas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Faixa de Preço */}
                      <div className="flex-1 min-w-[200px] space-y-2">
                        <Label>Faixa de Preço</Label>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Qualquer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualquer">Qualquer</SelectItem>
                            <SelectItem value="ate-150">
                              Até R$ 150.000
                            </SelectItem>
                            <SelectItem value="150-200">
                              R$ 150.000 - R$ 200.000
                            </SelectItem>
                            <SelectItem value="200-250">
                              R$ 200.000 - R$ 250.000
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button className="flex-1">Aplicar Filtros</Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent">
                        Limpar Filtros
                      </Button>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>

            {/* Properties Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    342 imóveis
                  </span>{" "}
                  encontrados
                </p>
                <Select defaultValue="recentes">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                    <SelectItem value="menor-preco">Menor preço</SelectItem>
                    <SelectItem value="maior-preco">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Imóvel 1 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src="/modern-apartment-building.png"
                      alt="Residencial Jardim das Flores"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-3 left-3">
                      Disponível
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      Residencial Jardim das Flores
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        Cohama, São Luís - MA
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>2 quartos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>1 vaga</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>65m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ 185.000
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Apartamento
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/imoveis/1">Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Imóvel 2 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src="/residential-house.jpg"
                      alt="Condomínio Vista Verde"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-3 left-3">
                      Disponível
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      Condomínio Vista Verde
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">Turu, São Luís - MA</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>3 quartos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>2 vagas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>95m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ 235.000
                        </p>
                        <p className="text-xs text-muted-foreground">Casa</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/imoveis/2">Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Imóvel 3 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src="/modern-apartment-complex.png"
                      alt="Edifício Solar do Atlântico"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-3 left-3">
                      Disponível
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      Edifício Solar do Atlântico
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        Renascença, São Luís - MA
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>2 quartos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>1 vaga</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>70m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ 198.000
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Apartamento
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/imoveis/3">Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Imóvel 4 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src="/modern-city-townhouses.png"
                      alt="Residencial Parque das Árvores"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-3 left-3">
                      Disponível
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      Residencial Parque das Árvores
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        Vinhais, São Luís - MA
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>2 quartos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>1 vaga</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>68m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ 175.000
                        </p>
                        <p className="text-xs text-muted-foreground">Casa</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/imoveis/4">Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Imóvel 5 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src="/modern-apartment-building.png"
                      alt="Residencial Novo Horizonte"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-3 left-3">
                      Disponível
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      Residencial Novo Horizonte
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        Cohama, São Luís - MA
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>3 quartos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>2 vagas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>85m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ 220.000
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Apartamento
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/imoveis/5">Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Imóvel 6 */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src="/residential-house.jpg"
                      alt="Condomínio Bela Vista"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Badge className="absolute bottom-3 left-3">
                      Disponível
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">
                      Condomínio Bela Vista
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">Turu, São Luís - MA</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>2 quartos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>1 vaga</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>72m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          R$ 192.000
                        </p>
                        <p className="text-xs text-muted-foreground">Casa</p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/imoveis/6">Ver Detalhes</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button variant="outline" disabled className="bg-transparent">
                  Anterior
                </Button>
                <Button variant="default">1</Button>
                <Button variant="outline" className="bg-transparent">
                  2
                </Button>
                <Button variant="outline" className="bg-transparent">
                  3
                </Button>
                <Button variant="outline" className="bg-transparent">
                  ...
                </Button>
                <Button variant="outline" className="bg-transparent">
                  10
                </Button>
                <Button variant="outline" className="bg-transparent">
                  Próximo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Governo do Estado do Maranhão. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
