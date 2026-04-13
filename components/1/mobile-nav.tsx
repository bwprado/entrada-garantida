'use client'

import { navLinks } from '@/components/header-nav-links'
import { Button } from '@/components/ui/button'
import { Portal, PortalBackdrop } from '@/components/ui/portal'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

type MobileNavProps = {
  /** Replaces default “Entrar / Cadastro” stack in the drawer footer */
  footer?: React.ReactNode
}

export function MobileNav({ footer }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Abrir menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <X className="size-[18px]" aria-hidden />
        ) : (
          <Menu className="size-[18px]" aria-hidden />
        )}
      </Button>
      {open ? (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              'data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in',
              'size-full p-4'
            )}
            data-slot={open ? 'open' : 'closed'}
          >
            <div className="grid gap-y-2">
              {navLinks.map((link) => (
                <Button
                  asChild
                  className="justify-start"
                  key={link.label}
                  variant="ghost"
                >
                  <Link href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-2">
              {footer ?? (
                <>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      Acessar sistema
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/ofertante/cadastro" onClick={() => setOpen(false)}>
                      Cadastro ofertante
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </Portal>
      ) : null}
    </div>
  )
}
