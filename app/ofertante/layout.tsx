"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useConvexAuth } from "convex/react"

import { Header } from "@/components/header"
import { OfertanteHeaderActions } from "@/components/ofertante-header-actions"

type Props = { children: ReactNode }

/**
 * When authenticated, ConditionalHeader renders children only (no global Header).
 * We inject the program Header here for ofertante routes except the public
 * construtor registration at /ofertante/cadastro.
 */
export default function OfertanteLayout({ children }: Props) {
  const pathname = usePathname()
  const { isAuthenticated } = useConvexAuth()

  if (pathname === "/ofertante/cadastro") {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <>
      <Header showLoginButton={false} actions={<OfertanteHeaderActions />} />
      {children}
    </>
  )
}
