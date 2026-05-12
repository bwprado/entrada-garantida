'use client'

import * as React from 'react'
import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useMaskito } from '@maskito/react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { dataNascimentoBrMaskOptions } from '@/lib/masks'

interface DatePickerProps {
  value?: string | Date
  onChange?: (value: string) => void
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
  /** Year range for the dropdowns. Example: [1900, 2026] */
  yearRange?: [number, number]
}

export function DatePicker({
  value,
  onChange,
  onSelect,
  placeholder = 'DD/MM/AAAA',
  className,
  id,
  disabled,
  yearRange
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  )

  const inputRef = useMaskito({ options: dataNascimentoBrMaskOptions })

  // Sync internal state when external value changes
  React.useEffect(() => {
    if (!value) {
      setInputValue('')
      setSelectedDate(undefined)
      return
    }

    let date: Date | undefined
    let inputStr = ''

    if (value instanceof Date) {
      date = value
      inputStr = format(date, 'dd/MM/yyyy')
    } else if (typeof value === 'string') {
      // Check if it's ISO or DD/MM/AAAA
      if (value.includes('-')) {
        // ISO YYYY-MM-DD
        const parsed = parse(value, 'yyyy-MM-dd', new Date())
        if (isValid(parsed)) {
          date = parsed
          inputStr = format(date, 'dd/MM/yyyy')
        }
      } else if (value.includes('/')) {
        // DD/MM/AAAA
        inputStr = value
        const parsed = parse(value, 'dd/MM/yyyy', new Date())
        if (isValid(parsed)) {
          date = parsed
        }
      }
    }

    setInputValue(inputStr)
    setSelectedDate(date)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)

    if (v.length === 10) {
      const parsed = parse(v, 'dd/MM/yyyy', new Date())
      if (isValid(parsed)) {
        setSelectedDate(parsed)
        onChange?.(v)
        onSelect?.(parsed)
      }
    } else if (v === '') {
      setSelectedDate(undefined)
      onChange?.('')
      onSelect?.(undefined)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const v = format(date, 'dd/MM/yyyy')
      setInputValue(v)
      onChange?.(v)
      onSelect?.(date)
    } else {
      setInputValue('')
      onChange?.('')
      onSelect?.(undefined)
    }
  }

  const fromYear = yearRange?.[0] ?? 1900
  const toYear = yearRange?.[1] ?? new Date().getFullYear()

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        id={id}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        className="pe-10"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-e-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            disabled={disabled}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="sr-only">Abrir calendário</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            defaultMonth={selectedDate || new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
