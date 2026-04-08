"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Form } from "@/components/ui/form"
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
import { ProfileLayout, CommonFields } from "@/components/profile"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useMaskito } from "@maskito/react"
import { phoneMaskOptions } from "@/lib/masks"

const adminNivelAcessoOptions = [
  { value: "super", label: "Super Administrador" },
  { value: "moderador", label: "Moderador" },
  { value: "leitor", label: "Leitor" },
]

const perfilAdminSchema = z.object({
  // Common fields
  nome: z.string().min(3, "Nome completo é obrigatório"),
  nomeSocial: z.string().optional(),
  cpf: z.string().min(14, "CPF inválido"),
  telefone: z.string().min(14, "Celular inválido"),
  email: z.string().email("E-mail inválido"),

  // Admin fields
  nivelAcesso: z.enum(["super", "moderador", "leitor"]),
  departamento: z.string().optional(),
  cargo: z.string().optional(),
})

type PerfilAdminFormData = z.infer<typeof perfilAdminSchema>

export default function AdminPerfilPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  
  const userWithProfile = useQuery(api.users.getCurrentUserWithProfile)
  const updateProfile = useMutation(api.users.updateAdminProfile)
  const updateBasicInfo = useMutation(api.users.updateUserBasicInfo)

  const phoneRef = useMaskito({ options: phoneMaskOptions })

  const form = useForm<PerfilAdminFormData>({
    resolver: zodResolver(perfilAdminSchema),
    defaultValues: {
      nome: "",
      nomeSocial: "",
      cpf: "",
      telefone: "",
      email: "",
      nivelAcesso: "leitor",
      departamento: "",
      cargo: "",
    },
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (userWithProfile?.user) {
      const { user, profile } = userWithProfile
      
      form.reset({
        nome: user.nome,
        nomeSocial: user.nomeSocial || "",
        cpf: user.cpf,
        telefone: user.telefone,
        email: user.email || "",
        nivelAcesso: profile?.nivelAcesso || "leitor",
        departamento: profile?.departamento || "",
        cargo: profile?.cargo || "",
      })
    }
  }, [userWithProfile, form])

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthLoading && user && user.role !== "admin") {
      router.push("/login")
    }
  }, [user, isAuthLoading, router])

  const onSubmit = async (data: PerfilAdminFormData) => {
    try {
      if (!user?._id) {
        toast.error("Usuário não encontrado")
        return
      }

      // Update profile data
      await updateProfile({
        userId: user._id,
        email: data.email,
        nivelAcesso: data.nivelAcesso,
        departamento: data.departamento,
        cargo: data.cargo,
      })

      // Update basic info
      await updateBasicInfo({
        userId: user._id,
        nomeSocial: data.nomeSocial || undefined,
      })

      toast.success("Perfil atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast.error("Erro ao atualizar perfil. Tente novamente.")
    }
  }

  if (isAuthLoading || !userWithProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <Form {...form}>
      <ProfileLayout
        title="Meu Perfil"
        description="Atualize suas informações de administrador"
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={form.formState.isSubmitting}
        backHref="/admin/dashboard"
        backLabel="Voltar ao Dashboard"
      >
        <div className="space-y-8">
          <CommonFields control={form.control} />
          
          <div className="border-t pt-6" />

          <h3 className="text-lg font-semibold">Informações Administrativas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nível de Acesso */}
            <FormField
              control={form.control}
              name="nivelAcesso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Acesso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adminNivelAcessoOptions.map((option) => (
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

            {/* Departamento */}
            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cargo */}
            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </ProfileLayout>
    </Form>
  )
}
