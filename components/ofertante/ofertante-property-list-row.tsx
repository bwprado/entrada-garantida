'use client'

import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Home, Pencil, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusLabel = {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}

function propertyStatusLabel(
  status: Doc<'properties'>['status']
): StatusLabel {
  switch (status) {
    case 'draft':
      return { label: 'Rascunho', variant: 'secondary' }
    case 'pending':
      return { label: 'Em análise', variant: 'default' }
    case 'validated':
      return { label: 'Aprovado', variant: 'default' }
    case 'selected':
      return { label: 'Selecionado', variant: 'default' }
    case 'rejected':
      return { label: 'Rejeitado', variant: 'destructive' }
    case 'sold':
      return { label: 'Vendido', variant: 'outline' }
    default:
      return { label: status, variant: 'outline' }
  }
}

export function OfertantePropertyListRow({
  property: p
}: {
  property: Doc<'properties'>
}) {
  const firstId = p.filesIds?.[0]
  const thumb = useQuery(
    api.r2.getFileUrlAndMetadata,
    firstId ? { fileIds: [firstId] } : 'skip'
  )
  const url = thumb?.[0]?.url
  const { label, variant } = propertyStatusLabel(p.status)
  const editHref = `/ofertante/imoveis/cadastro?propertyId=${p._id}`

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-stretch',
        'sm:gap-4'
      )}
    >
      <Link
        href={editHref}
        className="flex shrink-0 items-center gap-3 min-w-0 sm:w-[min(100%,7.5rem)]"
      >
        <div className="relative h-20 w-full overflow-hidden rounded-md bg-muted sm:h-full sm:min-h-[5rem] sm:w-32">
          {url ? (
            <Image
              src={url}
              alt={p.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 120px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {firstId && thumb === undefined ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Home className="size-7 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href={editHref} className="min-w-0 space-y-1 text-left sm:flex-1">
          <p className="font-medium leading-tight hover:underline">{p.titulo}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {p.endereco}
          </p>
          <p className="text-sm tabular-nums text-muted-foreground">
            {p.valorVenda.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </p>
        </Link>
        <div className="flex flex-col gap-2 sm:items-end sm:shrink-0">
          <Badge variant={variant} className="w-fit">
            {label}
          </Badge>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={editHref}>
                <Pencil className="mr-1.5 size-3.5" />
                Editar
              </Link>
            </Button>
            {p.status === 'validated' ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/imoveis/${p._id}`}>
                  <ExternalLink className="mr-1.5 size-3.5" />
                  Ver anúncio
                </Link>
              </Button>
            ) : (
              <p className="w-full text-xs text-muted-foreground sm:text-right">
                Anúncio disponível após aprovação
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
