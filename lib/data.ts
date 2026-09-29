import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { PaymentMethod } from '@/lib/format'

export type Restaurant = {
  id: string
  name: string
  logo_url: string | null
  address: string | null
  tagline: string | null
  cgst_rate: number
  sgst_rate: number
}

export type MenuCategory = { id: string; name: string }
export type MenuItem = {
  id: string
  category_id: string
  name: string
  price_paise: number
  image_url: string | null
}

export type OrderLine = {
  menu_item_id: string
  name: string
  unit_price_paise: number
  quantity: number
}

export type TableSummary = {
  id: string
  table_number: number
  label: string
  status: 'available' | 'disabled'
  openOrder: { itemCount: number; totalPaise: number } | null
}

export type BillRecord = {
  id: string
  bill_number: string
  billed_at: string
  business_date: string
  subtotal_paise: number
  cgst_rate: number
  cgst_paise: number
  sgst_rate: number
  sgst_paise: number
  total_paise: number
  payment_method: PaymentMethod
  table_label: string
  table_number: number
}

export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getRestaurant = cache(async (): Promise<Restaurant | null> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('restaurants')
    .select('id, name, logo_url, address, tagline, cgst_rate, sgst_rate')
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return { ...data, cgst_rate: Number(data.cgst_rate), sgst_rate: Number(data.sgst_rate) }
})

export async function getTables(): Promise<TableSummary[]> {
  const supabase = await createClient()
  const [{ data: tables }, { data: orders }] = await Promise.all([
    supabase
      .from('dining_tables')
      .select('id, table_number, label, status')
      .order('display_order'),
    supabase
      .from('orders')
      .select('table_id, order_items(quantity, line_total_paise)')
      .eq('status', 'open'),
  ])

  const openByTable = new Map<string, { itemCount: number; totalPaise: number }>()
  for (const order of orders ?? []) {
    const items = (order.order_items ?? []) as { quantity: number; line_total_paise: number }[]
    openByTable.set(order.table_id, {
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPaise: items.reduce((sum, i) => sum + Number(i.line_total_paise), 0),
    })
  }

  return (tables ?? []).map((t) => ({
    ...t,
    status: t.status as TableSummary['status'],
    openOrder: openByTable.get(t.id) ?? null,
  }))
}

export async function getTable(tableId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('dining_tables')
    .select('id, table_number, label, status')
    .eq('id', tableId)
    .maybeSingle()
  return data
}

export async function getMenu() {
  const supabase = await createClient()
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from('menu_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('menu_items')
      .select('id, category_id, name, price_paise, image_url')
      .eq('is_active', true)
      .order('display_order'),
  ])
  return {
    categories: (categories ?? []) as MenuCategory[],
    items: (items ?? []).map((i) => ({ ...i, price_paise: Number(i.price_paise) })) as MenuItem[],
  }
}

export async function getOpenOrder(tableId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, order_items(menu_item_id, item_name_snapshot, unit_price_paise, quantity, created_at)')
    .eq('table_id', tableId)
    .eq('status', 'open')
    .maybeSingle()
  if (!data) return null

  const lines: OrderLine[] = (data.order_items ?? [])
    .toSorted((a, b) => a.created_at.localeCompare(b.created_at))
    .map((i) => ({
      menu_item_id: i.menu_item_id,
      name: i.item_name_snapshot,
      unit_price_paise: Number(i.unit_price_paise),
      quantity: i.quantity,
    }))
  return { id: data.id as string, lines }
}

type BillRow = Omit<BillRecord, 'table_label' | 'table_number'> & {
  dining_tables: { label: string; table_number: number } | null
}

function toBillRecord(row: BillRow): BillRecord {
  const { dining_tables, ...rest } = row
  return {
    ...rest,
    subtotal_paise: Number(rest.subtotal_paise),
    cgst_rate: Number(rest.cgst_rate),
    cgst_paise: Number(rest.cgst_paise),
    sgst_rate: Number(rest.sgst_rate),
    sgst_paise: Number(rest.sgst_paise),
    total_paise: Number(rest.total_paise),
    table_label: dining_tables?.label ?? 'Table',
    table_number: dining_tables?.table_number ?? 0,
  }
}

const BILL_COLUMNS =
  'id, bill_number, billed_at, business_date, subtotal_paise, cgst_rate, cgst_paise, sgst_rate, sgst_paise, total_paise, payment_method, dining_tables(label, table_number)'

export async function getBillsForDate(date: string, payment?: PaymentMethod) {
  const supabase = await createClient()
  let query = supabase
    .from('bills')
    .select(BILL_COLUMNS)
    .eq('business_date', date)
    .order('billed_at', { ascending: false })
  if (payment) query = query.eq('payment_method', payment)
  const { data } = await query
  return ((data ?? []) as unknown as BillRow[]).map(toBillRecord)
}

export async function getBill(billId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bills')
    .select(`${BILL_COLUMNS}, bill_items(item_name, quantity, unit_price_paise, line_total_paise, created_at)`)
    .eq('id', billId)
    .maybeSingle()
  if (!data) return null
  const row = data as unknown as BillRow & {
    bill_items: { item_name: string; quantity: number; unit_price_paise: number; line_total_paise: number; created_at: string }[]
  }
  return {
    bill: toBillRecord(row),
    items: row.bill_items
      .toSorted((a, b) => a.created_at.localeCompare(b.created_at))
      .map((i) => ({
        name: i.item_name,
        quantity: i.quantity,
        unit_price_paise: Number(i.unit_price_paise),
        line_total_paise: Number(i.line_total_paise),
      })),
  }
}

export async function getDashboard(date: string) {
  const [bills, tables] = await Promise.all([getBillsForDate(date), getTables()])
  const byMethod: Record<PaymentMethod, number> = { cash: 0, upi: 0, other: 0 }
  for (const b of bills) byMethod[b.payment_method] += b.total_paise
  const usableTables = tables.filter((t) => t.status === 'available')
  const active = usableTables.filter((t) => t.openOrder).length
  return {
    totalSales: bills.reduce((sum, b) => sum + b.total_paise, 0),
    totalBills: bills.length,
    activeTables: active,
    availableTables: usableTables.length - active,
    tableCount: usableTables.length,
    byMethod,
  }
}
