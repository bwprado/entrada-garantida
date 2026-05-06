'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePaginatedQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { adminPaths } from '@/lib/app-links'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { AddUserSheet } from '@/app/admin/dashboard/add-user-sheet'
import { UserDetailSheet } from '@/app/admin/dashboard/user-detail-sheet'
import type { Id } from '@/convex/_generated/dataModel'
import { normalizePhone } from '@/lib/normalize-phone'
import { userStatusLabelPt } from '@/lib/user-status-label'

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function BeneficiariosAdminClient() {
  const [unlockingBeneficiaryId, setUnlockingBeneficiaryId] = useState<
    string | null
  >(null)
  const [beneficiaryToUnlock, setBeneficiaryToUnlock] = useState<{
    id: Id<'users'>
    nome: string
  } | null>(null)
  const [showAddUserSheet, setShowAddUserSheet] = useState(false)
  const [detailSheetUserId, setDetailSheetUserId] =
    useState<Id<'users'> | null>(null)
  const [detailSheetPreviewNome, setDetailSheetPreviewNome] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    results: beneficiaries,
    status: beneficiariesQueryStatus,
    loadMore
  } = usePaginatedQuery(
    api.users.getBeneficiariesPaginated,
    {
      searchQuery: debouncedSearch || undefined,
      sortDirection
    },
    { initialNumItems: 30 }
  )

  const isLoading = beneficiariesQueryStatus === 'LoadingFirstPage'
  const isLoadingMore = beneficiariesQueryStatus === 'LoadingMore'
  const canLoadMore = beneficiariesQueryStatus === 'CanLoadMore'

  const unlockSelectionMutation = useMutation(
    api.users.adminUnlockPropertySelection
  )

  const handleUnlockSelection = async (userId: Id<'users'>) => {
    setUnlockingBeneficiaryId(userId)
    try {
      await unlockSelectionMutation({ userId })
      toast.success('Seleção do beneficiário desbloqueada')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao desbloquear seleção'
      toast.error(message)
    } finally {
      setUnlockingBeneficiaryId(null)
    }
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Gestão de Beneficiários</CardTitle>
              <CardDescription>
                Visualize e gerencie os cadastros de beneficiários
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddUserSheet(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
              <Button asChild variant="outline" size="sm" className="bg-transparent">
                <Link href={adminPaths.beneficiariosUpload}>
                  <Download className="w-4 h-4 mr-2" />
                  Importar
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }
              title={`Ordenar ${sortDirection === 'asc' ? 'decrescente' : 'crescente'}`}
            >
              {sortDirection === 'asc' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando beneficiários...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : beneficiaries?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum beneficiário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  beneficiaries?.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="font-medium">{b.nome}</TableCell>
                      <TableCell>{formatCPF(b.cpf)}</TableCell>
                      <TableCell>{normalizePhone(b.phone).display()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.dadosComErro ? 'destructive' : 'secondary'
                          }
                          className={
                            b.dadosComErro ? '' : 'bg-secondary/50'
                          }
                        >
                          {b.dadosComErro
                            ? 'Erro Reportado'
                            : userStatusLabelPt(b.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(b.criadoEm).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Abrir ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                disabled={unlockingBeneficiaryId === b._id}
                                onSelect={() =>
                                  setBeneficiaryToUnlock({
                                    id: b._id,
                                    nome: b.nome
                                  })
                                }
                              >
                                {unlockingBeneficiaryId === b._id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <XCircle className="size-4" />
                                )}
                                Desbloquear seleção
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setDetailSheetUserId(b._id)
                                  setDetailSheetPreviewNome(b.nome)
                                }}
                              >
                                <Eye className="size-4" />
                                Ver detalhes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Carregando...'
                : `Mostrando ${beneficiaries?.length || 0} beneficiários`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMore(30)}
                disabled={!canLoadMore || isLoadingMore || isLoading}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Carregar Mais
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={beneficiaryToUnlock !== null}
        onOpenChange={(open) => {
          if (!open) setBeneficiaryToUnlock(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desbloquear seleção do beneficiário?</DialogTitle>
            <DialogDescription>
              Isso permitirá que {beneficiaryToUnlock?.nome} altere o imóvel
              selecionado no catálogo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBeneficiaryToUnlock(null)}
              disabled={unlockingBeneficiaryId === beneficiaryToUnlock?.id}
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!beneficiaryToUnlock) return
                await handleUnlockSelection(beneficiaryToUnlock.id)
                setBeneficiaryToUnlock(null)
              }}
              disabled={unlockingBeneficiaryId === beneficiaryToUnlock?.id}
            >
              {unlockingBeneficiaryId === beneficiaryToUnlock?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Desbloqueando...
                </>
              ) : (
                'Confirmar desbloqueio'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailSheet
        open={detailSheetUserId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDetailSheetUserId(null)
            setDetailSheetPreviewNome('')
          }
        }}
        userId={detailSheetUserId}
        previewNome={detailSheetPreviewNome}
        onDeleted={() => {
          setDetailSheetUserId(null)
          setDetailSheetPreviewNome('')
        }}
      />

      <AddUserSheet
        open={showAddUserSheet}
        onOpenChange={setShowAddUserSheet}
        onSuccess={() => {
          toast.success('Lista de beneficiários atualizada')
        }}
      />
    </>
  )
}
