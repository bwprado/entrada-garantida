"use client"

import * as React from "react"

export type StepFieldConfig = {
  fields: string[]
  component: React.ReactNode
}

type MultiStepContextValue = {
  currentStep: number
  totalSteps: number
  stepsFields: StepFieldConfig[]
  goNext: () => Promise<boolean>
  goPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

const MultiStepContext = React.createContext<MultiStepContextValue | null>(
  null
)

export function MultiStepFormProvider({
  children,
  stepsFields,
  onStepValidation,
}: {
  children: React.ReactNode
  stepsFields: StepFieldConfig[]
  onStepValidation: (step: StepFieldConfig) => Promise<boolean>
}) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const totalSteps = stepsFields.length

  const onStepValidationRef = React.useRef(onStepValidation)
  onStepValidationRef.current = onStepValidation

  const goNext = React.useCallback(async () => {
    const step = stepsFields[currentStep]
    if (!step) return false
    const ok = await onStepValidationRef.current(step)
    if (!ok) return false
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
    return true
  }, [currentStep, stepsFields, totalSteps])

  const goPrevious = React.useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }, [])

  const value = React.useMemo(
    (): MultiStepContextValue => ({
      currentStep,
      totalSteps,
      stepsFields,
      goNext,
      goPrevious,
      isFirst: currentStep === 0,
      isLast: currentStep >= totalSteps - 1,
    }),
    [
      currentStep,
      totalSteps,
      stepsFields,
      goNext,
      goPrevious,
    ]
  )

  return (
    <MultiStepContext.Provider value={value}>
      {children}
    </MultiStepContext.Provider>
  )
}

export function useMultiStepForm() {
  const ctx = React.useContext(MultiStepContext)
  if (!ctx) {
    throw new Error(
      "useMultiStepForm must be used within MultiStepFormProvider"
    )
  }
  return ctx
}
