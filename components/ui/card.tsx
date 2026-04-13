import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "lg",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "elevated" | "bordered"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "bg-card text-card-foreground flex flex-col",
        "transition-all duration-200 ease-out",
        "group",
        /* Variants */
        variant === "default" && [
          "rounded-xl border border-border shadow-sm",
          "hover:shadow-brand-md hover:-translate-y-0.5"
        ],
        variant === "elevated" && [
          "rounded-2xl shadow-brand-md",
          "hover:shadow-brand-lg hover:-translate-y-1"
        ],
        variant === "bordered" && [
          "rounded-lg border-2 border-border",
          "hover:border-primary/30 hover:shadow-brand-sm"
        ],
        /* Size padding */
        "data-[size=sm]:py-3",
        "data-[size=md]:py-5",
        "data-[size=lg]:py-6",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header",
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5",
        "group-data-[size=sm]:px-4 group-data-[size=sm]:pb-3",
        "group-data-[size=md]:px-5 group-data-[size=md]:pb-4",
        "group-data-[size=lg]:px-6 group-data-[size=lg]:pb-5",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "leading-tight font-semibold tracking-tight",
        "group-data-[size=sm]:text-sm",
        "group-data-[size=md]:text-base",
        "group-data-[size=lg]:text-lg",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-muted-foreground text-sm leading-relaxed",
        "group-data-[size=sm]:text-xs",
        "group-data-[size=md]:text-sm",
        "group-data-[size=lg]:text-base",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "group-data-[size=sm]:px-4",
        "group-data-[size=md]:px-5",
        "group-data-[size=lg]:px-6",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        "group-data-[size=sm]:px-4 group-data-[size=sm]:pt-3",
        "group-data-[size=md]:px-5 group-data-[size=md]:pt-4",
        "group-data-[size=lg]:px-6 group-data-[size=lg]:pt-5",
        "[.border-t]:pt-5",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent
}
