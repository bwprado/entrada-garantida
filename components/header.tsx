import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function Header({
  showLoginButton = true
}: {
  showLoginButton?: boolean
}) {
  return (
    <header className="border-b sticky top-0 z-50 drop-shadow-md h-20 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="aspect-square size-14 relative">
            <Image
              src="/icon.png"
              alt="Programa Aquisição Assistida"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight text-program-blue-dark">
              Programa Aquisição Assistida
            </h1>
            <p className="text-xs text-muted-foreground">
              Governo do Estado do Maranhão
            </p>
          </div>
        </Link>

        {showLoginButton && (
          <Button
            asChild
            className="bg-program-green-primary hover:bg-program-green-hover text-white"
          >
            <Link href="/login">Acessar Sistema</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
