'use client'

import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { navLinks } from '@/components/header-nav-links'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { LogInIcon, Menu, UserPlusIcon, X } from 'lucide-react'

type MobileNavProps = {
  /** Replaces default “Entrar / Cadastro” stack in the drawer footer */
  footer?: React.ReactNode
}

function ProgramBrandRow({
  compact,
  onNavigate
}: {
  compact?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      className="flex min-w-0 max-w-full items-center gap-2 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
      href="/"
      onClick={onNavigate}
    >
      <span className={cn('relative shrink-0', compact ? 'size-7' : 'size-8')}>
        <Image
          src="/icon.png"
          alt=""
          fill
          className="object-contain object-left"
          sizes="48px"
        />
      </span>
      <span
        className={cn(
          'min-w-0 truncate text-left font-semibold leading-tight',
          compact && 'text-sm'
        )}
      >
        Aquisição Assistida
      </span>
    </Link>
  )
}

export function MobileNav({ footer }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const close = () => setOpen(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="md:hidden"
            size="icon"
            variant="outline"
          >
            {open ? (
              <X className="size-[18px]" aria-hidden />
            ) : (
              <Menu className="size-[18px]" aria-hidden />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex h-full min-h-0 flex-col gap-0 p-0"
          id="mobile-menu"
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b px-4 pb-4 pt-4">
              <ProgramBrandRow onNavigate={close} />
            </div>

            <nav
              aria-label="Principal"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4"
            >
              <div className="grid gap-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Button
                      asChild
                      className="justify-start gap-2 px-2"
                      key={link.href}
                      variant="ghost"
                    >
                      <Link href={link.href} onClick={close}>
                        <Icon
                          className="size-5 shrink-0 opacity-80"
                          aria-hidden
                        />
                        {link.label}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </nav>

            <SheetFooter className="shrink-0 gap-4">
              <div className="flex justify-center">
                <Image
                  src="/secid-squared.png"
                  alt="Governo do Maranhão e SECID"
                  width={100}
                  height={100}
                  className="h-auto w-full max-w-[100px] object-contain"
                />
              </div>
              <div className="flex flex-col gap-2">
                {footer ?? (
                  <>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/login" onClick={close}>
                        <LogInIcon className="size-4 shrink-0" aria-hidden />
                        Acessar sistema
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/ofertante/cadastro" onClick={close}>
                        <UserPlusIcon className="size-4 shrink-0" aria-hidden />
                        Cadastro ofertante
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
