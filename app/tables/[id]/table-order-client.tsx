'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, ShoppingCart, Plus, Minus, ChevronDown, Loader2 } from 'lucide-react'
import { QtyStepper } from '@/components/qty-stepper'
import { useOrderQuantities } from '@/hooks/use-order-quantities'
import { formatINR } from '@/lib/format'
import type { MenuItem, MenuCategory, OrderLine } from '@/lib/data'
import { cn } from '@/lib/utils'

export function TableOrderClient({
  tableId,
  tableName,
  categories,
  menuItems,
  orderId,
  initialLines,
}: {
  tableId: string
  tableName: string
  categories: MenuCategory[]
  menuItems: MenuItem[]
  orderId: string | null
  initialLines: OrderLine[]
}) {
  const initial: Record<string, number> = {}
  for (const line of initialLines) {
    initial[line.menu_item_id] = line.quantity
  }

  const { quantities, setQty, isSyncing } = useOrderQuantities(tableId, initial)

  const [activeCatId, setActiveCatId] = useState<string>(categories[0]?.id ?? '')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const activeCat = categories.find((c) => c.id === activeCatId) ?? categories[0]

  const visibleItems = useMemo(() => {
    const inCat = menuItems.filter((i) => i.category_id === activeCatId)
    if (!searchQuery.trim()) return inCat
    const q = searchQuery.toLowerCase()
    return inCat.filter((i) => i.name.toLowerCase().includes(q))
  }, [menuItems, activeCatId, searchQuery])

  // Cart totals
  const cartItems = menuItems.filter((i) => (quantities[i.id] ?? 0) > 0)
  const totalItems = cartItems.reduce((s, i) => s + (quantities[i.id] ?? 0), 0)
  const totalPaise = cartItems.reduce(
    (s, i) => s + i.price_paise * (quantities[i.id] ?? 0),
    0,
  )
  const hasCart = totalItems > 0

  return (
    <div className="flex flex-1 flex-col">
      {/* Category chips (horizontal scroll) */}
      <div className="border-b border-border bg-card">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCatId(cat.id)
                setSearchQuery('')
              }}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                cat.id === activeCatId
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category dropdown + Search row */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {/* Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              aria-expanded={dropdownOpen}
            >
              <span className="truncate">{activeCat?.name ?? 'Category'}</span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-muted-foreground transition-transform',
                  dropdownOpen && 'rotate-180',
                )}
              />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 top-full z-40 mt-1 w-full rounded-xl border border-border bg-card shadow-lg">
                <ul className="max-h-60 overflow-y-auto py-1">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          setActiveCatId(cat.id)
                          setDropdownOpen(false)
                          setSearchQuery('')
                        }}
                        className={cn(
                          'flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-muted',
                          cat.id === activeCatId && 'font-semibold text-primary',
                        )}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Search toggle */}
          <button
            onClick={() => {
              setSearchOpen((o) => !o)
              if (searchOpen) setSearchQuery('')
            }}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            aria-label="Search dishes"
          >
            {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </button>
        </div>

        {/* Search input */}
        {searchOpen && (
          <div className="px-4 pb-3">
            <input
              type="search"
              placeholder={`Search in ${activeCat?.name ?? 'menu'}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}
      </div>

      {/* Dish list */}
      <div className={cn('flex-1 overflow-y-auto p-4', hasCart && 'pb-24')}>
        {visibleItems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {searchQuery
              ? `No dishes found for "${searchQuery}"`
              : 'No dishes in this category.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleItems.map((item) => {
              const qty = quantities[item.id] ?? 0
              const isAdded = qty > 0
              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border bg-card px-3 py-3 shadow-sm transition-colors',
                    isAdded && 'border-primary/30 bg-primary/5',
                  )}
                >
                  {/* Dish image */}
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Name + Price */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">{item.name}</p>
                    <p className="text-sm font-bold text-primary">
                      {formatINR(item.price_paise)}
                    </p>
                  </div>

                  {/* Qty control */}
                  {isAdded ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQty(item.id, qty - 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-primary/40 text-primary transition-colors hover:bg-primary/10"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-primary/40 px-1 text-sm font-bold text-primary tabular-nums">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(item.id, qty + 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-primary/40 text-primary transition-colors hover:bg-primary/10"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setQty(item.id, 1)}
                      className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow transition-colors hover:bg-primary/90 active:scale-95"
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus className="size-5" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Sticky cart bar */}
      {hasCart && (
        <div className="fixed bottom-0 left-0 right-0 z-30 cart-bar">
          <div className="mx-auto max-w-md px-4">
            <Link
              href={`/tables/${tableId}/bill`}
              className="flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 text-primary-foreground">
                <ShoppingCart className="size-5" />
                {isSyncing && <Loader2 className="size-4 animate-spin" />}
                <span className="text-sm font-semibold">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="flex-1 text-center text-base font-bold text-primary-foreground tabular-nums">
                {formatINR(totalPaise)}
              </span>
              <span className="text-sm font-semibold text-primary-foreground/90">
                View Bill →
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
