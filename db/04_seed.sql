-- ============================================================
-- Hotel Ganesh Billing App — Sample Seed Data
-- Optional. Run LAST, after all tables + RLS + functions.
-- Replace UUIDs with real ones from your database.
-- ============================================================

-- NOTE: After inserting the restaurant, also create a user in
-- Supabase Auth (Dashboard → Authentication → Users) and then
-- insert a profiles row linking that auth user to the restaurant.

-- Step 1: Insert restaurant
INSERT INTO public.restaurants (id, name, address, tagline, cgst_rate, sgst_rate)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Hotel Ganesh',
  'Peth Naka, Satara, Maharashtra',
  'Pure Veg — Good Food Brings People Together',
  0, -- CGST % (set to 2.5 for 5% GST split)
  0  -- SGST % (set to 2.5 for 5% GST split)
);

-- Step 2: Insert tables
INSERT INTO public.dining_tables (restaurant_id, table_number, label, display_order) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 1, 'Table 1', 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 2, 'Table 2', 2),
  ('aaaaaaaa-0000-0000-0000-000000000001', 3, 'Table 3', 3),
  ('aaaaaaaa-0000-0000-0000-000000000001', 4, 'Table 4', 4),
  ('aaaaaaaa-0000-0000-0000-000000000001', 5, 'Table 5', 5);

-- Step 3: Insert menu categories
INSERT INTO public.menu_categories (id, restaurant_id, name, display_order) VALUES
  ('cccccccc-0001-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Breakfast',      1),
  ('cccccccc-0002-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Meals',          2),
  ('cccccccc-0003-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Chapati Bhaji',  3),
  ('cccccccc-0004-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Tea & Coffee',   4),
  ('cccccccc-0005-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Snacks',         5);

-- Step 4: Insert menu items (prices in paise: ₹30 = 3000)
INSERT INTO public.menu_items (restaurant_id, category_id, name, price_paise, display_order) VALUES
  -- Breakfast
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Idli (2 pcs)',      3000, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Vada (2 pcs)',      3000, 2),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Poha',              3000, 3),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Upma',              3000, 4),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', 'Masala Dosa',       5000, 5),
  -- Meals
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0002-0000-0000-000000000001', 'Full Meal (Thali)', 10000, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0002-0000-0000-000000000001', 'Half Meal',          7000, 2),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0002-0000-0000-000000000001', 'Dal Rice',           6000, 3),
  -- Chapati Bhaji
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0003-0000-0000-000000000001', 'Chapati (2 pcs)',    2000, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0003-0000-0000-000000000001', 'Bhaji (1 bowl)',     3000, 2),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0003-0000-0000-000000000001', 'Chapati + Bhaji',    4000, 3),
  -- Tea & Coffee
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0004-0000-0000-000000000001', 'Tea',                1500, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0004-0000-0000-000000000001', 'Coffee',             2000, 2),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0004-0000-0000-000000000001', 'Lassi',              2500, 3),
  -- Snacks
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0005-0000-0000-000000000001', 'Samosa (2 pcs)',     2000, 1),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0005-0000-0000-000000000001', 'Kachori',            1500, 2);
