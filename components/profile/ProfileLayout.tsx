"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProfileLayoutProps {
  title: string
  description?: string
  children: ReactNode
  onSubmit?: () => void
  isLoading?: boolean
  backHref?: string
  backLabel?: string
}

export function ProfileLayout({
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
  backHref,
  backLabel = "Voltar",
}: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {backHref && (
              <Link
                href={backHref}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  onSubmit?.()
                }}
                className="space-y-6"
              >
                {children}

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={isLoading} size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
