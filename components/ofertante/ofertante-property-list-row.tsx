'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { ExternalLink, Home, Loader2, Pencil, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusLabel = {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
}

function rejectionReasonDisplay(property: Doc<'properties'>): string | undefined {
  const m = property.motivoRejeicao?.trim()
  if (m) return m
  return property.notasValidacao?.dadosPessoais?.trim() || undefined
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitForValidation = useMutation(api.properties.submitForValidation)

  const firstId = p.filesIds?.[0]
  const thumb = useQuery(
    api.r2.getFileUrlAndMetadata,
    firstId ? { fileIds: [firstId] } : 'skip'
  )
  const url = thumb?.[0]?.url
  const { label, variant } = propertyStatusLabel(p.status)
  const motivoRejeicao = rejectionReasonDisplay(p)
  const editHref = `/ofertante/imoveis/cadastro?propertyId=${p._id}`

  async function handleSubmitForValidation() {
    setIsSubmitting(true)
    try {
      await submitForValidation({ propertyId: p._id })
      toast.success('Imóvel enviado para análise')
      setConfirmOpen(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível enviar'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link href={editHref}>
                  <Pencil className="mr-1.5 size-3.5" />
                  Editar
                </Link>
              </Button>
              {p.status === 'validated' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/imoveis/${p._id}`}>
                    <ExternalLink className="mr-1.5 size-3.5" />
                    Ver anúncio
                  </Link>
                </Button>
              )}
              {(p.status === 'draft' || p.status === 'rejected') && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Send className="mr-1.5 size-3.5" />
                    Enviar para análise
                  </Button>
                  <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Enviar imóvel para análise?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Após o envio, a equipe irá analisar o cadastro. A
                          edição dos dados pelo formulário fica limitada às
                          regras do sistema para imóveis que não estão mais em
                          rascunho.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                          Cancelar
                        </AlertDialogCancel>
                        <Button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => void handleSubmitForValidation()}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Enviando…
                            </>
                          ) : (
                            'Confirmar envio'
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
            {p.status === 'pending' && (
              <p className="max-w-sm text-right text-xs text-muted-foreground">
                Aguardando análise da equipe.
              </p>
            )}
            {p.status === 'rejected' && (
              <div className="max-w-sm text-right text-xs text-destructive space-y-1">
                <p>Cadastro indeferido.</p>
                {motivoRejeicao ? (
                  <p className="whitespace-pre-wrap break-words text-foreground/90">
                    {motivoRejeicao}
                  </p>
                ) : (
                  <p className="text-destructive/90">
                    Ajuste o que for necessário com o apoio da equipe.
                  </p>
                )}
              </div>
            )}
            {p.status === 'selected' && (
              <p className="max-w-sm text-right text-xs text-muted-foreground">
                Imóvel vinculado a um processo de seleção.
              </p>
            )}
            {p.status === 'sold' && (
              <p className="max-w-sm text-right text-xs text-muted-foreground">
                Imóvel vendido pelo programa.
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
