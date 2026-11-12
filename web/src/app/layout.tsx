import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Nav, Footer, Reveals } from '@/components/Chrome'
import SmoothScroll from '@/components/SmoothScroll'
import Analytics from '@/components/Analytics'
import fs from 'node:fs'
import path from 'node:path'
import './globals.css'

const display = Inter_Tight({ variable: '--font-display', subsets: ['latin'], weight: ['500', '600', '700'] })
const body = Inter({ variable: '--font-body', subsets: ['latin'], weight: ['400', '500', '600'] })
const mono = JetBrains_Mono({ variable: '--font-mono', subsets: ['latin'], weight: ['400', '500', '600'] })

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#FFFFFF' }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'
const HAS_LOGO = fs.existsSync(path.join(process.cwd(), 'public/brand/logo.svg'))
const DESC = 'We build the automations your team does by hand: WhatsApp updates, CRM sync, refunds and content.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'AMC Automations | AI content and commerce automation', template: '%s | AMC Automations' },
  applicationName: 'AMC Automations',
  keywords: ['AMC Automations', 'amc.automations', 'AI automation agency', 'WhatsApp order updates', 'COD confirmation', 'CRM automation', 'AI Content Studio', 'AI Commerce Operations'],
  description: DESC,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'AMC Automations', title: 'AMC Automations | AI content and commerce automation', description: DESC, url: '/', locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title: 'AMC Automations | AI content and commerce automation', description: DESC },
}

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#org`,
    name: 'AMC Automations',
    alternateName: ['amc.automations'],
    url: SITE_URL,
    ...(HAS_LOGO ? { logo: `${SITE_URL}/brand/logo.svg` } : {}),
    email: 'atharva@amcautomations.in',
    description: 'AMC Automations builds AI automations for companies: an AI Content Studio for video editing agencies, and AI Commerce Operations (WhatsApp order updates, COD confirmation, CRM sync and refunds) for B2B, D2C and B2C brands.',
    founder: [{ '@type': 'Person', name: 'Atharva' }, { '@type': 'Person', name: 'Anirudh' }],
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'sales', email: 'atharva@amcautomations.in' },
      { '@type': 'ContactPoint', contactType: 'sales', email: 'anirudh@amcautomations.in' },
    ],
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Content Studio', url: `${SITE_URL}/ai-content-studio` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Commerce Operations', url: `${SITE_URL}/ai-commerce-operations` } },
    ],
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#site`, name: 'AMC Automations', alternateName: ['amc.automations'], url: SITE_URL, publisher: { '@id': `${SITE_URL}/#org` } },
]

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <a className="skip" href="#main">Skip to content</a>
        <Nav hasLogo={HAS_LOGO} />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <Reveals />
        <SmoothScroll />
        <Analytics />
      </body>
    </html>
  )
}
