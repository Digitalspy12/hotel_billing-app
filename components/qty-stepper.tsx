'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_QTY } from '@/hooks/use-order-quantities'

export function QtyStepper({
  value,
  onChange,
  itemName,
  size = 'md',
}: {
  value: number
  onChange: (next: number) => void
  itemName: string
  size?: 'sm' | 'md'
}) {
  const active = value > 0
  const btn = cn(
    'flex items-center justify-center rounded-md border transition-colors disabled:opacity-40',
    size === 'sm' ? 'size-7' : 'size-8',
    active
      ? 'border-primary/40 text-primary hover:bg-primary/10'
      : 'border-border text-foreground hover:bg-muted',
  )
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`Decrease ${itemName}`}
      >
        <Minus className="size-4" />
      </button>
      <span
        className={cn(
          'flex h-8 min-w-8 items-center justify-center rounded-md border px-1 text-sm font-medium tabular-nums',
          active ? 'border-primary/40 text-primary' : 'border-border',
        )}
        aria-live="polite"
        aria-label={`${itemName} quantity ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={`Increase ${itemName}`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
