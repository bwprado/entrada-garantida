"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@/components/ui/collapsible"
import { SlidersHorizontal } from "lucide-react"
import { ChevronDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import { useState } from "react"

export default function PropertyFilters() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  return (
    <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
      <Card size="md">
        <CardContent>
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
                    <SelectItem value="apartamento">Apartamento</SelectItem>
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
                    <SelectItem value="imperatriz">Imperatriz</SelectItem>
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
                    <SelectItem value="renascenca">Renascença</SelectItem>
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
                    <SelectItem value="ate-150">Até R$ 150.000</SelectItem>
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
              <Button variant="outline" className="flex-1 bg-transparent">
                Limpar Filtros
              </Button>
              <Button className="flex-1">Aplicar Filtros</Button>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  )
}
