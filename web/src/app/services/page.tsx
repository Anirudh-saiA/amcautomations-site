import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { BUILD_STEPS, SERVICES_FAQ, SITE } from '@/lib/content'
import { PageHead, SectionHead } from '@/components/Ui'
import { BriefForm, Faq } from '@/components/Widgets'
import AgencyMotion from '@/components/AgencyMotion'

export const metadata: Metadata = { title: 'AI Commerce Operations | amc.automations' }

/* background video for the header: used automatically once public/assets/clips/services-hero.mp4 exists */
const HERO_BG = fs.existsSync(path.join(process.cwd(), 'public/assets/clips/services-hero.mp4')) ? 'services-hero' : undefined

const ICON = {
  whatsapp: <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />,
  cod: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6 9.5v.01M18 14.5v.01" /></g>,
  crm: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></g>,
  refund: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></g>,
}

const HANDLES = [
  { n: '01', icon: 'whatsapp' as const, tag: 'WhatsApp', title: 'Order updates', text: 'Placed, packed, shipped, out for delivery. Every customer hears it first from you.' },
  { n: '02', icon: 'cod' as const, tag: 'COD', title: 'COD confirmation', text: 'Each COD order is confirmed on WhatsApp before it ships, so fewer parcels come back.' },
  { n: '03', icon: 'crm' as const, tag: 'CRM', title: 'CRM sync', text: 'Every order and customer lands in your CRM, clean and without copy-paste.' },
  { n: '04', icon: 'refund' as const, tag: 'Returns', title: 'Refunds by your rules', text: 'Return requests are checked against your policy, then approved or escalated.' },
]

const AUDIENCE = [
  { img: 'b2b', tag: 'B2B brands', title: 'Win and keep business accounts', text: 'Qualify leads, send quotes, chase invoices and keep every account followed up.', points: ['Lead qualifying and follow-ups', 'Quotes, invoices, payment reminders'],
    icon: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="10" height="18" rx="1.5" /><path d="M14 9h5a1 1 0 0 1 1 1v11H14M8 7h2M8 11h2M8 15h2" /></g> },
  { img: 'd2c', tag: 'D2C brands', title: 'Ship more, with fewer returns', text: 'Confirm COD, update every order, sync your CRM and handle refunds by your rules.', points: ['COD confirmation, order updates', 'Abandoned carts, refunds, CRM sync'],
    icon: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></g> },
  { img: 'b2c', tag: 'B2C customers', title: 'Answer every customer, any hour', text: 'Support, bookings and reminders on WhatsApp, so no message waits until morning.', points: ['Support and bookings on WhatsApp', 'Reminders and feedback requests'],
    icon: <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.5a3 3 0 0 1 0 5.6M18 14.4c1.8.8 3 2.6 3 4.6" /></g> },
]

const SERVICES = [
  'WhatsApp order updates and support agents',
  'COD confirmation and address checks',
  'CRM setup and sync (HubSpot, Zoho, Sheets)',
  'Refund and return workflows',
  'Abandoned cart and re-order reminders',
  'Lead qualifying and follow-ups',
  'Invoices, quotes and payment reminders',
  'Daily reports sent to your inbox',
]

const JOURNEY = [
  { who: 'Customer', title: 'Places an order', text: 'From your store.' },
  { who: 'System', title: 'Confirms COD', text: 'On WhatsApp, in minutes.' },
  { who: 'System', title: 'Updates the CRM', text: 'Order and customer synced.' },
  { who: 'System', title: 'Keeps them posted', text: 'Shipping and delivery updates.' },
  { who: 'System', title: 'Handles refunds', text: 'Approved by your rules.' },
]

export default function Services() {
  return (
    <div className="theme-orange">
      <AgencyMotion />
      <PageHead
        tone="orange"
        bg={HERO_BG}
        title={<>Your store, <em>running on its own.</em></>}
        lead="Order updates, COD confirmation, CRM sync and refunds, handled on WhatsApp by your rules."
      >
        <a className="btn wa" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Talk on WhatsApp</a>
        <a className="btn ghost dark" href="#brief">Send the brief instead</a>
      </PageHead>

      <section className="sec">
        <SectionHead title="What it handles." lead="The same few steps every day, off your team's plate." />
        <div className="handles">
          {HANDLES.map((h) => (
            <article key={h.title} data-reveal>
              <div className="h-top">
                <b>{h.n}</b>
                <span className={`h-ic ${h.icon}`}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{ICON[h.icon]}</svg></span>
              </div>
              <small>{h.tag}</small>
              <h3>{h.title}</h3>
              <p>{h.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec tint">
        <SectionHead title="Who it is for." lead="B2B, D2C and B2C. Same system, set up around how you sell." />
        <div className="aud">
          {AUDIENCE.map((a) => (
            <article key={a.tag} data-reveal>
              <div className="aud-img" style={{ backgroundImage: `url(/assets/aud-${a.img}.jpg)` }} aria-hidden="true" />
              <span className="h-ic"><svg viewBox="0 0 24 24" aria-hidden="true">{a.icon}</svg></span>
              <small>{a.tag}</small>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <ul>{a.points.map((x) => <li key={x}>{x}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="sec">
        <SectionHead title="Services we do." lead="Pick one, or combine them." />
        <ol className="svc">
          {SERVICES.map((t, i) => (
            <li key={t} data-reveal><b>{String(i + 1).padStart(2, '0')}</b><span>{t}</span></li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <SectionHead title="One order, start to finish." lead="Nobody on your team touches it." />
        <ol className="flow">
          {JOURNEY.map((s, i) => (
            <li key={s.title} data-reveal className={s.who === 'System' && i === 1 ? 'sys-step' : ''}>
              <span className="who">{s.who}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <i aria-hidden="true">{i + 1}</i>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec tint">
        <SectionHead title="How we build it." lead="Four steps, written down before anything is built." />
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

      <section className="sec split" id="brief">
        <div className="split-copy">
          <SectionHead title="Tell me what eats your week." lead="One line is enough. Reply within a day." />
        </div>
        <div className="split-form" data-reveal>
          <BriefForm />
        </div>
      </section>

      <section className="sec tint">
        <SectionHead title="Before you ask." />
        <Faq items={SERVICES_FAQ} />
      </section>
    </div>
  )
}
