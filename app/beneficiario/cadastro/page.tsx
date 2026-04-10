'use client'

import BackButton from '@/components/back-button'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cpfMaskOptions } from '@/lib/masks'
import { mergeRefs } from '@/lib/utils'
import {
  beneficiarioCompleteSchema,
  deficienciaEnum,
  identidadeGeneroEnum,
  racaEnum,
  rendaFamiliarFaixaEnum,
  sexoEnum,
  tipoRendaEnum,
  type BeneficiarioCompleteFormData
} from '@/lib/schemas/beneficiario'
import {
  deficienciaLabels,
  identidadeGeneroLabels,
  racaLabels,
  rendaFamiliarFaixaLabels,
  sexoLabels,
  tipoRendaLabels
} from '@/lib/schemas/mappers'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaskito } from '@maskito/react'
import { CheckCircle, DollarSign, MapPin, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocalStorage } from 'usehooks-ts'

const STEPS = [
  {
    id: 'pessoais',
    title: 'Dados Pessoais',
    description: 'Informações básicas do beneficiário',
    icon: <User className="size-6 text-primary" />,
    isLast: false
  },
  {
    id: 'contato',
    title: 'Contato e Renda',
    description: 'Como falar com você e sua situação profissional',
    icon: <DollarSign className="size-6 text-primary" />,
    isLast: false
  },
  {
    id: 'endereco',
    title: 'Endereço',
    description: 'Onde você mora',
    icon: <MapPin className="size-6 text-primary" />,
    isLast: false
  },
  {
    id: 'resumo',
    title: 'Revisão',
    description: 'Revise seus dados',
    icon: <CheckCircle className="size-6 text-primary" />,
    isLast: true
  }
] as const

type StepId = (typeof STEPS)[number]['id']

const STORAGE_KEY = 'beneficiario-draft'

const PLACEHOLDERS = {
  nome: 'João Silva',
  cpf: '123.456.789-09',
  rg: '123456789',
  sexo: 'nao-informado',
  identidadeGenero: 'nao-informado',
  raca: 'nao-informado',
  tipoRenda: 'nao-informado',
  deficiencias: ['nao_possui'],
  profissao: 'Desenvolvedor',
  rendaFaixa: '2-4',
  pessoasFamilia: 3,
  email: 'teste@email.com',
  aceitaComunicacoes: false,
  cep: '65000000',
  endereco: 'Rua Teste',
  numero: '123',
  bairro: 'Centro',
  cidade: 'São Luís',
  estado: 'MA'
}

