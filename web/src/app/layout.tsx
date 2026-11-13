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
  title: { default: 'AMC Automations | AI · Media · Commerce automation', template: '%s | AMC Automations' },
  applicationName: 'AMC Automations',
  keywords: ['AMC Automations', 'AMC', 'AI Media Commerce', 'amc.automations', 'AI automation agency', 'WhatsApp order updates', 'COD confirmation', 'CRM automation', 'AI Content Studio', 'AI Commerce Operations'],
  description: DESC,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'AMC Automations', title: 'AMC Automations | AI · Media · Commerce automation', description: DESC, url: '/', locale: 'en_IN' },
  twitter: { card: 'summary_large_image', title: 'AMC Automations | AI · Media · Commerce automation', description: DESC },
}

const PHONE = '+91 70759 69025'
const LOGO = `${SITE_URL}/assets/amc-logo-512.png`
/* add the real profile links here as they exist (LinkedIn page, Instagram, YouTube channel, Google Business Profile):
   they tell Google these pages are the same business, which is what builds the knowledge panel */
const SAME_AS: string[] = []

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${SITE_URL}/#org`,
    name: 'AMC Automations',
    legalName: 'AMC Automations',
    alternateName: ['AMC', 'AMC Automations India', 'amc.automations', 'AI Media Commerce Automations'],
    slogan: 'AI · Media · Commerce',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512 },
    image: LOGO,
    email: 'atharva@amcautomations.in',
    telephone: PHONE,
    description: 'AMC Automations builds AI automations for companies: an AI Content Studio for video editing agencies, and AI Commerce Operations (WhatsApp order updates, COD confirmation, CRM sync and refunds) for B2B, D2C and B2C brands.',
    areaServed: [{ '@type': 'Country', name: 'India' }, { '@type': 'Place', name: 'Worldwide (remote)' }],
    knowsAbout: ['AI automation', 'WhatsApp Business API', 'CRM automation', 'COD order confirmation', 'AI video editing', 'n8n workflows', 'Shopify automation'],
    founder: [{ '@type': 'Person', name: 'Atharva Bhutada' }, { '@type': 'Person', name: 'Anirudh' }],
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'sales', email: 'atharva@amcautomations.in', telephone: PHONE, areaServed: 'IN', availableLanguage: ['English', 'Hindi', 'Telugu'] },
      { '@type': 'ContactPoint', contactType: 'sales', email: 'anirudh@amcautomations.in', areaServed: 'IN', availableLanguage: ['English', 'Hindi', 'Telugu'] },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Content Studio', description: 'One long video in, finished captioned vertical Shorts out, for video editing agencies.', url: `${SITE_URL}/ai-content-studio` } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Commerce Operations', description: 'WhatsApp order updates, COD confirmation, CRM sync, refunds and reminders for B2B, D2C and B2C brands.', url: `${SITE_URL}/ai-commerce-operations` } },
      ],
    },
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#site`, name: 'AMC Automations', alternateName: ['AMC', 'amc.automations'], url: SITE_URL, inLanguage: 'en-IN', publisher: { '@id': `${SITE_URL}/#org` } },
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
