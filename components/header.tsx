'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function Header({
  showLoginButton = true,
  actions
}: {
  showLoginButton?: boolean
  actions?: ReactNode
}) {
  const right =
    actions != null ? (
      <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>
    ) : showLoginButton ? (
      <Button
        asChild
        className="bg-program-green-primary hover:bg-program-green-hover text-white"
      >
        <Link href="/login">Acessar Sistema</Link>
      </Button>
    ) : null

  return (
    <header className="border-b sticky top-0 z-50 drop-shadow-md min-h-20 bg-white">
      <div className="container mx-auto flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="relative aspect-square size-14 shrink-0">
            <Image
              src="/icon.png"
              alt="Programa Aquisição Assistida"
              fill
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight text-program-blue-dark">
              Programa Aquisição Assistida
            </h1>
            <p className="text-xs text-muted-foreground">
              Governo do Estado do Maranhão
            </p>
          </div>
        </Link>

        {right}
      </div>
    </header>
  )
}
