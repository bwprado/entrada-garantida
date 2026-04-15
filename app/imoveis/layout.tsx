import { Header } from '@/components/header'
import { ImoveisHeaderActions } from '@/components/imoveis-header-actions'
import { getServerCurrentUser } from '@/lib/server-auth'

export default async function ImoveisLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getServerCurrentUser()

  return (
    <div className="min-h-screen flex flex-col gap-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {user ? (
        <Header showLoginButton={false} actions={<ImoveisHeaderActions />} />
      ) : (
        <Header />
      )}
      <div className="grid h-full">{children}</div>
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Aquisição Assistida - Governo do Estado do Maranhão. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
