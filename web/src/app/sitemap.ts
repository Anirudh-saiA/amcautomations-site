import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [['/', 1], ['/agencies', 0.9], ['/services', 0.9], ['/about', 0.7], ['/privacy', 0.2]]
  return pages.map(([path, priority]) => ({ url: `${BASE}${path}`, changeFrequency: 'monthly', priority }))
}
