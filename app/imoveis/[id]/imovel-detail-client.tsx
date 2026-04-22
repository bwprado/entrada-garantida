'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { ArrowLeft, MapPin, Bed, Maximize } from 'lucide-react'

function propertyStatusLabel(status: string): string {
  switch (status) {
    case 'validated':
      return 'Disponível'
    case 'pending':
      return 'Em análise'
    case 'draft':
      return 'Rascunho'
    case 'selected':
      return 'Selecionado'
    case 'rejected':
      return 'Indisponível'
    case 'sold':
      return 'Vendido'
    default:
      return status
  }
}

export default function ImovelDetailClient() {
  const params = useParams()
  const raw = params?.id
  const id =
    typeof raw === 'string'
      ? (raw as Id<'properties'>)
      : Array.isArray(raw)
        ? (raw[0] as Id<'properties'>)
        : null

  const property = useQuery(
    api.properties.getForPublicDetail,
    id ? { id } : 'skip'
  )

  const files = useQuery(
    api.r2.getFileUrlAndMetadata,
    property?.filesIds && property.filesIds.length > 0
      ? { fileIds: property.filesIds }
      : 'skip'
  )

  if (id === null) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <p className="text-muted-foreground">Link inválido.</p>
        <Button asChild className="mt-4">
          <Link href="/imoveis">Voltar ao catálogo</Link>
        </Button>
      </div>
    )
  }

  if (property === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (property === null) {
    return (
      <div className="container max-w-3xl py-16 text-center space-y-4">
        <p className="text-muted-foreground">
          Imóvel não encontrado ou indisponível no catálogo.
        </p>
        <Button asChild variant="outline">
          <Link href="/imoveis">
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao catálogo
          </Link>
        </Button>
      </div>
    )
  }

  const images = files ?? []
  const price = property.valorVenda.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })

  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 pb-12">
      <div className="py-4">
        <Button variant="ghost" size="sm" asChild className="-ms-2">
          <Link href="/imoveis">
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao catálogo
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {property.filesIds && property.filesIds.length > 0 && files === undefined ? (
            <div className="flex aspect-[16/10] items-center justify-center rounded-lg border bg-muted">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : images.length > 0 ? (
            <Carousel className="w-full rounded-lg border bg-muted overflow-hidden">
              <CarouselContent>
                {images.map((file) => (
                  <CarouselItem key={file._id}>
                    <div className="relative aspect-[16/10] w-full bg-muted">
                      <Image
                        src={file.url}
                        alt={property.titulo}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 ? (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              ) : null}
            </Carousel>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
              Sem fotos
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle className="text-2xl">{property.titulo}</CardTitle>
                <Badge variant="secondary">
                  {propertyStatusLabel(property.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.descricao ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {property.descricao}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" />
                  {property.endereco}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardContent className="pt-6 space-y-4">
              <p className="text-3xl font-bold text-primary tabular-nums">
                {price}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Bed className="size-4" />
                  {property.compartimentos} compart.
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Maximize className="size-4" />
                  {property.tamanho} m²
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
