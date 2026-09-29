'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPaymentMethod } from '@/lib/format'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ActionResult = { ok: true } | { ok: false; error: string }

function friendly(message: string | undefined) {
  const known = [
    'Table is not available',
    'Menu item is not available',
    'Order is not open',
    'Cannot save a bill with no items',
    'Quantity must be between 0 and 99',
    'Invalid payment method',
  ]
  return known.find((k) => message?.includes(k)) ?? 'Something went wrong. Please try again.'
}

export async function setItemQuantity(
  tableId: string,
  menuItemId: string,
  quantity: number,
): Promise<ActionResult> {
  if (!UUID.test(tableId) || !UUID.test(menuItemId)) return { ok: false, error: 'Invalid request' }
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    return { ok: false, error: 'Quantity must be between 0 and 99' }
  }
  const supabase = await createClient()
  const { error } = await supabase.rpc('set_order_item_quantity', {
    p_table_id: tableId,
    p_menu_item_id: menuItemId,
    p_quantity: quantity,
  })
  if (error) return { ok: false, error: friendly(error.message) }
  return { ok: true }
}

export async function clearOrder(tableId: string): Promise<ActionResult> {
  if (!UUID.test(tableId)) return { ok: false, error: 'Invalid request' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('clear_table_order', { p_table_id: tableId })
  if (error) return { ok: false, error: friendly(error.message) }
  revalidatePath(`/tables/${tableId}`, 'layout')
  return { ok: true }
}

export async function saveBill(orderId: string, paymentMethod: string): Promise<ActionResult> {
  if (!UUID.test(orderId)) return { ok: false, error: 'Invalid request' }
  if (!isPaymentMethod(paymentMethod)) return { ok: false, error: 'Invalid payment method' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('save_bill', {
    p_order_id: orderId,
    p_payment_method: paymentMethod,
  })
  const saved = Array.isArray(data) ? data[0] : data
  if (error || !saved?.bill_id) return { ok: false, error: friendly(error?.message) }

  revalidatePath('/', 'layout')
  redirect(`/bills/${saved.bill_id}/saved`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function addMenuItem(formData: FormData): Promise<ActionResult> {
  const name = formData.get('name')?.toString().trim()
  const categoryId = formData.get('category_id')?.toString()
  const priceRupees = formData.get('price')?.toString()

  if (!name || name.length < 1) return { ok: false, error: 'Item name is required' }
  if (!categoryId || !UUID.test(categoryId)) return { ok: false, error: 'Category is required' }

  const price = parseFloat(priceRupees ?? '')
  if (isNaN(price) || price < 0) return { ok: false, error: 'Enter a valid price' }
  const pricePaise = Math.round(price * 100)

  const supabase = await createClient()

  // Get restaurant_id from user profile
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('restaurant_id')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile?.restaurant_id) return { ok: false, error: 'Restaurant not found' }

  const { error } = await supabase.from('menu_items').insert({
    restaurant_id: profile.restaurant_id,
    category_id: categoryId,
    name,
    price_paise: pricePaise,
    is_active: true,
    display_order: 9999,
  })

  if (error) return { ok: false, error: error.message }
  revalidatePath('/menu')
  return { ok: true }
}

export async function removeMenuItem(itemId: string): Promise<ActionResult> {
  if (!UUID.test(itemId)) return { ok: false, error: 'Invalid item' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('menu_items')
    .update({ is_active: false })
    .eq('id', itemId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/menu')
  return { ok: true }
}

