'use client'

import Image from 'next/image'
import Link from 'next/link'

import { MobileNav } from '@/components/mobile-nav'
import { navLinks } from '@/components/header-nav-links'
import { Button, buttonVariants } from '@/components/ui/button'
import { useScroll } from '@/hooks/use-scroll'
import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'

export function Header({
  showLoginButton = true,
  actions,
  floatingScrollExpand: _floatingScrollExpand = false
}: {
  showLoginButton?: boolean
  actions?: ReactNode
  floatingScrollExpand?: boolean
}) {
  const { user } = useAuth()
  const scrolled = useScroll(10)

  const desktopCtas =
    actions != null ? (
      <div className="flex items-center gap-2">{actions}</div>
    ) : showLoginButton ? (
      <>
        <Button asChild size="sm" variant="outline">
          <Link href="/login">Acessar sistema</Link>
        </Button>
        <Button asChild size="sm" className="shadow-brand-md">
          <Link href="/ofertante/cadastro">Cadastro ofertante</Link>
        </Button>
      </>
    ) : null

  const mobileDrawerFooter =
    actions != null ? (
      <div className="flex flex-col gap-2">{actions}</div>
    ) : showLoginButton ? undefined : null

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto w-full drop-shadow-sm bg-background/99 md:rounded-md md:transition-all md:ease-out',
        {
          'border-border border-2 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl drop-shadow-lg':
            scrolled
        }
      )}
    >
      <nav
        className={cn(
          'flex h-20 w-full items-center justify-between gap-2 px-4 md:h-18 md:transition-all md:ease-out',
          {
            'md:px-2': scrolled
          }
        )}
      >
        <Link
          className="flex min-w-0 max-w-[min(100%,18rem)] shrink items-center gap-2 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50 sm:max-w-xs"
          href="/"
        >
          <span className="relative size-8 shrink-0">
            <Image
              src="/icon.png"
              alt=""
              fill
              className="object-contain object-left"
              sizes="48px"
              priority
            />
          </span>
          <span className="min-w-0 truncate text-left font-semibold leading-tight">
            Aquisição Assistida
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
          <div className="flex min-w-0 flex-wrap items-center justify-end">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {desktopCtas}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 md:hidden">
          {actions != null ? (
            <div className="flex max-w-[min(100%,14rem)] flex-wrap items-center justify-end gap-1">
              {actions}
            </div>
          ) : null}
          <MobileNav footer={mobileDrawerFooter ?? undefined} />
        </div>
      </nav>
    </header>
  )
}
