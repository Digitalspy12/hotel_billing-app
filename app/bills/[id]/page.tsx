import { notFound } from 'next/navigation'
import { Printer } from 'lucide-react'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getBill } from '@/lib/data'
import { formatINR, formatDate, formatTime, PAYMENT_LABELS } from '@/lib/format'
import { BrandLogo } from '@/components/brand-logo'

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getBill(id)
  if (!result) notFound()

  const { bill, items } = result

  return (
    <AppShell>
      <AppHeader
        title={`Bill #${bill.bill_number}`}
        backHref="/history"
        action={
          <button
            id="print-btn"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/15 text-primary-foreground print:hidden"
            aria-label="Print bill"
          >
            <Printer className="size-5" />
          </button>
        }
      />

      <main className="flex flex-1 flex-col p-4 pb-8 print:p-0">
        <div className="receipt-print-area mx-auto w-full max-w-sm rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Restaurant header */}
          <div className="flex flex-col items-center gap-2 border-b border-border px-6 py-5 text-center">
            <BrandLogo className="max-w-36" />
          </div>

          {/* Bill meta */}
          <div className="border-b border-dashed border-border px-6 py-4 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Bill No</span>
              <span className="font-semibold">{bill.bill_number}</span>
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(bill.billed_at)}</span>
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{formatTime(bill.billed_at)}</span>
              <span className="text-muted-foreground">Table No</span>
              <span className="font-semibold">{bill.table_number}</span>
            </div>
          </div>

          {/* Items */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 pb-2 border-b border-border text-xs font-semibold uppercase text-muted-foreground">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>
            <ul className="divide-y divide-border/50">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-2 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-center tabular-nums">{item.quantity}</span>
                  <span className="text-right tabular-nums">
                    {formatINR(item.unit_price_paise)}
                  </span>
                  <span className="text-right font-semibold tabular-nums">
                    {formatINR(item.line_total_paise)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Totals */}
          <div className="border-t border-border px-6 py-4 space-y-1.5 text-sm">
            {bill.cgst_rate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>CGST ({bill.cgst_rate}%)</span>
                <span className="tabular-nums">{formatINR(bill.cgst_paise)}</span>
              </div>
            )}
            {bill.sgst_rate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>SGST ({bill.sgst_rate}%)</span>
                <span className="tabular-nums">{formatINR(bill.sgst_paise)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-bold text-base">Total Amount</span>
              <span className="font-bold text-base text-primary tabular-nums">
                {formatINR(bill.total_paise)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Payment Method</span>
              <span className="font-semibold text-foreground">
                {PAYMENT_LABELS[bill.payment_method]}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-dashed border-border px-6 py-5 text-center">
            <p className="font-script text-lg italic text-muted-foreground">
              Thank You! Visit Again.
            </p>
          </div>
        </div>
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('print-btn')?.addEventListener('click',()=>window.print())`,
        }}
      />
    </AppShell>
  )
}
