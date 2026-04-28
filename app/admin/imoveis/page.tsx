import Link from 'next/link'
import { ImoveisListClient } from './imoveis-list-client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AdminImoveisPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="-ms-2">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Painel
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-muted/30 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold tracking-tight">Imóveis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listagem de todos os cadastros, com filtro por status e busca.
          </p>
          <div className="mt-6">
          <ImoveisListClient />
          </div>
        </div>
      </div>
    </div>
  )
}
