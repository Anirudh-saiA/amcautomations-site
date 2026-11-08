import type { Metadata } from 'next'
import { AGENCY, SITE, VIDEO_STYLES } from '@/lib/content'
import { CtaBand, PageHead, SectionHead } from '@/components/Ui'
import { Faq, VideoCard } from '@/components/Widgets'

export const metadata: Metadata = { title: 'For agencies | amc.automations' }

export default function Agencies() {
  return (
    <>
      <PageHead
        tone="green"
        eyebrow="For video editing agencies"
        title={<>More clients. <em>Same editors.</em></>}
        lead="An editing system that runs on your own machine. A long video goes in, finished Shorts come out. Your editors set the creative direction, review, and deliver. One editor can handle many more clients without a new hire."
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
        <SectionHead kicker="Before and after" title="From one recording to a week of posts." lead="Your client sends one long video. The system marks the moments worth posting and turns each one into a finished vertical Short." />
        <div className="ba" data-reveal>
          <div className="ba-long"><b>Long video</b><i style={{ ['--a' as string]: '12%' }} /><i style={{ ['--a' as string]: '33%' }} /><i style={{ ['--a' as string]: '57%' }} /><i style={{ ['--a' as string]: '81%' }} /><small>Moments picked by the system</small></div>
          <span className="ba-arrow" aria-hidden="true">→</span>
          <div className="ba-shorts">
            {VIDEO_STYLES.slice(0, 4).map((v) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={v.id} src={`/assets/sample-${v.id}.jpg`} alt={`${v.title} short`} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <SectionHead kicker="Workflow" title="Your editors stay in charge." lead="The only human input is creative direction. The repetitive cutting is done by the system." />
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

      <section className="sec">
        <SectionHead kicker="Who it is for" title="Built for small editing teams." />
        <div className="trio">
          {AGENCY.forWho.map((f) => (
            <article className="tcard plain" key={f.title} data-reveal>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
        <p className="notfor" data-reveal><b>Not for:</b> {AGENCY.notFor}</p>
      </section>

      <section className="sec tint">
        <SectionHead kicker="Questions" title="Asked often." />
        <Faq items={AGENCY.faq} />
      </section>

      <CtaBand title="Try it on your own footage" text="Send one long video from a client. See the Shorts the system makes before you decide anything." label="Message on WhatsApp" />
    </>
  )
}
