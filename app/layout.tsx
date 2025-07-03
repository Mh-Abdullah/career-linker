// app/layout.tsx
import './globals.css'
import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CareerLinker',
  description: 'Find your dream job with CareerLinker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
    <body className="bg-background text-foreground antialiased">
      <Providers>
        {children}
      </Providers>
    </body>
  </html>

  )
}
