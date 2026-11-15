# Google presence checklist: AMC Automations

Goal: when someone searches "AMC Automations", Google shows a business card on the right (name, logo, website, phone, email, services). Google decides this itself. The steps below give it everything it needs.

## A. Google Business Profile (this is what creates the card)
1. Go to business.google.com, "Add your business".
2. Name: **AMC Automations** (exactly, no keywords added).
3. Business type: choose "Business that serves customers at their location / service area" ... then say **"I don't have a physical location"**. Pick the cities or "India" as the service area. No address is shown to the public.
4. Category (primary): **Marketing agency** or **Software company**. Add "Internet marketing service" and "Business management consultant" as secondary.
5. Phone: +91 70759 69025. Website: https://amcautomations.in
6. Description (750 characters max):
   > AMC Automations (AI · Media · Commerce) builds AI automations for companies and hands them over working. AI Content Studio turns one long video into finished vertical Shorts for video editing agencies. AI Commerce Operations handles WhatsApp order updates, COD confirmation, CRM sync, refunds and reminders for B2B, D2C and B2C brands. Everything runs on your own accounts, and a person approves what goes out. Book a call on WhatsApp or email us.
7. Services (add each one): AI Content Studio, AI Commerce Operations, WhatsApp order updates, COD confirmation, CRM sync, Refund and return workflows, Lead follow-ups.
8. Logo: `brand/logo-final/png/avatar-1080.png`. Cover photo: `amc-site-screenshot.png` or the LinkedIn banner.
9. Verify (video or phone call, Google tells you which). Until it's verified there is no card.

## B. Same details everywhere (Google trusts matching facts)
Name "AMC Automations", website, phone, email, the one-line description and the logo must be identical on: LinkedIn company page, Instagram (@amc.automations), YouTube channel, Website Launches, Clutch, GoodFirms, Crunchbase, Product Hunt.
When each profile exists, put its link into `SAME_AS` in `web/src/app/layout.tsx` (the list is empty now). That links them to the site in Google's eyes.

## C. Things that make the card appear sooner
- 3 to 5 Google reviews on the Business Profile.
- A LinkedIn company page with the same name and the website link.
- Mentions on other sites that say "AMC Automations" (directories, a Product Hunt launch, a guest post).
- Search Console set up and sitemap submitted (done by you), plus Bing Webmaster.

## D. Reality check on "AMC" alone
"AMC" is the cinema chain and a stock, so searching only "AMC" will show them for years. Aim for: "AMC Automations", "AMC Automations India", "AMC automation agency". Those you can own within weeks to months.
