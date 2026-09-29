import Link from 'next/link'
import { Armchair, Info } from 'lucide-react'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getTables } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'

export default async function TablesPage() {
  const tables = await getTables()

  return (
    <AppShell>
      <AppHeader title="Tables" backHref="/" />

      <main className="flex flex-1 flex-col gap-4 p-4">
        {tables.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No tables configured for this restaurant.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {tables.map((table) => {
              const occupied = Boolean(table.openOrder)
              const disabled = table.status === 'disabled'

              const cardBody = (
                <div className="flex flex-col items-center gap-1.5">
                  <Armchair
                    className={cn(
                      'size-8',
                      disabled
                        ? 'text-muted-foreground'
                        : occupied
                          ? 'text-primary'
                          : 'text-primary/70',
                    )}
                    aria-hidden
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {table.label}
                  </span>
                  <span className="text-4xl font-bold tabular-nums leading-none text-foreground">
                    {table.table_number}
                  </span>
                  <span
                    className={cn(
                      'mt-1 rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                      disabled
                        ? 'bg-muted text-muted-foreground'
                        : occupied
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-green-100 text-green-700',
                    )}
                  >
                    {disabled ? 'Disabled' : occupied ? 'Active' : 'Available'}
                  </span>
                  {occupied && table.openOrder && (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {table.openOrder.itemCount} items ·{' '}
                      {formatINR(table.openOrder.totalPaise)}
                    </span>
                  )}
                </div>
              )

              const baseClass =
                'flex h-44 flex-col items-center justify-center rounded-2xl border-2 transition-all'

              return (
                <li key={table.id}>
                  {disabled ? (
                    <div
                      className={cn(
                        baseClass,
                        'border-border bg-muted opacity-60 cursor-not-allowed',
                      )}
                      aria-disabled="true"
                    >
                      {cardBody}
                    </div>
                  ) : (
                    <Link
                      href={`/tables/${table.id}`}
                      className={cn(
                        baseClass,
                        'active:scale-[0.97]',
                        occupied
                          ? 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10 shadow-sm'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-accent/40 shadow-sm',
                      )}
                    >
                      {cardBody}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {/* Bottom tip */}
        <p className="mt-auto flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          Select a table to place order or view current order.
        </p>
      </main>
    </AppShell>
  )
}
