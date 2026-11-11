import { SITE } from '@/lib/content'
import { BriefForm } from './Widgets'
import Stack from './Stack'
import SplitVideo from './SplitVideo'
import Features from './Features'

/* everything below the hero on the home page:
   stack and numbers, the video split-reveal, D2C / CRM, then contact */
export default function Home() {
  return (
    <>
      <Stack />
      <SplitVideo />
      <Features />

      <section className="talk" id="contact">
        <div className="talk-in">
          <div className="talk-copy">
            <span className="kicker" data-reveal>Connect with us</span>
            <h2 data-reveal>Tell us what should run on its own.</h2>
            <p data-reveal>One line is enough. You get a reply within a day on whether it can be automated and how.</p>
            <div className="talk-links" data-reveal>
              <a className="btn wa" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
              {SITE.emails.map((m) => <a key={m} className="talk-mail" href={`mailto:${m}`}>{m}</a>)}
            </div>
          </div>
          <div className="talk-form" data-reveal>
            <BriefForm kind="home-brief" cta="Send the brief" />
          </div>
        </div>
      </section>
    </>
  )
}
