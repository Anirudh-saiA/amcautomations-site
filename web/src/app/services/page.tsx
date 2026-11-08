import type { Metadata } from 'next'
import { BUILD_STEPS, ENGINES, SERVICES_FAQ, SITE } from '@/lib/content'
import { PageHead, SectionHead } from '@/components/Ui'
import { BriefForm, Faq } from '@/components/Widgets'

export const metadata: Metadata = { title: 'Done for you | amc.automations' }

export default function Services() {
  return (
    <>
      <PageHead
        tone="orange"
        eyebrow="Done for you · Taking new builds this month"
        title={<>Your busywork, <em>running on its own.</em></>}
        lead="We build AI agents and automations for your business: designed around your tools, tested on your real data, and handed over working."
      >
        <a className="btn blue" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Talk on WhatsApp</a>
        <a className="btn ghost dark" href="#brief">Send the brief instead</a>
        <p className="stack">n8n for the plumbing · Claude for the thinking · your tools stay yours</p>
      </PageHead>

      <section className="sec">
        <SectionHead kicker="What we build" title="Four engines. Pick the one that hurts most." />
        <div className="bento">
          {ENGINES.map((e, i) => (
            <article className={`bcard ${e.tone}${e.big ? ' big' : ''}`} key={e.title} data-reveal style={{ ['--i' as string]: i }}>
              <span className="tag">{e.tag}</span>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec tint">
        <SectionHead kicker="How it goes" title="From first call to running on its own." />
        <ol className="timeline">
          {BUILD_STEPS.map((s, i) => (
            <li key={s.title} data-reveal>
              <span className="tl-n">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec split" id="brief">
        <div className="split-copy">
          <SectionHead kicker="Send the brief" title="Tell me what eats your week." lead="One line is enough. You get a reply within a day on whether it can be automated and how." />
        </div>
        <div className="split-form" data-reveal>
          <BriefForm />
        </div>
      </section>

      <section className="sec">
        <SectionHead kicker="Straight answers" title="Before you ask." />
        <Faq items={SERVICES_FAQ} />
      </section>
    </>
  )
}
