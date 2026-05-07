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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  Clock,
  Eye,
  Home,
  Phone
} from 'lucide-react'
import { UserDetailSheet } from '@/app/admin/dashboard/user-detail-sheet'
import type { Id } from '@/convex/_generated/dataModel'
import { normalizePhone } from '@/lib/normalize-phone'

function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function OfertantesAdminClient() {
  const [detailSheetUserId, setDetailSheetUserId] =
    useState<Id<'users'> | null>(null)
  const [detailSheetPreviewNome, setDetailSheetPreviewNome] = useState('')

  const ofertantes = useQuery(api.users.getOfertantes, {})
  const ofertantesPendentes = useQuery(api.users.getOfertantesPendentes, {})

  const pendentesCount = ofertantesPendentes?.length ?? 0

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
          <Tabs defaultValue="pendentes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="pendentes">
                <Clock className="mr-2 size-4" />
                Pendentes de Onboarding
                {pendentesCount > 0 && (
                  <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-yellow-500 text-xs text-white">
                    {pendentesCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ativos">
                <CheckCircle2 className="mr-2 size-4" />
                Ativos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes">
              {ofertantesPendentes?.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 size-12 text-secondary" />
                  <p className="text-muted-foreground">
                    Nenhum ofertante pendente de onboarding.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ofertantesPendentes?.map((o) => (
                    <div
                      key={o._id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h4 className="font-semibold">{o.nome}</h4>
                            <Badge variant="outline" className="bg-yellow-50">
                              <Clock className="mr-1 size-3" />
                              Pendente Onboarding
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-2">
                            <p>
                              Telefone: {normalizePhone(o.phone).display()}
                            </p>
                            <p>
                              Cadastro:{' '}
                              {new Date(o.criadoEm).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => {
                              setDetailSheetUserId(o._id)
                              setDetailSheetPreviewNome(o.nome)
                            }}
                          >
                            <Eye className="mr-2 size-4" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ativos">
              {ofertantes?.filter((o) => o.status === 'active').length ===
              0 ? (
                <div className="py-12 text-center">
                  <Home className="mx-auto mb-4 size-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum ofertante ativo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ofertantes
                    ?.filter((o) => o.status === 'active')
                    .map((o) => (
                      <div
                        key={o._id}
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h4 className="font-semibold">{o.nome}</h4>
                              <Badge
                                variant="secondary"
                                className="bg-secondary/50"
                              >
                                <CheckCircle2 className="mr-1 size-3" />
                                Ativo
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
                              <p>
                                CPF:{' '}
                                {o.cpf ? formatCPF(o.cpf) : 'Não informado'}
                              </p>
                              <p>
                                Telefone:{' '}
                                {normalizePhone(o.phone).display()}
                              </p>
                              <p>
                                Cadastro:{' '}
                                {new Date(o.criadoEm).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              onClick={() => {
                                setDetailSheetUserId(o._id)
                                setDetailSheetPreviewNome(o.nome)
                              }}
                            >
                              <Eye className="mr-2 size-4" />
                              Ver Detalhes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                            >
                              <Phone className="mr-2 size-4" />
                              Contatar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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
