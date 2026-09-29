'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Plus, ShoppingBag, Loader2, Banknote, Smartphone, MoreHorizontal } from 'lucide-react'
import { useOrderQuantities } from '@/hooks/use-order-quantities'
import { clearOrder } from '@/app/actions'
import { formatINR } from '@/lib/format'
import type { MenuItem, MenuCategory, OrderLine } from '@/lib/data'
import type { PaymentMethod } from '@/lib/format'
import { PAYMENT_LABELS, PAYMENT_METHODS } from '@/lib/format'
import { cn } from '@/lib/utils'

const METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
  cash: Banknote,
  upi: Smartphone,
  other: MoreHorizontal,
}

export function BillSummaryClient({
  tableId,
  tableName,
  menuItems,
  orderId,
  initialLines,
  cgstRate,
  sgstRate,
}: {
  tableId: string
  tableName: string
  menuItems: MenuItem[]
  orderId: string | null
  initialLines: OrderLine[]
  cgstRate: number
  sgstRate: number
}) {
  const initial: Record<string, number> = {}
  for (const line of initialLines) {
    initial[line.menu_item_id] = line.quantity
  }

  const { quantities, setQty, isSyncing, waitForSync } = useOrderQuantities(tableId, initial)
  const [isPending, startTransition] = useTransition()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const router = useRouter()

  const orderedItems = menuItems.filter((i) => (quantities[i.id] ?? 0) > 0)
  const subtotalPaise = orderedItems.reduce(
    (s, i) => s + i.price_paise * (quantities[i.id] ?? 0),
    0,
  )
  const cgstPaise = Math.round((subtotalPaise * cgstRate) / 100)
  const sgstPaise = Math.round((subtotalPaise * sgstRate) / 100)
  const totalPaise = subtotalPaise + cgstPaise + sgstPaise

  async function handleClearAll() {
    if (!orderId) return
    if (!confirm('Clear all items from this order?')) return
    startTransition(async () => {
      const res = await clearOrder(tableId)
      if (res.ok) {
        toast.success('Order cleared')
        router.push(`/tables/${tableId}`)
      } else {
        toast.error(res.error)
      }
    })
  }

  async function handleGenerateBill() {
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }
    if (orderedItems.length === 0) {
      toast.error('No items in this order')
      return
    }
    await waitForSync()
    // Navigate to bill preview, passing payment method via URL
    router.push(`/tables/${tableId}/preview?pay=${paymentMethod}`)
  }

  if (orderedItems.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <ShoppingBag className="size-16 text-muted-foreground/30" />
        <p className="text-center text-sm text-muted-foreground">
          No items in the order yet.
        </p>
        <a
          href={`/tables/${tableId}`}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Add Items
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-0 flex flex-col gap-4">
        {/* Item table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 border-b border-border bg-muted/50 px-4 py-2.5 text-xs font-semibold uppercase text-muted-foreground">
            <span>Item</span>
            <span className="text-center w-20">Qty</span>
            <span className="text-right w-14">Price</span>
            <span className="text-right w-14">Total</span>
            <span className="w-6" />
          </div>

          {/* Items */}
          <ul className="divide-y divide-border">
            {orderedItems.map((item) => {
              const qty = quantities[item.id] ?? 0
              return (
                <li
                  key={item.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 px-4 py-3"
                >
                  <span className="text-sm font-medium truncate">{item.name}</span>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1 w-20">
                    <button
                      type="button"
                      onClick={() => setQty(item.id, qty - 1)}
                      disabled={qty <= 0}
                      className="flex size-7 items-center justify-center rounded-lg border border-border text-sm transition-colors hover:bg-muted disabled:opacity-30"
                      aria-label={`Decrease ${item.name}`}
                    >
                      −
                    </button>
                    <span className="flex h-7 w-6 items-center justify-center text-sm font-bold tabular-nums">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(item.id, qty + 1)}
                      className="flex size-7 items-center justify-center rounded-lg border border-border text-sm transition-colors hover:bg-muted"
                      aria-label={`Increase ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <span className="w-14 text-right text-sm text-muted-foreground tabular-nums">
                    {formatINR(item.price_paise)}
                  </span>
                  <span className="w-14 text-right text-sm font-semibold tabular-nums">
                    {formatINR(item.price_paise * qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, 0)}
                    className="flex size-6 items-center justify-center text-muted-foreground/50 transition-colors hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Add More Items */}
        <a
          href={`/tables/${tableId}`}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 py-3.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Plus className="size-4" />
          Add More Items
        </a>

        {/* Totals */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4 space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatINR(subtotalPaise)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>CGST ({cgstRate}%)</span>
            <span className="tabular-nums">{formatINR(cgstPaise)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>SGST ({sgstRate}%)</span>
            <span className="tabular-nums">{formatINR(sgstPaise)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-base font-bold text-primary">Total Amount</span>
            <span className="text-xl font-bold text-primary tabular-nums">
              {formatINR(totalPaise)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = METHOD_ICONS[m]
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all',
                    paymentMethod === m
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5',
                  )}
                >
                  <Icon className="size-4" />
                  {PAYMENT_LABELS[m]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Generate Bill CTA */}
      <div className="p-4 pb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl border border-destructive/30 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            Clear All
          </button>
          <button
            type="button"
            onClick={handleGenerateBill}
            disabled={isPending || !paymentMethod || orderedItems.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-base font-bold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
          >
            {isSyncing || isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : null}
            Generate Bill →
          </button>
        </div>
      </div>
    </div>
  )
}
