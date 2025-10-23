import "./globals.css"

import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google"
import { Header } from "@/components/header"

import type { Metadata } from "next"
import type React from "react"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Programa Entrada Garantida - Governo do Maranhão - SEMAG",
  description:
    "Programa estadual de subsídio para aquisição de imóveis - Governo do Estado do Maranhão - SEMAG",
  generator: "Entrada Garantida"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} antialiased`}>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
