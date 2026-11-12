// Builds ../brand/business-cards.html: a restrained, print-ready card (90 x 55 mm) for each person, with a QR code to their digital card.
// Run:  node scripts/make-cards.mjs
import QRCode from 'qrcode'
import { writeFileSync } from 'node:fs'

const BASE = 'https://amcautomations.in'
const people = [
  { slug: 'atharva', name: 'Atharva Bhutada', role: 'Founder', email: 'atharva@amcautomations.in', phone: '+91 70759 69025' },
  { slug: 'anirudh', name: 'Anirudh', role: 'Founder', email: 'anirudh@amcautomations.in', phone: '' },
]

const qr = (slug) => QRCode.toString(`${BASE}/card/${slug}`, { type: 'svg', margin: 0, color: { dark: '#1E1C18', light: '#00000000' }, errorCorrectionLevel: 'M' })

const front = `
    <div class="card front">
      <div class="word">AMC<span>Automations</span></div>
      <div class="rule"></div>
      <div class="url">amcautomations.in</div>
    </div>`

const back = (p, svg) => `
    <div class="card back">
      <div class="who">
        <div class="name">${p.name}</div>
        <div class="role">${p.role}</div>
      </div>
      <div class="bottom">
        <ul>
          <li>${p.email}</li>
          ${p.phone ? `<li>${p.phone}</li>` : ''}
          <li>amcautomations.in</li>
        </ul>
        <div class="qr">${svg}<small>Scan to save</small></div>
      </div>
    </div>`

let sheets = ''
for (const p of people) {
  sheets += `
  <p class="label">${p.name}</p>
  <div class="sheet">${front}${back(p, await qr(p.slug))}
  </div>`
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AMC Automations business cards</title>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  /* Palette v1 only. Card size 90 x 55 mm. Print at 100% scale, margins none, background graphics on. */
  :root { --ink: #1E1C18; --ink-2: #3A3732; --mute: #A6A29A; --paper: #FFFFFF; --line: #DDD2C0; --blue: #2559C9; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #ECE8E1; color: var(--ink); padding: 24px; }
  h1 { font: 600 18px 'Inter Tight', sans-serif; margin-bottom: 4px; }
  .note { font-size: 13px; line-height: 1.5; color: var(--ink-2); max-width: 72ch; margin-bottom: 22px; }
  .label { font: 500 11px 'JetBrains Mono', monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); margin: 0 0 8px; }
  .sheet { display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 28px; }
  .card { width: 90mm; height: 55mm; position: relative; overflow: hidden; border-radius: 2mm; box-shadow: 0 10px 28px -16px rgba(0,0,0,.45); break-inside: avoid; }

  /* FRONT: dark, one wordmark, one line */
  .front { background: var(--ink); color: var(--paper); padding: 8mm; display: flex; flex-direction: column; justify-content: center; }
  .word { font: 700 19pt/1 'Inter Tight', sans-serif; letter-spacing: -0.03em; }
  .word span { display: block; margin-top: 2.2mm; font: 500 6pt 'JetBrains Mono', monospace; letter-spacing: .32em; text-transform: uppercase; color: var(--mute); }
  .rule { width: 9mm; height: .3mm; background: var(--paper); opacity: .55; margin: 6mm 0 3mm; }
  .url { font: 400 6.5pt 'JetBrains Mono', monospace; letter-spacing: .08em; color: var(--mute); }

  /* BACK: white, the person, QR */
  .back { background: var(--paper); border: .2mm solid var(--line); padding: 8mm; display: flex; flex-direction: column; justify-content: space-between; }
  .name { font: 600 13pt/1.1 'Inter Tight', sans-serif; letter-spacing: -0.02em; }
  .role { margin-top: 1.4mm; font: 500 6pt 'JetBrains Mono', monospace; letter-spacing: .18em; text-transform: uppercase; color: var(--blue); }
  .bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 4mm; }
  ul { list-style: none; padding: 0; display: grid; gap: 1.2mm; font-size: 7pt; color: var(--ink-2); }
  .qr { width: 17mm; text-align: center; }
  .qr svg { width: 17mm; height: 17mm; display: block; }
  .qr small { display: block; margin-top: 1mm; font: 400 4.5pt 'JetBrains Mono', monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--mute); }

  @page { size: 90mm 55mm; margin: 0; }
  @media print {
    body { background: none; padding: 0; }
    h1, .note, .label { display: none; }
    .sheet { display: block; margin: 0; }
    .card { box-shadow: none; border-radius: 0; break-after: page; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <h1>AMC Automations business cards</h1>
  <p class="note">Check the names, roles and phone numbers, then Print and Save as PDF for your printer (90 x 55 mm, margins none, background graphics on). Ask for 350 gsm matt. The QR code opens each person's digital card, where the visitor can save the contact in one tap. Replace the AMC wordmark with your logo once you have it.</p>
${sheets}
</body>
</html>
`
writeFileSync(new URL('../../brand/business-cards.html', import.meta.url), html)
console.log('wrote brand/business-cards.html')