export default function BeneficiarioCadastroPage() {
  const [selectedStep, setSelectedStep] = useState<StepId>('pessoais')

  const form = useForm<BeneficiarioCompleteFormData>({
    resolver: zodResolver(beneficiarioCompleteSchema),
    mode: 'onBlur',
    defaultValues: {
      nome: '',
      cpf: '',
      rg: '',
      sexo: undefined,
      identidadeGenero: undefined,
      raca: undefined,
      deficiencias: [],
      profissao: '',
      rendaFaixa: '2-4',
      pessoasFamilia: 1,
      email: '',
      aceitaComunicacoes: false,
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  })

  const cpfInputRef = useMaskito({ options: cpfMaskOptions })

  const { watch, setValue, handleSubmit, trigger } = form
  const [draft, setDraft] = useLocalStorage<
    Partial<BeneficiarioCompleteFormData>
  >(STORAGE_KEY, {})

  // Hydrate from draft once
  useEffect(() => {
    if (draft && Object.keys(draft).length > 0) {
      for (const [key, value] of Object.entries(draft)) {
        setValue(key as keyof BeneficiarioCompleteFormData, value as any, {
          shouldValidate: false
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist changes to localStorage
  useEffect(() => {
    const subscription = watch((values) => {
      setDraft(values as Partial<BeneficiarioCompleteFormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, setDraft])

  const stepFields: Record<StepId, (keyof BeneficiarioCompleteFormData)[]> =
    useMemo(
      () => ({
        pessoais: [
          'nome',
          'cpf',
          'rg',
          'sexo',
          'identidadeGenero',
          'raca',
          'deficiencias'
        ],
        contato: [
          'profissao',
          'empregador',
          'ramoAtividade',
          'tipoRenda',
          'rendaFaixa',
          'pessoasFamilia',
          'dddTelefoneFixo',
          'telefoneFixo',
          'dddTelefoneRecado',
          'telefoneRecado',
          'falarCom',
          'email',
          'aceitaComunicacoes'
        ],
        endereco: [
          'cep',
          'endereco',
          'numero',
          'complemento',
          'bairro',
          'cidade',
          'estado',
          'empreendimento'
        ],
        resumo: []
      }),
      []
    )

  async function goNext() {
    const currentIndex = STEPS.findIndex((step) => step.id === selectedStep)
    const next = STEPS[currentIndex + 1]?.id
    if (!next) return

    const valid = await trigger(stepFields[selectedStep])
    if (valid) {
      setSelectedStep(next as StepId)
    } else {
      // Scroll to first error
      const firstError = Object.keys(form.formState.errors)[0]
      if (firstError) {
        const element = document.getElementsByName(firstError)[0]
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element?.focus()
      }
    }
  }

  function goPrev() {
    const currentIndex = STEPS.findIndex((step) => step.id === selectedStep)
    const prev = STEPS[currentIndex - 1]?.id
    if (prev) setSelectedStep(prev as StepId)
  }

  const onSubmit = (data: BeneficiarioCompleteFormData) => {
    if (STEPS.find((step) => step.id === selectedStep)?.isLast) {
      console.log(data)
    } else {
      goNext()
    }
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4 mx-auto w-full min-h-[calc(100vh-115px)]">
      <BackButton>Voltar para o início</BackButton>

      <div className="">
        <h1 className="text-3xl font-bold">Cadastro de Beneficiário</h1>
        <p className="text-muted-foreground leading-relaxed">
          Preencha seus dados para participar da Aquisição Assistida no Maranhão
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 h-full">
          <Tabs
            value={selectedStep}
            onValueChange={(value: string) => setSelectedStep(value as StepId)}
            className="gap-4"
          >
            <Card size="md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  {STEPS.find((step) => step.id === selectedStep)?.icon}
                  <CardTitle>Etapas</CardTitle>
                </div>
                <CardDescription>Progresso do cadastro</CardDescription>
              </CardHeader>
              <CardContent>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="pessoais">Pessoais</TabsTrigger>
                  <TabsTrigger value="contato">Contato</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="resumo">Revisão</TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="pessoais">
              <Card size="md">
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                  <CardDescription>
                    Informações básicas do beneficiário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder={PLACEHOLDERS.nome} {...field} />
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
                            <Input
                              placeholder={PLACEHOLDERS.cpf}
                              {...field}
                              ref={mergeRefs(field.ref, cpfInputRef)}
                              onChange={(e) => {
                                field.onChange(e)
                                trigger('cpf')
                              }}
                              onBlur={(e) => {
                                field.onBlur()
                                trigger('cpf')
                              }}
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
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder={PLACEHOLDERS.rg} {...field} />
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={PLACEHOLDERS.sexo} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sexoEnum.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {sexoLabels[opt]}
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={PLACEHOLDERS.identidadeGenero}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {identidadeGeneroEnum.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {identidadeGeneroLabels[opt]}
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={PLACEHOLDERS.raca} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {racaEnum.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {racaLabels[opt]}
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
                    <p className="text-sm font-medium leading-none mb-2">
                      Deficiências
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {deficienciaEnum.options.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-input"
                            checked={form
                              .getValues('deficiencias')
                              .includes(opt)}
                            onChange={(e) => {
                              const current = new Set(
                                form.getValues('deficiencias')
                              )
                              if (e.target.checked) current.add(opt)
                              else current.delete(opt)
                              const next = Array.from(current)
                              form.setValue('deficiencias', next as any, {
                                shouldValidate: true
                              })
                            }}
                          />
                          <span>{deficienciaLabels[opt]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contato">
              <Card size="md">
                <CardHeader>
                  <CardTitle>Contato e Renda</CardTitle>
                  <CardDescription>
                    Como falar com você e sua situação profissional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={PLACEHOLDERS.email}
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
                            <Input
                              placeholder={PLACEHOLDERS.profissao}
                              {...field}
                            />
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={PLACEHOLDERS.tipoRenda}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tipoRendaEnum.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {tipoRendaLabels[opt]}
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
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={PLACEHOLDERS.rendaFaixa}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rendaFamiliarFaixaEnum.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {rendaFamiliarFaixaLabels[opt]}
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
                            <Input
                              type="number"
                              min={1}
                              placeholder={
                                PLACEHOLDERS.pessoasFamilia.toString() || ''
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endereco">
              <Card size="md">
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Endereço</h3>
                    <p className="text-sm text-muted-foreground">
                      Onde você mora
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder={PLACEHOLDERS.cep} {...field} />
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
                            <Input
                              placeholder={PLACEHOLDERS.endereco}
                              {...field}
                            />
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
                            <Input
                              placeholder={PLACEHOLDERS.numero}
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
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={PLACEHOLDERS.numero}
                              {...field}
                            />
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
                            <Input
                              placeholder={PLACEHOLDERS.bairro}
                              {...field}
                            />
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
                            <Input
                              placeholder={PLACEHOLDERS.cidade}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resumo">
              <Card size="md">
                <CardContent className="space-y-2">
                  <h3 className="text-xl font-semibold">Revise seus dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Ao enviar, seu rascunho local será apagado.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={goPrev}
              disabled={selectedStep === 'pessoais'}
            >
              Voltar
            </Button>

            {STEPS.find((step) => step.id === selectedStep)?.isLast ? (
              <Button type="submit">Enviar cadastro</Button>
            ) : (
              <Button type="button" onClick={() => void goNext()}>
                Próximo
              </Button>
            )}
            <Button type="button" variant="ghost" asChild>
              <Link href="/">Cancelar</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
