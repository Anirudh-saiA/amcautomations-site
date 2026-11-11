import type { Metadata } from 'next'
import Link from 'next/link'
import { ALSO_RUNNING, CAROUSEL, LOG, REAL_EMAIL, VIDEO_STYLES } from '@/lib/content'
import { CtaBand, PageHead, SectionHead } from '@/components/Ui'
import { VideoCard } from '@/components/Widgets'

export const metadata: Metadata = { title: 'Systems', robots: { index: false, follow: false } }

function Io({ i, o, l }: { i: string; o: string; l: string }) {
  return (
    <dl className="io">
      <div><dt>In</dt><dd>{i}</dd></div>
      <div><dt>Out</dt><dd>{o}</dd></div>
      <div><dt>Limits</dt><dd>{l}</dd></div>
    </dl>
  )
}

export default function Systems() {
  return (
    <>
      <PageHead
        tone="blue"
        eyebrow="The systems"
        title={<>What we run, <em>and what it made.</em></>}
        lead="Each system shows how it works, what goes in, and a real thing it produced. A person approves what matters."
      />

      {/* 01 outbound */}
      <section className="sys">
        <div className="sys-side" data-reveal>
          <span className="sys-n">01</span>
          <h2>Outbound engine</h2>
          <p>Runs every night. Finds businesses that fit, checks each is real, writes each a personal email, sends within a daily cap and follows up. Replies come back to one place.</p>
          <Io i="A short description of who you sell to." o="Checked prospects, sent emails, follow-ups, a reply log." l="40 sends a day. A person approves each message." />
        </div>
        <div className="sys-main">
          <div className="log" data-reveal>
            <header><b>Outbound engine · live log</b><span>{LOG.range}</span></header>
            <div className="stats">
              {LOG.stats.map((s) => <div key={s.label}><strong>{s.n}</strong><span>{s.label}</span></div>)}
            </div>
            <ul className="bars">
              {LOG.bars.map((b, i) => (
                <li key={b.label}><span>{b.label}</span><i style={{ ['--w' as string]: `${[100, 88, 10][i]}%` }} /><b>{b.n}</b></li>
              ))}
            </ul>
            <small>Emails sent per day, capped at 40.</small>
          </div>
          <div className="mail" data-reveal>
            <div className="mail-bar"><i /><i /><i /></div>
            <div className="mail-meta">
              <span>To: <b className="blur">{REAL_EMAIL.to}</b></span>
              <span>Subject: {REAL_EMAIL.subject}</span>
            </div>
            <div className="mail-body">{REAL_EMAIL.lines.map((l) => <p key={l}>{l}</p>)}</div>
          </div>
        </div>
      </section>

      {/* 02 video */}
      <section className="sys alt wide">
        <div className="sys-side" data-reveal>
          <span className="sys-n">02</span>
          <h2>Video repurposing</h2>
          <p>Cuts a long video into vertical shorts. Picks the strongest moments, keeps the speaker in frame, adds captions and explainer visuals, and ends with a call card.</p>
          <Io i="One long video." o="Finished 9:16 shorts." l="You approve each short before posting." />
        </div>
        <div className="sys-main">
          <div className="clips">
            {VIDEO_STYLES.map((v) => <VideoCard key={v.id} id={`sample-${v.id}`} title={v.title} text={v.text} />)}
          </div>
        </div>
      </section>

      {/* 03 posts */}
      <section className="sys">
        <div className="sys-side" data-reveal>
          <span className="sys-n">03</span>
          <h2>Post maker</h2>
          <p>Turns one idea into a finished carousel. The cover carries the strongest claim and each slide carries one point, in the same layout every time.</p>
          <Io i="One idea or claim." o="A finished carousel and caption." l="Text that does not fit is cut." />
        </div>
        <div className="sys-main">
          <div className="carousel" data-reveal>
            {CAROUSEL.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={c} src={`/assets/${c}.jpg`} alt={`Sample carousel slide ${i + 1} of 4`} loading="lazy" />
            ))}
          </div>
          <p className="small" data-reveal>More posts, same system.</p>
        </div>
      </section>

      <section className="sec tint">
        <SectionHead kicker="Also running" title="Small systems that quietly do a lot." />
        <div className="bento two">
          {ALSO_RUNNING.map((a, i) => (
            <article className={`bcard ${i ? 'green' : 'blue'}`} key={a.title} data-reveal>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
            </article>
          ))}
        </div>
        <div className="center" data-reveal>
          <Link className="btn blue" href="/services#brief">Want one of these? Send the brief</Link>
        </div>
      </section>

      <CtaBand title="See one on your own work." text="Tell us what should run on its own and we will show you how it would look." />
    </>
  )
}
