import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/assets/logo.png"
      alt="Hotel Ganesh Pure Veg logo"
      width={708}
      height={540}
      priority={priority}
      className={cn('h-auto w-full', className)}
    />
  )
}
