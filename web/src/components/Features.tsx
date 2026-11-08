import Link from 'next/link'
import { SITE } from '@/lib/content'
import { D2CWindow } from './FeatureWindows'
import SplitReveal from './SplitReveal'

/* windows 4 and 5: each opens with the same horizontal split as the video section,
   then shows what we do on the left and a small live window on the right */
export default function Features() {
  return (
    <>
      <SplitReveal id="d2c" word="AI COMMERCE|OPERATIONS" vw={11.5} cap={170} tone="blue" kicker="AI Commerce Operations" title="Your store and your CRM, running without you.">
        <div className="feat-copy">
          <span className="kicker">AI Commerce Operations</span>
          <h2>Your store and your CRM, running without you.</h2>
          <p>Orders, customers and support are the same few steps every day. We turn them into one workflow that answers on WhatsApp at 2 AM, keeps your CRM clean and handles refunds by your rules.</p>
          <ul className="ticks">
            <li>COD confirmation and order updates on WhatsApp</li>
            <li>Customer and order data synced to your CRM</li>
            <li>Customer care and refund requests handled by your rules</li>
            <li>Lead qualifying and reminders, on schedule</li>
          </ul>
          <Link className="btn ghost dark" href="/services">See how a build works</Link>
        </div>
        <D2CWindow />
      </SplitReveal>
    </>
  )
}
