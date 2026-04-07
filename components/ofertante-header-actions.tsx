"use client"

import Link from "next/link"
import { Home, LogOut, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function OfertanteHeaderActions() {
  const { logout } = useAuth()

  return (
    <>
      <Button variant="outline" size="sm" asChild>
        <Link href="/imoveis">
          <Home className="mr-2 size-4" />
          Ver Imóveis
        </Link>
      </Button>
      <Button size="sm" asChild className="bg-program-green-primary text-white hover:bg-program-green-hover">
        <Link href="/ofertante/imoveis/cadastro">
          <Plus className="mr-2 size-4" />
          Cadastrar Imóvel
        </Link>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => void logout()}>
        <LogOut className="mr-2 size-4" />
        Sair
      </Button>
    </>
  )
}
