import Link from 'next/link'
import { ImoveisListClient } from './imoveis-list-client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AdminImoveisPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="-ms-2 mb-2">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Painel
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Imóveis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Listagem de todos os cadastros, com filtro por status e busca.
          </p>
        </div>
      </div>
      <div className="flex-1 bg-muted/30 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <ImoveisListClient />
        </div>
      </div>
    </div>
  )
}
