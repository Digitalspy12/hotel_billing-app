# 🍽️ Hotel Ganesh Billing App

A lightweight, mobile-first **table, order & billing app** built for Hotel Ganesh Pure Veg restaurant staff. Manage tables, take orders, apply taxes, and generate bills — all from a phone browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Authentication** | Staff login/sign-up via Supabase Auth (email+password) |
| **Dashboard** | Today's sales summary, bill count, active vs. available tables, and payment breakdown |
| **Tables** | Grid view of all dining tables with live occupancy status |
| **Order Management** | Per-table order screen with +/− quantity steppers, live total with CGST/SGST |
| **Menu** | Read-only menu viewer grouped by category |
| **Bill History** | Filterable bill history by date and payment method |
| **Bill Receipt** | Itemized receipt with print support |
| **Saved Confirmation** | Post-checkout success screen with receipt link |

---

## 🗂️ Project Structure

```
Hotel-ganesh-billing-app/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, toaster)
│   ├── page.tsx                # Home screen — nav menu
│   ├── globals.css             # Tailwind + design tokens (OKLCH palette, radius)
│   ├── actions.ts              # Server Actions: setItemQuantity, clearOrder, saveBill, signOut
│   ├── auth/
│   │   ├── login/              # Login page
│   │   ├── sign-up/            # Sign-up page
│   │   ├── sign-up-success/    # Post-signup confirmation
│   │   ├── callback/           # OAuth / email callback handler
│   │   └── error/              # Auth error page
│   ├── dashboard/
│   │   └── page.tsx            # Sales dashboard (today's totals)
│   ├── tables/
│   │   ├── page.tsx            # All tables grid
│   │   └── [id]/
│   │       ├── page.tsx        # Per-table order page (server)
│   │       └── table-order-client.tsx  # Order UI with qty steppers, bill actions
│   ├── menu/
│   │   └── page.tsx            # Read-only menu browser
│   ├── history/
│   │   ├── page.tsx            # Bill history (server, date-filtered)
│   │   └── history-client.tsx  # Filter chips + bill list (client)
│   └── bills/
│       └── [id]/
│           ├── page.tsx        # Bill detail / receipt
│           └── saved/
│               └── page.tsx    # Post-checkout success screen
│
├── components/
│   ├── app-shell.tsx           # AppShell wrapper + AppHeader component
│   ├── brand-logo.tsx          # Hotel logo image
│   ├── auth-form.tsx           # Reusable auth form (login / sign-up)
│   ├── auth-card.tsx           # Card container for auth pages
│   ├── qty-stepper.tsx         # +/− quantity stepper (client)
│   └── ui/                     # shadcn/ui primitives (Button, Sonner, etc.)
│
├── hooks/
│   └── use-order-quantities.ts # Optimistic quantity state with serialized server writes
│
├── lib/
│   ├── data.ts                 # All Supabase data-fetching functions
│   ├── format.ts               # INR formatter, date/time utils, tax helpers
│   ├── utils.ts                # cn() class merging utility
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client (cookie-based)
│       └── proxy.ts            # Middleware session refresh logic
│
├── proxy.ts                    # Next.js middleware (session guard → /auth/login)
├── next.config.mjs             # Next.js config (TS errors ignored for build, images unoptimized)
├── package.json
└── tsconfig.json
```

---

## 🗄️ Supabase Database Schema

The app expects the following tables in your Supabase project:

| Table | Key Columns |
|---|---|
| `restaurants` | `id`, `name`, `logo_url`, `address`, `tagline`, `cgst_rate`, `sgst_rate` |
| `dining_tables` | `id`, `table_number`, `label`, `status` (`available`/`disabled`), `display_order` |
| `menu_categories` | `id`, `name`, `is_active`, `display_order` |
| `menu_items` | `id`, `category_id`, `name`, `price_paise`, `image_url`, `is_active`, `display_order` |
| `orders` | `id`, `table_id`, `status` (`open`/`closed`) |
| `order_items` | `order_id`, `menu_item_id`, `item_name_snapshot`, `unit_price_paise`, `quantity`, `line_total_paise`, `created_at` |
| `bills` | `id`, `bill_number`, `table_id`, `billed_at`, `business_date`, `subtotal_paise`, `cgst_rate`, `cgst_paise`, `sgst_rate`, `sgst_paise`, `total_paise`, `payment_method` |
| `bill_items` | `bill_id`, `item_name`, `quantity`, `unit_price_paise`, `line_total_paise`, `created_at` |

### Required RPC Functions

| Function | Parameters | Description |
|---|---|---|
| `set_order_item_quantity` | `p_table_id`, `p_menu_item_id`, `p_quantity` | Upserts/removes an order line item |
| `clear_table_order` | `p_table_id` | Deletes the open order for a table |
| `save_bill` | `p_order_id`, `p_payment_method` | Closes the order and creates a bill record |

> **Note:** Prices are stored in **paise** (1 ₹ = 100 paise) throughout the codebase.

---

## ⚙️ Setup & Installation

### 1. Prerequisites

- Node.js ≥ 20
- pnpm (preferred) or npm
- A [Supabase](https://supabase.com) project

### 2. Clone & Install

```bash
git clone <repo-url>
cd Hotel-ganesh-billing-app
pnpm install
# or
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> Get these from your Supabase Dashboard → **Project Settings → API**.

### 4. Set Up the Database

1. Go to your Supabase project → **SQL Editor**
2. Create the tables listed in the [Database Schema](#-supabase-database-schema) section
3. Create the three RPC functions (`set_order_item_quantity`, `clear_table_order`, `save_bill`)
4. Insert a row in `restaurants` with your restaurant details and tax rates
5. Add your dining tables to `dining_tables`
6. Add menu categories and items

### 5. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to `/auth/login`.

### 6. First Login

Sign up with an email and password at `/auth/sign-up`. Once confirmed, log in at `/auth/login`.

---

## 🚀 Build for Production

```bash
pnpm build
pnpm start
```

Or deploy directly to **Vercel** — Vercel Analytics is already integrated and activates automatically in production.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | Full-stack React framework (App Router) |
| [Supabase](https://supabase.com) | PostgreSQL DB + Auth + RPC functions |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | UI component primitives |
| [Sonner](https://sonner.emilkowal.ski) | Toast notifications |
| [Lucide React](https://lucide.dev) | Icon library |
| [Poppins + Playfair Display](https://fonts.google.com) | Typography |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics (production only) |

---

## 🔐 Authentication Flow

1. All routes except `/auth/*` are protected by the middleware in `proxy.ts`
2. Unauthenticated requests are redirected to `/auth/login`
3. Sessions are refreshed on every request via `lib/supabase/proxy.ts`
4. Staff can sign out from the home screen

---

## 💡 Key Design Decisions

- **Prices in paise**: Avoids floating-point rounding errors for monetary calculations
- **Serialized order writes**: The `use-order-quantities` hook queues server writes so rapid taps reach the DB in order, with optimistic UI rollback on error
- **Server Components first**: Data fetching happens in server components; only interactive parts (`qty-stepper`, filter chips) are client components
- **Mobile-first**: The app shell constrains width to `max-w-md` and uses `min-h-svh` for full-height mobile layouts

---

## 📄 License

Private — for internal use at Hotel Ganesh Pure Veg.
