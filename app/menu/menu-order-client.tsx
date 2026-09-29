'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Trash2, Plus, X, Loader2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { addMenuItem, removeMenuItem } from '@/app/actions'
import { formatINR } from '@/lib/format'
import type { MenuItem, MenuCategory } from '@/lib/data'
import { cn } from '@/lib/utils'

function AddItemForm({
  categories,
  onClose,
}: {
  categories: MenuCategory[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id ?? '')
  const [catOpen, setCatOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCatName = categories.find((c) => c.id === selectedCat)?.name ?? 'Select category'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('category_id', selectedCat)
    startTransition(async () => {
      const result = await addMenuItem(fd)
      if (result.ok) {
        toast.success('Item added to menu')
        onClose()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Add Menu Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Category dropdown */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                aria-expanded={catOpen}
              >
                <span>{selectedCatName}</span>
                <ChevronDown
                  className={cn(
                    'size-4 text-muted-foreground transition-transform',
                    catOpen && 'rotate-180',
                  )}
                />
              </button>
              {catOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-border bg-card shadow-lg">
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCat(cat.id)
                            setCatOpen(false)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                        >
                          <Check
                            className={cn(
                              'size-4 shrink-0',
                              cat.id === selectedCat ? 'text-primary' : 'text-transparent',
                            )}
                          />
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Item name */}
          <div>
            <label
              htmlFor="item-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Item Name
            </label>
            <input
              id="item-name"
              name="name"
              type="text"
              required
              placeholder="e.g. Masala Dosa"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="item-price"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                ₹
              </span>
              <input
                id="item-price"
                name="price"
                type="number"
                min="0"
                step="0.50"
                required
                placeholder="0.00"
                className="w-full rounded-xl border border-border bg-background py-3 pl-8 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}
            Add Item
          </button>
        </form>
      </div>
    </div>
  )
}

export function MenuManageClient({
  categories,
  menuItems,
}: {
  categories: MenuCategory[]
  menuItems: MenuItem[]
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeCatId, setActiveCatId] = useState<string>('all')
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  const visibleItems =
    activeCatId === 'all'
      ? menuItems
      : menuItems.filter((i) => i.category_id === activeCatId)

  async function handleRemove(item: MenuItem) {
    if (!confirm(`Remove "${item.name}" from the menu?`)) return
    setRemoving((prev) => new Set(prev).add(item.id))
    const result = await removeMenuItem(item.id)
    if (result.ok) {
      toast.success(`"${item.name}" removed`)
    } else {
      toast.error(result.error)
      setRemoving((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  return (
    <>
      {/* Category filter chips */}
      <div className="border-b border-border bg-card">
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          <button
            onClick={() => setActiveCatId('all')}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              activeCatId === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
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
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pb-24">
        {/* Item count */}
        <p className="text-xs font-medium text-muted-foreground">
          {visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''}
        </p>

        {visibleItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div>
              <p className="text-sm text-muted-foreground">No items in this category.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                + Add first item
              </button>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleItems.map((item) => {
              const isRemoving = removing.has(item.id)
              const catName = categories.find((c) => c.id === item.category_id)?.name

              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border bg-card px-3 py-3 shadow-sm transition-opacity',
                    isRemoving && 'opacity-50 pointer-events-none',
                  )}
                >
                  {/* Image */}
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
                      <div className="flex size-full items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>

                  {/* Name + category + price */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate">{item.name}</p>
                    {catName && (
                      <p className="text-[11px] text-muted-foreground">{catName}</p>
                    )}
                    <p className="text-sm font-bold text-primary">{formatINR(item.price_paise)}</p>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={isRemoving}
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    aria-label={`Remove ${item.name}`}
                  >
                    {isRemoving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* FAB — Add Item */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="size-5" />
          Add New Item
        </button>
      </div>

      {/* Add item modal */}
      {showAddForm && (
        <AddItemForm categories={categories} onClose={() => setShowAddForm(false)} />
      )}
    </>
  )
}
