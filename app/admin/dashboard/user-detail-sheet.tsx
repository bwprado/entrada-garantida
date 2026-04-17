'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { normalizePhone } from '@/lib/normalize-phone'

function formatCPF(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatAddressLine(p: {
  endereco?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  complemento?: string
}) {
  const parts = [
    p.endereco,
    p.numero,
    p.complemento,
    p.bairro,
    p.cidade,
    p.estado
  ].filter(Boolean)
  return parts.join(', ')
}

type UserDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: Id<'users'> | null
  previewNome?: string
  onDeleted?: () => void
}

export function UserDetailSheet({
  open,
  onOpenChange,
  userId,
  previewNome,
  onDeleted
}: UserDetailSheetProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const detail = useQuery(
    api.users.getUserDetailForAdmin,
    open && userId ? { userId } : 'skip'
  )

  const deleteBeneficiary = useMutation(api.users.adminDeleteBeneficiary)
  const deleteOfertante = useMutation(api.users.adminDeleteOfertante)

  const handleDelete = async () => {
    if (!userId || !detail?.user) return
    setDeleting(true)
    try {
      if (detail.user.role === 'beneficiary') {
        await deleteBeneficiary({ userId })
      } else {
        await deleteOfertante({ userId })
      }
      toast.success('Usuário excluído')
      setShowDeleteDialog(false)
      onOpenChange(false)
      onDeleted?.()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const nome =
    detail?.user.nome ?? previewNome ?? 'Carregando…'

  const beneficiaryProfile: Doc<'beneficiaryProfiles'> | null =
    detail?.user.role === 'beneficiary' && detail.profile
      ? (detail.profile as Doc<'beneficiaryProfiles'>)
      : null
  const ofertanteProfile: Doc<'ofertanteProfiles'> | null =
    detail?.user.role === 'ofertante' && detail.profile
      ? (detail.profile as Doc<'ofertanteProfiles'>)
      : null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden sm:max-w-lg">
          <SheetHeader className="pr-8 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="line-clamp-2">{nome}</SheetTitle>
              {detail?.user.role === 'beneficiary' && (
                <Badge variant="secondary">Beneficiário</Badge>
              )}
              {detail?.user.role === 'ofertante' && (
                <Badge variant="secondary">Ofertante</Badge>
              )}
            </div>
            <SheetDescription>
              Dados cadastrais do usuário selecionado.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
            {detail === undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando detalhes…
              </div>
            )}

            {detail === null && (
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar este usuário.
              </p>
            )}

            {detail?.user && (
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Conta</h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">CPF</dt>
                      <dd className="font-medium">
                        {formatCPF(detail.user.cpf)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Telefone</dt>
                      <dd className="font-medium">
                        {detail.user.phone
                          ? normalizePhone(detail.user.phone).display()
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">E-mail</dt>
                      <dd className="font-medium">
                        {detail.user.email ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{detail.user.status}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Cadastro</dt>
                      <dd className="font-medium">
                        {new Date(detail.user.criadoEm).toLocaleString(
                          'pt-BR'
                        )}
                      </dd>
                    </div>
                    {detail.user.dadosComErro && (
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">
                          Erro nos dados
                        </dt>
                        <dd className="text-destructive">
                          {detail.user.mensagemErroDados ?? 'Reportado'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                <Separator />

                {beneficiaryProfile && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Perfil beneficiário</h3>
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">RG</dt>
                        <dd className="font-medium">{beneficiaryProfile.rg}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Sexo</dt>
                        <dd className="font-medium">{beneficiaryProfile.sexo}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Profissão</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.profissao}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Renda</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.tipoRenda} ·{' '}
                          {beneficiaryProfile.rendaFamiliarFaixa}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Família</dt>
                        <dd className="font-medium">
                          {beneficiaryProfile.pessoasFamilia} pessoa(s)
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Endereço</dt>
                        <dd className="font-medium">
                          {formatAddressLine(beneficiaryProfile)}
                        </dd>
                        <dd className="text-muted-foreground">
                          CEP {beneficiaryProfile.cep}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}

                {ofertanteProfile && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Perfil ofertante</h3>
                    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">RG</dt>
                        <dd className="font-medium">{ofertanteProfile.rg}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Data nascimento
                        </dt>
                        <dd className="font-medium">
                          {ofertanteProfile.dataNascimento || '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Estado civil</dt>
                        <dd className="font-medium">
                          {ofertanteProfile.estadoCivil}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Onboarding</dt>
                        <dd className="font-medium">
                          {ofertanteProfile.onboardingCompleto
                            ? 'Completo'
                            : 'Pendente'}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Endereço</dt>
                        <dd className="font-medium">
                          {formatAddressLine(ofertanteProfile)}
                        </dd>
                        <dd className="text-muted-foreground">
                          CEP {ofertanteProfile.cep}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}

                {detail.user.role === 'beneficiary' && !beneficiaryProfile && (
                  <p className="text-sm text-muted-foreground">
                    Perfil de beneficiário ainda não cadastrado.
                  </p>
                )}
                {detail.user.role === 'ofertante' && !ofertanteProfile && (
                  <p className="text-sm text-muted-foreground">
                    Perfil de ofertante ainda não cadastrado.
                  </p>
                )}
              </div>
            )}
          </div>

          {detail?.user && (
            <div className="border-t bg-muted/30 px-4 py-3">
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir usuário
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Serão removidos o cadastro, o
              perfil, documentos e sessões de autenticação de{' '}
              <strong>{detail?.user.nome ?? previewNome}</strong>
              {detail?.user.phone && (
                <>
                  {' '}
                  ({normalizePhone(detail.user.phone).display()})
                </>
              )}
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo…
                </>
              ) : (
                'Excluir definitivamente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
