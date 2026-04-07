"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Home, ArrowLeft, Building2, FileText, User } from "lucide-react"

export default function ConstrutorCadastroPage() {
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [termosErro, setTermosErro] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Form */}
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o início
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Cadastro de Construtor</h1>
            <p className="text-muted-foreground leading-relaxed">
              Cadastre sua empresa para oferecer imóveis no Programa
              Habitacional
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              if (!termosAceitos) {
                e.preventDefault()
                setTermosErro(true)
              }
            }}>
            {/* Dados da Empresa */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle>Dados da Empresa</CardTitle>
                </div>
                <CardDescription>
                  Informações da construtora ou incorporadora
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razao-social">Razão Social *</Label>
                  <Input
                    id="razao-social"
                    placeholder="Nome completo da empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome-fantasia">Nome Fantasia *</Label>
                  <Input
                    id="nome-fantasia"
                    placeholder="Nome comercial"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inscricao-estadual">
                      Inscrição Estadual *
                    </Label>
                    <Input
                      id="inscricao-estadual"
                      placeholder="000.000.000.000"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo-empresa">Tipo de Empresa *</Label>
                    <Select required>
                      <SelectTrigger id="tipo-empresa">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construtora">Construtora</SelectItem>
                        <SelectItem value="incorporadora">
                          Incorporadora
                        </SelectItem>
                        <SelectItem value="ambos">
                          Construtora e Incorporadora
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tempo-mercado">
                      Tempo de Mercado (anos) *
                    </Label>
                    <Input
                      id="tempo-mercado"
                      type="number"
                      min="0"
                      placeholder="10"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone-empresa">Telefone *</Label>
                    <Input
                      id="telefone-empresa"
                      placeholder="(98) 0000-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-empresa">E-mail Corporativo *</Label>
                    <Input
                      id="email-empresa"
                      type="email"
                      placeholder="contato@empresa.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site">Website</Label>
                  <Input
                    id="site"
                    type="url"
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço da Empresa</CardTitle>
                <CardDescription>Localização da sede</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep-empresa">CEP *</Label>
                    <Input id="cep-empresa" placeholder="00000-000" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco-empresa">Endereço *</Label>
                    <Input
                      id="endereco-empresa"
                      placeholder="Rua, Avenida, etc."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero-empresa">Número *</Label>
                    <Input id="numero-empresa" placeholder="123" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="complemento-empresa">Complemento</Label>
                    <Input
                      id="complemento-empresa"
                      placeholder="Sala, Andar, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro-empresa">Bairro *</Label>
                    <Input
                      id="bairro-empresa"
                      placeholder="Nome do bairro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade-empresa">Cidade *</Label>
                    <Input
                      id="cidade-empresa"
                      placeholder="São Luís"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado-empresa">Estado *</Label>
                    <Input id="estado-empresa" value="MA" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsável Legal */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Responsável Legal</CardTitle>
                </div>
                <CardDescription>
                  Dados do representante da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-responsavel">Nome Completo *</Label>
                  <Input
                    id="nome-responsavel"
                    placeholder="Nome do responsável"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf-responsavel">CPF *</Label>
                    <Input
                      id="cpf-responsavel"
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo-responsavel">Cargo *</Label>
                    <Input
                      id="cargo-responsavel"
                      placeholder="Diretor, Sócio, etc."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone-responsavel">Telefone *</Label>
                    <Input
                      id="telefone-responsavel"
                      placeholder="(98) 00000-0000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-responsavel">E-mail *</Label>
                    <Input
                      id="email-responsavel"
                      type="email"
                      placeholder="responsavel@empresa.com"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
                <CardDescription>
                  Conte-nos mais sobre sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empreendimentos-anteriores">
                    Número de Empreendimentos Entregues *
                  </Label>
                  <Input
                    id="empreendimentos-anteriores"
                    type="number"
                    min="0"
                    placeholder="5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao-empresa">
                    Descrição da Empresa *
                  </Label>
                  <Textarea
                    id="descricao-empresa"
                    placeholder="Conte sobre a experiência da empresa, principais projetos, diferenciais..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Documentos</CardTitle>
                </div>
                <CardDescription>
                  Anexe os documentos necessários (PDF)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-contrato-social">Contrato Social *</Label>
                  <Input
                    id="doc-contrato-social"
                    type="file"
                    accept=".pdf"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-cnpj">Cartão CNPJ *</Label>
                  <Input id="doc-cnpj" type="file" accept=".pdf" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-certidoes">
                    Certidões Negativas (Federal, Estadual, Municipal) *
                  </Label>
                  <Input
                    id="doc-certidoes"
                    type="file"
                    accept=".pdf"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-alvara">Alvará de Funcionamento *</Label>
                  <Input id="doc-alvara" type="file" accept=".pdf" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-responsavel-tecnico">
                    Registro do Responsável Técnico (CREA/CAU) *
                  </Label>
                  <Input
                    id="doc-responsavel-tecnico"
                    type="file"
                    accept=".pdf"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Termos */}
            <Card>
              <CardHeader>
                <CardTitle>Declaração</CardTitle>
                <CardDescription>
                  Confirme a veracidade das informações para concluir o cadastro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 rounded-lg border bg-card/50 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label
                      htmlFor="termos-construtor"
                      className="text-sm font-medium leading-none">
                      Veracidade e regularidade
                    </Label>
                    <p
                      id="termos-construtor-desc"
                      className="text-sm leading-relaxed text-muted-foreground">
                      Declaro que todas as informações e documentos fornecidos são
                      verdadeiros e que a empresa está em situação regular
                      perante os órgãos competentes. Estou ciente de que a
                      prestação de informações falsas pode resultar em
                      penalidades legais e exclusão do programa.
                    </p>
                    {termosErro && (
                      <p className="text-sm text-destructive" role="alert">
                        Ative o interruptor para confirmar a declaração.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <span className="text-xs text-muted-foreground sm:order-2">
                      Aceito
                    </span>
                    <Switch
                      id="termos-construtor"
                      checked={termosAceitos}
                      onCheckedChange={(v) => {
                        setTermosAceitos(v)
                        if (v) setTermosErro(false)
                      }}
                      aria-describedby="termos-construtor-desc"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" size="lg" className="flex-1">
                Enviar Cadastro
              </Button>
              <Button type="button" variant="outline" size="lg" asChild>
                <Link href="/">Cancelar</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
