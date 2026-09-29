import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, ReceiptText, History, Plus } from 'lucide-react'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getBill } from '@/lib/data'
import { formatINR, PAYMENT_LABELS } from '@/lib/format'

export default async function BillSavedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getBill(id)
  if (!result) notFound()

  const { bill } = result

  return (
    <AppShell>
      <AppHeader title="Bill Saved" />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        {/* Success icon + message */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex size-24 items-center justify-center">
            {/* Confetti-like decorative dots */}
            <div className="absolute inset-0 rounded-full bg-green-100" />
            <CheckCircle2 className="relative size-14 text-green-600" strokeWidth={1.5} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bill Saved Successfully!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bill No.{' '}
              <span className="font-semibold text-foreground">{bill.bill_number}</span>{' '}
              has been saved.
            </p>
          </div>

          {/* Bill summary pill */}
          <div className="rounded-2xl border border-border bg-card px-8 py-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-primary tabular-nums">
              {formatINR(bill.total_paise)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {bill.table_label} · Table {bill.table_number} ·{' '}
              {PAYMENT_LABELS[bill.payment_method]}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/history"
            className="flex h-14 items-center justify-between rounded-2xl border-2 border-primary/20 bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <ReceiptText className="size-5 text-primary" />
              View Today's Bills
            </div>
            <span className="text-primary">›</span>
          </Link>

          <Link
            href="/history"
            className="flex h-14 items-center justify-between rounded-2xl border-2 border-primary/20 bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <History className="size-5 text-primary" />
              View Bill History
            </div>
            <span className="text-primary">›</span>
          </Link>

          <Link
            href="/tables"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="size-5" />
            New Order
          </Link>
        </div>
      </main>
    </AppShell>
  )
}
