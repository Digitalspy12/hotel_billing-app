import Link from 'next/link'
import { BarChart3, ChevronRight, Armchair, UtensilsCrossed, LogOut } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BrandLogo } from '@/components/brand-logo'
import { getRestaurant } from '@/lib/data'
import { signOut } from '@/app/actions'

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    primary: true,
  },
  { href: '/tables', label: 'Tables', icon: Armchair, primary: false },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed, primary: false },
]

export default async function HomePage() {
  const restaurant = await getRestaurant()

  return (
    <AppShell className="px-5 pb-6 pt-8">
      <main className="flex flex-1 flex-col gap-8">
        {/* Brand identity */}
        <div className="flex flex-col items-center gap-2">
          <BrandLogo priority className="max-w-72" />
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {restaurant?.address ?? 'Aavad Tumchi, Chaav Aamchi'}
          </p>
        </div>

        {/* Navigation cards */}
        <nav aria-label="Main navigation" className="flex flex-col gap-3">
          {NAV.map(({ href, label, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={[
                'flex h-16 items-center gap-4 rounded-2xl border-2 px-5 text-lg font-semibold shadow-sm transition-all active:scale-[0.98]',
                primary
                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
                  : 'border-primary/20 bg-card text-foreground hover:border-primary/40 hover:bg-accent/50',
              ].join(' ')}
            >
              <Icon
                className={['size-6 shrink-0', primary ? 'text-primary-foreground/80' : 'text-primary'].join(' ')}
                aria-hidden
              />
              <span className="flex-1">{label}</span>
              <ChevronRight
                className={['size-5', primary ? 'text-primary-foreground/70' : 'text-primary'].join(' ')}
                aria-hidden
              />
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center gap-4">
          <p className="text-center font-script text-2xl italic leading-snug text-primary">
            {restaurant?.tagline ?? 'Good Food Brings People Together'}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>v1.0</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1 transition-colors hover:text-primary"
              >
                <LogOut className="size-3.5" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
