"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, CheckCircle2, User, MapPin, CreditCard, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cpfMaskOptions, phoneMaskOptions, cepMaskOptions } from "@/lib/masks";
import { useMaskito } from "@maskito/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Step = 1 | 2 | 3;

export default function OfertanteOnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding, logout, isLoading: isAuthLoading } = useAuth();
  const userWithProfile = useQuery(api.users.getCurrentUserWithProfile);
  const profile = userWithProfile?.profile;
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  // Step 1: Personal Info
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // Step 2: Address
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("MA");

  // Pre-fill form data from profile when it loads
  useEffect(() => {
    if (userWithProfile === undefined) return; // Still loading
    
    const { user: userData, profile: profileData } = userWithProfile;
    
    if (userData) {
      setNome(userData.nome || "");
      // CPF might be on user or profile
      if (userData.cpf) {
        setCpf(userData.cpf);
      }
    }
    
    if (profileData) {
      // Pre-fill from profile data
      if (profileData.cpf) setCpf(profileData.cpf);
      if (profileData.dataNascimento) setDataNascimento(profileData.dataNascimento);
      if (profileData.cep) setCep(profileData.cep);
      if (profileData.endereco) setEndereco(profileData.endereco);
      if (profileData.numero) setNumero(profileData.numero);
      if (profileData.complemento) setComplemento(profileData.complemento);
      if (profileData.bairro) setBairro(profileData.bairro);
      if (profileData.cidade) setCidade(profileData.cidade);
      if (profileData.estado) setEstado(profileData.estado);
    }
    
    setIsInitializing(false);
  }, [userWithProfile]);

  const cpfInputRef = useMaskito({ options: cpfMaskOptions });
  const cepInputRef = useMaskito({ options: cepMaskOptions });

  const progress = ((currentStep - 1) / 2) * 100;

  // Show loading while auth or profile data is loading
  if (isAuthLoading || isInitializing || userWithProfile === undefined) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados do cadastro...</p>
        </div>
      </div>
    );
  }

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1) {
      // Validate step 1
      if (!nome.trim()) {
        setError("Informe seu nome completo");
        return;
      }
      if (cpf.replace(/\D/g, "").length !== 11) {
        setError("Informe um CPF válido");
        return;
      }
      if (!dataNascimento) {
        setError("Informe sua data de nascimento");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate step 2
      if (cep.replace(/\D/g, "").length !== 8) {
        setError("Informe um CEP válido");
        return;
      }
      if (!endereco.trim()) {
        setError("Informe seu endereço");
        return;
      }
      if (!numero.trim()) {
        setError("Informe o número");
        return;
      }
      if (!bairro.trim()) {
        setError("Informe o bairro");
        return;
      }
      if (!cidade.trim()) {
        setError("Informe a cidade");
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Include all fields from profile if they were already saved during cadastro
    const profileData = userWithProfile?.profile;
    
    const result = await completeOnboarding({
      nome,
      cpf: cpf.replace(/\D/g, ""),
      dataNascimento,
      // Include fields from profile that were saved during cadastro
      rg: profileData?.rg || undefined,
      profissao: profileData?.profissao || undefined,
      estadoCivil: profileData?.estadoCivil || undefined,
      cep: cep.replace(/\D/g, ""),
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
    });

    if (result.success) {
      router.push("/ofertante/dashboard");
    } else {
      setError(result.error || "Erro ao completar cadastro");
    }

    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Check if profile data exists from cadastro
  const hasProfileData = !!profile && (
    profile.cpf || profile.dataNascimento || profile.cep || profile.endereco
  );

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <h1 className="text-3xl font-bold mb-2">Complete seu Cadastro</h1>
            <p className="text-muted-foreground">
              Informe seus dados para ativar sua conta de ofertante
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className={currentStep >= 1 ? "font-medium text-primary" : ""}>
                Dados Pessoais
              </span>
              <span className={currentStep >= 2 ? "font-medium text-primary" : ""}>
                Endereço
              </span>
              <span className={currentStep >= 3 ? "font-medium text-primary" : ""}>
                Revisão
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Info: Data pre-filled from cadastro */}
          {hasProfileData && (
            <div className="mb-6 p-4 border border-primary/50 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary">
                <strong>Dados preenchidos automaticamente:</strong> Alguns campos já foram preenchidos com as informações do seu cadastro inicial. Verifique se estão corretos antes de continuar.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Dados Pessoais</CardTitle>
                </div>
                <CardDescription>
                  Informe seus dados pessoais para identificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    ref={cpfInputRef}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-nascimento">Data de Nascimento *</Label>
                  <Input
                    id="data-nascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleNextStep} className="w-full">
                    Continuar
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Endereço</CardTitle>
                </div>
                <CardDescription>
                  Informe seu endereço residencial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      ref={cepInputRef}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    type="text"
                    placeholder="Rua, Avenida, etc."
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      type="text"
                      placeholder="123"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      type="text"
                      placeholder="Apto, Casa, etc."
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    type="text"
                    placeholder="Nome do bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      type="text"
                      placeholder="São Luís"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      type="text"
                      value={estado}
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1">
                    Continuar
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <CardTitle>Revisão</CardTitle>
                </div>
                <CardDescription>
                  Verifique se todas as informações estão corretas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info Summary */}
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Dados Pessoais
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nome:</span>{" "}
                        <span className="font-medium">{nome}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPF:</span>{" "}
                        <span className="font-medium">{cpf}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data de Nascimento:</span>{" "}
                        <span className="font-medium">{formatDate(dataNascimento)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço
                    </h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">CEP:</span>{" "}
                        <span className="font-medium">{cep}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Endereço:</span>{" "}
                        <span className="font-medium">
                          {endereco}, {numero}
                          {complemento ? ` - ${complemento}` : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bairro:</span>{" "}
                        <span className="font-medium">{bairro}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cidade/Estado:</span>{" "}
                        <span className="font-medium">{cidade} - {estado}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Notice */}
                  <div className="p-4 border border-yellow-500/50 bg-yellow-50/50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Próximo passo:</strong> Após confirmar seu cadastro, você poderá fazer upload dos documentos necessários (RG e Comprovante de Residência) no seu painel.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirmar Cadastro
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Logout Option */}
          <div className="mt-8 text-center">
            <Button variant="ghost" onClick={logout} className="text-muted-foreground">
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
