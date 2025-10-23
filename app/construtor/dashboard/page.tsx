import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Building2, Plus, LogOut, Eye, Edit, BarChart3, Users, CheckCircle2, Clock, XCircle } from "lucide-react"

export default function ConstrutorDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Programa Habitacional</h1>
              <p className="text-xs text-muted-foreground">Portal do Construtor</p>
            </div>
          </Link>
          <Button variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Construtora ABC Ltda</h2>
              <p className="text-muted-foreground">Gerencie seus empreendimentos no programa</p>
            </div>
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Imóvel
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Imóveis</p>
                    <p className="text-3xl font-bold">12</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Aprovados</p>
                    <p className="text-3xl font-bold text-secondary">8</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Em Análise</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Solicitações</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Imóveis Cadastrados */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Imóveis Cadastrados</CardTitle>
                  <CardDescription>Gerencie seus empreendimentos no programa</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Relatórios
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Imóvel 1 */}
                <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="/modern-apartment-building.png"
                      alt="Residencial Jardim das Flores"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Residencial Jardim das Flores</h3>
                        <p className="text-sm text-muted-foreground">Apartamento • 2 quartos • 1 vaga</p>
                      </div>
                      <Badge variant="secondary" className="bg-secondary/50 flex-shrink-0">
                        Aprovado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Cohama, São Luís - MA</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">R$ 185.000</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        <Users className="w-4 h-4 inline mr-1" />8 solicitações de beneficiários
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imóvel 2 */}
                <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="/residential-house.jpg"
                      alt="Condomínio Vista Verde"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Condomínio Vista Verde</h3>
                        <p className="text-sm text-muted-foreground">Casa • 3 quartos • 2 vagas</p>
                      </div>
                      <Badge className="flex-shrink-0">Em Análise</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Turu, São Luís - MA</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">R$ 235.000</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Aguardando aprovação da documentação
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imóvel 3 */}
                <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="/modern-apartment-complex.png"
                      alt="Edifício Solar do Atlântico"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Edifício Solar do Atlântico</h3>
                        <p className="text-sm text-muted-foreground">Apartamento • 2 quartos • 1 vaga</p>
                      </div>
                      <Badge variant="secondary" className="bg-secondary/50 flex-shrink-0">
                        Aprovado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Renascença, São Luís - MA</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">R$ 198.000</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        <Users className="w-4 h-4 inline mr-1" />
                        12 solicitações de beneficiários
                      </p>
                    </div>
                  </div>
                </div>

                {/* Imóvel 4 - Reprovado */}
                <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors opacity-60">
                  <div className="w-full md:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src="/modern-city-townhouses.png"
                      alt="Residencial Parque das Árvores"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1">Residencial Parque das Árvores</h3>
                        <p className="text-sm text-muted-foreground">Casa • 2 quartos • 1 vaga</p>
                      </div>
                      <Badge variant="destructive" className="flex-shrink-0">
                        Reprovado
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Vinhais, São Luís - MA</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-muted-foreground">R$ 265.000</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-destructive">
                        <XCircle className="w-4 h-4 inline mr-1" />
                        Valor acima do limite permitido (R$ 250.000)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
