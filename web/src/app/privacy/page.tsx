import type { Metadata } from 'next'
import { SITE } from '@/lib/content'
import { PageHead } from '@/components/Ui'

export const metadata: Metadata = { title: 'Privacy',
  description: 'How AMC Automations handles the details you send us through the contact form, and basic website analytics.', alternates: { canonical: '/privacy' } }

const BLOCKS = [
  { h: 'What we collect', p: 'Only what you send us through the forms on this site: your business name, what you want automated, your email or WhatsApp number, and the link to any video you ask us to turn into shorts.' },
  { h: 'How we use it', p: 'To reply to you, to judge whether your request can be automated, and to build and deliver the work you ask for. We do not sell your details and we do not use them for advertising.' },
  { h: 'Where it is stored', p: 'Form submissions are saved in our database and sent to our inbox by email. Only the people who run amc.automations can read them.' },
  { h: 'Cookies', p: 'This site does not use advertising or tracking cookies.' },
  { h: 'Your choices', p: `You can ask us to show, correct or delete what you sent at any time by writing to ${SITE.email}. We will do it within a few days.` },
]

export default function Privacy() {
  return (
    <>
      <PageHead tone="green" eyebrow="Privacy" title={<>Your details stay <em>with us.</em></>} lead="A short, plain description of what this site does with the information you send us. Last updated 7 November 2026." />
      <section className="sec">
        <div className="legal">
          {BLOCKS.map((b) => (
            <article key={b.h} data-reveal>
              <h2>{b.h}</h2>
              <p>{b.p}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
