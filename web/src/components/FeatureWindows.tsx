'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const FLOW = [
  { t: 'Order placed', s: 'A new order lands from your store', w: 'Waiting', d: 'Received', k: 'blue' },
  { t: 'COD confirmation', s: 'WhatsApp asks the customer to confirm', w: 'Waiting', d: 'Confirmed', k: 'green' },
  { t: 'CRM updated', s: 'Customer, items and status saved', w: 'Waiting', d: 'Synced', k: 'blue' },
  { t: 'Delivery updates', s: 'Tracking sent at every step', w: 'Waiting', d: 'Sent', k: 'orange' },
  { t: 'Refund request', s: 'Checked against your rules', w: 'Waiting', d: 'Handled', k: 'green' },
]

/* start the loop only while the window is on screen, and show the finished state for reduced motion */
function useLoop(ref: React.RefObject<HTMLDivElement | null>, build: (el: HTMLDivElement, tl: gsap.core.Timeline) => void, still: (el: HTMLDivElement) => void) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { still(el); return }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, paused: true })
      build(el, tl)
      ScrollTrigger.create({ trigger: el.closest('section') ?? el, start: 'top 85%', end: 'bottom 15%', refreshPriority: -1, onToggle: (self) => (self.isActive ? tl.play() : tl.pause()) })
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/* D2C / CRM: an order moves down the workflow, each step lights up and reports its status */
export function D2CWindow() {
  const root = useRef<HTMLDivElement>(null)
  useLoop(
    root,
    (el, tl) => {
      const rows = Array.from(el.querySelectorAll<HTMLElement>('.fw-row'))
      const chips = rows.map((r) => r.querySelector<HTMLElement>('.chip-s')!)
      const dot = el.querySelector<HTMLElement>('.fw-dot')!
      const mid = (r: HTMLElement) => r.offsetTop + r.offsetHeight / 2 - 7
      tl.call(() => { rows.forEach((r, i) => { r.classList.remove('on'); chips[i].textContent = FLOW[i].w }) }, [], 0)
      tl.set(dot, { y: mid(rows[0]), autoAlpha: 0 }, 0)
      const STEP = 0.7 /* seconds per step */
      rows.forEach((r, i) => {
        const t = 0.3 + i * STEP
        if (i > 0) {
          /* the dot slides down the rail to this step, then hands over to its number */
          tl.set(dot, { y: mid(rows[i - 1]), autoAlpha: 1 }, t - 0.5)
          tl.to(dot, { y: mid(r), duration: 0.42, ease: 'power2.inOut' }, t - 0.5)
          tl.to(dot, { autoAlpha: 0, duration: 0.1 }, t - 0.08)
        }
        tl.call(() => { r.classList.add('on'); chips[i].textContent = FLOW[i].d }, [], t)
      })
      tl.to({}, { duration: 1.0 })
    },
    (el) => el.querySelectorAll<HTMLElement>('.fw-row').forEach((r, i) => { r.classList.add('on'); r.querySelector('.chip-s')!.textContent = FLOW[i].d }),
  )
  return (
    <div className="win" ref={root} role="img" aria-label="Animated workflow: an order is placed, confirmed on WhatsApp, saved to the CRM, tracked and any refund handled">
      <div className="win-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <b>d2c-crm · workflow</b>
        <em><i />Live</em>
      </div>
      <div className="win-body">
        <ol className="fw" aria-hidden="true">
          <span className="fw-rail" />
          <span className="fw-dot" />
          {FLOW.map((r, i) => (
            <li className={`fw-row ${r.k}`} key={r.t}>
              <span className="fw-n">{i + 1}</span>
              <div><strong>{r.t}</strong><small>{r.s}</small></div>
              <span className="chip-s">{r.w}</span>
            </li>
          ))}
        </ol>
        <p className="win-foot" aria-hidden="true">A person only sees the edge cases.</p>
      </div>
    </div>
  )
}

const MSG = 'Hi Maya, loved the new serum launch. Quick idea for your repeat orders. Want me to send it over?'

/* simple marks in palette colours for the three channels */
const WA = 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z'
function Logo({ k }: { k: 'wa' | 'mail' | 'in' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      {k === 'wa' && <path d={WA} fill="var(--beige-1)" />}
      {k === 'mail' && (
        <g fill="none" stroke="var(--beige-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
          <path d="M4 8l8 6 8-6" />
        </g>
      )}
      {k === 'in' && (
        <g fill="var(--beige-1)">
          <circle cx="6.8" cy="6.8" r="1.9" />
          <rect x="5.2" y="9.6" width="3.2" height="9.2" rx="0.6" />
          <path d="M10.6 9.6h3v1.3c.6-1 1.7-1.6 3.1-1.6 2.5 0 3.5 1.5 3.5 4.1v5.4h-3.2v-4.8c0-1.2-.4-2-1.5-2s-1.7.8-1.7 2v4.8h-3.2z" />
        </g>
      )}
    </svg>
  )
}

