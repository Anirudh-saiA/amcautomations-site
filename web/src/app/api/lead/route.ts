import { NextResponse } from 'next/server'

/* Forwards a brief the same way the original site did: Supabase `leads` table plus formsubmit.co.
   The Supabase key below is the publishable (browser-safe) key already used by the static site. */
const SB = process.env.SUPABASE_URL ?? 'https://mwryqqpsjuobeonjfdbx.supabase.co'
const SBK = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_G0lRP8-CRTcjorNnwDz_Iw_iyY8YTsF'
const FORMSUBMIT = process.env.FORMSUBMIT_URL ?? 'https://formsubmit.co/ajax/atharva@apterno.com'

export async function POST(req: Request) {
  let data: Record<string, unknown>
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const clean = (v: unknown) => String(v ?? '').slice(0, 2000)
  /* same columns the static site wrote to the `leads` table */
  const row = {
    kind: 'brief',
    business: clean(data.business) || null,
    job: clean(data.brief) || null,
    contact: clean(data.contact) || null,
    page: clean(data.page).slice(0, 300) || null,
  }
  if (!row.contact || !row.job) return NextResponse.json({ ok: false }, { status: 422 })

  const sb = fetch(`${SB}/rest/v1/leads`, {
    method: 'POST',
    headers: { apikey: SBK, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  }).then((r) => r.ok).catch(() => false)

  const mail = fetch(FORMSUBMIT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: 'amc.automations: sv', _template: 'table', _captcha: 'false', ...row }),
  }).then((r) => r.ok).catch(() => false)

  const [a, b] = await Promise.all([sb, mail])
  /* like the original: success if either destination took it */
  return NextResponse.json({ ok: a || b }, { status: a || b ? 200 : 502 })
}
