-- ============================================================
-- Hotel Ganesh Billing App — Stored Procedure RPCs
-- Run AFTER 01_tables.sql and 02_rls.sql.
-- All functions use SECURITY DEFINER so they bypass RLS
-- internally while still being called by authenticated users.
-- Safe to re-run: uses CREATE OR REPLACE.
-- ============================================================


-- ── RPC 1: set_order_item_quantity ──────────────────────────
-- Called on every +/- tap in the order screen.
-- Creates an open order for the table if none exists.
-- Upserts the order item; deletes it when quantity reaches 0.
CREATE OR REPLACE FUNCTION public.set_order_item_quantity(
  p_table_id     uuid,
  p_menu_item_id uuid,
  p_quantity     integer
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order_id      uuid;
  v_restaurant_id uuid;
  v_item_name     text;
  v_price_paise   bigint;
BEGIN
  -- Validate quantity
  IF p_quantity < 0 OR p_quantity > 99 THEN
    RAISE EXCEPTION 'Quantity must be between 0 and 99';
  END IF;

  -- Table must exist and not be disabled
  SELECT restaurant_id INTO v_restaurant_id
  FROM public.dining_tables
  WHERE id = p_table_id AND status != 'disabled';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Table is not available';
  END IF;

  -- Menu item must be active and belong to same restaurant
  SELECT name, price_paise INTO v_item_name, v_price_paise
  FROM public.menu_items
  WHERE id = p_menu_item_id
    AND is_active = true
    AND restaurant_id = v_restaurant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Menu item is not available';
  END IF;

  -- Get existing open order or create one
  SELECT id INTO v_order_id
  FROM public.orders
  WHERE table_id = p_table_id AND status = 'open'
  LIMIT 1;

  IF v_order_id IS NULL THEN
    INSERT INTO public.orders (restaurant_id, table_id, created_by)
    VALUES (v_restaurant_id, p_table_id, auth.uid())
    RETURNING id INTO v_order_id;
  END IF;

  -- Delete if quantity = 0, otherwise upsert
  IF p_quantity = 0 THEN
    DELETE FROM public.order_items
    WHERE order_id = v_order_id AND menu_item_id = p_menu_item_id;
  ELSE
    INSERT INTO public.order_items
      (order_id, menu_item_id, item_name_snapshot, unit_price_paise, quantity)
    VALUES
      (v_order_id, p_menu_item_id, v_item_name, v_price_paise, p_quantity)
    ON CONFLICT (order_id, menu_item_id) DO UPDATE SET
      quantity           = EXCLUDED.quantity,
      unit_price_paise   = EXCLUDED.unit_price_paise,
      item_name_snapshot = EXCLUDED.item_name_snapshot,
      updated_at         = now();
  END IF;
END;
$$;


-- ── RPC 2: clear_table_order ────────────────────────────────
-- Cancels the current open order on a table (deletes all items).
CREATE OR REPLACE FUNCTION public.clear_table_order(p_table_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  SELECT id INTO v_order_id
  FROM public.orders
  WHERE table_id = p_table_id AND status = 'open'
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'Order is not open';
  END IF;

  DELETE FROM public.order_items WHERE order_id = v_order_id;

  UPDATE public.orders
  SET status = 'cancelled', closed_at = now(), updated_at = now()
  WHERE id = v_order_id;
END;
$$;


-- ── RPC 3: save_bill ────────────────────────────────────────
-- Finalises an open order:
--   1. Calculates subtotal + tax from current order_items.
--   2. Inserts a bill record with a sequential bill_number.
--   3. Inserts bill_items as a permanent snapshot.
--   4. Marks the order as 'billed'.
-- Returns the new bill_id and bill_number.
CREATE OR REPLACE FUNCTION public.save_bill(
  p_order_id       uuid,
  p_payment_method text
)
RETURNS TABLE(bill_id uuid, bill_number text)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order        public.orders%ROWTYPE;
  v_restaurant   public.restaurants%ROWTYPE;
  v_subtotal     bigint := 0;
  v_cgst_paise   bigint;
  v_sgst_paise   bigint;
  v_total        bigint;
  v_bill_id      uuid;
  v_bill_number  text;
  v_biz_date     date;
  v_bill_seq     integer;
BEGIN
  -- Validate
  IF p_payment_method NOT IN ('cash', 'upi', 'other') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id AND status = 'open';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order is not open';
  END IF;

  SELECT * INTO v_restaurant
  FROM public.restaurants WHERE id = v_order.restaurant_id;

  -- Sum items
  SELECT COALESCE(SUM(line_total_paise), 0) INTO v_subtotal
  FROM public.order_items WHERE order_id = p_order_id;

  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'Cannot save a bill with no items';
  END IF;

  -- Tax (rates stored as %; amounts in paise)
  v_cgst_paise := ROUND(v_subtotal * v_restaurant.cgst_rate / 100);
  v_sgst_paise := ROUND(v_subtotal * v_restaurant.sgst_rate / 100);
  v_total      := v_subtotal + v_cgst_paise + v_sgst_paise;

  -- Business date in restaurant timezone
  v_biz_date := (now() AT TIME ZONE COALESCE(v_restaurant.timezone, 'Asia/Kolkata'))::date;

  -- Sequential bill number per day: YYYYMMDD-001, YYYYMMDD-002 …
  SELECT COUNT(*) + 1 INTO v_bill_seq
  FROM public.bills
  WHERE restaurant_id = v_restaurant.id AND business_date = v_biz_date;

  v_bill_number := to_char(v_biz_date, 'YYYYMMDD') || '-' || lpad(v_bill_seq::text, 3, '0');

  -- Insert bill header
  INSERT INTO public.bills (
    restaurant_id, order_id, table_id,
    bill_number, business_date,
    subtotal_paise,
    cgst_rate, cgst_paise,
    sgst_rate, sgst_paise,
    total_paise, payment_method, created_by
  ) VALUES (
    v_restaurant.id, p_order_id, v_order.table_id,
    v_bill_number, v_biz_date,
    v_subtotal,
    v_restaurant.cgst_rate, v_cgst_paise,
    v_restaurant.sgst_rate, v_sgst_paise,
    v_total, p_payment_method, auth.uid()
  )
  RETURNING id INTO v_bill_id;

  -- Snapshot bill items
  INSERT INTO public.bill_items (bill_id, item_name, quantity, unit_price_paise, line_total_paise)
  SELECT v_bill_id, item_name_snapshot, quantity, unit_price_paise, line_total_paise
  FROM public.order_items
  WHERE order_id = p_order_id;

  -- Close order
  UPDATE public.orders
  SET status = 'billed', closed_at = now(), updated_at = now()
  WHERE id = p_order_id;

  RETURN QUERY SELECT v_bill_id, v_bill_number;
END;
$$;


-- ── Grant execute to authenticated users ─────────────────────
GRANT EXECUTE ON FUNCTION public.set_order_item_quantity(uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_table_order(uuid)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_bill(uuid, text)                         TO authenticated;
