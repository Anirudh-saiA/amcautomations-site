import Link from 'next/link'
import { SITE } from '@/lib/content'

/* compact page header used by every inner page: tinted hero block with a big title */
import PageVideo from './PageVideo'

export function PageHead({
  title, lead, tone = 'blue', bg, children,
}: { eyebrow?: string; title: React.ReactNode; lead: string; tone?: 'blue' | 'orange' | 'green'; bg?: string; children?: React.ReactNode }) {
  return (
    <section className={`phead ${tone}${bg ? ' has-video' : ''}`}>
      {bg && <PageVideo name={bg} />}
      <div className="phead-in">
        <h1 className="ph-in" style={{ ['--d' as string]: '0.1s' }}>{title}</h1>
        <p className="lead ph-in" style={{ ['--d' as string]: '0.45s' }}>{lead}</p>
        {children && <div className="cta-row ph-in" style={{ ['--d' as string]: '0.75s' }}>{children}</div>}
      </div>
    </section>
  )
}

export function SectionHead({ kicker, title, lead }: { kicker?: string; title: React.ReactNode; lead?: string }) {
  return (
    <header className="shead">
      {kicker && <span className="kicker" data-reveal>{kicker}</span>}
      <h2 data-reveal>{title}</h2>
      {lead && <p data-reveal>{lead}</p>}
    </header>
  )
}

export function CtaBand({ title, text, label = 'Message on WhatsApp', href = SITE.whatsapp, internal }: { title: string; text: string; label?: string; href?: string; internal?: boolean }) {
  return (
    <section className="ctaband">
      <div className="ctaband-in" data-reveal>
        <h2>{title}</h2>
        <p>{text}</p>
        {internal ? (
          <Link className="btn orange" href={href}>{label}</Link>
        ) : (
          <a className="btn orange" href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        )}
      </div>
    </section>
  )
}
