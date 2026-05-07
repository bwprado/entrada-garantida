'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { adminPaths } from '@/lib/app-links'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Users,
  Building2,
  FileText,
  TrendingUp,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  CreditCard,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Doc } from '@/convex/_generated/dataModel'
import { normalizePhone } from '@/lib/normalize-phone'

/** Users doc plus optional address (joined/enriched in some rows). */
type BeneficiaryErrorRow = Doc<'users'> & {
  endereco?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState('erros')
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<BeneficiaryErrorRow | null>(null)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [beneficiaryLoginEnabled, setBeneficiaryLoginEnabled] = useState(false)
  const [ofertanteLoginEnabled, setOfertanteLoginEnabled] = useState(true)
  const [isSavingLoginSettings, setIsSavingLoginSettings] = useState(false)

  const beneficiariesWithErrors = useQuery(
    api.users.getBeneficiariesWithErrors,
    {}
  )
  const beneficiariesCount = useQuery(api.users.getBeneficiariesCount, {})
  const construtores = useQuery(api.users.getConstrutores, {})
  const properties = useQuery(api.properties.getAllForAdmin, {})
  const pendingProperties = useQuery(api.properties.getPendingValidation, {})
  const loginAvailability = useQuery(api.users.getLoginAvailabilityForAdmin, {})

  const resolveErrorMutation = useMutation(api.users.resolveDataError)
  const setLoginAvailability = useMutation(api.users.setLoginAvailability)

  const hasLoginSettingsLoaded = loginAvailability !== undefined
  const hasLoginSettingsChanged =
    hasLoginSettingsLoaded &&
    (beneficiaryLoginEnabled !== loginAvailability.beneficiaryLoginEnabled ||
      ofertanteLoginEnabled !== loginAvailability.ofertanteLoginEnabled)

  useEffect(() => {
    if (!loginAvailability || isSavingLoginSettings) return
    setBeneficiaryLoginEnabled(loginAvailability.beneficiaryLoginEnabled)
    setOfertanteLoginEnabled(loginAvailability.ofertanteLoginEnabled)
  }, [loginAvailability, isSavingLoginSettings])

  const handleResolveError = async () => {
    if (!selectedBeneficiary) return

    setResolvingId(selectedBeneficiary._id)
    try {
      await resolveErrorMutation({ userId: selectedBeneficiary._id })
      toast.success('Erro marcado como resolvido')
      setShowResolveDialog(false)
      setSelectedBeneficiary(null)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao resolver'
      toast.error(message)
    } finally {
      setResolvingId(null)
    }
  }

  const handleSaveLoginSettings = async () => {
    setIsSavingLoginSettings(true)
    try {
      await setLoginAvailability({
        beneficiaryLoginEnabled,
        ofertanteLoginEnabled
      })
      toast.success('Disponibilidade de acesso atualizada')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao atualizar acessos'
      toast.error(message)
    } finally {
      setIsSavingLoginSettings(false)
    }
  }

  const stats = {
    totalBeneficiarios: beneficiariesCount ?? 0,
    totalImoveis: properties?.length ?? 0,
    solicitacoesPendentes: pendingProperties?.length ?? 0,
    construtoresAtivos: construtores?.length ?? 0,
    beneficiariosComErros: beneficiariesWithErrors?.length ?? 0
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatAddress = (b: BeneficiaryErrorRow) => {
    const parts = [b.endereco, b.numero, b.bairro, b.cidade, b.estado].filter(
      Boolean
    )
    return parts.join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Total de Beneficiários
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.totalBeneficiarios}
                  </p>
                  {stats.beneficiariosComErros > 0 && (
                    <p className="mt-1 flex items-center text-xs text-destructive">
                      <AlertCircle className="mr-1 size-3" />
                      {stats.beneficiariosComErros} com erros
                    </p>
                  )}
                  <p className="mt-2">
                    <Link
                      href={adminPaths.beneficiarios}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Ver lista completa
                    </Link>
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Imóveis Cadastrados
                  </p>
                  <p className="text-3xl font-bold">{stats.totalImoveis}</p>
                  <p className="mt-1 text-xs text-secondary">
                    <TrendingUp className="mr-1 inline size-3" />+
                    {pendingProperties?.length ?? 0} pendentes
                  </p>
                  {(pendingProperties?.length ?? 0) > 0 && (
                    <p className="mt-2">
                      <Link
                        href={adminPaths.imoveis}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Revisar fila de análise
                      </Link>
                    </p>
                  )}
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Solicitações Pendentes
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.solicitacoesPendentes}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requer atenção
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Construtores Ativos
                  </p>
                  <p className="text-3xl font-bold">
                    {stats.construtoresAtivos}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Empresas cadastradas
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:inline-grid lg:w-auto">
            <TabsTrigger value="erros" className="relative">
              Erros de Dados
              {stats.beneficiariosComErros > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {stats.beneficiariosComErros}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="construtores">Construtores</TabsTrigger>
            <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
            <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          </TabsList>

          <TabsContent value="erros" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="size-5 text-destructive" />
                      Beneficiários com Erros nos Dados
                    </CardTitle>
                    <CardDescription>
                      Lista de beneficiários que reportaram erros em seus dados
                      cadastrais
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                    >
                      <Download className="mr-2 size-4" />
                      Exportar Lista
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {beneficiariesWithErrors?.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="mx-auto mb-4 size-12 text-secondary" />
                    <p className="text-muted-foreground">
                      Nenhum beneficiário com erro reportado no momento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beneficiariesWithErrors?.map((b) => (
                      <div
                        key={b._id}
                        className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                              <h4 className="text-lg font-semibold">
                                {b.nome}
                              </h4>
                              <Badge variant="destructive">
                                Erro Reportado
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {b.erroReportadoEm &&
                                  new Date(
                                    b.erroReportadoEm
                                  ).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <CreditCard className="mt-0.5 size-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      CPF
                                    </p>
                                    <p className="font-medium">
                                      {formatCPF(b.cpf)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Phone className="mt-0.5 size-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Telefone
                                    </p>
                                    <p className="font-medium">
                                      {normalizePhone(b.phone).display()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Endereço
                                    </p>
                                    <p className="font-medium">
                                      {formatAddress(b)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg bg-muted/50 p-3">
                              <p className="mb-1 text-sm font-medium">
                                Descrição do problema:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {b.mensagemErroDados}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 md:min-w-[150px]">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedBeneficiary(b)
                                setShowResolveDialog(true)
                              }}
                            >
                              <CheckCircle2 className="mr-2 size-4" />
                              Marcar como Resolvido
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="construtores" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <CardTitle>Gestão de Construtores</CardTitle>
                    <CardDescription>
                      Visualize e gerencie as empresas cadastradas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {construtores?.slice(0, 3).map((c) => (
                    <div
                      key={c._id}
                      className="flex flex-col justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h4 className="font-semibold">{c.nome}</h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50"
                          >
                            Ativo
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-3">
                          <p>CNPJ: {c.cpf}</p>
                          <p>Telefone: {normalizePhone(c.phone).display()}</p>
                          <p>
                            Cadastro:{' '}
                            {new Date(c.criadoEm).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        <Eye className="mr-2 size-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imoveis" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle>Gestão de Imóveis</CardTitle>
                    <CardDescription>
                      Consulte, filtre por status e abra a revisão de cada
                      imóvel numa única tela.
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={adminPaths.imoveis}>Abrir imóveis</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use busca e filtro de status em{' '}
                  <Link
                    href={adminPaths.imoveis}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {adminPaths.imoveis}
                  </Link>
                  . No painel, o card &quot;Imóveis cadastrados&quot; também
                  oferece atalho quando há pendentes de análise.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solicitacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Imóveis</CardTitle>
                <CardDescription>
                  Gerencie as solicitações de beneficiários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-semibold">João Silva Santos</h4>
                          <Badge>Em Análise</Badge>
                        </div>
                        <p className="mb-1 text-sm text-muted-foreground">
                          Solicitou: Residencial Jardim das Flores
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent"
                      >
                        <Eye className="mr-2 size-4" />
                        Analisar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Erro como Resolvido</DialogTitle>
            <DialogDescription>
              Confirme que os dados de{' '}
              <strong>{selectedBeneficiary?.nome}</strong> foram corrigidos.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 rounded-lg bg-muted/50 p-3">
            <p className="mb-1 text-sm font-medium">Problema reportado:</p>
            <p className="text-sm text-muted-foreground">
              {selectedBeneficiary?.mensagemErroDados}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
              disabled={resolvingId === selectedBeneficiary?._id}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleResolveError()}
              disabled={resolvingId === selectedBeneficiary?._id}
            >
              {resolvingId === selectedBeneficiary?._id ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Confirmar Resolução
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
