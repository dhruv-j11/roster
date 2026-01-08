import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roster - Workforce Optimization Dashboard',
  description: 'Analyze employee data and optimize your workforce',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

