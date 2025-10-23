import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

interface HeaderProps {
  showLoginButton?: boolean
}

export function Header({ showLoginButton = true }: HeaderProps) {
  return (
    <header className="border-b sticky top-0 z-50 drop-shadow-md h-20 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 bg-program-green-primary rounded-lg flex items-center justify-center">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-program-blue-dark">
              Programa Entrada Garantida
            </h1>
            <p className="text-xs text-muted-foreground">
              Governo do Estado do Maranhão
            </p>
          </div>
        </Link>

        {showLoginButton && (
          <Button
            asChild
            className="bg-program-green-primary hover:bg-program-green-hover text-white">
            <Link href="/login">Acessar Sistema</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
