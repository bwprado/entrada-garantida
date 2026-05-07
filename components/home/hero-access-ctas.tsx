'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { ArrowRight, Building2 } from 'lucide-react'

export function HeroAccessCtas() {
  const availability = useQuery(api.users.getLoginAvailability, {})
  const beneficiaryEnabled = availability?.beneficiaryLoginEnabled ?? false

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        asChild={beneficiaryEnabled}
        disabled={!beneficiaryEnabled}
        className="text-base shadow-brand-xl"
      >
        {beneficiaryEnabled ? (
          <Link href="/login/beneficiario">
            Entrar como beneficiário
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        ) : (
          <span>Beneficiário indisponível no momento</span>
        )}
      </Button>

      <Button
        size="lg"
        asChild
        className="text-base bg-white/95 hover:bg-white border-white text-secondary shadow-xl"
      >
        <Link href="/login/ofertante">
          <Building2 className="w-5 h-5 mr-2" />
          Vender imóvel
        </Link>
      </Button>
    </div>
  )
}
