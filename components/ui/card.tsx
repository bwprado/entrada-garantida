import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "lg",
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl border border-border shadow-sm group",
        "data-[size=sm]:py-2",
        "data-[size=md]:py-4",
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
        [
          "@container/card-header",
          "grid",
          "auto-rows-min",
          "grid-rows-[auto_auto]",
          "items-start",
          "gap-2",
          "group-data-[size=sm]:px-2",
          "group-data-[size=md]:px-4",
          "group-data-[size=lg]:px-6",
          "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
          "[.border-b]:pb-6"
        ],
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
        [
          "leading-none",
          "font-semibold",
          "group-data-[size=sm]:text-sm",
          "group-data-[size=md]:text-base",
          "group-data-[size=lg]:text-lg"
        ],
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
        [
          "text-muted-foreground",
          "text-sm",
          "group-data-[size=sm]:text-xs",
          "group-data-[size=md]:text-sm",
          "group-data-[size=lg]:text-base"
        ],
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
        [
          "group-data-[size=sm]:px-2",
          "group-data-[size=md]:px-4",
          "group-data-[size=lg]:px-6"
        ],

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
        [
          "flex items-center",
          "group-data-[size=sm]:px-2",
          "group-data-[size=md]:px-4",
          "group-data-[size=lg]:px-6",
          "[.border-t]:pt-6"
        ],
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
