import { AppShell } from '@/components/app-shell'
import { BrandLogo } from '@/components/brand-logo'

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <AppShell className="px-6 py-10">
      <main className="flex flex-1 flex-col justify-center gap-6">
        <BrandLogo priority className="mx-auto max-w-64" />
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold text-balance">{title}</h1>
          <p className="text-sm text-muted-foreground text-pretty">{description}</p>
        </div>
        {children}
      </main>
    </AppShell>
  )
}
