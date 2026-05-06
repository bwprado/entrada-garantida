import Link from 'next/link'
import { BeneficiariosAdminClient } from './beneficiarios-admin-client'
import { Button } from '@/components/ui/button'
import { adminPaths } from '@/lib/app-links'
import { ArrowLeft } from 'lucide-react'

export default function AdminBeneficiariosPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="container mx-auto max-w-7xl">
          <Button variant="ghost" size="sm" asChild className="-ms-2">
            <Link href={adminPaths.dashboard}>
              <ArrowLeft className="mr-2 size-4" />
              Painel
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-muted/30 px-4 py-8">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold tracking-tight">Beneficiários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista paginada, busca e ações administrativas.
          </p>
          <BeneficiariosAdminClient />
        </div>
      </div>
    </div>
  )
}
