'use client'

import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { getOfertanteActionLinks } from '@/lib/app-links'

const links = getOfertanteActionLinks()

export function OfertanteHeaderActions() {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      {links.map(({ href, label, icon: Icon }) => (
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
  )
}
