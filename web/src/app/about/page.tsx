import type { Metadata } from 'next'
import Link from 'next/link'
import { ABOUT_FAQ, BUILD_STEPS, SITE } from '@/lib/content'
import JsonLd, { BASE_URL, faqLd } from '@/components/JsonLd'
import { Faq } from '@/components/Widgets'
import { CtaBand, PageHead, SectionHead } from '@/components/Ui'
import AgencyMotion from '@/components/AgencyMotion'

export const metadata: Metadata = {
  title: 'About us',
  description: 'amc.automations builds AI content and commerce automations for companies, and hands them over working. Run by Atharva and Anirudh.',
  alternates: { canonical: '/about' },
}

const PRODUCTS = [
  { href: '/ai-content-studio', tag: 'AI Content Studio', title: 'Long video in. Shorts out.', text: 'For video editing agencies. The system finds the best moments, cuts, captions and reframes them. Your editors review and deliver.' },
  { href: '/ai-commerce-operations', tag: 'AI Commerce Operations', title: 'Your store, running on its own.', text: 'For B2B, D2C and B2C brands. Order updates, COD confirmation, CRM sync and refunds, handled on WhatsApp by your rules.' },
]

const RULES = [
  { title: 'You own it', text: 'It runs on your accounts and your keys. Nothing is locked to us.' },
  { title: 'A person approves', text: 'You stay in control. Nothing important goes out without a human saying yes.' },
  { title: 'Your tools stay yours', text: 'We connect what you already use: WhatsApp, your CRM, Sheets, Gmail. No new software to learn.' },
]

export default function About() {
  return (
    <div className="theme-blue">
      <JsonLd data={faqLd(ABOUT_FAQ)} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'AboutPage', url: `${BASE_URL}/about`, name: 'About AMC Automations',
        about: { '@id': `${BASE_URL}/#org` },
        mainEntity: { '@id': `${BASE_URL}/#org` },
      }} />
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'Person', name: 'Atharva Bhutada', jobTitle: 'Founder', email: 'atharva@amcautomations.in', worksFor: { '@id': `${BASE_URL}/#org` } },
        { '@context': 'https://schema.org', '@type': 'Person', name: 'Anirudh', jobTitle: 'Founder', email: 'anirudh@amcautomations.in', worksFor: { '@id': `${BASE_URL}/#org` } },
      ]} />
      <AgencyMotion />
      <PageHead
        tone="blue"
        bg="about-hero"
        title={<>We build the busywork <em>out of your week.</em></>}
        lead="We build AI content and commerce automations for companies, and hand them over working. Run by Atharva and Anirudh."
      />

      <section className="sec">
        <SectionHead title="What we do." lead="Two products, each built for one kind of business." />
        <div className="prod">
          {PRODUCTS.map((p) => (
            <Link key={p.href} href={p.href} data-reveal>
              <small>{p.tag}</small>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <span>See how it works <i aria-hidden="true">→</i></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec tint">
        <SectionHead title="How we work." lead="Four steps, written down before anything is built." />
        <ol className="pipe">
          {BUILD_STEPS.map((s, i) => (
            <li key={s.title} data-reveal>
              <i aria-hidden="true">{i + 1}</i>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <SectionHead title="Simple rules." />
        <div className="rules">
          {RULES.map((r, i) => (
            <article key={r.title} data-reveal>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec">
        <SectionHead title="Questions we get asked." lead="Short answers about who we are and how we work." />
        <Faq items={ABOUT_FAQ} />
      </section>

      <section className="sec tint">
        <SectionHead title="Talk to us." lead="Two people, one inbox each. Write to either of us." />
        <div className="mails">
          {SITE.emails.map((m) => (
            <a key={m} href={`mailto:${m}`} data-reveal>
              <small>{m.split('@')[0]}</small>
              <span>{m}</span>
            </a>
          ))}
        </div>
      </section>

      <CtaBand title="Tell us what should run on its own." text="You get a reply within a day on whether it can be automated and how." />
    </div>
  )
}
