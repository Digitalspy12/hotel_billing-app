import Link from 'next/link'
import { ArrowLeft, Menu as MenuIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto flex min-h-svh w-full max-w-md flex-col bg-background shadow-sm print:max-w-none print:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function AppHeader({
  title,
  backHref,
  action,
}: {
  title: string
  backHref?: string
  action?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 bg-primary px-2 text-primary-foreground print:hidden shadow-sm">
      {/* Left: back button or menu icon */}
      <div className="flex w-12 justify-start">
        <Link
          href={backHref ?? '/'}
          className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:bg-white/25"
          aria-label={backHref ? 'Go back' : 'Home'}
        >
          {backHref ? (
            <ArrowLeft className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </Link>
      </div>

      {/* Title */}
      <h1 className="flex-1 truncate text-center text-base font-bold tracking-wide text-balance">
        {title}
      </h1>

      {/* Right: action slot */}
      <div className="flex w-12 justify-end">{action}</div>
    </header>
  )
}
