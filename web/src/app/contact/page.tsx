import type { Metadata } from 'next'
import { SITE } from '@/lib/content'
import { PageHead } from '@/components/Ui'
import JsonLd, { BASE_URL } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact AMC Automations on WhatsApp or by email. Two founders, one inbox each. Tell us what should run on its own.',
  alternates: { canonical: '/contact' },
}

const PHONE_DISPLAY = '+91 70759 69025'

export default function Contact() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'ContactPage', url: `${BASE_URL}/contact`, name: 'Contact AMC Automations',
        about: { '@id': `${BASE_URL}/#org` },
      }} />
      <PageHead tone="blue" eyebrow="Contact" title={<>Tell us what should <em>run on its own.</em></>} lead="Write to either founder, or start on WhatsApp. We reply with whether it can be automated and how." />
      <section className="sec">
        <div className="mails">
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" data-reveal>
            <small>WhatsApp</small>
            <span>{PHONE_DISPLAY}</span>
          </a>
          {SITE.emails.map((m) => (
            <a key={m} href={`mailto:${m}`} data-reveal>
              <small>{m.split('@')[0]}</small>
              <span>{m}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
