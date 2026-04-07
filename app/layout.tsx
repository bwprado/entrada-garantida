import './globals.css'

import { ConditionalHeader } from '@/components/conditional-header'
import { ConvexClientProvider } from '@/lib/convex-provider'
import { Analytics } from '@vercel/analytics/next'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'

import type { Metadata } from 'next'
import type React from 'react'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aquisição Assistida - Governo do Maranhão - SEMAG',
  description:
    'Programa estadual de subsídio para aquisição de imóveis - Governo do Estado do Maranhão - SEMAG',
  generator: 'Aquisição Assistida',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const content = (
    <ConvexClientProvider>
      <ConditionalHeader>{children}</ConditionalHeader>
      <Analytics />
      <Toaster position="top-right" richColors />
    </ConvexClientProvider>
  )

  return (
    <html lang="pt-BR">
      <body
        className={`${geist.className} antialiased min-h-screen flex flex-col`}
      >
        {process.env.NEXT_PUBLIC_CONVEX_URL ? (
          // Async server component (React 19); @types/react 18 typings are incomplete
          // @ts-expect-error -- ConvexAuthNextjsServerProvider is Promise<JSX.Element>
          <ConvexAuthNextjsServerProvider>
            {content}
          </ConvexAuthNextjsServerProvider>
        ) : (
          content
        )}
      </body>
    </html>
  )
}
