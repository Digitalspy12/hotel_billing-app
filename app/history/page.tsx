import { Suspense } from 'react'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getBillsForDate } from '@/lib/data'
import { isISODate, todayInIST } from '@/lib/format'
import type { PaymentMethod } from '@/lib/format'
import { HistoryClient } from './history-client'
import { HistoryDateInput } from './history-date-input'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; pay?: string }>
}) {
  const params = await searchParams
  const date = isISODate(params.date) ? params.date : todayInIST()
  const pay = params.pay as PaymentMethod | undefined
  const validPay = pay && ['cash', 'upi', 'other'].includes(pay) ? pay : undefined

  const bills = await getBillsForDate(date, validPay)

  return (
    <AppShell>
      <AppHeader
        title="Bill History"
        backHref="/"
        action={<HistoryDateInput currentDate={date} />}
      />
      <Suspense>
        <HistoryClient bills={bills} date={date} />
      </Suspense>
    </AppShell>
  )
}
