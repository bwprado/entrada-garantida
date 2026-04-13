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
      <div className="flex flex-wrap items-center justify-end gap-2">
        {actions}
      </div>
    ) : showLoginButton ? (
      <Button asChild className="shadow-brand-md">
        <Link href="/login">Acessar Sistema</Link>
      </Button>
    ) : null

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 max-w-7xl py-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="relative shrink-0 size-12 aspect-square">
            <Image
              src="/icon.png"
              alt="Icone do Aquisição Assistida"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight text-foreground tracking-tight">
              Aquisição Assistida
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
