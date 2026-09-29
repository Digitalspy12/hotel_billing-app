'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { setItemQuantity } from '@/app/actions'

export const MAX_QTY = 99

export function useOrderQuantities(tableId: string, initial: Record<string, number>) {
  const [quantities, setQuantities] = useState<Record<string, number>>(initial)
  const confirmed = useRef<Record<string, number>>({ ...initial })
  const queue = useRef<Promise<void>>(Promise.resolve())
  const [pending, setPending] = useState(0)

  const setQty = useCallback(
    (menuItemId: string, next: number) => {
      const qty = Math.max(0, Math.min(MAX_QTY, Math.trunc(next)))
      setQuantities((prev) => ({ ...prev, [menuItemId]: qty }))
      setPending((p) => p + 1)

      // Writes are serialized so rapid taps reach the server in order.
      queue.current = queue.current.then(async () => {
        const result = await setItemQuantity(tableId, menuItemId, qty)
        if (result.ok) {
          confirmed.current[menuItemId] = qty
        } else {
          toast.error(result.error)
          setQuantities((prev) => ({ ...prev, [menuItemId]: confirmed.current[menuItemId] ?? 0 }))
        }
        setPending((p) => p - 1)
      })
    },
    [tableId],
  )

  const waitForSync = useCallback(() => queue.current, [])

  return { quantities, setQty, isSyncing: pending > 0, waitForSync }
}
