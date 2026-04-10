"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState("beneficiarios");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<any>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Queries
  const beneficiaries = useQuery(api.users.getBeneficiaries, {});
  const beneficiariesWithErrors = useQuery(api.users.getBeneficiariesWithErrors, {});
  const construtores = useQuery(api.users.getConstrutores, {});
  const ofertantes = useQuery(api.users.getOfertantes, {});
  const ofertantesPendentes = useQuery(api.users.getOfertantesPendentes, {});
  const properties = useQuery(api.properties.getAllForAdmin, {});
  const pendingProperties = useQuery(api.properties.getPendingValidation, {});

  const resolveErrorMutation = useMutation(api.users.resolveDataError);

  const handleResolveError = async () => {
    if (!selectedBeneficiary) return;
    
    setResolvingId(selectedBeneficiary._id);
    try {
      await resolveErrorMutation({ userId: selectedBeneficiary._id });
      toast.success("Erro marcado como resolvido");
      setShowResolveDialog(false);
      setSelectedBeneficiary(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao resolver");
    } finally {
      setResolvingId(null);
    }
  };

  const stats = {
    totalBeneficiarios: beneficiaries?.length || 0,
    totalImoveis: properties?.length || 0,
    solicitacoesPendentes: pendingProperties?.length || 0,
    construtoresAtivos: construtores?.length || 0,
    ofertantesAtivos: ofertantes?.filter(o => o.status === "active").length || 0,
    ofertantesPendentes: ofertantesPendentes?.length || 0,
    beneficiariosComErros: beneficiariesWithErrors?.length || 0,
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatAddress = (b: any) => {
    const parts = [b.endereco, b.numero, b.bairro, b.cidade, b.estado].filter(Boolean);
    return parts.join(", ");
  };

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
                    <p className="text-3xl font-bold">{stats.totalBeneficiarios}</p>
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
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +{pendingProperties?.length || 0} pendentes
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
                    <p className="text-3xl font-bold">{stats.solicitacoesPendentes}</p>
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
                    <p className="text-3xl font-bold">{stats.construtoresAtivos}</p>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
              <TabsTrigger value="beneficiarios">
                Beneficiários
              </TabsTrigger>
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
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button asChild variant="outline" size="sm" className="bg-transparent">
                        <Link href="/admin/beneficiarios/upload">
                          <Download className="w-4 h-4 mr-2" />
                          Importar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, CPF..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {beneficiaries?.slice(0, 5).map((b) => (
                      <div
                        key={b._id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{b.nome}</h4>
                            <Badge
                              variant={b.dadosComErro ? "destructive" : "secondary"}
                              className={b.dadosComErro ? "" : "bg-secondary/50"}
                            >
                              {b.dadosComErro ? "Erro Reportado" : b.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <p>CPF: {formatCPF(b.cpf)}</p>
                            <p>Telefone: {formatPhone(b.telefone)}</p>
                            <p>
                              Cadastro: {new Date(b.criadoEm).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    ))}
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
                        Lista de beneficiários que reportaram erros em seus dados cadastrais
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
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
                                <h4 className="font-semibold text-lg">{b.nome}</h4>
                                <Badge variant="destructive">Erro Reportado</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {b.erroReportadoEm && 
                                    new Date(b.erroReportadoEm).toLocaleDateString("pt-BR")
                                  }
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">CPF</p>
                                      <p className="font-medium">{formatCPF(b.cpf)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">Telefone</p>
                                      <p className="font-medium">{formatPhone(b.telefone)}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    <div>
                                      <p className="text-sm text-muted-foreground">Endereço</p>
                                      <p className="font-medium">{formatAddress(b)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="text-sm font-medium mb-1">Descrição do problema:</p>
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
                                  setSelectedBeneficiary(b);
                                  setShowResolveDialog(true);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marcar como Resolvido
                              </Button>
                              <Button size="sm" variant="outline" className="bg-transparent">
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
                              <Badge variant="outline" className="bg-yellow-50">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente Onboarding
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <p>Telefone: {formatPhone(o.telefone)}</p>
                              <p>
                                Cadastro: {new Date(o.criadoEm).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
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
                {ofertantes?.filter(o => o.status === "active").length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum ofertante ativo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ofertantes?.filter(o => o.status === "active").map((o) => (
                      <div
                        key={o._id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{o.nome}</h4>
                              <Badge variant="secondary" className="bg-secondary/50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Ativo
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <p>CPF: {o.cpf ? formatCPF(o.cpf) : "Não informado"}</p>
                              <p>Telefone: {formatPhone(o.telefone)}</p>
                              <p>
                                Cadastro: {new Date(o.criadoEm).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            {o.endereco && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {formatAddress(o)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
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
                            <Badge variant="secondary" className="bg-secondary/50">
                              Ativo
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <p>CNPJ: {c.cpf}</p>
                            <p>Telefone: {formatPhone(c.telefone)}</p>
                            <p>
                              Cadastro: {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent">
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
                              <Button size="sm" variant="outline" className="bg-transparent">
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
                        <Button size="sm" variant="outline" className="bg-transparent">
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
              Confirme que os dados de <strong>{selectedBeneficiary?.nome}</strong> foram corrigidos.
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
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
