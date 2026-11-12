import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { PEOPLE, personBySlug, prettyPhone } from '@/lib/people'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ who: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ who: string }> }): Promise<Metadata> {
  const p = personBySlug((await params).who)
  return { title: p ? `${p.name}, AMC Automations` : 'Card', robots: { index: false, follow: false } }
}

/* a phone-first digital business card: save the contact in one tap, message on WhatsApp, or scan the code */
export default async function Card({ params }: { params: Promise<{ who: string }> }) {
  const p = personBySlug((await params).who)
  if (!p) notFound()
  const url = `${BASE}/card/${p.slug}`
  const qr = await QRCode.toString(url, { type: 'svg', margin: 1, color: { dark: '#1E1C18', light: '#FFFFFF' }, errorCorrectionLevel: 'M' })
  const wa = p.phone ? `https://wa.me/${p.phone}?text=${encodeURIComponent('Hi ' + p.name.split(' ')[0] + ', we met at the event. I would like to talk about AMC Automations.')}` : null

  return (
    <section className="dcard">
      <div className="dcard-in">
        <div className="dcard-brand">AMC<small>Automations</small></div>
        <h1>{p.name}</h1>
        <p className="dcard-role">{p.role}, AMC Automations</p>
        <p className="dcard-line">We build AI content and commerce automations for companies.</p>

        <a className="btn blue dcard-save" href={`/card/${p.slug}/vcf`}>Save contact</a>
        <ul className="dcard-links">
          {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer"><b>WhatsApp</b><span>{prettyPhone(p.phone!)}</span></a></li>}
          {p.phone && <li><a href={`tel:+${p.phone}`}><b>Call</b><span>{prettyPhone(p.phone)}</span></a></li>}
          <li><a href={`mailto:${p.email}`}><b>Email</b><span>{p.email}</span></a></li>
          <li><a href={BASE}><b>Website</b><span>amcautomations.in</span></a></li>
        </ul>

        <div className="dcard-qr">
          <div dangerouslySetInnerHTML={{ __html: qr }} aria-label={`QR code for ${p.name}'s card`} role="img" />
          <small>Scan to open this card</small>
        </div>
      </div>
    </section>
  )
}
