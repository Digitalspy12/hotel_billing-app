'use client'

import { useRouter } from 'next/navigation'

/** Date input for the History header — must be 'use client' to use onChange */
export function HistoryDateInput({ currentDate }: { currentDate: string }) {
  const router = useRouter()

  return (
    <input
      type="date"
      defaultValue={currentDate}
      onChange={(e) => {
        if (e.target.value) {
          router.push(`/history?date=${e.target.value}`)
        }
      }}
      className="rounded-lg border border-white/30 bg-transparent px-2 py-1 text-xs text-primary-foreground outline-none cursor-pointer"
      aria-label="Select date"
    />
  )
}
