"use client"

import { Control } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useMaskito } from "@maskito/react"
import { rgMaskOptions } from "@/lib/masks"

const sexoOptions = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao_informado", label: "Prefiro não informar" },
]

const racaOptions = [
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
  { value: "nao_informado", label: "Prefiro não informar" },
]

const identidadeGeneroOptions = [
  { value: "cisgenero", label: "Cisgênero" },
  { value: "transgenero", label: "Transgênero" },
  { value: "nao_binario", label: "Não-binário" },
  { value: "outro", label: "Outro" },
  { value: "nao_informado", label: "Prefiro não informar" },
]

const deficienciaOptions = [
  { value: "auditiva", label: "Auditiva" },
  { value: "intelectual", label: "Intelectual" },
  { value: "visual", label: "Visual" },
  { value: "multipla", label: "Múltipla" },
  { value: "psicossocial", label: "Psicossocial" },
  { value: "fisica", label: "Física" },
]

const tipoRendaOptions = [
  { value: "clt", label: "CLT" },
  { value: "autonomo", label: "Autônomo" },
  { value: "servidor_publico", label: "Servidor Público" },
  { value: "aposentado", label: "Aposentado" },
  { value: "bpc", label: "BPC" },
  { value: "outros", label: "Outros" },
  { value: "nao_informado", label: "Prefiro não informar" },
]

const rendaFaixaOptions = [
  { value: "ate_2", label: "Até 2 salários mínimos" },
  { value: "2_4", label: "2 a 4 salários mínimos" },
  { value: "4_6", label: "4 a 6 salários mínimos" },
  { value: "6_8", label: "6 a 8 salários mínimos" },
  { value: "acima_8", label: "Acima de 8 salários mínimos" },
]

interface BeneficiaryFieldsProps {
  control: Control<any>
  isAdmin?: boolean
}

export function BeneficiaryFields({ control, isAdmin = false }: BeneficiaryFieldsProps) {
  const rgRef = useMaskito({ options: rgMaskOptions })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Dados Pessoais do Beneficiário</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RG */}
        <FormField
          control={control}
          name="rg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl>
                <Input {...field} ref={rgRef} disabled={!isAdmin} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome Responsável Familiar */}
        <FormField
          control={control}
          name="nomeResponsavelFamiliar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável Familiar (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome Mãe */}
        <FormField
          control={control}
          name="nomeMae"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Mãe (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome Pai */}
        <FormField
          control={control}
          name="nomePai"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Pai (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sexo */}
        <FormField
          control={control}
          name="sexo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sexoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Identidade de Gênero */}
        <FormField
          control={control}
          name="identidadeGenero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identidade de Gênero</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {identidadeGeneroOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Raça/Cor */}
        <FormField
          control={control}
          name="raca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raça/Cor</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {racaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Deficiências - Multi-select with checkboxes */}
        <FormField
          control={control}
          name="deficiencias"
          render={() => (
            <FormItem>
              <FormLabel>Deficiências (opcional)</FormLabel>
              <div className="space-y-2">
                <FormField
                  control={control}
                  name="deficiencias"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes("nao_possui")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(["nao_possui"])
                            } else {
                              field.onChange([])
                            }
                          }}
                          disabled={!isAdmin}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Não possui deficiência</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {deficienciaOptions.map((option) => (
                    <FormField
                      key={option.value}
                      control={control}
                      name="deficiencias"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                const hasNaoPossui = current.includes("nao_possui")
                                
                                if (hasNaoPossui && checked) {
                                  // Remove "nao_possui" and add the disability
                                  field.onChange([option.value])
                                } else if (checked) {
                                  field.onChange([...current, option.value])
                                } else {
                                  field.onChange(current.filter((v: string) => v !== option.value))
                                }
                              }}
                              disabled={!isAdmin || field.value?.includes("nao_possui")}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {option.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-semibold pt-4">Dados Profissionais e Financeiros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profissão */}
        <FormField
          control={control}
          name="profissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <FormControl>
                <Input {...field} disabled={!isAdmin} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Empregador */}
        <FormField
          control={control}
          name="empregador"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empregador (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ramo de Atividade */}
        <FormField
          control={control}
          name="ramoAtividade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ramo de Atividade (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Renda */}
        <FormField
          control={control}
          name="tipoRenda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Renda</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tipoRendaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Renda Familiar */}
        <FormField
          control={control}
          name="rendaFamiliarFaixa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faixa de Renda Familiar</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!isAdmin}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rendaFaixaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pessoas na Família */}
        <FormField
          control={control}
          name="pessoasFamilia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Pessoas na Família</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  disabled={!isAdmin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meses no Aluguel Social - Admin only */}
        <FormField
          control={control}
          name="mesesAluguelSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meses no Programa Aluguel Social</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  disabled={!isAdmin}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-semibold pt-4">Composição Familiar</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Possui Idoso */}
        <FormField
          control={control}
          name="possuiIdosoFamilia"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isAdmin}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Possui idoso na família</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Chefia Feminina */}
        <FormField
          control={control}
          name="chefiaFeminina"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!isAdmin}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Chefe de família é mulher</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-semibold pt-4">Contato Adicional</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telefone Fixo */}
        <FormField
          control={control}
          name="telefoneFixo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone Fixo (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="(00) 0000-0000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telefone de Recado */}
        <FormField
          control={control}
          name="telefoneRecado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone de Recado (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="(00) 00000-0000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Falar Com */}
        <FormField
          control={control}
          name="falarCom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Falar com (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="Nome do contato" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Aceita Comunicações */}
        <FormField
          control={control}
          name="aceitaComunicacoes"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Aceito receber comunicações sobre a Aquisição Assistida
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
