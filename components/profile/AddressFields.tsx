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
import { mergeRefs } from "@/lib/utils"
import { useMaskito } from "@maskito/react"
import { cepMaskOptions } from "@/lib/masks"

interface AddressFieldsProps {
  control: Control<any>
  prefix?: string
}

export function AddressFields({ control, prefix = "" }: AddressFieldsProps) {
  const cepRef = useMaskito({ options: cepMaskOptions })

  const fieldName = (name: string) => (prefix ? `${prefix}.${name}` : name)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Endereço</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CEP */}
        <FormField
          control={control}
          name={fieldName("cep")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  ref={mergeRefs(field.ref, cepRef)}
                  placeholder="00000-000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={control}
          name={fieldName("estado")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input {...field} maxLength={2} placeholder="UF" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cidade */}
        <FormField
          control={control}
          name={fieldName("cidade")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Endereço */}
        <FormField
          control={control}
          name={fieldName("endereco")}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Logradouro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Número */}
        <FormField
          control={control}
          name={fieldName("numero")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bairro */}
        <FormField
          control={control}
          name={fieldName("bairro")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Complemento */}
        <FormField
          control={control}
          name={fieldName("complemento")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
