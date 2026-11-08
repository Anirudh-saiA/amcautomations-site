import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Nav, Footer, Reveals } from '@/components/Chrome'
import SmoothScroll from '@/components/SmoothScroll'
import './globals.css'

const display = Inter_Tight({ variable: '--font-display', subsets: ['latin'], weight: ['500', '600', '700'] })
const body = Inter({ variable: '--font-body', subsets: ['latin'], weight: ['400', '500', '600'] })
const mono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'], weight: ['400', '500', '600'] })

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#FFFFFF' }

export const metadata: Metadata = {
  title: 'amc.automations | AI agents and automations for companies',
  description: 'We build the automations your team does by hand: follow-ups, WhatsApp updates, content and outbound.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <Reveals />
        <SmoothScroll />
      </body>
    </html>
  )
}
