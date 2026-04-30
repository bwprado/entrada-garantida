'use client'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

export interface AmenityToggleProps {
  icon: React.ReactNode
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function AmenityToggle({
  icon,
  label,
  checked,
  onCheckedChange,
  disabled,
  className
}: AmenityToggleProps) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
        checked && 'border-primary bg-primary/5',
        !checked && 'hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors',
            checked
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            'text-sm font-medium truncate transition-colors',
            checked ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </label>
  )
}