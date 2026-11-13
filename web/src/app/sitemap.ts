import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [['/', 1], ['/ai-content-studio', 0.9], ['/ai-commerce-operations', 0.9], ['/about', 0.7], ['/contact', 0.6], ['/privacy', 0.2]]
  return pages.map(([path, priority]) => ({ url: `${BASE}${path}`, lastModified: new Date(), changeFrequency: 'monthly', priority }))
}
