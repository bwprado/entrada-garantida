'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useAuth } from '@/lib/auth-context'
import { documentTipoLabel } from '@/lib/document-tipo-labels'
import { FileTypeIconView } from '@/lib/file-type-icon'
import { useMutation, useQuery } from 'convex/react'
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  Check,
  X
} from 'lucide-react'

function parsePropertyId(raw: string | string[] | undefined): Id<'properties'> | null {
  if (typeof raw === 'string' && raw.length > 0) {
    return raw as Id<'properties'>
  }
  if (Array.isArray(raw) && raw[0]) {
    return raw[0] as Id<'properties'>
  }
  return null
}

export function RevisarClient() {
  const params = useParams()
  const propertyId = parsePropertyId(params?.id)
  const { user } = useAuth()

  const review = useQuery(
    api.properties.getForAdminReview,
    propertyId ? { propertyId } : 'skip'
  )
  const docRows = useQuery(
    api.documents.getPropertyDocumentsWithFiles,
    propertyId ? { propertyId } : 'skip'
  )

  const fileIdList = useMemo(() => {
    const p = review?.property
    if (!p) return [] as Id<'files'>[]
    const s = new Set<string>()
    for (const id of p.filesIds ?? []) s.add(id as string)
    for (const row of docRows ?? []) {
      if (row.file?._id) s.add(row.file._id as string)
    }
    return [...s] as Id<'files'>[]
  }, [review?.property, docRows])

  const filesResolved = useQuery(
    api.r2.getFileUrlAndMetadata,
    fileIdList.length > 0 ? { fileIds: fileIdList } : 'skip'
  )

  const urlByFileId = useMemo(() => {
    const m = new Map<string, string>()
    for (const f of filesResolved ?? []) {
      m.set(f._id, f.url)
    }
    return m
  }, [filesResolved])

  const approveAll = useMutation(api.properties.approveAll)
  const rejectMut = useMutation(api.properties.reject)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [busy, setBusy] = useState(false)

  if (propertyId === null) {
    return (
      <p className="text-center text-muted-foreground">Link inválido.</p>
    )
  }

  if (review === undefined || docRows === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (review === null) {
    return (
      <p className="text-center text-muted-foreground">
        Imóvel não encontrado.
      </p>
    )
  }

  const { property: p, ofertante, construtor } = review
  const isPending = p.status === 'pending'
  const owner =
    ofertante != null ? ofertante : construtor != null ? construtor : null
  const ownerLabel = ofertante != null ? 'Ofertante' : 'Construtor'

  async function handleApprove() {
    if (!user?._id) {
      toast.error('Sessão inválida')
      return
    }
    setBusy(true)
    try {
      await approveAll({ propertyId: p._id, adminId: user._id })
      toast.success('Imóvel aprovado')
      setApproveOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao aprovar')
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    const t = motivo.trim()
    if (t.length < 3) {
      toast.error('Informe o motivo da rejeição (mín. 3 caracteres).')
      return
    }
    if (!user?._id) {
      toast.error('Sessão inválida')
      return
    }
    setBusy(true)
    try {
      await rejectMut({ propertyId: p._id, adminId: user._id, motivo: t })
      toast.success('Imóvel rejeitado; o ofertante verá o motivo no painel.')
      setRejectOpen(false)
      setMotivo('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao rejeitar')
    } finally {
      setBusy(false)
    }
  }

  const dataLabel = new Date(p.dataConstrucao).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{p.titulo}</h1>
          <p className="text-muted-foreground mt-1">{p.endereco}</p>
          {owner && (
            <p className="text-sm text-muted-foreground mt-2">
              {ownerLabel}: <span className="text-foreground">{owner.nome}</span>
              {owner.email ? (
                <>
                  {' '}
                  ·{' '}
                  <a
                    href={`mailto:${owner.email}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {owner.email}
                  </a>
                </>
              ) : null}
            </p>
          )}
        </div>
        {isPending && user?._id && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              className="gap-1.5"
              onClick={() => setApproveOpen(true)}
            >
              <Check className="size-4" />
              Aprovar
            </Button>
            <Button
              variant="destructive"
              className="gap-1.5"
              onClick={() => setRejectOpen(true)}
            >
              <X className="size-4" />
              Rejeitar
            </Button>
          </div>
        )}
        {!isPending && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Status atual: <strong>{p.status}</strong> — ações de aprovação
            ficam disponíveis apenas para imóveis em análise.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do imóvel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">Preço de venda</span>
            <p className="font-medium">
              {p.valorVenda.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Compartimentos</span>
            <p className="font-medium">{p.compartimentos}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Área (m²)</span>
            <p className="font-medium">{p.tamanho}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Data de construção</span>
            <p className="font-medium">{dataLabel}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Matrícula (informada)</span>
            <p className="font-medium break-words">{p.matricula}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Inscrição imobiliária</span>
            <p className="font-medium break-words">{p.inscricaoImobiliaria}</p>
          </div>
          {p.cep && (
            <div>
              <span className="text-muted-foreground">CEP</span>
              <p className="font-medium">{p.cep}</p>
            </div>
          )}
          {p.descricao && (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Descrição</span>
              <p className="font-medium whitespace-pre-wrap">{p.descricao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {p.filesIds && p.filesIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fotos do anúncio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {p.filesIds.map((fid) => {
                const u = urlByFileId.get(fid as string)
                return (
                  <a
                    key={fid}
                    href={u ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted"
                  >
                    {u ? (
                      <Image
                        src={u}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 50vw, 200px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="size-5" />
            Documentos do imóvel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!docRows.length && (
            <p className="text-sm text-muted-foreground">
              Nenhum documento vinculado no registro.
            </p>
          )}
          {docRows.map(({ document: d, file }) => {
            const href = file?._id
              ? urlByFileId.get(file._id as string)
              : undefined
            return (
              <div
                key={d._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileTypeIconView
                    type={file?.type ?? 'application/octet-stream'}
                    name={file?.name ?? d.nomeOriginal}
                    className="size-10 shrink-0"
                    iconClassName="size-5"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">
                      {documentTipoLabel(d.tipo)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.nomeOriginal}
                    </p>
                  </div>
                </div>
                {href ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" />
                      Abrir
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-amber-600">Sem arquivo</span>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar este imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              O imóvel passará a constar como validado e poderá entrar no fluxo
              do programa conforme as regras vigentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button disabled={busy} onClick={() => void handleApprove()}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirmar aprovação'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(o) => {
          setRejectOpen(o)
          if (!o) setMotivo('')
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar cadastro</AlertDialogTitle>
            <AlertDialogDescription>
              O motivo abaixo será exibido ao ofertante no painel, para que
              possa ajustar o que for necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="motivo-rejeicao">Motivo</Label>
            <Textarea
              id="motivo-rejeicao"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o que precisa ser corrigido…"
              rows={4}
              className="min-h-24"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void handleReject()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirmar rejeição'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function RevisarBackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ms-2">
      <Link href="/admin/imoveis">
        <ArrowLeft className="mr-2 size-4" />
        Imóveis
      </Link>
    </Button>
  )
}
