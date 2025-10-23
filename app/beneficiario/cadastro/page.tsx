import Link from "next/link"
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
import {
  Home,
  ArrowLeft,
  User,
  FileText,
  MapPin,
  DollarSign
} from "lucide-react"

export default function BeneficiarioCadastroPage() {
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
            <h1 className="text-3xl font-bold mb-2">
              Cadastro de Beneficiário
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Preencha seus dados para participar do Programa Habitacional do
              Maranhão
            </p>
          </div>

          <form className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Dados Pessoais</CardTitle>
                </div>
                <CardDescription>
                  Informações básicas do beneficiário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" placeholder="Seu nome completo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input id="cpf" placeholder="000.000.000-00" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG *</Label>
                    <Input id="rg" placeholder="00.000.000-0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-nascimento">
                      Data de Nascimento *
                    </Label>
                    <Input id="data-nascimento" type="date" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado-civil">Estado Civil *</Label>
                    <Select required>
                      <SelectTrigger id="estado-civil">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">
                          Divorciado(a)
                        </SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        <SelectItem value="uniao-estavel">
                          União Estável
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      placeholder="(98) 00000-0000"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço Atual */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Endereço Atual</CardTitle>
                </div>
                <CardDescription>Onde você mora atualmente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input id="cep" placeholder="00000-000" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço *</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, Avenida, etc."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input id="numero" placeholder="123" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" placeholder="Apto, Bloco, etc." />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input id="bairro" placeholder="Nome do bairro" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input id="cidade" placeholder="São Luís" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Input id="estado" value="MA" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Socioeconômicas */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <CardTitle>Informações Socioeconômicas</CardTitle>
                </div>
                <CardDescription>
                  Dados sobre sua situação financeira e familiar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="renda-familiar">
                      Renda Familiar Mensal *
                    </Label>
                    <Select required>
                      <SelectTrigger id="renda-familiar">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ate-2">Até R$ 2.000</SelectItem>
                        <SelectItem value="2-4">R$ 2.000 - R$ 4.000</SelectItem>
                        <SelectItem value="4-6">R$ 4.000 - R$ 6.000</SelectItem>
                        <SelectItem value="6-8">R$ 6.000 - R$ 8.000</SelectItem>
                        <SelectItem value="acima-8">
                          Acima de R$ 8.000
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pessoas-familia">
                      Pessoas na Família *
                    </Label>
                    <Input
                      id="pessoas-familia"
                      type="number"
                      min="1"
                      placeholder="4"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profissao">Profissão *</Label>
                    <Input
                      id="profissao"
                      placeholder="Sua profissão"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="situacao-emprego">
                      Situação de Emprego *
                    </Label>
                    <Select required>
                      <SelectTrigger id="situacao-emprego">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clt">CLT</SelectItem>
                        <SelectItem value="autonomo">Autônomo</SelectItem>
                        <SelectItem value="servidor">
                          Servidor Público
                        </SelectItem>
                        <SelectItem value="desempregado">
                          Desempregado
                        </SelectItem>
                        <SelectItem value="aposentado">Aposentado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Conte-nos mais sobre sua situação e por que você precisa deste programa..."
                    rows={4}
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
                  Anexe os documentos necessários (PDF ou imagem)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-identidade">RG ou CNH *</Label>
                  <Input
                    id="doc-identidade"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-cpf">CPF *</Label>
                  <Input
                    id="doc-cpf"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-comprovante-residencia">
                    Comprovante de Residência *
                  </Label>
                  <Input
                    id="doc-comprovante-residencia"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-comprovante-renda">
                    Comprovante de Renda *
                  </Label>
                  <Input
                    id="doc-comprovante-renda"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Termos */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="termos"
                    className="mt-1"
                    required
                  />
                  <Label
                    htmlFor="termos"
                    className="text-sm leading-relaxed cursor-pointer">
                    Declaro que todas as informações fornecidas são verdadeiras
                    e estou ciente de que a prestação de informações falsas pode
                    resultar em penalidades legais e exclusão do programa.
                  </Label>
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
