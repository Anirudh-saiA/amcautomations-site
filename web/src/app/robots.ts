import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amcautomations.in'

const DISALLOW = ['/api/', '/systems', '/youtube']
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
