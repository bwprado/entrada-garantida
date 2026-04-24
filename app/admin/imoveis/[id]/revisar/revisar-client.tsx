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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
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
  X,
  Pause,
  Play,
  Ban,
  RotateCcw,
  Users
} from 'lucide-react'

function parsePropertyId(
  raw: string | string[] | undefined
): Id<'properties'> | null {
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

  const selections = useQuery(
    api.properties.getSelectionsForProperty,
    propertyId && review ? { propertyId } : 'skip'
  )

  const interessadosSorted = useMemo(() => {
    const rows = selections ?? []
    return [...rows].sort((a, b) => {
      const o = a.selection.ordemPreferencia - b.selection.ordemPreferencia
      if (o !== 0) return o
      return a.selection.selecionadoEm - b.selection.selecionadoEm
    })
  }, [selections])

  const urlByFileId = useMemo(() => {
    const m = new Map<string, string>()
    for (const f of filesResolved ?? []) {
      m.set(f._id, f.url)
    }
    return m
  }, [filesResolved])

  const approveAll = useMutation(api.properties.approveAll)
  const rejectMut = useMutation(api.properties.reject)
  const pauseListing = useMutation(api.properties.pauseListing)
  const resumeListing = useMutation(api.properties.resumeListing)
  const adminInvalidateListing = useMutation(
    api.properties.adminInvalidateListing
  )
  const reopenToPending = useMutation(api.properties.reopenToPending)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [invalidateOpen, setInvalidateOpen] = useState(false)
  const [motivoInvalidate, setMotivoInvalidate] = useState('')
  const [reopenOpen, setReopenOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  if (propertyId === null) {
    return <p className="text-center text-muted-foreground">Link inválido.</p>
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
  const canPause = p.status === 'validated'
  const canResume = p.status === 'paused'
  const canInvalidate = p.status === 'validated' || p.status === 'paused'
  const canReopen =
    p.status === 'validated' || p.status === 'paused' || p.status === 'rejected'
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

  async function handlePause() {
    setBusy(true)
    try {
      await pauseListing({ propertyId: p._id })
      toast.success('Anúncio pausado (fora do catálogo).')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao pausar')
    } finally {
      setBusy(false)
    }
  }

  async function handleResume() {
    setBusy(true)
    try {
      await resumeListing({ propertyId: p._id })
      toast.success('Anúncio reativado no catálogo.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao retomar')
    } finally {
      setBusy(false)
    }
  }

  async function handleInvalidate() {
    const t = motivoInvalidate.trim()
    if (t.length < 3) {
      toast.error('Informe o motivo (mín. 3 caracteres).')
      return
    }
    if (!user?._id) {
      toast.error('Sessão inválida')
      return
    }
    setBusy(true)
    try {
      await adminInvalidateListing({
        propertyId: p._id,
        adminId: user._id,
        motivo: t
      })
      toast.success(
        'Publicação invalidada; interesses dos beneficiários foram removidos.'
      )
      setInvalidateOpen(false)
      setMotivoInvalidate('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao invalidar')
    } finally {
      setBusy(false)
    }
  }

  async function handleReopen() {
    setBusy(true)
    try {
      await reopenToPending({ propertyId: p._id })
      toast.success('Imóvel reaberto para análise (checklist resetado).')
      setReopenOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao reabrir')
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
              {ownerLabel}:{' '}
              <span className="text-foreground">{owner.nome}</span>
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
        {!isPending &&
          user?._id &&
          (canPause || canResume || canInvalidate || canReopen) && (
            <div className="flex max-w-xl flex-col gap-2 sm:items-end">
              <p className="text-sm text-muted-foreground text-right">
                Status: <strong className="text-foreground">{p.status}</strong>
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                {canPause && (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={busy}
                    onClick={() => void handlePause()}
                  >
                    <Pause className="size-4" />
                    Pausar
                  </Button>
                )}
                {canResume && (
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    disabled={busy}
                    onClick={() => void handleResume()}
                  >
                    <Play className="size-4" />
                    Retomar
                  </Button>
                )}
                {canInvalidate && (
                  <Button
                    variant="destructive"
                    className="gap-1.5"
                    disabled={busy}
                    onClick={() => setInvalidateOpen(true)}
                  >
                    <Ban className="size-4" />
                    Invalidar publicação
                  </Button>
                )}
                {canReopen && (
                  <Button
                    variant="secondary"
                    className="gap-1.5"
                    disabled={busy}
                    onClick={() => setReopenOpen(true)}
                  >
                    <RotateCcw className="size-4" />
                    Reabrir para análise
                  </Button>
                )}
              </div>
            </div>
          )}
        {!isPending &&
          !(
            user?._id &&
            (canPause || canResume || canInvalidate || canReopen)
          ) && (
            <p className="text-sm text-amber-700 dark:text-amber-400 max-w-md text-right">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="size-5" />
            Beneficiários com interesse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selections === undefined ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-7 animate-spin text-muted-foreground" />
            </div>
          ) : interessadosSorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum beneficiário selecionou este imóvel na lista de interesse.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beneficiário</TableHead>
                  <TableHead className="w-24">Ordem</TableHead>
                  <TableHead className="w-44">Selecionado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interessadosSorted.map(({ selection, beneficiary }) => {
                  const nome = beneficiary?.nome ?? 'Usuário indisponível'
                  const email = beneficiary?.email
                  return (
                    <TableRow key={selection._id}>
                      <TableCell>
                        <div className="font-medium">{nome}</div>
                        {email ? (
                          <a
                            href={`mailto:${email}`}
                            className="text-xs text-primary underline-offset-4 hover:underline"
                          >
                            {email}
                          </a>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {beneficiary?._id
                              ? 'Sem e-mail'
                              : `ID: ${String(selection.beneficiarioId)}`}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{selection.ordemPreferencia}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(selection.selecionadoEm).toLocaleString(
                          'pt-BR'
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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
                    className="relative aspect-4/3 overflow-hidden rounded-md border bg-muted"
                  >
                    {u ? (
                      <Image
                        src={u}
                        alt=""
                        fill
                        loading="eager"
                        className="object-cover"
                        sizes="300px"
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

      <AlertDialog
        open={invalidateOpen}
        onOpenChange={(o) => {
          setInvalidateOpen(o)
          if (!o) setMotivoInvalidate('')
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalidar publicação</AlertDialogTitle>
            <AlertDialogDescription>
              O anúncio será rejeitado, o ofertante verá o motivo, e o imóvel
              sairá da lista de interesse de todos os beneficiários.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="motivo-invalidate">Motivo</Label>
            <Textarea
              id="motivo-invalidate"
              value={motivoInvalidate}
              onChange={(e) => setMotivoInvalidate(e.target.value)}
              placeholder="Descreva o motivo da invalidação…"
              rows={4}
              className="min-h-24"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void handleInvalidate()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirmar invalidação'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reabrir para análise?</AlertDialogTitle>
            <AlertDialogDescription>
              O imóvel voltará para <strong>em análise</strong> e a checklist de
              validação será resetada. Use quando precisar corrigir a validação
              sem rejeitar o cadastro ao ofertante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <Button disabled={busy} onClick={() => void handleReopen()}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirmar reabertura'
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
