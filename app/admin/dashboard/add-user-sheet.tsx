'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cpf as cpfValidator } from 'cpf-cnpj-validator'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAddressByCEP } from '@/lib/validation'
import { normalizePhone } from '@/lib/normalize-phone'

// Form schema for adding users
const userFormSchema = z
  .object({
    userType: z.enum(['beneficiary', 'ofertante']),
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    telefone: z
      .string()
      .regex(
        /^\(\d{2}\)\s\d{5}-\d{4}$/,
        'Telefone deve estar no formato (99) 99999-9999'
      ),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    // Beneficiary specific fields
    cpf: z.string().optional(),
    rg: z.string().optional(),
    sexo: z.enum(['feminino', 'masculino', 'nao_informado']).optional(),
    raca: z
      .enum([
        'branca',
        'preta',
        'parda',
        'amarela',
        'indigena',
        'nao_informado'
      ])
      .optional(),
    profissao: z.string().optional(),
    tipoRenda: z
      .enum([
        'clt',
        'autonomo',
        'servidor_publico',
        'aposentado',
        'bpc',
        'outros',
        'nao_informado'
      ])
      .optional(),
    rendaFamiliarFaixa: z
      .enum(['ate_2', '2_4', '4_6', '6_8', 'acima_8'])
      .optional(),
    pessoasFamilia: z.number().min(1).optional(),
    // Address fields
    cep: z.string().optional(),
    endereco: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().length(2).optional(),
    complemento: z.string().optional(),
    nomeMae: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        if (!data.cpf) return false
        return cpfValidator.isValid(data.cpf)
      }
      return true
    },
    {
      message: 'CPF inválido',
      path: ['cpf']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.rg && data.rg.length >= 5
      }
      return true
    },
    {
      message: 'RG é obrigatório',
      path: ['rg']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.sexo
      }
      return true
    },
    {
      message: 'Sexo é obrigatório',
      path: ['sexo']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.profissao && data.profissao.length >= 2
      }
      return true
    },
    {
      message: 'Profissão é obrigatória',
      path: ['profissao']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.tipoRenda
      }
      return true
    },
    {
      message: 'Tipo de renda é obrigatório',
      path: ['tipoRenda']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.rendaFamiliarFaixa
      }
      return true
    },
    {
      message: 'Faixa de renda é obrigatória',
      path: ['rendaFamiliarFaixa']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.pessoasFamilia && data.pessoasFamilia >= 1
      }
      return true
    },
    {
      message: 'Número de pessoas na família é obrigatório',
      path: ['pessoasFamilia']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        const cepClean = data.cep?.replace(/\D/g, '')
        return !!cepClean && cepClean.length === 8
      }
      return true
    },
    {
      message: 'CEP deve ter 8 dígitos',
      path: ['cep']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.endereco && data.endereco.length >= 3
      }
      return true
    },
    {
      message: 'Endereço é obrigatório',
      path: ['endereco']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.numero
      }
      return true
    },
    {
      message: 'Número é obrigatório',
      path: ['numero']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.bairro
      }
      return true
    },
    {
      message: 'Bairro é obrigatório',
      path: ['bairro']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.cidade
      }
      return true
    },
    {
      message: 'Cidade é obrigatória',
      path: ['cidade']
    }
  )
  .refine(
    (data) => {
      if (data.userType === 'beneficiary') {
        return !!data.estado && data.estado.length === 2
      }
      return true
    },
    {
      message: 'Estado é obrigatório (2 letras)',
      path: ['estado']
    }
  )

type UserFormValues = z.infer<typeof userFormSchema>

