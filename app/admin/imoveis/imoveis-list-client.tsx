'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Building2, ChevronRight, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_ALL = 'all' as const

const STATUS_OPTIONS: {
  value: typeof STATUS_ALL | Doc<'properties'>['status']
  label: string
}[] = [
  { value: STATUS_ALL, label: 'Todos os status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'pending', label: 'Em análise' },
  { value: 'validated', label: 'Validado' },
  { value: 'paused', label: 'Pausado' },
  { value: 'selected', label: 'Selecionado' },
  { value: 'rejected', label: 'Rejeitado' },
  { value: 'sold', label: 'Vendido' }
]

function statusBadgeClass(status: Doc<'properties'>['status']): string {
  switch (status) {
    case 'draft':
      return 'bg-muted text-muted-foreground'
    case 'pending':
      return 'bg-amber-500/15 text-amber-900 dark:text-amber-200'
    case 'validated':
      return 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-200'
    case 'paused':
      return 'bg-sky-500/15 text-sky-900 dark:text-sky-200'
    case 'selected':
      return 'bg-primary/15 text-primary'
    case 'rejected':
      return 'bg-destructive/15 text-destructive'
    case 'sold':
      return 'bg-secondary'
    default:
      return ''
  }
}

function statusRowLabel(status: Doc<'properties'>['status']): string {
  const row = STATUS_OPTIONS.find((o) => o.value === status)
  return row?.label ?? status
}

function RowThumb({ fileId }: { fileId: Id<'files'> }) {
  const files = useQuery(api.r2.getFileUrlAndMetadata, {
    fileIds: [fileId]
  })
  const url = files?.[0]?.url
  return (
    <div className="relative h-20 w-full min-w-0 overflow-hidden rounded-md bg-muted sm:h-full sm:min-h-20 sm:w-32">
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          className="object-cover"
          sizes="128px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          {files === undefined ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Building2 className="size-8 opacity-50" />
          )}
        </div>
      )}
    </div>
  )
}

export function ImoveisListClient() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusKey, setStatusKey] = useState<string>(STATUS_ALL)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const rows = useQuery(api.properties.getListForAdmin, {
    status: statusKey === STATUS_ALL ? undefined : (statusKey as Doc<'properties'>['status']),
    searchQuery: debouncedSearch.trim() || undefined
  })

  if (rows === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
          <CardDescription>
            Por status (usa índice) e busca no título, endereço, matrícula e
            inscrição imobiliária.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:w-56">
            <Label htmlFor="imoveis-status">Status</Label>
            <Select value={statusKey} onValueChange={setStatusKey}>
              <SelectTrigger id="imoveis-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={String(o.value)} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1">
            <Label htmlFor="imoveis-search" className="sr-only">
              Buscar
            </Label>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="imoveis-search"
              placeholder="Buscar por título, endereço, matrícula…"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">
          Nenhum imóvel encontrado com estes critérios.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ property: p, ofertante, construtor }) => {
            const firstId = p.filesIds?.[0]
            const owner =
              ofertante != null
                ? ofertante
                : construtor != null
                  ? construtor
                  : null
            return (
              <li key={p._id}>
                <div
                  className={cn(
                    'flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row',
                    'sm:items-stretch sm:gap-4'
                  )}
                >
                  {firstId ? (
                    <RowThumb fileId={firstId} />
                  ) : (
                    <div className="flex h-20 w-full min-w-0 items-center justify-center rounded-md bg-muted sm:h-full sm:min-h-20 sm:w-32">
                      <Building2 className="size-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="min-w-0 flex flex-1 flex-col justify-center gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-tight line-clamp-2">
                        {p.titulo}
                      </p>
                      <Badge
                        className={cn('shrink-0 font-normal', statusBadgeClass(p.status))}
                        variant="secondary"
                      >
                        {statusRowLabel(p.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {p.endereco}
                    </p>
                    {owner && (
                      <p className="text-xs text-muted-foreground">
                        {ofertante ? 'Ofertante' : 'Construtor'}: {owner.nome}
                        {owner.email ? ` · ${owner.email}` : null}
                      </p>
                    )}
                    <p className="text-sm font-medium text-foreground">
                      {p.valorVenda.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center sm:items-end">
                    <Button variant="secondary" asChild>
                      <Link
                        href={`/admin/imoveis/${p._id}/revisar`}
                        className="inline-flex items-center gap-1"
                      >
                        {p.status === 'pending' ? 'Revisar' : 'Ver detalhes'}
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
