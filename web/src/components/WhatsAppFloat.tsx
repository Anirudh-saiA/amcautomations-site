'use client'

import { usePathname } from 'next/navigation'
import { SITE } from '@/lib/content'

/* a round WhatsApp button that stays in the bottom corner, so a visitor can reach us from any page.
   Hidden on the business-card pages. Counts clicks in Analytics when it is switched on. */
export default function WhatsAppFloat() {
  const path = usePathname()
  if (path.startsWith('/card')) return null
  const track = () => {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void }
    w.gtag?.('event', 'whatsapp_click', { page: path })
  }
  return (
    <a className="wa-float" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" onClick={track}>
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.78h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88M20.52 3.45A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.34-1.66a11.88 11.88 0 0 0 5.7 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.42-8.45"/>
      </svg>
    </a>
  )
}