interface AddUserSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddUserSheet({
  open,
  onOpenChange,
  onSuccess
}: AddUserSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingCEP, setIsFetchingCEP] = useState(false)
  const createBeneficiary = useMutation(api.users.createBeneficiary)
  const createOfertante = useMutation(api.users.createOfertanteMinimal)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userType: 'beneficiary',
      nome: '',
      telefone: '',
      email: '',
      cpf: '',
      rg: '',
      sexo: undefined,
      raca: 'nao_informado',
      profissao: '',
      tipoRenda: undefined,
      rendaFamiliarFaixa: undefined,
      pessoasFamilia: 1,
      cep: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: '',
      nomeMae: ''
    }
  })

  const userType = form.watch('userType')
  const cep = form.watch('cep')

  // CEP auto-completion
  useEffect(() => {
    const fetchCEP = async () => {
      const cepClean = cep?.replace(/\D/g, '')
      if (cepClean?.length === 8) {
        setIsFetchingCEP(true)
        try {
          const address = await fetchAddressByCEP(cepClean)
          if (address) {
            form.setValue('endereco', address.logradouro)
            form.setValue('bairro', address.bairro)
            form.setValue('cidade', address.cidade)
            form.setValue('estado', address.estado)
          }
        } finally {
          setIsFetchingCEP(false)
        }
      }
    }
    fetchCEP()
  }, [cep, form])

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      form.reset({
        userType: 'beneficiary',
        nome: '',
        telefone: '',
        email: '',
        cpf: '',
        rg: '',
        sexo: undefined,
        raca: 'nao_informado',
        profissao: '',
        tipoRenda: undefined,
        rendaFamiliarFaixa: undefined,
        pessoasFamilia: 1,
        cep: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: '',
        nomeMae: ''
      })
    }
  }, [open, form])

  // Phone mask handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
      } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`
      } else if (value.length > 0) {
        value = `(${value}`
      }
      form.setValue('telefone', value)
    }
  }

  // CPF mask handler
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      if (value.length > 9) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}.${value.slice(3)}`
      }
      form.setValue('cpf', value)
    }
  }

  // CEP mask handler
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 8) {
      if (value.length > 5) {
        value = `${value.slice(0, 5)}-${value.slice(5, 8)}`
      }
      form.setValue('cep', value)
    }
  }

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    try {
      if (values.userType === 'beneficiary') {
        const result = await createBeneficiary({
          nome: values.nome,
          cpf: values.cpf!,
          telefone: normalizePhone(values.telefone).save(),
          email: values.email || undefined,
          rg: values.rg!,
          sexo: values.sexo!,
          raca: values.raca,
          profissao: values.profissao!,
          tipoRenda: values.tipoRenda!,
          rendaFamiliarFaixa: values.rendaFamiliarFaixa!,
          pessoasFamilia: values.pessoasFamilia!,
          cep: values.cep!,
          endereco: values.endereco!,
          numero: values.numero!,
          bairro: values.bairro!,
          cidade: values.cidade!,
          estado: values.estado!,
          complemento: values.complemento,
          nomeMae: values.nomeMae
        })

        if (result.success) {
          toast.success('Beneficiário criado com sucesso!')
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || 'Erro ao criar beneficiário')
        }
      } else {
        const result = await createOfertante({
          nome: values.nome,
          telefone: normalizePhone(values.telefone).save()
        })

        if (result.success) {
          toast.success('Ofertante criado com sucesso!')
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || 'Erro ao criar ofertante')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto px-4"
      >
        <SheetHeader className="space-y-2">
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Adicionar Usuário
          </SheetTitle>
          <SheetDescription>
            Preencha os dados para criar um novo usuário no sistema.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            {/* User Type Selection */}
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Usuário *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beneficiary" id="beneficiary" />
                        <Label htmlFor="beneficiary" className="font-normal">
                          Beneficiário
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ofertante" id="ofertante" />
                        <Label htmlFor="ofertante" className="font-normal">
                          Ofertante (irá para onboarding)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Dados Básicos
              </h3>

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Celular *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(98) 99999-9999"
                        {...field}
                        onChange={handlePhoneChange}
                        maxLength={15}
                      />
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
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Beneficiary Specific Fields */}
            {userType === 'beneficiary' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Documentos
                  </h3>

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="999.999.999-99"
                            {...field}
                            onChange={handleCPFChange}
                            maxLength={14}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RG *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o RG" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nomeMae"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Mãe (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome da mãe"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Dados Pessoais
                  </h3>

                  <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="nao_informado">
                              Não Informado
                            </SelectItem>
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
                        <FormLabel>Raça/Cor (opcional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a raça/cor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="branca">Branca</SelectItem>
                            <SelectItem value="preta">Preta</SelectItem>
                            <SelectItem value="parda">Parda</SelectItem>
                            <SelectItem value="amarela">Amarela</SelectItem>
                            <SelectItem value="indigena">Indígena</SelectItem>
                            <SelectItem value="nao_informado">
                              Não Informado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profissao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profissão *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite a profissão" {...field} />
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
                        <FormLabel>Tipo de Renda *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de renda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="clt">CLT</SelectItem>
                            <SelectItem value="autonomo">Autônomo</SelectItem>
                            <SelectItem value="servidor_publico">
                              Servidor Público
                            </SelectItem>
                            <SelectItem value="aposentado">
                              Aposentado
                            </SelectItem>
                            <SelectItem value="bpc">BPC</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                            <SelectItem value="nao_informado">
                              Não Informado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rendaFamiliarFaixa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faixa de Renda Familiar *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a faixa de renda" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ate_2">
                              Até 2 salários
                            </SelectItem>
                            <SelectItem value="2_4">2 a 4 salários</SelectItem>
                            <SelectItem value="4_6">4 a 6 salários</SelectItem>
                            <SelectItem value="6_8">6 a 8 salários</SelectItem>
                            <SelectItem value="acima_8">
                              Acima de 8 salários
                            </SelectItem>
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
                        <FormLabel>Pessoas na Família *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Número de pessoas"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Endereço
                  </h3>

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="99999-999"
                              {...field}
                              onChange={handleCEPChange}
                              maxLength={9}
                            />
                            {isFetchingCEP && (
                              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
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
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Cidade *</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MA"
                              maxLength={2}
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.toUpperCase().slice(0, 2)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {userType === 'beneficiary'
                      ? 'Criar Beneficiário'
                      : 'Criar Ofertante'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
