import type { Metadata } from 'next'
import { AGENCY, SITE, VIDEO_STYLES } from '@/lib/content'
import { CtaBand, PageHead, SectionHead } from '@/components/Ui'
import { Faq, VideoCard } from '@/components/Widgets'
import JsonLd, { faqLd, serviceLd } from '@/components/JsonLd'
import AgencyMotion from '@/components/AgencyMotion'

export const metadata: Metadata = {
  title: 'AI Content Studio',
  description: 'For video editing agencies: a long video goes in, finished captioned Shorts come out. Your editors review and deliver, and handle many more clients.',
  alternates: { canonical: '/ai-content-studio' },
}

const PIPE = [
  { title: 'It listens to the whole video', text: 'The recording is transcribed and scanned start to end, so nothing is missed.', tag: 'Transcribe + scan' },
  { title: 'It picks the best moments', text: 'Hooks, stories and tips are scored. The strongest ones open as Shorts, not a slow intro.', tag: 'Hook · Story · Tip' },
  { title: 'It cuts and finishes each one', text: 'Reframed to vertical, captioned, with visuals and a call to action added.', tag: '9:16 · Captions · CTA' },
  { title: 'Your editor reviews', text: 'Checks every Short, tweaks what needs it and sends it under your name.', tag: 'Human approval' },
]

export default function Agencies() {
  return (
    <>
      <JsonLd data={serviceLd('AI Content Studio', 'A long video goes in, finished captioned Shorts come out. Editors review and deliver. For video editing agencies.', '/ai-content-studio', 'Video editing agencies')} />
      <JsonLd data={faqLd(AGENCY.faq)} />
      <AgencyMotion />
      <PageHead
        tone="green"
        bg="agencies-hero"
        title={<>More clients. <em>Same editors.</em></>}
        lead="A long video goes in, finished Shorts come out. Your editors set the direction and approve. One editor handles many more clients."
      >
        <a className="btn blue" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">See it on your footage</a>
      </PageHead>

      <section className="sec">
        <SectionHead kicker="What it does" title="One long video in. Shorts out." />
        <div className="trio">
          {AGENCY.features.map((f) => (
            <article className="tcard" key={f.n} data-reveal>
              <span>{f.n}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sec tint">
        <SectionHead kicker="How it works" title="What happens to your video." lead="Four automatic steps. A person only steps in at the end." />
        <ol className="pipe">
          {PIPE.map((p, i) => (
            <li key={p.title} data-reveal>
              <i aria-hidden="true">{i + 1}</i>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <small>{p.tag}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <SectionHead title="Your editors stay in charge." lead="You give direction. The system does the cutting." />
        <ol className="flow">
          {AGENCY.flow.map((s, i) => (
            <li key={s.title} data-reveal className={s.who === 'System' ? 'sys-step' : ''}>
              <span className="who">{s.who}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <i aria-hidden="true">{i + 1}</i>
            </li>
          ))}
        </ol>
      </section>

      <section className="sec tint">
        <SectionHead kicker="Output" title="What the system makes." lead="Each of these is system output from a single long video. Different styles come from different direction, not different editors." />
        <div className="clips">
          {VIDEO_STYLES.map((v) => <VideoCard key={v.id} id={`sample-${v.id}`} title={v.title} text={v.text.replace('Sample edit', 'Sample')} />)}
        </div>
      </section>

      <section className="sec tint">
        <SectionHead kicker="Questions" title="Asked often." />
        <Faq items={AGENCY.faq} />
      </section>

      <CtaBand title="Try it on your own footage" text="Send one long video from a client. See the Shorts the system makes before you decide anything." label="Message on WhatsApp" />
    </>
  )
}
