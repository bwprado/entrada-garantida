import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Home, User, FileText, Clock, CheckCircle2, AlertCircle, LogOut, Building2 } from "lucide-react"

export default function BeneficiarioDashboardPage() {
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
              <p className="text-xs text-muted-foreground">Portal do Beneficiário</p>
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
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Bem-vindo, João Silva</h2>
            <p className="text-muted-foreground">Acompanhe o status da sua solicitação no programa</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Status da Solicitação</CardTitle>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Em Análise
                    </Badge>
                  </div>
                  <CardDescription>Protocolo: #2025-MA-00123</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso da análise</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="w-0.5 h-full bg-primary mt-2" />
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className="font-semibold mb-1">Cadastro Realizado</h4>
                        <p className="text-sm text-muted-foreground">15/01/2025 às 14:30</p>
                        <p className="text-sm mt-2">Seu cadastro foi recebido com sucesso.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="w-0.5 h-full bg-primary mt-2" />
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className="font-semibold mb-1">Documentos Verificados</h4>
                        <p className="text-sm text-muted-foreground">18/01/2025 às 10:15</p>
                        <p className="text-sm mt-2">Todos os documentos foram aprovados.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Clock className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div className="w-0.5 h-full bg-border mt-2" />
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className="font-semibold mb-1">Análise Socioeconômica</h4>
                        <p className="text-sm text-muted-foreground">Em andamento</p>
                        <p className="text-sm mt-2">Sua situação está sendo avaliada pela equipe técnica.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-muted-foreground">Aprovação Final</h4>
                        <p className="text-sm text-muted-foreground">Aguardando etapas anteriores</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imóvel Solicitado */}
              <Card>
                <CardHeader>
                  <CardTitle>Imóvel de Interesse</CardTitle>
                  <CardDescription>Você ainda não selecionou um imóvel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4 max-w-md">
                      Navegue pelo catálogo de imóveis disponíveis e escolha o que melhor atende sua família
                    </p>
                    <Button asChild>
                      <Link href="/imoveis">Ver Imóveis Disponíveis</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Dados do Beneficiário */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Seus Dados</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">João Silva</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPF</p>
                    <p className="font-medium">123.456.789-00</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">E-mail</p>
                    <p className="font-medium">joao@email.com</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">(98) 98765-4321</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                    Editar Dados
                  </Button>
                </CardContent>
              </Card>

              {/* Documentos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Documentos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>RG/CNH</span>
                    <Badge variant="secondary" className="bg-secondary/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>CPF</span>
                    <Badge variant="secondary" className="bg-secondary/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Comp. Residência</span>
                    <Badge variant="secondary" className="bg-secondary/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Comp. Renda</span>
                    <Badge variant="secondary" className="bg-secondary/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                    Enviar Novo Documento
                  </Button>
                </CardContent>
              </Card>

              {/* Avisos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Avisos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Mantenha seus dados atualizados e acompanhe regularmente o status da sua solicitação.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
