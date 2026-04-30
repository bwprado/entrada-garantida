'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface StepperProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ value, min, max, step = 1, onChange, disabled, className }, ref) => {
    const decrement = React.useCallback(() => {
      const next = value - step
      if (next >= min) onChange(next)
    }, [value, min, step, onChange])

    const increment = React.useCallback(() => {
      const next = value + step
      if (next <= max) onChange(next)
    }, [value, max, step, onChange])

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg border bg-background',
          className
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-l-lg rounded-r-none"
          disabled={disabled || value <= min}
          onClick={decrement}
          aria-label="Diminuir"
          tabIndex={-1}
        >
          <Minus className="size-4" />
        </Button>
        <span
          className="flex h-9 w-10 items-center justify-center text-sm font-medium tabular-nums select-none"
          aria-live="polite"
          aria-atomic
        >
          {value}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-r-lg rounded-l-none"
          disabled={disabled || value >= max}
          onClick={increment}
          aria-label="Aumentar"
          tabIndex={-1}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    )
  }
)
Stepper.displayName = 'Stepper'