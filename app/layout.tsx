import "./globals.css"

import { Header } from "@/components/header"
import { Analytics } from "@vercel/analytics/next"
import { Geist } from "next/font/google"

import type { Metadata } from "next"
import type React from "react"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Programa Entrada Garantida - Governo do Maranhão - SEMAG",
  description:
    "Programa estadual de subsídio para aquisição de imóveis - Governo do Estado do Maranhão - SEMAG",
  generator: "Entrada Garantida",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geist.className} antialiased min-h-screen flex flex-col`}>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
