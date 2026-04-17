'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Home,
  Plus,
  Upload,
  User,
  Users
} from 'lucide-react'

export default function OfertanteDashboardPage() {
  const query = useQuery(api.users.getCurrentUserWithProfile)
  const user = query?.user
  const profile = query?.profile as Doc<'ofertanteProfiles'>

  // Check authentication and onboarding

  // Show loading while auth is loading or profile data is not yet available
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content — menu actions live in ofertante/layout Header */}
      <div className="flex-1 bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <p className="mb-8 text-sm text-muted-foreground">
            Bem-vindo, {user?.nome}
          </p>

          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold md:text-3xl">
              Meus Imóveis
            </h2>
            <p className="text-muted-foreground">
              Gerencie suas propriedades disponibilizadas na Aquisição Assistida
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total de Imóveis
                    </p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Aprovados
                    </p>
                    <p className="text-3xl font-bold text-secondary">0</p>
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
                    <p className="text-sm text-muted-foreground mb-1">
                      Em Análise
                    </p>
                    <p className="text-3xl font-bold">0</p>
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
                    <p className="text-sm text-muted-foreground mb-1">
                      Interessados
                    </p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="imoveis" className="space-y-6">
            <TabsList>
              <TabsTrigger value="imoveis">
                <Home className="w-4 h-4 mr-2" />
                Meus Imóveis
              </TabsTrigger>
              <TabsTrigger value="documentos">
                <FileText className="w-4 h-4 mr-2" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="perfil">
                <User className="w-4 h-4 mr-2" />
                Meu Perfil
              </TabsTrigger>
            </TabsList>

            {/* Imóveis Tab */}
            <TabsContent value="imoveis">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Imóveis Cadastrados</CardTitle>
                      <CardDescription>
                        Gerencie suas propriedades na Aquisição Assistida
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Relatórios
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum imóvel cadastrado
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Cadastre seu primeiro imóvel para começar a participar da
                      Aquisição Assistida.
                    </p>
                    <Button asChild>
                      <Link href="/ofertante/imoveis/cadastro">
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Imóvel
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documentos Tab */}
            <TabsContent value="documentos">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Pendentes</CardTitle>
                  <CardDescription>
                    Faça upload dos documentos necessários para validação do seu
                    cadastro
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* RG Upload */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">RG ou CNH</p>
                        <p className="text-sm text-muted-foreground">
                          Documento de identidade
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  {/* Comprovante de Residência */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Comprovante de Residência</p>
                        <p className="text-sm text-muted-foreground">
                          Conta de luz, água, etc.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  {/* Matrícula do Imóvel */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Matrícula do Imóvel</p>
                        <p className="text-sm text-muted-foreground">
                          Certidão atualizada
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>

                  {/* Certidão de IPTU */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Certidão Negativa de IPTU</p>
                        <p className="text-sm text-muted-foreground">
                          Certidão atualizada
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Perfil Tab */}
            <TabsContent value="perfil">
              <Card>
                <CardHeader>
                  <CardTitle>Meus Dados</CardTitle>
                  <CardDescription>
                    Visualize e atualize suas informações cadastrais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{user?.nome}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">
                        {user?.cpf || 'Não informado'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{user?.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Data de Nascimento
                      </p>
                      <p className="font-medium">
                        {profile?.dataNascimento || 'Não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Endereço</h3>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {profile?.endereco || 'Não informado'}
                        {profile?.numero ? `, ${profile.numero}` : ''}
                        {profile?.complemento
                          ? ` - ${profile.complemento}`
                          : ''}
                      </p>
                      <p className="text-muted-foreground">
                        {profile?.bairro || ''}{' '}
                        {profile?.cidade
                          ? `- ${profile.cidade}/${profile.estado}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/ofertante/perfil">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Dados
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Help Section */}
          <div className="mt-12 p-6 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Entre em contato com a SECID para dúvidas sobre a Aquisição
              Assistida ou problemas com seu cadastro.
            </p>
            <div className="text-sm space-y-1">
              <p>
                <strong>Telefone:</strong> (98) 3198-5300
              </p>
              <p>
                <strong>Email:</strong> secid@ma.gov.br
              </p>
              <p>
                <strong>Horário:</strong> Segunda a Sexta, 8h às 18h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
