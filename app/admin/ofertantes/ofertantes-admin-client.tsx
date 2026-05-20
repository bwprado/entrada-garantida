'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import {
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Phone,
  XCircle,
  Ban
} from 'lucide-react'
import { UserDetailSheet } from '@/app/admin/dashboard/user-detail-sheet'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { normalizePhone } from '@/lib/normalize-phone'
import type { ColumnDef } from '@tanstack/react-table'

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function statusBadge(status: string) {
  switch (status) {
    case 'onboarding':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          <Clock className="size-3" />
          Pendente Onboarding
        </Badge>
      )
    case 'active':
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 border-green-200"
        >
          <CheckCircle2 className="size-3" />
          Ativo
        </Badge>
      )
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-600 border-gray-200"
        >
          <Clock className="size-3" />
          Pendente
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive">
          <XCircle className="size-3" />
          Rejeitado
        </Badge>
      )
    case 'verified':
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <CheckCircle2 className="size-3" />
          Verificado
        </Badge>
      )
    case 'suspended':
      return (
        <Badge
          variant="outline"
          className="bg-orange-50 text-orange-700 border-orange-200"
        >
          <Ban className="size-3" />
          Suspenso
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function OfertantesAdminClient() {
  const [detailSheetUserId, setDetailSheetUserId] =
    useState<Id<'users'> | null>(null)
  const [detailSheetPreviewNome, setDetailSheetPreviewNome] = useState('')

  const ofertantes = useQuery(api.users.getOfertantes, {})

  const columns: ColumnDef<Doc<'users'>, unknown>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome'
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      cell: ({ row }) => {
        const cpf = row.getValue<string | undefined>('cpf')
        return (
          <span className="text-muted-foreground">
            {cpf ? formatCPF(cpf) : '-'}
          </span>
        )
      }
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => {
        const phone = row.getValue<string | undefined>('phone')
        return (
          <span className="text-muted-foreground">
            {phone ? normalizePhone(phone).display() : '-'}
          </span>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => statusBadge(row.getValue('status'))
    },
    {
      accessorKey: 'criadoEm',
      header: 'Cadastro',
      cell: ({ row }) => {
        const date = row.getValue<number>('criadoEm')
        return (
          <span className="text-muted-foreground">
            {new Date(date).toLocaleDateString('pt-BR')}
          </span>
        )
      }
    },
    {
      id: 'acoes',
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => {
                setDetailSheetUserId(user._id)
                setDetailSheetPreviewNome(user.nome)
              }}
            >
              <Eye className="size-4" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Phone className="size-4" />
              Contatar
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                Gestão de Ofertantes
              </CardTitle>
              <CardDescription>
                Visualize e gerencie os proprietários cadastrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={ofertantes ?? []}
            searchKey="global"
            searchPlaceholder="Buscar por nome, CPF, telefone ou email..."
          />
        </CardContent>
      </Card>

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
    </>
  )
}
