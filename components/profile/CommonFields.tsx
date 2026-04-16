"use client"

import type { Control } from "react-hook-form"
import { useId } from "react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mergeRefs } from "@/lib/utils"
import { useMaskito } from "@maskito/react"
import { cpfMaskOptions, phoneMaskOptions } from "@/lib/masks"

interface CommonFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared across forms with different shapes
  control: Control<any>
  isAdmin?: boolean
  /** When set, CPF and celular are read-only display (not form fields). */
  identifiersDisplay?: { cpf: string; phone: string }
}

export function CommonFields({
  control,
  isAdmin = false,
  identifiersDisplay,
}: CommonFieldsProps) {
  const cpfDisplayId = useId()
  const phoneDisplayId = useId()
  const cpfRef = useMaskito({ options: cpfMaskOptions })
  const phoneRef = useMaskito({ options: phoneMaskOptions })

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informações Básicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={Boolean(identifiersDisplay) || !isAdmin}
                  readOnly={Boolean(identifiersDisplay)}
                  className={
                    identifiersDisplay ? 'bg-muted' : undefined
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nome Social */}
        <FormField
          control={control}
          name="nomeSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Social (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {identifiersDisplay ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor={cpfDisplayId}>CPF</Label>
              <Input
                id={cpfDisplayId}
                value={identifiersDisplay.cpf}
                disabled
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={phoneDisplayId}>Celular</Label>
              <Input
                id={phoneDisplayId}
                value={identifiersDisplay.phone}
                disabled
                readOnly
                className="bg-muted"
              />
            </div>
          </>
        ) : (
          <>
            <FormField
              control={control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={mergeRefs(field.ref, cpfRef)}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={mergeRefs(field.ref, phoneRef)}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Email */}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} type="email" value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
