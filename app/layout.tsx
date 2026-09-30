// © 2026 AK 0121 Agency — All rights reserved.
// Team: Fall_AK
// Project: Hotel Ganesh Billing App

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-script',
})

export const metadata: Metadata = {
  title: 'Hotel Ganesh Billing',
  description:
    'Lightweight table, order and billing app for Hotel Ganesh Pure Veg staff.',
  generator: 'v0.app',
  icons: {
    icon: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#c8102e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`light ${poppins.variable} ${playfair.variable}`}>
      <body className="bg-muted font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
