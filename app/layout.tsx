import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'DigitalArtChain — Bukti Digital, Tanpa Perantara',
  description: 'Buat bukti digital dengan fingerprint SHA-256. File asli tetap privat di perangkat; identitas karya dapat diverifikasi.',
  generator: 'DigitalArtChain',
  openGraph: {
    title: 'DigitalArtChain — Bukti Digital, Tanpa Perantara',
    description: 'Buat bukti digital dengan fingerprint SHA-256. File asli tetap privat di perangkat; identitas karya dapat diverifikasi.',
    siteName: 'DigitalArtChain',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
