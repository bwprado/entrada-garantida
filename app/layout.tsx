import './globals.css'

import { ConvexClientProvider } from '@/lib/convex-provider'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { Analytics } from '@vercel/analytics/next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'

import type { Metadata } from 'next'
import type React from 'react'

const geist = Geist({ subsets: ['latin'] })

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Aquisição Assistida - Governo do Maranhão - SECID',
  description:
    'Programa estadual de subsídio para aquisição de imóveis - Governo do Estado do Maranhão - SECID',
  generator: 'Aquisição Assistida',
  openGraph: {
    title: 'Aquisição Assistida - Governo do Maranhão - SECID',
    description:
      'Programa estadual de subsídio para aquisição de imóveis - Governo do Estado do Maranhão - SECID',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aquisição Assistida - Governo do Maranhão - SECID',
    description:
      'Programa estadual de subsídio para aquisição de imóveis - Governo do Estado do Maranhão - SECID',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
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
