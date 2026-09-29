# Hotel Ganesh Billing App — Supabase SQL Schema

## How to run

Paste each file into **Supabase Dashboard → SQL Editor → New query**, then click **Run**.
Run them **in order** — each file depends on the previous one.

| Order | File | Description |
|-------|------|-------------|
| 1 | `01_tables.sql` | CREATE TABLE statements + indexes |
| 2 | `02_rls.sql` | Row Level Security policies |
| 3 | `03_functions.sql` | Stored procedure RPCs |
| 4 | `04_seed.sql` | Optional sample data for testing |

## If tables already exist

- Skip `01_tables.sql` entirely.
- For `02_rls.sql`: only run the policies that are missing.
  - You can check existing policies at: **Authentication → Policies**.
- For `03_functions.sql`: always safe to re-run (uses `CREATE OR REPLACE`).

## Quick fix for menu_items RLS error

If you only hit `new row violates row-level security policy` on `menu_items`,
run **only** these two statements from `02_rls.sql`:

```sql
CREATE POLICY "staff_can_insert_menu_items" ON public.menu_items
FOR INSERT TO authenticated
WITH CHECK (restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "staff_can_update_menu_items" ON public.menu_items
FOR UPDATE TO authenticated
USING  (restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (restaurant_id = (SELECT restaurant_id FROM public.profiles WHERE id = auth.uid()));
```
