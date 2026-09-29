import { notFound } from 'next/navigation'
import { AppHeader, AppShell } from '@/components/app-shell'
import { getTable, getMenu, getOpenOrder } from '@/lib/data'
import { TableOrderClient } from './table-order-client'

export default async function TablePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [table, { categories, items }, openOrder] = await Promise.all([
    getTable(id),
    getMenu(),
    getOpenOrder(id),
  ])

  if (!table || table.status === 'disabled') notFound()

  const tableName = `${table.label} - ${openOrder ? 'Current Order' : 'New Order'}`

  return (
    <AppShell>
      <AppHeader title={tableName} backHref="/tables" />
      <TableOrderClient
        tableId={table.id}
        tableName={tableName}
        categories={categories}
        menuItems={items}
        orderId={openOrder?.id ?? null}
        initialLines={openOrder?.lines ?? []}
      />
    </AppShell>
  )
}
