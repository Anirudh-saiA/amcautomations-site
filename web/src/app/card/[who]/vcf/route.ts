import { PEOPLE, personBySlug } from '@/lib/people'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ who: p.slug }))
}

/* a standard vCard: opens "Add contact" on iPhone and Android */
export async function GET(_req: Request, { params }: { params: Promise<{ who: string }> }) {
  const p = personBySlug((await params).who)
  if (!p) return new Response('Not found', { status: 404 })
  const [first, ...rest] = p.name.split(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${rest.join(' ')};${first};;;`,
    `FN:${p.name}`,
    'ORG:AMC Automations',
    `TITLE:${p.role}`,
    ...(p.phone ? [`TEL;TYPE=CELL,VOICE:+${p.phone}`] : []),
    `EMAIL;TYPE=INTERNET,WORK:${p.email}`,
    `URL:${BASE}`,
    'END:VCARD',
  ]
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${p.slug}-amc-automations.vcf"`,
    },
  })
}
