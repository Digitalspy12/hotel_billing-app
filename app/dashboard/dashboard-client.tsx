'use client'

import { useRouter } from 'next/navigation'
import { CalendarDays } from 'lucide-react'

export function DateFilterInput({ currentDate }: { currentDate: string }) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value) {
      router.push(`/dashboard?date=${e.target.value}`)
    }
  }

  return (
    <label
      htmlFor="dash-date"
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
    >
      <CalendarDays className="size-4 text-primary shrink-0" />
      <input
        id="dash-date"
        type="date"
        defaultValue={currentDate}
        onChange={handleChange}
        className="border-0 bg-transparent text-sm font-medium outline-none cursor-pointer"
      />
    </label>
  )
}

export function QuickActionLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="flex flex-1 items-center justify-between rounded-xl border border-primary/20 bg-card px-4 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5 active:scale-[0.98]"
    >
      <span>{children}</span>
      <span className="text-primary/60">›</span>
    </a>
  )
}
