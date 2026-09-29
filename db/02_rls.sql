-- ============================================================
-- Hotel Ganesh Billing App — Row Level Security Policies
-- Run AFTER 01_tables.sql.
-- ============================================================
-- Pattern: authenticated users can only see/touch data that
-- belongs to their own restaurant (via profiles.restaurant_id).
-- ============================================================

-- helper: inline subquery used in every policy
-- (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())


-- ── restaurants ─────────────────────────────────────────────
CREATE POLICY "staff_can_read_own_restaurant"
ON public.restaurants FOR SELECT TO authenticated
USING (
  id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- ── profiles ─────────────────────────────────────────────────
CREATE POLICY "users_can_read_own_profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());


-- ── dining_tables ───────────────────────────────────────────
CREATE POLICY "staff_can_read_tables"
ON public.dining_tables FOR SELECT TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- ── menu_categories ─────────────────────────────────────────
CREATE POLICY "staff_can_read_categories"
ON public.menu_categories FOR SELECT TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- ── menu_items ──────────────────────────────────────────────
CREATE POLICY "staff_can_read_menu_items"
ON public.menu_items FOR SELECT TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);

-- ✅ Required for "Add New Item" in Menu Management
CREATE POLICY "staff_can_insert_menu_items"
ON public.menu_items FOR INSERT TO authenticated
WITH CHECK (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);

-- ✅ Required for soft-delete (is_active = false) in Menu Management
CREATE POLICY "staff_can_update_menu_items"
ON public.menu_items FOR UPDATE TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- ── orders ──────────────────────────────────────────────────
CREATE POLICY "staff_can_read_orders"
ON public.orders FOR SELECT TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "staff_can_insert_orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "staff_can_update_orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- ── order_items ─────────────────────────────────────────────
CREATE POLICY "staff_can_read_order_items"
ON public.order_items FOR SELECT TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "staff_can_insert_order_items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  order_id IN (
    SELECT id FROM public.orders
    WHERE restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "staff_can_update_order_items"
ON public.order_items FOR UPDATE TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "staff_can_delete_order_items"
ON public.order_items FOR DELETE TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders
    WHERE restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
  )
);


-- ── bills ───────────────────────────────────────────────────
CREATE POLICY "staff_can_read_bills"
ON public.bills FOR SELECT TO authenticated
USING (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "staff_can_insert_bills"
ON public.bills FOR INSERT TO authenticated
WITH CHECK (
  restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
);


-- ── bill_items ──────────────────────────────────────────────
CREATE POLICY "staff_can_read_bill_items"
ON public.bill_items FOR SELECT TO authenticated
USING (
  bill_id IN (
    SELECT id FROM public.bills
    WHERE restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "staff_can_insert_bill_items"
ON public.bill_items FOR INSERT TO authenticated
WITH CHECK (
  bill_id IN (
    SELECT id FROM public.bills
    WHERE restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid())
  )
);
