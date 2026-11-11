'use client'

import { useId, useRef, useState } from 'react'
import { SITE } from '@/lib/content'

/* a clip that plays on hover, or on tap / Enter / Space (a real button, so keyboards work) */
export function VideoCard({ id, title, text, tag }: { id: string; title: string; text: string; tag?: string }) {
  const v = useRef<HTMLVideoElement>(null)
  const [on, setOn] = useState(false)
  const play = () => { v.current?.play().then(() => setOn(true)).catch(() => {}) }
  const stop = () => { v.current?.pause(); setOn(false) }
  return (
    <figure className={`clip${on ? ' playing' : ''}`} onMouseEnter={play} onMouseLeave={stop} data-reveal>
      <button
        type="button"
        className="clip-frame"
        aria-pressed={on}
        aria-label={`${on ? 'Pause' : 'Play'} the ${title} clip`}
        onClick={() => (on ? stop() : play())}
      >
        <video ref={v} src={`/assets/${id}.mp4`} poster={`/assets/${id}.jpg`} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        <span className="clip-play" aria-hidden="true">
          {on ? (
            <svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" /></svg>
          )}
        </span>
        {tag && <span className="clip-tag">{tag}</span>}
      </button>
      <figcaption>
        <b>{title}</b>
        <span>{text}</span>
      </figcaption>
    </figure>
  )
}

/* FAQ accordion: each question controls its answer, which is announced as a region */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const uid = useId()
  return (
    <div className="faq">
      {items.map((it, i) => (
        <div className={`faq-item${open === i ? ' open' : ''}`} key={it.q} data-reveal>
          <button id={`${uid}-q${i}`} aria-expanded={open === i} aria-controls={`${uid}-a${i}`} onClick={() => setOpen(open === i ? null : i)}>
            <span>{it.q}</span>
            <i aria-hidden="true">+</i>
          </button>
          <div className="faq-a" id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`}>
            <p>{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const validContact = (v: string) => {
  const t = v.trim()
  return /^\S+@\S+\.\S+$/.test(t) || t.replace(/\D/g, '').length >= 7
}

/* brief form: visible labels, inline validation on blur, live status, posts to our own /api/lead route */
export function BriefForm({ kind = 'service-brief', cta = 'Send the brief' }: { kind?: string; cta?: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [contactErr, setContactErr] = useState('')
  const contactRef = useRef<HTMLInputElement>(null)
  const uid = useId()

  function checkContact(value: string) {
    const bad = !validContact(value)
    setContactErr(bad ? 'Enter an email, or a phone number with country code.' : '')
    return !bad
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    if (!checkContact(String(f.get('contact') ?? ''))) {
      contactRef.current?.focus()
      return
    }
    setState('sending')
    try {
      const r = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          business: f.get('business'),
          brief: f.get('brief'),
          contact: f.get('contact'),
          website: f.get('website'),
          page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })
      setState(r.ok ? 'ok' : 'err')
      if (r.ok) form.reset()
    } catch {
      setState('err')
    }
  }
  return (
    <form className="brief" onSubmit={onSubmit} noValidate aria-busy={state === 'sending'}>
      <div className="hp" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label>
        Business
        <input name="business" required autoComplete="organization" placeholder="Your company" />
      </label>
      <label>
        What should run on its own?
        <textarea name="brief" required rows={4} placeholder="One line is enough" aria-describedby={`${uid}-hint`} />
        <span className="field-hint" id={`${uid}-hint`}>For example: follow-ups, WhatsApp updates, editing clips.</span>
      </label>
      <label>
        Email or WhatsApp
        <input
          ref={contactRef}
          name="contact"
          required
          autoComplete="email"
          placeholder="you@company.com or +91…"
          aria-invalid={contactErr ? true : undefined}
          aria-describedby={contactErr ? `${uid}-err` : undefined}
          onBlur={(e) => { if (e.currentTarget.value) checkContact(e.currentTarget.value) }}
          onChange={() => { if (contactErr) setContactErr('') }}
        />
        {contactErr && <span className="field-error" id={`${uid}-err`} role="alert">{contactErr}</span>}
      </label>
      <button className="btn orange" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : cta}</button>
      <div aria-live="polite">
        {state === 'ok' && <p className="form-ok">Got it. You will hear back within a day.</p>}
        {state === 'err' && (
          <p className="form-err" role="alert">
            That did not go through. <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> instead.
          </p>
        )}
      </div>
    </form>
  )
}

/* sample output: animated steps that "run" on scroll into view */
export function StepRun({ steps }: { steps: string[] }) {
  return (
    <ol className="steprun">
      {steps.map((s, i) => (
        <li key={s} style={{ animationDelay: `${i * 0.35}s` }}>
          <i aria-hidden="true">{i + 1}</i>
          {s}
        </li>
      ))}
    </ol>
  )
}
