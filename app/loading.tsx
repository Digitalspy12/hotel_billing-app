import { Loader2 } from 'lucide-react'
import { AppShell, AppHeader } from '@/components/app-shell'

export default function GlobalLoading() {
  return (
    <AppShell>
      <AppHeader title="Loading..." backHref="/" />
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-muted-foreground gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading data...</p>
      </div>
    </AppShell>
  )
}
