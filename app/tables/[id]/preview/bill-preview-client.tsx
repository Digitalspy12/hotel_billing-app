'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Printer, Save, Loader2 } from 'lucide-react'
import { saveBill } from '@/app/actions'
import { formatINR, formatDate, formatTime, PAYMENT_LABELS } from '@/lib/format'
import type { PaymentMethod } from '@/lib/format'
import type { MenuItem, OrderLine, Restaurant } from '@/lib/data'
import { BrandLogo } from '@/components/brand-logo'

export function BillPreviewClient({
  tableId,
  tableNumber,
  tableLabel,
  orderId,
  lines,
  menuItems,
  paymentMethod,
  cgstRate,
  sgstRate,
  restaurant,
}: {
  tableId: string
  tableNumber: number
  tableLabel: string
  orderId: string
  lines: OrderLine[]
  menuItems: MenuItem[]
  paymentMethod: PaymentMethod
  cgstRate: number
  sgstRate: number
  restaurant: Restaurant | null
}) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  // Build bill items
  const billItems = lines.map((line) => {
    const item = menuItems.find((m) => m.id === line.menu_item_id)
    return {
      name: line.name,
      qty: line.quantity,
      unitPaise: line.unit_price_paise,
      totalPaise: line.unit_price_paise * line.quantity,
    }
  })

  const subtotalPaise = billItems.reduce((s, i) => s + i.totalPaise, 0)
  const cgstPaise = Math.round((subtotalPaise * cgstRate) / 100)
  const sgstPaise = Math.round((subtotalPaise * sgstRate) / 100)
  const totalPaise = subtotalPaise + cgstPaise + sgstPaise

  const now = new Date()

  function handlePrint() {
    window.print()
  }

  async function handleSave() {
    if (saved || isPending) return
    setSaved(true)
    startTransition(async () => {
      try {
        const result = await saveBill(orderId, paymentMethod)
        // saveBill redirects on success; if we reach here it returned an error
        if (result && !result.ok) {
          toast.error(result.error)
          setSaved(false)
        }
      } catch {
        // redirect() throws — that's expected and correct
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4 print:p-0">
        {/* Receipt card */}
        <div className="receipt-print-area mx-auto max-w-sm rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Restaurant header */}
          <div className="flex flex-col items-center gap-2 border-b border-border px-6 py-5 text-center">
            <BrandLogo className="max-w-36" />
            <div>
              <p className="font-bold text-foreground">{restaurant?.name ?? 'Hotel Ganesh'}</p>
              {restaurant?.address && (
                <p className="text-xs text-muted-foreground">{restaurant.address}</p>
              )}
            </div>
          </div>

          {/* Bill meta */}
          <div className="border-b border-dashed border-border px-6 py-4 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Bill No</span>
              <span className="font-semibold">—</span>
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(now)}</span>
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{formatTime(now)}</span>
              <span className="text-muted-foreground">Table No</span>
              <span className="font-semibold">{tableNumber}</span>
            </div>
          </div>

          {/* Items table */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1 text-xs font-semibold uppercase text-muted-foreground pb-2 border-b border-border">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>
            <ul className="divide-y divide-border/50">
              {billItems.map((item, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-0.5 py-2 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-center tabular-nums">{item.qty}</span>
                  <span className="text-right tabular-nums">{formatINR(item.unitPaise)}</span>
                  <span className="text-right font-semibold tabular-nums">
                    {formatINR(item.totalPaise)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="border-t border-border px-6 py-4 space-y-1 text-sm">
            {cgstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>CGST ({cgstRate}%)</span>
                <span className="tabular-nums">{formatINR(cgstPaise)}</span>
              </div>
            )}
            {sgstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>SGST ({sgstRate}%)</span>
                <span className="tabular-nums">{formatINR(sgstPaise)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-border">
              <span className="font-bold text-base">Total Amount</span>
              <span className="font-bold text-base text-primary tabular-nums">
                {formatINR(totalPaise)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground pt-1">
              <span>Payment Method</span>
              <span className="font-semibold text-foreground">
                {PAYMENT_LABELS[paymentMethod]}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-dashed border-border px-6 py-5 text-center">
            <p className="font-script text-lg italic text-muted-foreground">
              {restaurant?.tagline ?? 'Thank You! Visit Again.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 p-4 pb-6 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary py-3.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
        >
          <Printer className="size-5" />
          Print Bill
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || saved}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          Save Bill
        </button>
      </div>
    </div>
  )
}
