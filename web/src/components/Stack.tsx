import { STATS, TECH } from '@/lib/content'
import Counters from './Counters'

/* window 2: the technologies we build with, and the numbers */
export default function Stack() {
  const row = (items: typeof TECH, rev = false) => (
    <div className={`marq-row${rev ? ' rev' : ''}`}>
      <div className="marq-track">
        {[...items, ...items].map((t, i) => (
          <span className={`tech ${t.tone}`} key={`${t.n}-${i}`} aria-hidden={i >= items.length ? true : undefined}>
            <i>{t.n.slice(0, 2)}</i>
            <b>{t.n}</b>
            <small>{t.k}</small>
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <section className="stack" id="glance">
      <div className="stack-in">
        <header className="stack-head">
          <span className="kicker" data-reveal>Our stack</span>
          <h2 data-reveal>Built with the tools your team already knows.</h2>
          <p data-reveal>We connect what you use today and add AI where it saves the most time. Nothing to switch, nothing locked to us.</p>
        </header>
        <div className="stack-nums" aria-label="At a glance">
          {STATS.map((x) => (
            <div className="num" key={x.t} data-reveal>
              <b><span data-count={x.n}>{x.n.toLocaleString('en-US')}</span>{x.s}</b>
              <span>{x.t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="marq" role="list" aria-label="Technologies we use">
        {row(TECH.slice(0, 5))}
        {row(TECH.slice(5), true)}
      </div>
      <Counters />
    </section>
  )
}
