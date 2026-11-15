# AMC Automations: logo phases and GPT prompts

Logo: three dots joined by one line, forming an A.
Blue = AI (left), Orange = Media (top), Green = Commerce (right). Same order as "AI · Media · Commerce".
Colours: ink #1E1C18, beige #FAF7F2, blue #3B74EE, orange #EE7A2E, green #1F9D57.
Font: Inter Tight ExtraBold for the name, JetBrains Mono for the tagline.

**Rule:** do not ask GPT to draw the logo itself. Image models misspell text and wobble shapes.
Upload the finished PNG from `png/` as a reference and ask GPT only for the scene around it (mockups, banners, backgrounds), then drop the real logo on top.

## Phase 1: Core files (already made, in `png/` and `svg/`)
| File | Use |
|---|---|
| lockup-h-light / dark | main logo, website header, proposals, invoices |
| lockup-h-tagline-light / dark | directory listings (Website Launches etc.), pitch decks |
| lockup-stacked-light / dark | posters, slides, QR card centre |
| mark-color-on-light / on-dark (svg) | icon only |
| mark-black / mark-white (svg) | one-colour print, stamps, embroidery, watermark |
| icon-512-light / dark | app-style icon, Google Business Profile |
| avatar-1080 | WhatsApp, Instagram, LinkedIn, X, YouTube, GitHub profile picture |
| apple-touch-180, favicon-32 | browser and phone home-screen icon |
| email-signature | email footer (700x160, shown at ~240px wide) |
| og-1200x630 | link preview when the site is shared |
| linkedin-banner-1584x396 | LinkedIn company banner |
| watermark-white | corner watermark on videos |

## Phase 2: Documents and cards (build on the real logo)
Business card, letterhead, invoice header, proposal cover, email signature block, WhatsApp Business profile, QR card.

## Phase 3: Social and video
YouTube banner (2560x1440, keep content in the centre 1546x423), Instagram highlights covers, video intro/outro (3 dots appear, line draws, name fades in), reel end card.

## Phase 4: Real-world mockups (GPT is good at these)
Prompts to use with the PNG attached as reference:

1. **Business card mockup.** "Photoreal mockup of a minimal matte business card on a warm beige desk, soft window light. Use the attached logo exactly as given on the front, black card, white logo. Do not redraw or retype the logo."
2. **Laptop and phone.** "A laptop on a clean desk showing a plain dark website page with the attached logo top-left, a phone beside it with the attached icon as an app icon. Do not change the logo."
3. **Office signage.** "Frosted glass office door with the attached logo in white vinyl, shallow depth of field, modern studio."
4. **Tote bag or T-shirt.** "Beige cotton tote bag, the attached mark printed in black, studio product photo, neutral background."
5. **Social post template background.** "Abstract soft beige background with a few very faint blue, orange and green circles and thin lines, lots of empty space, no text, no logo." (add the real logo yourself)
6. **YouTube banner background.** "Wide dark charcoal gradient background with three softly glowing dots (blue, orange, green) connected by thin lines, minimal, empty centre, no text."
7. **Notebook, pen, mug.** "Flat-lay of a black notebook, pen and white mug on beige linen, each carrying the attached mark in small size, soft shadows."

## Phase 5: Brand guard-rails to keep GPT consistent
Paste this at the top of every prompt:

> Brand: AMC Automations. Minimal, premium, professional. Palette only: charcoal #1E1C18, warm beige #FAF7F2, blue #3B74EE, orange #EE7A2E, green #1F9D57. No gradients on the logo, no 3D effects on the logo, no cartoon style, no extra text. Never redraw, restyle or retype the attached logo.

## Before real use
- Trademark search for the name and logo on IP India (tmrsearch.ipindia.gov.in) before printing in volume.
- The wordmark in these PNGs is live text rendered in Inter Tight. For print vendors, ask for an outlined vector (I can produce one if needed).
