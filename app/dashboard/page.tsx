import {
  IndianRupee,
  ReceiptText,
  Users,
  Armchair,
  Banknote,
  Smartphone,
  MoreHorizontal,
} from 'lucide-react'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getDashboard } from '@/lib/data'
import { formatINR, todayInIST, isISODate } from '@/lib/format'
import { DateFilterInput, QuickActionLink } from './dashboard-client'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const date = isISODate(params.date) ? params.date : todayInIST()
  const data = await getDashboard(date)

  const statCards = [
    {
      label: 'Total Sales',
      value: formatINR(data.totalSales),
      icon: IndianRupee,
      large: true,
    },
    {
      label: 'Total Bills',
      value: String(data.totalBills),
      icon: ReceiptText,
      large: true,
    },
    {
      label: 'Active Tables',
      value: `${data.activeTables} / ${data.tableCount}`,
      icon: Users,
      large: false,
    },
    {
      label: 'Available Tables',
      value: `${data.availableTables} / ${data.tableCount}`,
      icon: Armchair,
      large: false,
    },
  ]

  const paymentRows = [
    { label: 'Cash', value: data.byMethod.cash, icon: Banknote },
    { label: 'UPI', value: data.byMethod.upi, icon: Smartphone },
    { label: 'Other', value: data.byMethod.other, icon: MoreHorizontal },
  ]

  return (
    <AppShell>
      <AppHeader title="Dashboard" backHref="/" />

      <main className="flex flex-1 flex-col gap-5 p-4 pb-8">
        {/* Date selector */}
        <div className="flex items-center justify-between">
          <DateFilterInput currentDate={date} />
        </div>

        {/* 2×2 Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {statCards.map(({ label, value, icon: Icon, large }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-primary/15 bg-card py-5 shadow-sm"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className={`font-bold tabular-nums text-foreground ${large ? 'text-2xl' : 'text-xl'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Today's Sales by Payment Method */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">
              Today's Sales{' '}
              <span className="font-normal text-muted-foreground">(Payment Method)</span>
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {paymentRows.map(({ label, value, icon: Icon }) => (
              <li key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {formatINR(value)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-primary">Quick Actions</h2>
          <div className="flex gap-3">
            <QuickActionLink href={`/history?date=${date}`}>
              View Today's Bills
            </QuickActionLink>
            <QuickActionLink href="/history">
              View Reports
            </QuickActionLink>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
