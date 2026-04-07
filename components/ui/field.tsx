"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Field({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("grid gap-4", className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="field-content" className={cn("", className)} {...props} />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FieldSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      className={cn("border-t my-2", className)}
      {...props}
    />
  )
}

function FieldError({
  errors,
  className,
}: {
  errors: unknown[]
  className?: string
}) {
  const messages: string[] = []
  for (const e of errors) {
    if (e == null) continue
    if (typeof e === "string") {
      messages.push(e)
      continue
    }
    if (typeof e === "object" && e !== null && "message" in e) {
      const m = (e as { message?: unknown }).message
      if (typeof m === "string") messages.push(m)
    }
  }
  if (!messages.length) return null
  return (
    <div data-slot="field-error" className={cn("space-y-1", className)}>
      {messages.map((msg, i) => (
        <p key={i} role="alert" className="text-destructive text-sm">
          {msg}
        </p>
      ))}
    </div>
  )
}

export {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
  FieldError,
}
