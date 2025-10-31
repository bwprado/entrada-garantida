"use client"

import { ArrowLeft } from "lucide-react"
import { Button, buttonVariants } from "./ui/button"
import { useRouter } from "next/navigation"

export default function BackButton({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      className={buttonVariants({ variant: "ghost" })}
      onClick={() => router.back()}>
      <ArrowLeft className="w-4 h-4" />
      {children}
    </Button>
  )
}
