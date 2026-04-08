import './globals.css'

import { ConvexClientProvider } from '@/lib/convex-provider'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { Analytics } from '@vercel/analytics/next'
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
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="pt-BR">
        <body
          className={`${geist.className} antialiased min-h-screen flex flex-col`}
        >
          <ConvexClientProvider>
            {children}
            <Analytics />

            <Toaster position="top-right" richColors />
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
