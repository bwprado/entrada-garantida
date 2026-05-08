'use client'

import Link from 'next/link'
import { useState } from 'react'

import { AccountMenuPanel } from '@/components/account/account-menu-panel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { useAuth } from '@/lib/auth-context'
import { getHeaderQuickActionLinks } from '@/lib/app-links'
import { getInitials } from '@/lib/user-display'

export function AuthenticatedHeaderActions() {
  const { user, logout, isLoading } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const closeSheet = () => setSheetOpen(false)

  const initials = getInitials(user?.nome ?? user?.phone ?? 'AA')
  const quickLinks = getHeaderQuickActionLinks(user?.role)

  const avatarInner = (
    <>
      {user?.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </>
  )

  return (
    <div className="flex items-center gap-2">
      {quickLinks.length > 0 ? (
        <div className="hidden max-w-full flex-wrap items-center justify-end gap-1.5 md:flex sm:gap-2">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href + label}
              href={href}
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'shrink-0 gap-1.5 max-sm:px-2'
              })}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="hidden md:block">
        <HoverCard openDelay={120} closeDelay={80}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar>{avatarInner}</Avatar>
            </button>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-[min(100vw-2rem,20rem)] p-0"
            side="bottom"
            align="end"
          >
            <div className="p-4">
              <AccountMenuPanel
                user={user}
                isLoading={isLoading}
                onLogout={logout}
              />
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full"
              aria-label="Abrir menu da conta"
            >
              <Avatar className="size-8">{avatarInner}</Avatar>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-[min(100vw-1rem,22rem)] flex-col gap-0 overflow-y-auto p-0 sm:max-w-md"
            showCloseButton
          >
            <SheetTitle className="sr-only">Conta e atalhos</SheetTitle>
            <div className="flex flex-1 flex-col p-4 pb-6">
              <AccountMenuPanel
                user={user}
                isLoading={isLoading}
                onLogout={() => {
                  closeSheet()
                  void logout()
                }}
                onNavigate={closeSheet}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
