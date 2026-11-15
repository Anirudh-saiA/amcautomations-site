# AMC Automations website

Marketing site for AMC Automations (AI · Media · Commerce), live at https://amcautomations.in.
Built with Next.js (App Router), GSAP, and a 3D hero in React Three Fiber.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Pages

| Route | What it is |
|---|---|
| `/` | Home |
| `/ai-content-studio` | Product: long video to finished vertical Shorts |
| `/ai-commerce-operations` | Product: WhatsApp updates, COD confirmation, CRM sync, refunds |
| `/about` | Team, FAQ, name disambiguation |
| `/contact` | WhatsApp and email |
| `/privacy` | Privacy |
| `/card/[who]` | Digital business cards (not indexed) |

## Where things live

- `src/lib/content.ts`: site copy, tools list, stats, FAQ.
- `src/lib/people.ts`: founders and card details.
- `src/components/Chrome.tsx`: nav and footer. The footer is marked `data-nosnippet` so Google does not use it as a search snippet.
- `src/app/globals.css`: all styles. Palette v1 only (black, beige, blue, orange, green).
- `src/app/layout.tsx`: site-wide metadata and JSON-LD. `SAME_AS` holds social profile links (LinkedIn, Instagram, YouTube, Google Business Profile). Add them as they exist.
- `src/app/robots.ts`, `src/app/sitemap.ts`, `public/llms.txt`: search and AI crawler files. `/api/`, `/systems`, `/youtube` and `/card/` are not crawled.
- `src/app/opengraph-image.tsx`: share image.

## Deploy

Pushing to `main` on GitHub deploys to Vercel automatically.

## Check before pushing

Test at 375px and 320px wide for sideways scroll, and run `npm run build`.
