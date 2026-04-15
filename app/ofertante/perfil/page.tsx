"use client"

import { AddressFields, CommonFields, OfertanteFields, ProfileLayout } from "@/components/profile"
import { Form } from "@/components/ui/form"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/lib/auth-context"
import { parseDataNascimentoBrParaIso } from "@/lib/date-br"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const perfilOfertanteSchema = z.object({
  // Common fields
  nome: z.string().min(3, "Nome completo é obrigatório"),
  nomeSocial: z.string().optional(),
  cpf: z.string().min(14, "CPF inválido"),
  telefone: z.string().min(14, "Celular inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),

  // Ofertante fields
  rg: z.string().min(3, "RG é obrigatório"),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine(
      (v) => parseDataNascimentoBrParaIso(v) !== null,
      "Use uma data válida (DD-MM-AAAA)"
    ),
  estadoCivil: z.enum([
    "solteiro",
    "casado",
    "divorciado",
    "viuvo",
    "uniao_estavel",
    "separado",
  ]),
  profissao: z.string().min(2, "Profissão é obrigatória"),

  // Address
  cep: z.string().min(9, "CEP inválido"),
  endereco: z.string().min(3, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().length(2, "UF inválida"),
})

type PerfilOfertanteFormData = z.infer<typeof perfilOfertanteSchema>

export default function OfertantePerfilPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  
  const userWithProfile = useQuery(api.users.getCurrentUserWithProfile)
  const updateProfile = useMutation(api.users.updateOfertanteProfile)
  const updateBasicInfo = useMutation(api.users.updateUserBasicInfo)

  const form = useForm<PerfilOfertanteFormData>({
    resolver: zodResolver(perfilOfertanteSchema),
    defaultValues: {
      nome: "",
      nomeSocial: "",
      cpf: "",
      telefone: "",
      email: "",
      rg: "",
      dataNascimento: "",
      estadoCivil: "solteiro",
      profissao: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (userWithProfile?.user && userWithProfile?.profile) {
      const { user, profile } = userWithProfile
      
      form.reset({
        nome: user.nome,
        nomeSocial: user.nomeSocial || "",
        cpf: user.cpf,
        telefone: user.phone,
        email: user.email || "",
        rg: profile.rg,
        dataNascimento: profile.dataNascimento,
        estadoCivil: profile.estadoCivil,
        profissao: profile.profissao,
        cep: profile.cep,
        endereco: profile.endereco,
        numero: profile.numero,
        complemento: profile.complemento || "",
        bairro: profile.bairro,
        cidade: profile.cidade,
        estado: profile.estado,
      })
    }
  }, [userWithProfile, form])

  // Redirect if not authenticated or not ofertante
  useEffect(() => {
    if (!isAuthLoading && user && user.role !== "ofertante") {
      router.push("/login")
    }
  }, [user, isAuthLoading, router])

  const onSubmit = async (data: PerfilOfertanteFormData) => {
    try {
      if (!user?._id) {
        toast.error("Usuário não encontrado")
        return
      }

      // Update profile data
      await updateProfile({
        userId: user._id,
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        email: data.email || undefined,
        rg: data.rg,
        dataNascimento: data.dataNascimento,
        estadoCivil: data.estadoCivil,
        profissao: data.profissao,
      })

      // Update basic info (only nomeSocial can be updated by user)
      if (data.nomeSocial !== userWithProfile?.user.nomeSocial) {
        await updateBasicInfo({
          userId: user._id,
          nomeSocial: data.nomeSocial || undefined,
        })
      }

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

  if (!user || user.role !== "ofertante") {
    return null
  }

  return (
    <Form {...form}>
      <ProfileLayout
        title="Meu Perfil"
        description="Atualize suas informações pessoais e de contato"
        onSubmit={form.handleSubmit(onSubmit)}
        isLoading={form.formState.isSubmitting}
        backHref="/ofertante/dashboard"
        backLabel="Voltar ao Dashboard"
      >
        <div className="space-y-8">
          <CommonFields control={form.control} />
          
          <div className="border-t pt-6" />
          
          <OfertanteFields control={form.control} />
          
          <div className="border-t pt-6" />
          
          <AddressFields control={form.control} />
        </div>
      </ProfileLayout>
    </Form>
  )
}
