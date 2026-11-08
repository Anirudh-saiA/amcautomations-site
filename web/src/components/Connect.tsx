'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* Marketing that introduces two people with the same mindset.
   Two avatars drift together as you scroll, meet in the middle and a "Match" pill pops. */
export default function Connect() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduce) { gsap.set('.cx-a', { x: 70 }); gsap.set('.cx-b', { x: -70 }); gsap.set('.cx-line', { strokeDashoffset: 0 }); return }
      const line = document.querySelector<SVGPathElement>('.cx-line')
      const L = line?.getTotalLength() ?? 300
      gsap.set('.cx-line', { strokeDasharray: L, strokeDashoffset: L })
      gsap.set('.cx-match', { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' })
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.cx-stage', start: 'top 80%', end: 'bottom 45%', scrub: 0.8 } })
      tl.to('.cx-a', { x: 70, ease: 'power2.out' }, 0)
      tl.to('.cx-b', { x: -70, ease: 'power2.out' }, 0)
      tl.to('.cx-line', { strokeDashoffset: 0, ease: 'none' }, 0.1)
      tl.to('.cx-match', { scale: 1, autoAlpha: 1, ease: 'back.out(2.4)', duration: 0.35 }, 0.75)
      gsap.to('.cx-spark', { scale: 1.25, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%' })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="sec cx" id="connect-people" ref={root}>
      <div className="cx-in">
        <div className="cx-copy">
          <span className="kicker" data-reveal>Marketing</span>
          <h2 data-reveal>We introduce people who should know each other.</h2>
          <p data-reveal>Same goals, same mindset. We find the right founder, creator or brand for you and make the introduction warm, so growth comes from the right relationships, not cold guesses.</p>
        </div>
        <div className="cx-stage" aria-hidden="true">
          <svg viewBox="0 0 520 260" className="cx-svg" focusable="false">
            <path className="cx-line" d="M120 130 C 200 60 320 60 400 130" fill="none" stroke="var(--black-3)" strokeWidth="3" strokeLinecap="round" />
            <g className="cx-a">
              <circle cx="90" cy="130" r="54" fill="var(--blue-2)" stroke="var(--black-3)" strokeWidth="2.5" />
              <circle cx="72" cy="120" r="5" fill="var(--black-3)" /><circle cx="108" cy="120" r="5" fill="var(--black-3)" />
              <path d="M70 142 Q90 160 110 142" stroke="var(--black-3)" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
            <g className="cx-b">
              <circle cx="430" cy="130" r="54" fill="var(--orange-2)" stroke="var(--black-3)" strokeWidth="2.5" />
              <circle cx="412" cy="120" r="5" fill="var(--black-3)" /><circle cx="448" cy="120" r="5" fill="var(--black-3)" />
              <path d="M410 142 Q430 160 450 142" stroke="var(--black-3)" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
            <g className="cx-match">
              <rect x="205" y="196" width="110" height="38" rx="19" fill="var(--green-4)" stroke="var(--black-3)" strokeWidth="2.5" />
              <text x="260" y="221" textAnchor="middle" className="vt" fontSize="16" fontWeight="800" fill="var(--beige-1)">Great match</text>
              <circle className="cx-spark" cx="260" cy="64" r="11" fill="var(--green-2)" stroke="var(--black-3)" strokeWidth="2.5" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
