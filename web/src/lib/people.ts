/* the two people behind AMC Automations. Used by the digital card pages (/card/...) and the vCard download.
   Add a `phone` (digits with country code, like '917075969025') and it appears on the card automatically. */
export type Person = { slug: string; name: string; role: string; email: string; phone?: string }

export const PEOPLE: Person[] = [
  { slug: 'atharva', name: 'Atharva Bhutada', role: 'Founder', email: 'atharva@amcautomations.in', phone: '917075969025' },
  { slug: 'anirudh', name: 'Anirudh', role: 'Founder', email: 'anirudh@amcautomations.in', phone: '918341705946' },
]

export const personBySlug = (slug: string) => PEOPLE.find((p) => p.slug === slug)

export const prettyPhone = (digits: string) =>
  digits.length === 12 && digits.startsWith('91') ? `+91 ${digits.slice(2, 7)} ${digits.slice(7)}` : `+${digits}`
