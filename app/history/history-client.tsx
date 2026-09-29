'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Banknote, Smartphone, MoreHorizontal, CalendarDays, ReceiptText } from 'lucide-react'
import type { PaymentMethod } from '@/lib/format'
import { PAYMENT_LABELS, PAYMENT_METHODS, formatINR, formatDate, formatTime } from '@/lib/format'
import type { BillRecord } from '@/lib/data'
import { cn } from '@/lib/utils'

const METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
  cash: Banknote,
  upi: Smartphone,
  other: MoreHorizontal,
}

const METHOD_COLORS: Record<PaymentMethod, string> = {
  cash: 'bg-green-100 text-green-700',
  upi: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-600',
}

export function HistoryClient({
  bills,
  date,
}: {
  bills: BillRecord[]
  date: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const payFilter = searchParams.get('pay') as PaymentMethod | null

  function setFilter(method: PaymentMethod | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (method) params.set('pay', method)
    else params.delete('pay')
    router.replace(`/history?${params.toString()}`)
  }

  const total = bills.reduce((s, b) => s + b.total_paise, 0)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pb-8">
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
            !payFilter
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-card text-foreground hover:bg-muted',
          )}
        >
          All
        </button>
        {PAYMENT_METHODS.map((m) => {
          const Icon = METHOD_ICONS[m]
          return (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                payFilter === m
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              <Icon className="size-3.5" />
              {PAYMENT_LABELS[m]}
            </button>
          )
        })}
      </div>

      {/* Date + summary bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary px-4 py-3.5 text-primary-foreground">
        <CalendarDays className="size-5 text-primary-foreground/70" />
        <div className="flex-1">
          <p className="text-xs text-primary-foreground/70">{formatDate(date)}</p>
          <p className="text-lg font-bold tabular-nums">
            {formatINR(total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary-foreground/70">Bills</p>
          <p className="text-lg font-bold">{bills.length}</p>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
          <ReceiptText className="size-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No bills found for this date.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {bills.map((bill) => {
            const Icon = METHOD_ICONS[bill.payment_method]
            const colorClass = METHOD_COLORS[bill.payment_method]
            return (
              <li key={bill.id}>
                <a
                  href={`/bills/${bill.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">#{bill.bill_number}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                          colorClass,
                        )}
                      >
                        {PAYMENT_LABELS[bill.payment_method]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bill.table_label} · Table {bill.table_number} ·{' '}
                      {formatTime(bill.billed_at)}
                    </p>
                  </div>
                  <span className="text-base font-bold text-primary tabular-nums shrink-0">
                    {formatINR(bill.total_paise)}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
