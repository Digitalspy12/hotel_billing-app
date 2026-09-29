-- ============================================================
-- Hotel Ganesh Billing App — Table Definitions
-- Run this FIRST in Supabase SQL Editor.
-- ============================================================

-- ── 1. restaurants ──────────────────────────────────────────
CREATE TABLE public.restaurants (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  logo_url    text,
  address     text,
  tagline     text,
  cgst_rate   numeric(5,2) NOT NULL DEFAULT 0,
  sgst_rate   numeric(5,2) NOT NULL DEFAULT 0,
  currency    text        NOT NULL DEFAULT 'INR',
  timezone    text        NOT NULL DEFAULT 'Asia/Kolkata',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;


-- ── 2. profiles ─────────────────────────────────────────────
-- Links auth.users → restaurant. One user belongs to one restaurant.
CREATE TABLE public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id),
  full_name     text,
  role          text NOT NULL DEFAULT 'staff'
                  CHECK (role IN ('owner', 'manager', 'staff')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ── 3. dining_tables ────────────────────────────────────────
CREATE TABLE public.dining_tables (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid    NOT NULL REFERENCES public.restaurants(id),
  table_number  integer NOT NULL,
  label         text    NOT NULL,                -- e.g. "Table 1"
  status        text    NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'active', 'disabled')),
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, table_number)
);

CREATE INDEX idx_dining_tables_restaurant
  ON public.dining_tables (restaurant_id, display_order);

ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;


-- ── 4. menu_categories ──────────────────────────────────────
CREATE TABLE public.menu_categories (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid    NOT NULL REFERENCES public.restaurants(id),
  name          text    NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_categories_restaurant
  ON public.menu_categories (restaurant_id, is_active, display_order);

ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;


-- ── 5. menu_items ───────────────────────────────────────────
-- price_paise: ₹30 is stored as 3000 (integer paise, avoids float errors)
CREATE TABLE public.menu_items (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid    NOT NULL REFERENCES public.restaurants(id),
  category_id   uuid    NOT NULL REFERENCES public.menu_categories(id),
  name          text    NOT NULL,
  description   text,
  price_paise   bigint  NOT NULL DEFAULT 0,
  image_url     text,
  is_active     boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_restaurant
  ON public.menu_items (restaurant_id, category_id, is_active, display_order);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;


-- ── 6. orders ───────────────────────────────────────────────
-- One open order per table at a time (enforced by app logic + RPC).
CREATE TABLE public.orders (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid    NOT NULL REFERENCES public.restaurants(id),
  table_id      uuid    NOT NULL REFERENCES public.dining_tables(id),
  status        text    NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'billed', 'cancelled')),
  opened_at     timestamptz NOT NULL DEFAULT now(),
  closed_at     timestamptz,
  created_by    uuid    REFERENCES auth.users(id),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_table_status   ON public.orders (table_id, status);
CREATE INDEX idx_orders_restaurant     ON public.orders (restaurant_id, status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;


-- ── 7. order_items ──────────────────────────────────────────
-- item_name_snapshot + unit_price_paise are snapshot copies so history
-- stays accurate even if menu prices change later.
CREATE TABLE public.order_items (
  id                  uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid    NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id        uuid    NOT NULL REFERENCES public.menu_items(id),
  item_name_snapshot  text    NOT NULL,
  unit_price_paise    bigint  NOT NULL,
  quantity            integer NOT NULL CHECK (quantity >= 0),
  line_total_paise    bigint  GENERATED ALWAYS AS (unit_price_paise * quantity) STORED,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, menu_item_id)
);

CREATE INDEX idx_order_items_order ON public.order_items (order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- ── 8. bills ────────────────────────────────────────────────
CREATE TABLE public.bills (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   uuid    NOT NULL REFERENCES public.restaurants(id),
  order_id        uuid    NOT NULL REFERENCES public.orders(id),
  table_id        uuid    NOT NULL REFERENCES public.dining_tables(id),
  bill_number     text    NOT NULL,
  business_date   date    NOT NULL,
  billed_at       timestamptz NOT NULL DEFAULT now(),
  subtotal_paise  bigint  NOT NULL DEFAULT 0,
  cgst_rate       numeric(5,2) NOT NULL DEFAULT 0,
  cgst_paise      bigint  NOT NULL DEFAULT 0,
  sgst_rate       numeric(5,2) NOT NULL DEFAULT 0,
  sgst_paise      bigint  NOT NULL DEFAULT 0,
  total_paise     bigint  NOT NULL DEFAULT 0,
  payment_method  text    NOT NULL CHECK (payment_method IN ('cash', 'upi', 'other')),
  created_by      uuid    REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bills_restaurant_date
  ON public.bills (restaurant_id, business_date, billed_at DESC);
CREATE INDEX idx_bills_order ON public.bills (order_id);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;


-- ── 9. bill_items ───────────────────────────────────────────
-- Permanent snapshot of what was billed. Never changes after insert.
CREATE TABLE public.bill_items (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id          uuid    NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  item_name        text    NOT NULL,
  quantity         integer NOT NULL,
  unit_price_paise bigint  NOT NULL,
  line_total_paise bigint  NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bill_items_bill ON public.bill_items (bill_id);

ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
