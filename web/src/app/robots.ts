import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/systems', '/youtube'] }],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
