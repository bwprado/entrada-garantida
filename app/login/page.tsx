import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o início
            </Link>
          </Button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Acessar Sistema</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar o portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail ou CPF</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="seu@email.com ou 000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/recuperar-senha"
                    className="text-primary hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t space-y-3">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Ainda não tem cadastro?
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/beneficiario/cadastro">Sou Beneficiário</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/construtor/cadastro">Sou Construtor</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
