'use client'

import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { Home } from 'lucide-react'

export function OfertanteHeaderActions() {
  return (
    <>
      <Link
        href="/imoveis"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        <Home className="size-4" />
        Ver Imóveis
      </Link>
    </>
  )
}
