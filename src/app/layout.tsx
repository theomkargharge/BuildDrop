import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BuildDrop — Ship builds. Notify teams.',
  description: 'The fastest way to distribute app builds to your team.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}