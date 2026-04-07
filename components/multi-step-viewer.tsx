"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMultiStepForm } from "@/hooks/use-multi-step-viewer"

export function MultiStepFormContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

export function FormHeader({ className }: { className?: string }) {
  const { currentStep, totalSteps } = useMultiStepForm()
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Etapa {currentStep + 1} de {totalSteps}
        </span>
        <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}

export function StepFields() {
  const { currentStep, stepsFields } = useMultiStepForm()
  const step = stepsFields[currentStep]
  if (!step) return null
  return (
    <div
      key={currentStep}
      className="grid grid-cols-1 gap-4"
    >
      {step.component}
    </div>
  )
}

export function FormFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between sm:items-center",
        className
      )}
      {...props}
    />
  )
}

export function PreviousButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { goPrevious, isFirst } = useMultiStepForm()
  if (isFirst) return null
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("w-full sm:w-auto", className)}
      onClick={goPrevious}
      {...props}
    >
      {children}
    </Button>
  )
}

export function NextButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { goNext, isLast } = useMultiStepForm()
  if (isLast) return null
  return (
    <Button
      type="button"
      className={cn("w-full sm:w-auto sm:ms-auto", className)}
      onClick={() => void goNext()}
      {...props}
    >
      {children}
    </Button>
  )
}

export function SubmitButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isLast } = useMultiStepForm()
  if (!isLast) return null
  return (
    <Button
      type="submit"
      className={cn("w-full sm:w-auto sm:ms-auto", className)}
      {...props}
    />
  )
}
