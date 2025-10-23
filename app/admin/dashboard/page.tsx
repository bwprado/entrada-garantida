import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Home,
  LogOut,
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
  AlertCircle
} from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Painel Administrativo</h2>
            <p className="text-muted-foreground">
              Gestão completa do Programa Habitacional do Maranhão
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
                    <p className="text-3xl font-bold">8.547</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      de 10.000 vagas
                    </p>
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
                    <p className="text-3xl font-bold">342</p>
                    <p className="text-xs text-secondary mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +12 esta semana
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
                    <p className="text-3xl font-bold">156</p>
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
                    <p className="text-3xl font-bold">47</p>
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
          <Tabs defaultValue="beneficiarios" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="beneficiarios">Beneficiários</TabsTrigger>
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
                        className="bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, CPF ou protocolo..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Beneficiário 1 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">João Silva Santos</h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50">
                            Aprovado
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CPF: 123.456.789-00</p>
                          <p>Protocolo: #2025-MA-00123</p>
                          <p>Cadastro: 15/01/2025</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Beneficiário 2 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            Maria Oliveira Costa
                          </h4>
                          <Badge>Em Análise</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CPF: 987.654.321-00</p>
                          <p>Protocolo: #2025-MA-00124</p>
                          <p>Cadastro: 16/01/2025</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Beneficiário 3 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            Carlos Eduardo Ferreira
                          </h4>
                          <Badge variant="outline">Pendente Documentação</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CPF: 456.789.123-00</p>
                          <p>Protocolo: #2025-MA-00125</p>
                          <p>Cadastro: 17/01/2025</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Beneficiário 4 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">Ana Paula Rodrigues</h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50">
                            Aprovado
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CPF: 321.654.987-00</p>
                          <p>Protocolo: #2025-MA-00126</p>
                          <p>Cadastro: 18/01/2025</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou CNPJ..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Construtor 1 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            Construtora ABC Ltda
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50">
                            Ativo
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CNPJ: 12.345.678/0001-00</p>
                          <p>12 imóveis cadastrados</p>
                          <p>Cadastro: 10/12/2024</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Construtor 2 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            Incorporadora XYZ S.A.
                          </h4>
                          <Badge>Em Análise</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CNPJ: 98.765.432/0001-00</p>
                          <p>0 imóveis cadastrados</p>
                          <p>Cadastro: 20/01/2025</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>

                    {/* Construtor 3 */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">
                            Construtora Maranhense
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50">
                            Ativo
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <p>CNPJ: 45.678.912/0001-00</p>
                          <p>8 imóveis cadastrados</p>
                          <p>Cadastro: 05/01/2025</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, endereço ou construtor..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Imóvel 1 - Pendente */}
                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-full md:w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src="/modern-apartment-building.png"
                          alt="Residencial Novo Horizonte"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-semibold mb-1">
                              Residencial Novo Horizonte
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Apartamento • 2 quartos • 1 vaga
                            </p>
                          </div>
                          <Badge>Pendente Aprovação</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cohama, São Luís - MA
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              R$ 195.000
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Construtora ABC Ltda
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Button>
                            <Button size="sm" variant="default">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Reprovar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Imóvel 2 - Aprovado */}
                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-full md:w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src="/residential-house.jpg"
                          alt="Condomínio Vista Verde"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-semibold mb-1">
                              Condomínio Vista Verde
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Casa • 3 quartos • 2 vagas
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/50">
                            Aprovado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Turu, São Luís - MA
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              R$ 235.000
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Construtora ABC Ltda
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitações Tab */}
            <TabsContent value="solicitacoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Solicitações de Imóveis</CardTitle>
                      <CardDescription>
                        Gerencie as solicitações de beneficiários
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por beneficiário ou imóvel..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Solicitação 1 */}
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
                          <p className="text-xs text-muted-foreground">
                            Protocolo: #2025-MA-SOL-001 • 18/01/2025
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Analisar
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Aguardando análise socioeconômica
                        </span>
                      </div>
                    </div>

                    {/* Solicitação 2 */}
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              Maria Oliveira Costa
                            </h4>
                            <Badge
                              variant="secondary"
                              className="bg-secondary/50">
                              Aprovado
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Solicitou: Edifício Solar do Atlântico
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Protocolo: #2025-MA-SOL-002 • 19/01/2025
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-secondary">
                          Solicitação aprovada - Aguardando assinatura
                        </span>
                      </div>
                    </div>

                    {/* Solicitação 3 */}
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              Carlos Eduardo Ferreira
                            </h4>
                            <Badge variant="outline">Pendente</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Solicitou: Condomínio Vista Verde
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Protocolo: #2025-MA-SOL-003 • 20/01/2025
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Analisar
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Documentação incompleta
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
