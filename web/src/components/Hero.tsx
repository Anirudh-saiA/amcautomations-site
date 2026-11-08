'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import HeroStage from './HeroStage'

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-kicker', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' })
      gsap.from('.hero-h1 .ln-in', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.14, delay: 0.1 })
      gsap.from('.hero-side > *', { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.5 })
      gsap.to('.blob.a', { y: -22, x: 12, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.blob.b', { y: 18, x: -14, duration: 6.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.blob.c', { y: -14, x: -10, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" ref={root} id="top">
      <div className="hero-in">
        <div className="hero-copy">
          <p className="hero-kicker">AI agents, automations and outbound</p>
          <h1 className="hero-h1">
            <span className="ln"><span className="ln-in">Busywork,</span></span>
            <span className="ln hl"><span className="ln-in">on autopilot.</span></span>
          </h1>
          <div className="hero-side">
            <p>We build the automations your team does by hand: follow-ups, WhatsApp updates, content and outbound.</p>
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

        <div className="stage-wrap">
          <i className="blob a" aria-hidden="true" />
          <i className="blob b" aria-hidden="true" />
          <i className="blob c" aria-hidden="true" />
          <HeroStage />
        </div>
      </div>
      <a className="scroll-cue" href="#glance" aria-label="Scroll to the next section"><span /></a>
    </section>
  )
}
