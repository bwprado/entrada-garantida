'use client'

import ImovelCard from './imovel-card'
import PropertyFilters from './property-filters'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { api } from '@/convex/_generated/api'
import { useAuth } from '@/lib/auth-context'
import { useMutation, useQuery } from 'convex/react'
import { AlertCircle, Heart, Loader2, Search, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ImoveisClient() {
  const { user, isAuthenticated } = useAuth()
  const properties = useQuery(api.properties.getValidated, {})

  const selectionState = useQuery(
    api.properties.getUserPropertySelectionState,
    user ? { userId: user._id } : 'skip'
  )

  const selectPropertyMutation = useMutation(api.users.selectProperty)
  const removePropertyMutation = useMutation(api.users.removePropertySelection)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recentes')
  const [loadingPropertyId, setLoadingPropertyId] = useState<string | null>(
    null
  )

  const selectedPropertyId = selectionState?.selectedProperty?._id ?? null
  const selectionLocked = Boolean(selectionState?.selectionLocked)

  // Filter properties based on search
  const filteredProperties = properties?.filter((property) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      property.titulo.toLowerCase().includes(query) ||
      property.endereco.toLowerCase().includes(query)
    )
  })

  // Sort properties
  const sortedProperties = [...(filteredProperties || [])].sort((a, b) => {
    switch (sortBy) {
      case 'menor-preco':
        return a.valorVenda - b.valorVenda
      case 'maior-preco':
        return b.valorVenda - a.valorVenda
      case 'recentes':
      default:
        return b.criadoEm - a.criadoEm
    }
  })

  const handleSelectProperty = async (propertyId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para selecionar imóveis')
      return
    }

    setLoadingPropertyId(propertyId)
    try {
      await selectPropertyMutation({
        userId: user._id,
        propertyId: propertyId as any
      })
      toast.success('Imóvel confirmado com sucesso')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao selecionar imóvel')
    } finally {
      setLoadingPropertyId(null)
    }
  }

  const handleRemoveProperty = async (propertyId: string) => {
    if (!isAuthenticated || !user) return

    setLoadingPropertyId(propertyId)
    try {
      await removePropertyMutation({
        userId: user._id,
        propertyId: propertyId as any
      })
      toast.success('Imóvel removido da seleção')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover imóvel')
    } finally {
      setLoadingPropertyId(null)
    }
  }

  const isPropertySelected = (propertyId: string) => {
    return selectedPropertyId === propertyId
  }

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
              Navegue pelos imóveis disponíveis na Aquisição Assistida e escolha
              até 3 opções
            </p>

            {/* Selection Counter */}
            {isAuthenticated && (
              <div className="mt-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-medium">
                    {!selectedPropertyId
                      ? 'Você ainda não confirmou um imóvel'
                      : selectionLocked
                        ? 'Você possui um imóvel confirmado e bloqueado'
                        : 'Você possui um imóvel confirmado'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por localização, bairro ou tipo de imóvel..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="px-8">
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

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {sortedProperties.length} imóveis
                </span>{' '}
                encontrados
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
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

            {/* Properties Grid */}
            {sortedProperties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum imóvel encontrado com os critérios selecionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProperties.map((property) => (
                  <div key={property._id} className="relative">
                    <ImovelCard
                      id={property._id}
                      title={property.titulo}
                      location={property.endereco}
                      imageSrc={
                        property.coverImageUrl ?? '/placeholder-property.jpg'
                      }
                      status={
                        property.status === 'validated'
                          ? 'Disponível'
                          : property.status
                      }
                      compartimentos={property.compartimentos ?? 0}
                      areaM2={property.tamanho}
                      priceBRL={property.valorVenda}
                      type="Imóvel"
                      href={`/imoveis/${property._id}`}
                    />

                    {/* Selection Button */}
                    {isAuthenticated && (
                      <div className="absolute top-3 right-3">
                        {isPropertySelected(property._id) ? (
                          <Button
                            size="icon"
                            variant="destructive"
                            className="rounded-full shadow-lg"
                            onClick={() => handleRemoveProperty(property._id)}
                            disabled={
                              selectionLocked || loadingPropertyId === property._id
                            }
                          >
                            {loadingPropertyId === property._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="secondary"
                            className={`rounded-full shadow-lg ${
                              selectionLocked && !isPropertySelected(property._id)
                                ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed'
                                : 'bg-background/80 hover:bg-background'
                            }`}
                            onClick={() => handleSelectProperty(property._id)}
                            disabled={
                              (selectionLocked &&
                                !isPropertySelected(property._id)) ||
                              loadingPropertyId === property._id
                            }
                          >
                            {loadingPropertyId === property._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Selected Badge */}
                    {isPropertySelected(property._id) && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        Imóvel confirmado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state for locked selection */}
            {isAuthenticated &&
              selectionLocked &&
              sortedProperties.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Sua seleção está bloqueada. A troca só poderá ser feita após
                    liberação da equipe responsável.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  )
}
