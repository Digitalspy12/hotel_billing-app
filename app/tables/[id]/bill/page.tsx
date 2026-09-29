import { notFound } from 'next/navigation'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getTable, getMenu, getOpenOrder, getRestaurant } from '@/lib/data'
import { BillSummaryClient } from './bill-summary-client'

export default async function BillSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [table, { items }, openOrder, restaurant] = await Promise.all([
    getTable(id),
    getMenu(),
    getOpenOrder(id),
    getRestaurant(),
  ])

  if (!table || table.status === 'disabled') notFound()
  if (!openOrder) {
    // No open order - redirect back to table
    notFound()
  }

  const tableName = `${table.label} - Bill`

  return (
    <AppShell>
      <AppHeader title={tableName} backHref={`/tables/${id}`} />
      <BillSummaryClient
        tableId={table.id}
        tableName={tableName}
        menuItems={items}
        orderId={openOrder.id}
        initialLines={openOrder.lines}
        cgstRate={restaurant?.cgst_rate ?? 0}
        sgstRate={restaurant?.sgst_rate ?? 0}
      />
    </AppShell>
  )
}
