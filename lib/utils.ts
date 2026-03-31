import { clsx, type ClassValue } from 'clsx'
import * as React from 'react'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Compose multiple refs (e.g. react-hook-form + Maskito). */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (ref == null) continue
      if (typeof ref === 'function') {
        ref(value)
      } else {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    }
  }
}
