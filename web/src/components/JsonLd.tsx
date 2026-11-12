/* structured data for search engines and AI assistants */
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  }
}

export function serviceLd(name: string, description: string, path: string, audience: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: `${BASE_URL}${path}`,
    serviceType: name,
    provider: { '@type': 'Organization', name: 'AMC Automations', url: BASE_URL },
    audience: { '@type': 'Audience', audienceType: audience },
  }
}
