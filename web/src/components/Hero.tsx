'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const WORKS_WITH = [
  { n: 'WhatsApp', f: 'whatsapp' }, { n: 'Claude', f: 'claude' }, { n: 'n8n', f: 'n8n' },
  { n: 'Shopify', f: 'shopify' }, { n: 'WooCommerce', f: 'woocommerce' }, { n: 'Razorpay', f: 'razorpay' },
  { n: 'HubSpot', f: 'hubspot' }, { n: 'Zoho', f: 'zoho' }, { n: 'Google Sheets', f: 'googlesheets' }, { n: 'Gmail', f: 'gmail' },
]

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const vid = useRef<HTMLVideoElement>(null)

  /* the looping city video behind the hero: phones get the lighter file, it pauses when off screen,
     and reduced motion keeps the still poster */
  useEffect(() => {
    const v = vid.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.src = window.innerWidth <= 700 ? '/assets/clips/hero-bg-540.mp4' : '/assets/clips/hero-bg.mp4'
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.05 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  /* slow, smooth intro on every load: the city fades up, then the words arrive one after another */
  useEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.remove('hero-pre'); vid.current?.classList.add('on'); return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('.hero-video', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 2.6, ease: 'power2.out' }, 0)
        .from('.hero-h1 .ln-in', { yPercent: 118, opacity: 0, duration: 1.9, ease: 'power4.out', stagger: 0.32 }, 0.9)
        .from('.hero-side p', { y: 28, opacity: 0, duration: 1.5 }, 2.0)
        .from('.hero-side .cta', { y: 28, opacity: 0, duration: 1.4 }, 2.4)
        .from('.scroll-cue', { opacity: 0, duration: 1.2 }, 3.0)
      el.classList.remove('hero-pre') /* gsap has now applied the start state, so the CSS hold can go */
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero hero-pre" ref={root} id="top">
      <video ref={vid} className="hero-video" poster="/assets/clips/hero-bg-poster.jpg" muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
      <div className="hero-veil" aria-hidden="true" />
      <div className="hero-in">
        <div className="hero-copy">
          <h1 className="hero-h1">
            <span className="ln"><span className="ln-in">AI · Media ·</span></span>
            <span className="ln hl"><span className="ln-in">Commerce.</span></span>
          </h1>
          <div className="hero-side">
            <p>We build the automations your team does by hand.</p>
            <div className="cta">
              <a className="btn wa" href="https://wa.me/917075969025?text=Hi%20Atharva%2C%20I%20saw%20amc.automations%20and%20want%20to%20book%20a%20call" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />
                </svg>
                Book a call on WhatsApp
              </a>
              <Link className="btn ghost" href="/systems">See what each system made</Link>
            </div>
          </div>
        </div>

      </div>
      <div className="works" aria-label="Works with">
        <span className="works-label">Works with</span>
        <div className="works-track" aria-hidden="false">
          {[0, 1].map((k) => (
            <ul key={k} aria-hidden={k === 1}>
              {WORKS_WITH.map((w) => (
                <li key={w.f}><i style={{ ['--logo' as string]: `url(/assets/logos/${w.f}.svg)` }} /><span>{w.n}</span></li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <a className="scroll-cue" href="#glance" aria-label="Scroll to the next section"><span /></a>
    </section>
  )
}