const CHANNELS = [
  { k: 'wa' as const, n: 'WhatsApp', tone: 'green' },
  { k: 'mail' as const, n: 'Email', tone: 'orange' },
  { k: 'in' as const, n: 'LinkedIn', tone: 'blue' },
]

/* Outreach: a message is typed, sent, and lands on WhatsApp, email and LinkedIn; the person replies */
export function OutreachWindow() {
  const root = useRef<HTMLDivElement>(null)
  useLoop(
    root,
    (el, tl) => {
      const q = <T extends Element = HTMLElement>(s: string) => el.querySelector(s) as T
      const qa = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s))
      const typed = q('.oc-typed'), caret = q('.oc-caret'), send = q('.oc-send')
      const tiles = qa('.oc-tile'), chips = qa('.oc-tile .chip-s'), pkts = qa('.oc-pkt'), reply = q('.oc-reply')
      const sentEl = q('.or-sent'), repEl = q('.or-rep')
      const center = (n: HTMLElement) => ({ x: n.offsetLeft + n.offsetWidth / 2 - 14, y: n.offsetTop + n.offsetHeight / 2 - 10 })
      /* offsetLeft/Top are relative to .oc, whatever scale the page is currently animating at */
      const from = () => center(send)
      const type = { n: 0 }
      let sent = 0

      tl.call(() => {
        typed.textContent = ''; sentEl.textContent = '0'; repEl.textContent = '0'; sent = 0
        tiles.forEach((t, i) => { t.classList.remove('on', 'rep'); chips[i].textContent = 'Waiting' })
      }, [], 0)
      tl.set(pkts, { autoAlpha: 0 }, 0).set(reply, { autoAlpha: 0, y: 10 }, 0).set(caret, { autoAlpha: 1 }, 0)
      tl.to(type, { n: MSG.length, duration: 2.2, ease: 'none', onUpdate: () => { typed.textContent = MSG.slice(0, Math.round(type.n)) } }, 0.3)
      tl.to(send, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, 2.7)
      tl.set(caret, { autoAlpha: 0 }, 2.85)
      tiles.forEach((t, i) => {
        const at = 2.9 + i * 0.14
        tl.set(pkts[i], { x: () => from().x, y: () => from().y, autoAlpha: 1, scale: 1 }, at)
        tl.to(pkts[i], { x: () => center(t).x, y: () => center(t).y, scale: 0.7, duration: 0.5, ease: 'power2.inOut' }, at)
        tl.set(pkts[i], { autoAlpha: 0 }, at + 0.5)
        tl.call(() => { t.classList.add('on'); chips[i].textContent = 'Delivered'; sent += 1; sentEl.textContent = String(sent) }, [], at + 0.5)
      })
      tl.fromTo(reply, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)' }, 4.5)
      tl.call(() => { tiles[0].classList.add('rep'); chips[0].textContent = 'Replied'; repEl.textContent = '1' }, [], 4.6)
      tl.to({}, { duration: 2.2 }, 4.9)
      tl.to(reply, { autoAlpha: 0, duration: 0.3 }, 6.9)
    },
    (el) => {
      el.querySelector('.oc-typed')!.textContent = MSG
      el.querySelector('.oc-caret')!.remove()
      el.querySelectorAll<HTMLElement>('.oc-tile').forEach((t, i) => { t.classList.add('on'); t.querySelector('.chip-s')!.textContent = i === 0 ? 'Replied' : 'Delivered'; if (i === 0) t.classList.add('rep') })
      el.querySelector<HTMLElement>('.oc-reply')!.style.opacity = '1'
      el.querySelector('.or-sent')!.textContent = '3'; el.querySelector('.or-rep')!.textContent = '1'
    },
  )
  return (
    <div className="win" ref={root} role="img" aria-label="Animated outreach: a message is typed and sent, lands on WhatsApp, email and LinkedIn, and the person replies">
      <div className="win-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <b>outreach · today</b>
        <em><i />Running</em>
      </div>
      <div className="win-body" aria-hidden="true">
        <div className="oc">
          <div className="oc-compose">
            <div className="oc-to"><i>GS</i><b>Maya · Glow Skincare</b><small>New lead</small></div>
            <p className="oc-text"><span className="oc-typed" /><span className="oc-caret" /></p>
            <div className="oc-send">Send</div>
          </div>
          <div className="oc-channels">
            {CHANNELS.map((c) => (
              <div className={`oc-tile ${c.tone}`} key={c.n}>
                <span className="oc-logo"><Logo k={c.k} /></span>
                <b>{c.n}</b>
                <span className="chip-s">Waiting</span>
              </div>
            ))}
          </div>
          {[0, 1, 2].map((i) => <span className="oc-pkt" key={i}><i /></span>)}
          <div className="oc-reply"><i>M</i><p>Yes, Thursday works. Send it over!</p></div>
        </div>
        <div className="or-stats">
          <span><b className="or-sent">0</b> messages delivered</span>
          <span><b className="or-rep">0</b> reply</span>
          <span className="or-note">Sample data</span>
        </div>
      </div>
    </div>
  )
}
