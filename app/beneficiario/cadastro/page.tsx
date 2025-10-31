"use client"

import BackButton from "@/components/back-button"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import SmoothTab from "@/components/smooth-tab"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
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
import { DollarSign, MapPin, User } from "lucide-react"
import {
  beneficiarioSchema,
  deficienciaEnum,
  identidadeGeneroEnum,
  racaEnum,
  rendaFamiliarFaixaEnum,
  sexoEnum,
  tipoRendaEnum,
  type BeneficiarioFormData
} from "@/lib/schemas/beneficiario"
import { useLocalStorage } from "usehooks-ts"

const STORAGE_KEY = "beneficiario-draft"

const STEP_IDS = ["pessoais", "contato", "endereco", "resumo"] as const
type StepId = (typeof STEP_IDS)[number]

export default function BeneficiarioCadastroPage() {
  const [selectedStep, setSelectedStep] = useState<StepId>("pessoais")

  const form = useForm<BeneficiarioFormData>({
    resolver: zodResolver(beneficiarioSchema),
    mode: "onChange",
    defaultValues: {
      sexo: "nao-informado",
      identidadeGenero: "nao-informado",
      raca: "nao-informado",
      deficiencias: ["nao_possui"],
      aceitaComunicacoes: false,
      estado: "MA"
    }
  })

  const { watch, setValue, handleSubmit, trigger } = form
  const [draft, setDraft] = useLocalStorage<Partial<BeneficiarioFormData>>(
    STORAGE_KEY,
    {}
  )

  // Hydrate from draft once
  useEffect(() => {
    if (draft && Object.keys(draft).length > 0) {
      for (const [key, value] of Object.entries(draft)) {
        // @ts-expect-error runtime set
        setValue(key as keyof BeneficiarioFormData, value as any, {
          shouldValidate: false
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist changes to localStorage
  useEffect(() => {
    const subscription = watch((values) => {
      setDraft(values as Partial<BeneficiarioFormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDraft])

  const stepFields: Record<StepId, (keyof BeneficiarioFormData)[]> = useMemo(
    () => ({
      pessoais: [
        "nome",
        "cpf",
        "rg",
        "senha",
        "sexo",
        "identidadeGenero",
        "raca",
        "deficiencias"
      ],
      contato: [
        "profissao",
        "empregador",
        "ramoAtividade",
        "tipoRenda",
        "rendaFaixa",
        "pessoasFamilia",
        "dddCelular",
        "celular",
        "dddTelefoneFixo",
        "telefoneFixo",
        "dddTelefoneRecado",
        "telefoneRecado",
        "falarCom",
        "email",
        "aceitaComunicacoes"
      ],
      endereco: [
        "cep",
        "endereco",
        "numero",
        "complemento",
        "bairro",
        "cidade",
        "estado",
        "empreendimento"
      ],
      resumo: []
    }),
    []
  )

  async function goNext() {
    const currentIndex = STEP_IDS.indexOf(selectedStep)
    const next = STEP_IDS[currentIndex + 1]
    if (!next) return
    const valid = await trigger(stepFields[selectedStep])
    if (valid) setSelectedStep(next)
  }

  function goPrev() {
    const currentIndex = STEP_IDS.indexOf(selectedStep)
    const prev = STEP_IDS[currentIndex - 1]
    if (prev) setSelectedStep(prev)
  }

  const onSubmit = (data: BeneficiarioFormData) => {
    localStorage.removeItem(STORAGE_KEY)
    console.log("Submitted:", data)
  }

  const tabItems = [
    {
      id: "pessoais",
      title: "Pessoais",
      color: "bg-blue-500 hover:bg-blue-600",
      cardContent: (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Dados Pessoais</h3>
            <p className="text-sm text-muted-foreground">
              Informações básicas do beneficiário
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG</FormLabel>
                  <FormControl>
                    <Input placeholder="00.000.000-0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="sexo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sexoEnum.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identidadeGenero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identidade de Gênero</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {identidadeGeneroEnum.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="raca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça/Cor</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {racaEnum.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormLabel>Deficiências</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {deficienciaEnum.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input"
                    checked={form.getValues("deficiencias").includes(opt)}
                    onChange={(e) => {
                      const current = new Set(form.getValues("deficiencias"))
                      if (e.target.checked) current.add(opt)
                      else current.delete(opt)
                      const next = Array.from(current)
                      form.setValue("deficiencias", next as any, {
                        shouldValidate: true
                      })
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "contato",
      title: "Contato",
      color: "bg-purple-500 hover:bg-purple-600",
      cardContent: (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Contato e Renda</h3>
            <p className="text-sm text-muted-foreground">
              Como falar com você e sua situação profissional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dddCelular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DDD Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="98" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="90000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="voce@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="profissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissão</FormLabel>
                  <FormControl>
                    <Input placeholder="Sua profissão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipoRenda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Renda</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipoRendaEnum.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="rendaFaixa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renda Familiar (faixa)</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rendaFamiliarFaixaEnum.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pessoasFamilia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoas na família</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )
    },
    {
      id: "endereco",
      title: "Endereço",
      color: "bg-emerald-500 hover:bg-emerald-600",
      cardContent: (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Endereço</h3>
            <p className="text-sm text-muted-foreground">Onde você mora</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Av., etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="complemento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto, Bloco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="São Luís" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )
    },
    {
      id: "resumo",
      title: "Revisão",
      color: "bg-amber-500 hover:bg-amber-600",
      cardContent: (
        <div className="p-6 space-y-2">
          <h3 className="text-xl font-semibold">Revise seus dados</h3>
          <p className="text-sm text-muted-foreground">
            Ao enviar, seu rascunho local será apagado.
          </p>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 space-y-4">
        <div className="container mx-auto">
          <BackButton>Voltar para o início</BackButton>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Cadastro de Beneficiário
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Preencha seus dados para participar do Programa Habitacional do
              Maranhão
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {selectedStep === "pessoais" && (
                      <User className="w-5 h-5 text-primary" />
                    )}
                    {selectedStep === "contato" && (
                      <DollarSign className="w-5 h-5 text-primary" />
                    )}
                    {selectedStep === "endereco" && (
                      <MapPin className="w-5 h-5 text-primary" />
                    )}
                    <CardTitle>Etapas</CardTitle>
                  </div>
                  <CardDescription>Progresso do cadastro</CardDescription>
                </CardHeader>
                <CardContent>
                  <SmoothTab
                    items={tabItems}
                    defaultTabId={selectedStep}
                    onChange={(id) => setSelectedStep(id as StepId)}
                    className="w-full max-w-2xl"
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPrev}
                  disabled={selectedStep === "pessoais"}>
                  Voltar
                </Button>
                {selectedStep !== "resumo" ? (
                  <Button type="button" onClick={goNext}>
                    Próximo
                  </Button>
                ) : (
                  <Button type="submit" className="flex-1">
                    Enviar cadastro
                  </Button>
                )}
                <Button type="button" variant="ghost" asChild>
                  <Link href="/">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
