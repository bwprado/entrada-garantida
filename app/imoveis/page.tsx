"use client"

import imoveis from "@/data/imoveis.json"
import ImovelCard from "./imovel-card"
import PropertyFilters from "./property-filters"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Search } from "lucide-react"

export default function ImoveisPage() {
  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto py-6">
      {/* Hero Section */}
      <section>
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
          <div className="mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por localização, bairro ou tipo de imóvel..."
                  className="pl-10 h-10"
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
      <div className="flex-1 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4">
            <PropertyFilters />
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
                {imoveis.map((item) => (
                  <ImovelCard key={item.id} {...item} />
                ))}
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
