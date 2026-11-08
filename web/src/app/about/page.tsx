import type { Metadata } from 'next'
import { BUILD_STEPS, SITE } from '@/lib/content'
import { CtaBand, PageHead, SectionHead } from '@/components/Ui'

export const metadata: Metadata = { title: 'About us | amc.automations' }

export default function About() {
  return (
    <>
      <PageHead
        tone="blue"
        eyebrow="About us"
        title={<>We build the busywork <em>out of your week.</em></>}
        lead={`${SITE.name} builds AI agents and automations for companies: follow-ups, WhatsApp updates, content and outbound. It is run by ${SITE.person}.`}
      />

      <section className="sec">
        <SectionHead kicker="How we work" title="Four steps, in writing." />
        <div className="trio">
          {BUILD_STEPS.map((s, i) => (
            <article className="tcard" key={s.title} data-reveal>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec tint">
        <SectionHead kicker="What we promise" title="Simple rules." />
        <div className="trio">
          <article className="tcard plain" data-reveal><h3>You own it</h3><p>It runs on your accounts and your keys. Nothing is locked to us.</p></article>
          <article className="tcard plain" data-reveal><h3>A person approves</h3><p>{SITE.approval}</p></article>
          <article className="tcard plain" data-reveal><h3>No tool switching</h3><p>We connect the tools you already use: WhatsApp, Gmail, Sheets, your CRM and calendar.</p></article>
        </div>
      </section>

      <CtaBand title="Tell us what should run on its own." text="You get a reply within a day on whether it can be automated and how." />
    </>
  )
}
