'use client'

import Link from 'next/link'
import SplitReveal from './SplitReveal'
import { useId, useState } from 'react'

const BARS = Array.from({ length: 44 }, (_, i) => 18 + Math.round(Math.abs(Math.sin(i * 1.7) * 60 + Math.cos(i * 0.6) * 22)))

/* a small window: a long video is scanned start to end, shorts pop out, and you can send us a link */
function ShortsWindow() {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [err, setErr] = useState('')
  const uid = useId()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const link = String(f.get('link') ?? '').trim()
    const contact = String(f.get('contact') ?? '').trim()
    if (!link) { setErr('Paste the link to your long video.'); return }
    if (!(/^\S+@\S+\.\S+$/.test(contact) || contact.replace(/\D/g, '').length >= 7)) { setErr('Add an email, or a WhatsApp number with country code.'); return }
    setErr(''); setState('sending')
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: 'Video to shorts', brief: `Long video link: ${link}`, contact, page: window.location.pathname }),
      })
      setState(r.ok ? 'ok' : 'err')
      if (r.ok) form.reset()
    } catch { setState('err') }
  }

  return (
    <div className="win" role="group" aria-label="Video to shorts">
      <div className="win-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <b>shorts-studio</b>
        <em><i />Analysing</em>
      </div>
      <div className="win-body">
        <div className="tl" aria-hidden="true">
          <div className="tl-track">
            {BARS.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
            <span className="tl-seg a" /><span className="tl-seg b" /><span className="tl-seg c" />
            <span className="tl-scan" />
          </div>
          <div className="tl-meta"><span>0:00</span><span>Reading start to end</span><span>48:12</span></div>
        </div>
        <div className="outs" aria-hidden="true">
          <span className="out-s o1"><b>Hook</b><i /></span>
          <span className="out-s o2"><b>Story</b><i /></span>
          <span className="out-s o3"><b>Tip</b><i /></span>
        </div>
        <form className="win-form" onSubmit={onSubmit} noValidate aria-busy={state === 'sending'}>
          <label htmlFor={`${uid}-l`}>Link to your long video</label>
          <input id={`${uid}-l`} name="link" inputMode="url" autoComplete="off" placeholder="YouTube, Drive or Dropbox link" />
          <label htmlFor={`${uid}-c`}>Where should we send the shorts?</label>
          <input id={`${uid}-c`} name="contact" autoComplete="email" placeholder="you@company.com or +91…" />
          {err && <p className="win-err" role="alert">{err}</p>}
          <button className="btn orange" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Make my shorts'}</button>
          <div aria-live="polite">
            {state === 'ok' && <p className="win-ok">Got it. We watch it start to end and send your shorts for approval.</p>}
            {state === 'err' && <p className="win-err" role="alert">That did not go through. Message us on WhatsApp instead.</p>}
          </div>
        </form>
      </div>
    </div>
  )
}

/* window 3: a big "CONTENT" word splits at the middle and reveals the video product */
export default function SplitVideo() {
  return (
    <SplitReveal id="video" word="AI CONTENT|STUDIO" vw={13} cap={230} tone="black" kicker="AI Content Studio" title="Send one long video. Get shorts back.">
      <div className="sp-copy">
        <span className="kicker">AI Content Studio</span>
        <h2>Send one long video. Get shorts back.</h2>
        <p>We watch your video from start to end, find the moments worth posting and cut each one into a vertical short with captions and a call card. You approve every short before it goes out.</p>
        <ul className="ticks">
          <li>Reads the whole video, start to end</li>
          <li>Picks the strongest moments</li>
          <li>Captions, speaker in frame, call card</li>
        </ul>
        <Link className="btn ghost dark" href="/agencies">See sample shorts</Link>
      </div>
      <ShortsWindow />
    </SplitReveal>
  )
}
