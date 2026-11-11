import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Nav, Footer, Reveals } from '@/components/Chrome'
import SmoothScroll from '@/components/SmoothScroll'
import './globals.css'

const display = Inter_Tight({ variable: '--font-display', subsets: ['latin'], weight: ['500', '600', '700'] })
const body = Inter({ variable: '--font-body', subsets: ['latin'], weight: ['400', '500', '600'] })
const mono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'], weight: ['400', '500', '600'] })

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#FFFFFF' }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'
const DESC = 'We build the automations your team does by hand: WhatsApp updates, CRM sync, refunds and content.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'amc.automations | AI agents and automations for companies', template: '%s | amc.automations' },
  description: DESC,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'amc.automations', title: 'amc.automations', description: DESC, url: '/', locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title: 'amc.automations', description: DESC },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'amc.automations',
  url: SITE_URL,
  email: 'atharva@amcautomations.in',
  description: DESC,
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'sales', email: 'atharva@amcautomations.in' },
    { '@type': 'ContactPoint', contactType: 'sales', email: 'anirudh@amcautomations.in' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
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
