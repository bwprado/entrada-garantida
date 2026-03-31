"use client";

import { useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ParsedBeneficiary {
  cpf: string;
  nome: string;
  telefone: string;
  mesesAluguelSocial: number;
  possuiIdosoFamilia: boolean;
  chefiaFeminina: boolean;
  pessoasFamilia?: number;
  sexo?: string;
  raca?: string;
  deficiencias?: string[];
  linha: number;
  valid: boolean;
  error?: string;
}

const EXPECTED_HEADERS = [
  "cpf",
  "nome",
  "telefone",
  "meses_aluguel_social",
  "possui_idoso_familia",
  "chefia_feminina",
];

export default function AdminBulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedBeneficiary[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    total: number;
    sucessos: number;
    erros: Array<{ linha: number; erro: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkUploadMutation = useMutation(api.users.bulkUploadBeneficiaries);

  const cleanCPF = (cpf: string): string => cpf.replace(/\D/g, "");

  const parseCSV = (text: string): ParsedBeneficiary[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("Arquivo deve conter cabeçalho e pelo menos uma linha de dados");
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    
    // Validate headers
    const missingHeaders = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Colunas obrigatórias não encontradas: ${missingHeaders.join(", ")}`);
    }

    const cpfIdx = headers.indexOf("cpf");
    const nomeIdx = headers.indexOf("nome");
    const telefoneIdx = headers.indexOf("telefone");
    const mesesIdx = headers.indexOf("meses_aluguel_social");
    const idosoIdx = headers.indexOf("possui_idoso_familia");
    const chefiaIdx = headers.indexOf("chefia_feminina");
    const pessoasIdx = headers.indexOf("pessoas_familia");
    const sexoIdx = headers.indexOf("sexo");
    const racaIdx = headers.indexOf("raca");
    const deficienciasIdx = headers.indexOf("deficiencias");

    const results: ParsedBeneficiary[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const linha = i + 1;

      const cpf = cleanCPF(values[cpfIdx] || "");
      const nome = values[nomeIdx] || "";
      const telefone = values[telefoneIdx] || "";
      const mesesStr = values[mesesIdx] || "0";
      const idosoStr = values[idosoIdx]?.toLowerCase() || "false";
      const chefiaStr = values[chefiaIdx]?.toLowerCase() || "false";

      // Validation
      const errors: string[] = [];

      if (cpf.length !== 11) {
        errors.push("CPF inválido (deve ter 11 dígitos)");
      }
      if (!nome || nome.length < 3) {
        errors.push("Nome inválido");
      }
      if (!telefone || telefone.length < 10) {
        errors.push("Telefone inválido");
      }

      const meses = parseInt(mesesStr, 10);
      if (isNaN(meses) || meses < 0) {
        errors.push("Meses em aluguel social inválido");
      }

      const possuiIdosoFamilia = idosoStr === "true" || idosoStr === "1" || idosoStr === "sim";
      const chefiaFeminina = chefiaStr === "true" || chefiaStr === "1" || chefiaStr === "sim";

      results.push({
        cpf,
        nome,
        telefone: telefone.replace(/\D/g, ""),
        mesesAluguelSocial: meses,
        possuiIdosoFamilia,
        chefiaFeminina,
        pessoasFamilia: pessoasIdx >= 0 ? parseInt(values[pessoasIdx], 10) || undefined : undefined,
        sexo: sexoIdx >= 0 ? values[sexoIdx] : undefined,
        raca: racaIdx >= 0 ? values[racaIdx] : undefined,
        deficiencias: deficienciasIdx >= 0 ? values[deficienciasIdx]?.split(";") : undefined,
        linha,
        valid: errors.length === 0,
        error: errors.length > 0 ? errors.join("; ") : undefined,
      });
    }

    return results;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setParsedData([]);
    setUploadResult(null);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao processar arquivo");
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    // Filter only valid entries
    const validData = parsedData.filter((p) => p.valid);
    if (validData.length === 0) {
      alert("Nenhum registro válido para importar");
      return;
    }

    setIsUploading(true);

    try {
      // Note: In production, you'd get the admin ID from auth context
      const adminId = "dummy_admin_id" as any;

      const result = await bulkUploadMutation({
        adminId,
        beneficiaries: validData.map((b) => ({
          cpf: b.cpf,
          nome: b.nome,
          telefone: b.telefone,
          mesesAluguelSocial: b.mesesAluguelSocial,
          possuiIdosoFamilia: b.possuiIdosoFamilia,
          chefiaFeminina: b.chefiaFeminina,
          pessoasFamilia: b.pessoasFamilia,
          sexo: b.sexo,
          raca: b.raca,
          deficiencias: b.deficiencias,
        })),
      });

      setUploadResult({
        total: parsedData.length,
        sucessos: result.sucessos,
        erros: result.erros,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `cpf,nome,telefone,meses_aluguel_social,possui_idoso_familia,chefia_feminina,pessoas_familia,sexo,raca,deficiencias
12345678901,João da Silva,98999998888,24,false,true,4,masculino,parda,
98765432100,Maria Oliveira,98888887777,36,true,true,3,feminina,preta,auditiva`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_beneficiarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao painel
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Importar Beneficiários</h1>
        <p className="text-muted-foreground mb-6">
          Faça upload de um arquivo CSV com os beneficiários pré-aprovados
        </p>

        {/* Template Download */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Formato do Arquivo</CardTitle>
            <CardDescription>
              Baixe o template e preencha com os dados dos beneficiários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Template CSV
            </Button>
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Colunas obrigatórias:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>cpf</strong> - CPF com 11 dígitos (apenas números)</li>
                <li><strong>nome</strong> - Nome completo</li>
                <li><strong>telefone</strong> - Telefone com DDD</li>
                <li><strong>meses_aluguel_social</strong> - Meses em aluguel social</li>
                <li><strong>possui_idoso_familia</strong> - true/false</li>
                <li><strong>chefia_feminina</strong> - true/false</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Upload do Arquivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
                disabled={isParsing || isUploading}
              />
              {file && (
                <div className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parsing Results */}
        {parsedData.length > 0 && !uploadResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Pré-visualização</CardTitle>
              <CardDescription>
                {parsedData.filter((p) => p.valid).length} de {parsedData.length} registros válidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Linha</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Meses</TableHead>
                      <TableHead>Idoso</TableHead>
                      <TableHead>Chefia Fem.</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row) => (
                      <TableRow key={row.linha} className={!row.valid ? "bg-destructive/10" : ""}>
                        <TableCell>{row.linha}</TableCell>
                        <TableCell>{row.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</TableCell>
                        <TableCell>{row.nome}</TableCell>
                        <TableCell>{row.telefone}</TableCell>
                        <TableCell>{row.mesesAluguelSocial}</TableCell>
                        <TableCell>{row.possuiIdosoFamilia ? "Sim" : "Não"}</TableCell>
                        <TableCell>{row.chefiaFeminina ? "Sim" : "Não"}</TableCell>
                        <TableCell>
                          {row.valid ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Válido
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              {row.error}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 50 && (
                  <p className="text-sm text-muted-foreground p-2 text-center">
                    Mostrando primeiros 50 de {parsedData.length} registros
                  </p>
                )}
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || parsedData.filter((p) => p.valid).length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar {parsedData.filter((p) => p.valid).length} beneficiários
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isUploading}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="text-lg text-green-600">
                Importação Concluída
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{uploadResult.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{uploadResult.sucessos}</p>
                  <p className="text-sm text-green-700">Sucessos</p>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{uploadResult.erros.length}</p>
                  <p className="text-sm text-red-700">Erros</p>
                </div>
              </div>
              
              {uploadResult.erros.length > 0 && (
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">Detalhes dos erros:</p>
                  <ul className="text-sm space-y-1">
                    {uploadResult.erros.map((e, i) => (
                      <li key={i} className="text-destructive">
                        Linha {e.linha}: {e.erro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={() => router.push("/admin/dashboard")}>
                Voltar ao painel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
