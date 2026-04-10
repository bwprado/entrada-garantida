"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  User,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Heart,
  X,
  Loader2,
  MapPin,
  Bed,
  ArrowRight,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function BeneficiarioDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  const userWithProfile = useQuery(
    api.users.getCurrentUserWithProfile,
    user ? {} : "skip"
  );
  
  const userData = userWithProfile?.user;
  const profile = userWithProfile?.profile;

  const selectedProperties = useQuery(
    api.properties.getByIds,
    profile?.propriedadesInteresse?.length 
      ? { ids: profile.propriedadesInteresse }
      : "skip"
  );

  const removePropertyMutation = useMutation(api.users.removePropertySelection);

  const handleRemoveProperty = async (propertyId: string) => {
    if (!user) return;
    
    setRemovingId(propertyId);
    try {
      await removePropertyMutation({
        userId: user._id,
        propertyId: propertyId as any,
      });
      toast.success("Imóvel removido da seleção");
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover imóvel");
    } finally {
      setRemovingId(null);
    }
  };

  const selectionCount = profile?.propriedadesInteresse?.length || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar esta página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 bg-muted/30 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Bem-vindo, {userData?.nome || user?.nome || "Beneficiário"}
            </h2>
            <p className="text-muted-foreground">
              Acompanhe o status da sua solicitação na Aquisição Assistida
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Properties Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        Imóveis Selecionados
                      </CardTitle>
                      <CardDescription>
                        Você pode selecionar até 3 imóveis de seu interesse
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {selectionCount}/3
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectionCount === 0 
                          ? "Nenhum selecionado" 
                          : selectionCount === 3 
                            ? "Limite atingido"
                            : `${3 - selectionCount} restante(s)`
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectionCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4 max-w-md">
                        Você ainda não selecionou nenhum imóvel. 
                        Navegue pelo catálogo e escolha até 3 opções.
                      </p>
                      <Button asChild>
                        <Link href="/imoveis">Ver Imóveis Disponíveis</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedProperties?.map((property, index) => (
                        <div
                          key={property._id}
                          className="relative flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {/* Preference Number */}
                          <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>

                          {/* Property Image */}
                          <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src="/placeholder-property.jpg"
                              alt={property.titulo}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Property Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold line-clamp-1">
                                {property.titulo}
                              </h4>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveProperty(property._id)}
                                disabled={removingId === property._id}
                              >
                                {removingId === property._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              <MapPin className="w-3 h-3 inline mr-1 shrink-0" />
                              {property.endereco}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Bed className="w-3 h-3" />
                                {property.compartimentos} compart.
                              </span>
                              <span>{property.tamanho} m²</span>
                            </div>
                            <p className="text-lg font-bold text-primary mt-2">
                              {formatCurrency(property.valorVenda)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {selectionCount < 3 && (
                        <Button asChild variant="outline" className="w-full mt-4">
                          <Link href="/imoveis">
                            <Heart className="w-4 h-4 mr-2" />
                            Adicionar mais imóveis
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Status da Solicitação</CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground"
                    >
                      Em Análise
                    </Badge>
                  </div>
                  <CardDescription>
                    Protocolo: #{userData?._id?.slice(-6) || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progresso da análise
                      </span>
                      <span className="font-medium">{selectionCount > 0 ? "40%" : "20%"}</span>
                    </div>
                    <Progress value={selectionCount > 0 ? 40 : 20} className="h-2" />
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
                        <h4 className="font-semibold mb-1">
                          Cadastro Realizado
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {userData?.criadoEm 
                            ? new Date(userData.criadoEm).toLocaleDateString("pt-BR")
                            : "Data não disponível"
                          }
                        </p>
                        <p className="text-sm mt-2">
                          Seu cadastro foi recebido com sucesso.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectionCount > 0 ? "bg-primary" : "bg-secondary"
                        }`}>
                          {selectionCount > 0 ? (
                            <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                          ) : (
                            <Clock className="w-4 h-4 text-secondary-foreground" />
                          )}
                        </div>
                        <div className={`w-0.5 h-full mt-2 ${
                          selectionCount > 0 ? "bg-primary" : "bg-border"
                        }`} />
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className="font-semibold mb-1">
                          Seleção de Imóveis
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectionCount > 0 ? "Concluído" : "Pendente"}
                        </p>
                        <p className="text-sm mt-2">
                          {selectionCount > 0 
                            ? `Você selecionou ${selectionCount} imóvel(s).`
                            : "Selecione até 3 imóveis de seu interesse."
                          }
                        </p>
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
                        <h4 className="font-semibold mb-1">
                          Análise Socioeconômica
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Em andamento
                        </p>
                        <p className="text-sm mt-2">
                          Sua situação está sendo avaliada pela equipe técnica.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 text-muted-foreground">
                          Aprovação Final
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Aguardando etapas anteriores
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Dados do Beneficiário */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Seus Dados</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/beneficiario/perfil">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome</p>
                    <p className="font-medium">{userData?.nome || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPF</p>
                    <p className="font-medium">
                      {userData?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">
                      {userData?.telefone?.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Endereço</p>
                    <p className="font-medium">
                      {profile?.endereco 
                        ? `${profile.endereco}${profile.numero ? `, ${profile.numero}` : ""}`
                        : "N/A"
                      }
                    </p>
                    {profile?.bairro && (
                      <p className="text-muted-foreground">
                        {profile.bairro}, {profile.cidade} - {profile.estado}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/imoveis">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Ver Imóveis
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/beneficiario/documentos">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Documentos
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between text-destructive hover:text-destructive"
                    onClick={logout}
                  >
                    <span className="flex items-center">
                      Sair
                    </span>
                    <ArrowRight className="w-4 h-4" />
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
                    Mantenha seus dados atualizados e acompanhe regularmente o
                    status da sua solicitação.
                  </p>
                  {selectionCount === 0 && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary">
                        <strong>Dica:</strong> Selecione até 3 imóveis para aumentar suas chances!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
