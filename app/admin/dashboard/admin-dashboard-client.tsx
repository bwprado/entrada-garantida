'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, usePaginatedQuery } from 'convex/react'
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Home,
  Users,
  Building2,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { AddUserSheet } from './add-user-sheet'
import { normalizePhone } from '@/lib/normalize-phone'

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState('beneficiarios')
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [showAddUserSheet, setShowAddUserSheet] = useState(false)

  // Beneficiary table state
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Paginated beneficiaries query
  const {
    results: beneficiaries,
    status,
    loadMore
  } = usePaginatedQuery(
    api.users.getBeneficiariesPaginated,
    {
      searchQuery: debouncedSearch || undefined,
      sortDirection
    },
    { initialNumItems: 30 }
  )

  const isLoading = status === 'LoadingFirstPage'
  const isLoadingMore = status === 'LoadingMore'
  const canLoadMore = status === 'CanLoadMore'

  const beneficiariesWithErrors = useQuery(
    api.users.getBeneficiariesWithErrors,
    {}
  )
  const beneficiariesCount = useQuery(api.users.getBeneficiariesCount, {
    searchQuery: debouncedSearch || undefined
  })
  const construtores = useQuery(api.users.getConstrutores, {})
  const ofertantes = useQuery(api.users.getOfertantes, {})
  const ofertantesPendentes = useQuery(api.users.getOfertantesPendentes, {})
  const properties = useQuery(api.properties.getAllForAdmin, {})
  const pendingProperties = useQuery(api.properties.getPendingValidation, {})

  const resolveErrorMutation = useMutation(api.users.resolveDataError)

  const handleResolveError = async () => {
    if (!selectedBeneficiary) return

    setResolvingId(selectedBeneficiary._id)
    try {
      await resolveErrorMutation({ userId: selectedBeneficiary._id })
      toast.success('Erro marcado como resolvido')
      setShowResolveDialog(false)
      setSelectedBeneficiary(null)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resolver')
    } finally {
      setResolvingId(null)
    }
  }

  // Get total beneficiaries count for stats (using a separate query or estimate)
  // For now, we'll use the paginated results length as an estimate
  // You might want to add a separate count query for accurate stats
  const stats = {
    totalBeneficiarios: beneficiariesCount || 0, // This is now paginated count
    totalImoveis: properties?.length || 0,
    solicitacoesPendentes: pendingProperties?.length || 0,
    construtoresAtivos: construtores?.length || 0,
    ofertantesAtivos:
      ofertantes?.filter((o) => o.status === 'active').length || 0,
    ofertantesPendentes: ofertantesPendentes?.length || 0,
    beneficiariosComErros: beneficiariesWithErrors?.length || 0
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatAddress = (b: any) => {
    const parts = [b.endereco, b.numero, b.bairro, b.cidade, b.estado].filter(
      Boolean
    )
    return parts.join(', ')
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* Main Content */}
      <div className="flex-1 bg-muted/30 px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Painel Administrativo</h2>
            <p className="text-muted-foreground">
              Gestão completa da Aquisição Assistida no Maranhão
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total de Beneficiários
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.totalBeneficiarios}
                    </p>
                    {stats.beneficiariosComErros > 0 && (
                      <p className="text-xs text-destructive mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {stats.beneficiariosComErros} com erros
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Imóveis Cadastrados
                    </p>
                    <p className="text-3xl font-bold">{stats.totalImoveis}</p>
                    <p className="text-xs text-secondary mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />+
                      {pendingProperties?.length || 0} pendentes
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Solicitações Pendentes
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.solicitacoesPendentes}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requer atenção
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Construtores Ativos
                    </p>
                    <p className="text-3xl font-bold">
                      {stats.construtoresAtivos}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Empresas cadastradas
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
              <TabsTrigger value="beneficiarios">Beneficiários</TabsTrigger>
              <TabsTrigger value="erros" className="relative">
                Erros de Dados
                {stats.beneficiariosComErros > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                    {stats.beneficiariosComErros}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ofertantes" className="relative">
                Ofertantes
                {stats.ofertantesPendentes > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center">
                    {stats.ofertantesPendentes}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="construtores">Construtores</TabsTrigger>
              <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
              <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
            </TabsList>

            {/* Beneficiários Tab */}
            <TabsContent value="beneficiarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Gestão de Beneficiários</CardTitle>
                      <CardDescription>
                        Visualize e gerencie os cadastros de beneficiários
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
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
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        <Link href="/admin/beneficiarios/upload">
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
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                        setSortDirection(
                          sortDirection === 'asc' ? 'desc' : 'asc'
                        )
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
                              <TableCell className="font-medium">
                                {b.nome}
                              </TableCell>
                              <TableCell>{formatCPF(b.cpf)}</TableCell>
                              <TableCell>
                                {normalizePhone(b.phone).display()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    b.dadosComErro ? 'destructive' : 'secondary'
                                  }
                                  className={
                                    b.dadosComErro ? '' : 'bg-secondary/50'
                                  }
                                >
                                  {b.dadosComErro ? 'Erro Reportado' : b.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(b.criadoEm).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
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
            </TabsContent>

            {/* Erros de Dados Tab */}
            <TabsContent value="erros" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        Beneficiários com Erros nos Dados
                      </CardTitle>
                      <CardDescription>
                        Lista de beneficiários que reportaram erros em seus
                        dados cadastrais
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Lista
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {beneficiariesWithErrors?.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum beneficiário com erro reportado no momento.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {beneficiariesWithErrors?.map((b) => (
                        <div
                          key={b._id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="font-semibold text-lg">
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

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
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
                                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
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
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
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

                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm font-medium mb-1">
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
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marcar como Resolvido
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent"
                              >
                                <Phone className="w-4 h-4 mr-2" />
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

            {/* Ofertantes Tab */}
            <TabsContent value="ofertantes" className="space-y-6">
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
                        <Clock className="w-4 h-4 mr-2" />
                        Pendentes de Onboarding
                        {stats.ofertantesPendentes > 0 && (
                          <span className="ml-2 w-5 h-5 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center">
                            {stats.ofertantesPendentes}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="ativos">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Ativos
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pendentes">
                      {ofertantesPendentes?.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Nenhum ofertante pendente de onboarding.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {ofertantesPendentes?.map((o) => (
                            <div
                              key={o._id}
                              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold">{o.nome}</h4>
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-50"
                                    >
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pendente Onboarding
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
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
                      {ofertantes?.filter((o) => o.status === 'active')
                        .length === 0 ? (
                        <div className="text-center py-12">
                          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
                                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-semibold">
                                        {o.nome}
                                      </h4>
                                      <Badge
                                        variant="secondary"
                                        className="bg-secondary/50"
                                      >
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Ativo
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                                      <p>
                                        CPF:{' '}
                                        {o.cpf
                                          ? formatCPF(o.cpf)
                                          : 'Não informado'}
                                      </p>
                                      <p>
                                        Telefone:{' '}
                                        {normalizePhone(o.phone).display()}
                                      </p>
                                      <p>
                                        Cadastro:{' '}
                                        {new Date(
                                          o.criadoEm
                                        ).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-transparent"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Ver Detalhes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-transparent"
                                    >
                                      <Phone className="w-4 h-4 mr-2" />
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
            </TabsContent>

            {/* Construtores Tab */}
            <TabsContent value="construtores" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{c.nome}</h4>
                            <Badge
                              variant="secondary"
                              className="bg-secondary/50"
                            >
                              Ativo
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
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
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Imóveis Tab */}
            <TabsContent value="imoveis" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Gestão de Imóveis</CardTitle>
                      <CardDescription>
                        Aprove ou reprove imóveis cadastrados
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {properties?.slice(0, 2).map((p) => (
                      <div
                        key={p._id}
                        className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-full md:w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Home className="w-8 h-8 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h4 className="font-semibold mb-1">{p.titulo}</h4>
                              <p className="text-sm text-muted-foreground">
                                {p.compartimentos} compart. • {p.tamanho} m²
                              </p>
                            </div>
                            <Badge>{p.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {p.endereco}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(p.valorVenda)}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-transparent"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Button>
                              <Button size="sm" variant="default">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Aprovar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitações Tab */}
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
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">João Silva Santos</h4>
                            <Badge>Em Análise</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Solicitou: Residencial Jardim das Flores
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent"
                        >
                          <Eye className="w-4 h-4 mr-2" />
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
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Erro como Resolvido</DialogTitle>
            <DialogDescription>
              Confirme que os dados de{' '}
              <strong>{selectedBeneficiary?.nome}</strong> foram corrigidos.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-3 rounded-lg my-4">
            <p className="text-sm font-medium mb-1">Problema reportado:</p>
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
              onClick={handleResolveError}
              disabled={resolvingId === selectedBeneficiary?._id}
            >
              {resolvingId === selectedBeneficiary?._id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Resolução
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Sheet */}
      <AddUserSheet
        open={showAddUserSheet}
        onOpenChange={setShowAddUserSheet}
        onSuccess={() => {
          // The paginated query will automatically refresh
          toast.success('Lista de beneficiários atualizada')
        }}
      />
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value)
}
