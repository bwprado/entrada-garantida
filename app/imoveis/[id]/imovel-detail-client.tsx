'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel
} from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import PropertyMap from '@/components/property-map'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import {
  ArrowLeft,
  Bed,
  CalendarDays,
  Maximize,
  Share2
} from 'lucide-react'

function propertyStatusLabel(status: string): string {
  switch (status) {
    case 'validated':
      return 'Disponivel'
    case 'paused':
      return 'Pausado'
    case 'pending':
      return 'Em analise'
    case 'draft':
      return 'Rascunho'
    case 'selected':
      return 'Selecionado'
    case 'rejected':
      return 'Indisponivel'
    case 'sold':
      return 'Vendido'
    default:
      return status
  }
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function CarouselCounter() {
  const { api: carouselApi } = useCarousel()
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!carouselApi) return
    const update = () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1)
      setTotal(carouselApi.scrollSnapList().length)
    }
    update()
    carouselApi.on('select', update)
    carouselApi.on('reInit', update)
    return () => {
      carouselApi.off('select', update)
      carouselApi.off('reInit', update)
    }
  }, [carouselApi])

  if (total <= 1) return null

  return (
    <div className="absolute top-4 right-4 z-10 rounded-full bg-white/80 backdrop-blur-md border border-white/10 px-3 py-1 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
      {current} / {total}
    </div>
  )
}

function ThumbnailStrip({
  images
}: {
  images: Array<{ url: string; _id: string }>
}) {
  const { api: carouselApi } = useCarousel()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!carouselApi) return
    const update = () => setActive(carouselApi.selectedScrollSnap())
    carouselApi.on('select', update)
    carouselApi.on('reInit', update)
    return () => {
      carouselApi.off('select', update)
      carouselApi.off('reInit', update)
    }
  }, [carouselApi])

  if (images.length <= 1) return null

  return (
    <div className="flex gap-2 mt-3 overflow-x-auto py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {images.map((img, i) => (
        <button
          key={img._id}
          type="button"
          onClick={() => carouselApi?.scrollTo(i)}
          className={`relative shrink-0 size-16 rounded-lg overflow-hidden ring-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            i === active
              ? 'ring-primary ring-offset-2 scale-105'
              : 'ring-transparent opacity-70 hover:opacity-100'
          }`}
        >
          <Image
            src={img.url}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        </button>
      ))}
    </div>
  )
}

function FadeSection({
  children,
  index = 0,
  className = ''
}: {
  children: React.ReactNode
  index?: number
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        animation: 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        animationDelay: `${index * 100}ms`
      }}
    >
      {children}
    </div>
  )
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
        <p className="text-muted-foreground">Link invalido.</p>
        <Button asChild className="mt-4">
          <Link href="/imoveis">Voltar ao catalogo</Link>
        </Button>
      </div>
    )
  }

  if (property === undefined) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (property === null) {
    return (
      <div className="container max-w-3xl py-16 text-center space-y-4">
        <p className="text-muted-foreground">
          Imovel nao encontrado ou indisponivel no catalogo.
        </p>
        <Button asChild variant="outline">
          <Link href="/imoveis">
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao catalogo
          </Link>
        </Button>
      </div>
    )
  }

  const images = files ?? []
  const price = formatPrice(property.valorVenda)
  const constructionYear = new Date(property.dataConstrucao).getFullYear()

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <FadeSection index={0}>
        <div className="py-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/imoveis">
              <ArrowLeft className="mr-2 size-4" />
              Voltar ao catalogo
            </Link>
          </Button>
        </div>
      </FadeSection>

      <FadeSection index={1}>
        <Carousel
          className="w-full rounded-2xl overflow-hidden"
          opts={{ loop: true }}
        >
          <CarouselContent className="-ml-0">
            {property.filesIds && property.filesIds.length > 0 && files === undefined ? (
              <CarouselItem className="pl-0">
                <div className="flex aspect-[4/3] md:aspect-[21/9] items-center justify-center bg-muted">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              </CarouselItem>
            ) : images.length > 0 ? (
              images.map((file) => (
                <CarouselItem key={file._id} className="pl-0">
                  <div className="relative aspect-[4/3] md:aspect-[21/9] w-full bg-muted">
                    <Image
                      src={file.url}
                      alt={property.titulo}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 100vw"
                      priority
                    />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/20 to-transparent" />
                      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/20 to-transparent" />
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="pl-0">
                <div className="flex aspect-[4/3] md:aspect-[21/9] items-center justify-center bg-muted text-sm text-muted-foreground">
                  Sem fotos
                </div>
              </CarouselItem>
            )}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-white/80 backdrop-blur-md border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/90 size-10 rounded-full" />
              <CarouselNext className="right-4 bg-white/80 backdrop-blur-md border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/90 size-10 rounded-full" />
            </>
          )}

          <CarouselCounter />
          <ThumbnailStrip images={images} />
        </Carousel>
      </FadeSection>

      <FadeSection index={2} className="mt-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl tracking-tighter font-semibold leading-tight">
              {property.titulo}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {property.endereco}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="secondary">{propertyStatusLabel(property.status)}</Badge>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full size-9"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.titulo, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                }
              }}
            >
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </FadeSection>

      <FadeSection index={3}>
        <Separator className="my-6" />
        <div className="flex flex-wrap gap-6 md:gap-8 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Bed className="size-5" strokeWidth={1.5} />
            <span className="font-medium text-foreground">{property.compartimentos}</span> compartimentos
          </span>
          <span className="inline-flex items-center gap-2">
            <Maximize className="size-5" strokeWidth={1.5} />
            <span className="font-medium text-foreground">{property.tamanho}</span> m2
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-5" strokeWidth={1.5} />
            <span className="font-medium text-foreground">{constructionYear}</span>
          </span>
        </div>
        <Separator className="mt-6" />
      </FadeSection>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 mt-8">
        <div className="space-y-10">
          <FadeSection index={4}>
            <section>
              <h2 className="text-lg font-semibold tracking-tight mb-4">
                Sobre este imovel
              </h2>
              {property.descricao ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap prose-width">
                  {property.descricao}
                </p>
              ) : (
                <p className="text-muted-foreground leading-relaxed prose-width">
                  Nenhuma descricao disponivel para este imovel.
                </p>
              )}
            </section>
          </FadeSection>

          <FadeSection index={5}>
            <section>
              <h2 className="text-lg font-semibold tracking-tight mb-4">
                Localizacao
              </h2>
              <PropertyMap address={property.endereco} />
              <p className="text-sm text-muted-foreground mt-3">
                {property.endereco}
              </p>
            </section>
          </FadeSection>
        </div>

        <div className="lg:col-start-2 lg:row-start-1">
          <FadeSection index={2}>
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-brand-lg">
              <p className="text-3xl font-bold tracking-tight tabular-nums">
                {price}
              </p>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Bed className="size-4" strokeWidth={1.5} />
                    Compartimentos
                  </span>
                  <span className="font-medium text-foreground">{property.compartimentos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <Maximize className="size-4" strokeWidth={1.5} />
                    Area
                  </span>
                  <span className="font-medium text-foreground">{property.tamanho} m2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4" strokeWidth={1.5} />
                    Construcao
                  </span>
                  <span className="font-medium text-foreground">{constructionYear}</span>
                </div>
              </div>

              <Button className="w-full mt-6 h-12 text-base font-semibold rounded-xl shadow-brand-colored transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] active:translate-y-[1px]">
                Adquirir
              </Button>
            </div>
          </FadeSection>
        </div>
      </div>
    </div>
  )
}