import Link from 'next/link'
import { SITE } from '@/lib/content'

/* compact page header used by every inner page: tinted hero block with a big title */
export function PageHead({
  eyebrow, title, lead, tone = 'blue', children,
}: { eyebrow: string; title: React.ReactNode; lead: string; tone?: 'blue' | 'orange' | 'green'; children?: React.ReactNode }) {
  return (
    <section className={`phead ${tone}`}>
      <div className="phead-in">
        <span className="eyebrow" data-reveal>{eyebrow}</span>
        <h1 data-reveal>{title}</h1>
        <p className="lead" data-reveal>{lead}</p>
        {children && <div className="cta-row" data-reveal>{children}</div>}
      </div>
      <i className="blob b1" aria-hidden="true" />
      <i className="blob b2" aria-hidden="true" />
    </section>
  )
}

export function SectionHead({ kicker, title, lead }: { kicker: string; title: React.ReactNode; lead?: string }) {
  return (
    <header className="shead">
      <span className="kicker" data-reveal>{kicker}</span>
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
