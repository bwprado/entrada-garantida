'use client'

import { cn } from '@/lib/utils'
import { Stepper, type StepperProps } from '@/components/ui/stepper'

export interface RoomCounterProps {
  icon: React.ReactNode
  label: string
  value: number
  min: number
  max: number
  onChange: StepperProps['onChange']
  disabled?: boolean
  className?: string
}

export function RoomCounter({
  icon,
  label,
  value,
  min,
  max,
  onChange,
  disabled,
  className
}: RoomCounterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border p-3',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      <Stepper
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}