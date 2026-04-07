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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Compartimentos (mín.)</Label>
                <Select disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Faixa de preço</Label>
                <Select disabled>
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
            <p className="text-xs text-muted-foreground mt-3">
              Use a busca acima para filtrar por título ou endereço. Filtros
              avançados em breve.
            </p>

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
