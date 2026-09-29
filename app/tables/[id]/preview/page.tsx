import { notFound, redirect } from 'next/navigation'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getTable, getMenu, getOpenOrder, getRestaurant } from '@/lib/data'
import { isPaymentMethod } from '@/lib/format'
import { BillPreviewClient } from './bill-preview-client'

export default async function BillPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pay?: string }>
}) {
  const { id } = await params
  const { pay } = await searchParams

  if (!isPaymentMethod(pay)) {
    redirect(`/tables/${id}/bill`)
  }

  const [table, { items }, openOrder, restaurant] = await Promise.all([
    getTable(id),
    getMenu(),
    getOpenOrder(id),
    getRestaurant(),
  ])

  if (!table || table.status === 'disabled') notFound()
  if (!openOrder) redirect(`/tables/${id}`)

  return (
    <AppShell>
      <AppHeader title="Bill Preview" backHref={`/tables/${id}/bill`} />
      <BillPreviewClient
        tableId={table.id}
        tableNumber={table.table_number}
        tableLabel={table.label}
        orderId={openOrder.id}
        lines={openOrder.lines}
        menuItems={items}
        paymentMethod={pay}
        cgstRate={restaurant?.cgst_rate ?? 0}
        sgstRate={restaurant?.sgst_rate ?? 0}
        restaurant={restaurant}
      />
    </AppShell>
  )
}
