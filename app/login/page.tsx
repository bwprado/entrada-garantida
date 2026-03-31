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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, MapPin, User, Phone, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cpfMaskOptions, phoneMaskOptions } from "@/lib/masks";
import { useMaskito } from "@maskito/react";

type Step = "cpf" | "otp" | "data-validation" | "data-error" | "secid-contact" | "terms";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, requestOTP, verifyOTP, acceptTerms, confirmData, reportDataError } = useAuth();
  const [step, setStep] = useState<Step>("cpf");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [otp, setOtp] = useState("");
  const [telefoneMascarado, setTelefoneMascarado] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [mensagemErro, setMensagemErro] = useState("");
  const [userData, setUserData] = useState<any>(null);

  const cpfInputRef = useMaskito({ options: cpfMaskOptions });
  const phoneInputRef = useMaskito({ options: phoneMaskOptions });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.termoAceitoEm) {
        setStep("terms");
      } else {
        redirectToDashboard(user.role);
      }
    }
  }, [isAuthenticated, user]);

  // Countdown for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/admin/dashboard");
        break;
      case "beneficiary":
        router.push("/beneficiario/dashboard");
        break;
      case "ofertante":
        router.push("/ofertante/dashboard");
        break;
      case "construtor":
        router.push("/construtor/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await requestOTP(cpf, telefone);

    if (result.success) {
      setTelefoneMascarado(result.telefoneMascarado || "");
      setStep("otp");
      setCountdown(60);
    } else {
      // Check if it's a phone mismatch error
      if (result.error?.includes("telefone informado não corresponde")) {
        setStep("secid-contact");
      } else {
        setError(result.error || "Erro ao enviar código");
      }
    }

    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await verifyOTP(cpf, otp);

    if (result.success) {
      setUserData(result.userData);
      
      // Check if user already validated data
      if (result.userData.dadosValidados) {
        // Skip validation, go to terms
        setStep("terms");
      } else if (result.userData.dadosComErro) {
        // User already reported error, show contact
        setStep("secid-contact");
      } else {
        // Show data validation step
        setStep("data-validation");
      }
    } else {
      setError(result.error || "Código inválido");
    }

    setIsLoading(false);
  };

  const handleConfirmData = async () => {
    setIsLoading(true);
    setError("");

    const result = await confirmData();

    if (result.success) {
      setStep("terms");
    } else {
      setError(result.error || "Erro ao confirmar dados");
    }

    setIsLoading(false);
  };

  const handleReportDataError = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mensagemErro.trim()) {
      setError("Por favor, descreva qual informação está incorreta");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await reportDataError(mensagemErro);

    if (result.success) {
      setStep("secid-contact");
    } else {
      setError(result.error || "Erro ao reportar problema");
    }

    setIsLoading(false);
  };

  const handleAcceptTerms = async () => {
    setIsLoading(true);
    setError("");

    const result = await acceptTerms();

    if (result.success) {
      router.push("/imoveis");
    } else {
      setError(result.error || "Erro ao aceitar termos");
    }

    setIsLoading(false);
  };

  const formatAddress = (data: any) => {
    const parts = [
      data.endereco,
      data.numero,
      data.bairro,
      data.cidade,
      data.estado,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o início
            </Link>
          </Button>

          {/* Step 1: CPF + Telefone */}
          {step === "cpf" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Aquisição Assistida</CardTitle>
                <CardDescription>
                  Digite seu CPF e telefone para receber o código de verificação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      ref={cpfInputRef}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Celular</Label>
                    <Input
                      id="telefone"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      ref={phoneInputRef}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite o mesmo celular cadastrado no programa
                    </p>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Receber código"
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Problemas com seus dados?
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setStep("secid-contact")}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Entrar em contato com SECID
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Verificação</CardTitle>
                <CardDescription>
                  Enviamos um código para o telefone {telefoneMascarado}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Código de 6 dígitos</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                      disabled={isLoading}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={countdown > 0}
                    onClick={() => {
                      setStep("cpf");
                      setOtp("");
                      setError("");
                    }}
                  >
                    {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar código"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Data Validation */}
          {step === "data-validation" && userData && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Confirme seus dados</CardTitle>
                <CardDescription>
                  Verifique se suas informações estão corretas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{userData.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">{userData.cpf}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Celular</p>
                      <p className="font-medium">{userData.telefone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{formatAddress(userData)}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handleConfirmData}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Meus dados estão corretos
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep("data-error")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Há informações incorretas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Data Error Report */}
          {step === "data-error" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Reportar Erro nos Dados</CardTitle>
                <CardDescription>
                  Informe quais dados estão incorretos para que a SECID possa atualizá-los
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReportDataError} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mensagem-erro">Descrição do problema</Label>
                    <Textarea
                      id="mensagem-erro"
                      placeholder="Ex: Meu endereço está errado. O correto é: Rua das Flores, 123, Centro..."
                      value={mensagemErro}
                      onChange={(e) => setMensagemErro(e.target.value)}
                      required
                      disabled={isLoading}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Descreva claramente qual informação está incorreta e qual é o valor correto.
                    </p>
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <div className="space-y-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar solicitação de correção"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep("data-validation");
                        setMensagemErro("");
                        setError("");
                      }}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Voltar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 5: SECID Contact */}
          {step === "secid-contact" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Entre em Contato</CardTitle>
                <CardDescription>
                  É necessário atualizar seus dados para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-2">Secretaria de Estado de Cidades e Desenvolvimento Urbano (SECID)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Entre em contato com a SECID para atualizar seus dados cadastrais.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Endereço:</strong> Av. dos Holandeses, s/n - Quadra 33 - Calhau, São Luís - MA</p>
                    <p><strong>Telefone:</strong> (98) 3198-5300</p>
                    <p><strong>Email:</strong> secid@ma.gov.br</p>
                    <p><strong>Horário:</strong> Segunda a Sexta, 8h às 18h</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("cpf");
                    setError("");
                    setMensagemErro("");
                  }}
                  className="w-full"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Terms */}
          {step === "terms" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Termo de Ciência</CardTitle>
                <CardDescription>
                  Leia atentamente as regras do programa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto border rounded-lg p-4 text-sm text-muted-foreground">
                  <h3 className="font-bold text-foreground mb-2">
                    TERMO DE CIÊNCIA E MANIFESTAÇÃO DE INTERESSE
                  </h3>
                  <p className="mb-3">
                    Ao participar do programa Aquisição Assistida, você declara estar ciente de que:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      O subsídio de até R$ 20.000,00 (vinte mil reais) é destinado exclusivamente à entrada do imóvel.
                    </li>
                    <li>
                      O valor máximo do imóvel a ser adquirido é de R$ 200.000,00 (duzentos mil reais).
                    </li>
                    <li>
                      A seleção do imóvel será feita pelo beneficiário entre as opções disponíveis e validadas pela Administração Pública.
                    </li>
                    <li>
                      O valor final do imóvel será o menor valor entre a avaliação da CAIXA e o preço ofertado pelo vendedor.
                    </li>
                    <li>
                      É obrigatório possuir renda familiar bruta mensal de até 2 (dois) salários mínimos.
                    </li>
                    <li>
                      O beneficiário não pode possuir imóvel registrado em seu nome ou de seu cônjuge/companheiro.
                    </li>
                    <li>
                      A aprovação do financiamento junto à CAIXA é condição para a efetivação da aquisição.
                    </li>
                    <li>
                      Informações falsas ou incompletas podem resultar no cancelamento do cadastro e em penalidades legais.
                    </li>
                  </ul>
                  <p className="mt-4 font-bold">
                    Ao aceitar este termo, você manifesta seu interesse em participar do programa e declara estar ciente de todas as regras acima.
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleAcceptTerms}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Aceito os termos"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    disabled={isLoading}
                  >
                    Não aceito
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
