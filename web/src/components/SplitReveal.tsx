'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Tone = 'black' | 'blue' | 'green'

/* A full-screen band with one huge word. While you scroll it stays pinned, splits across the middle
   (top half up, bottom half down) and reveals what is behind it.
   Desktop: the whole section is revealed. Phones: the band reveals the section title, then the rest scrolls normally.
   Reduced motion: no split, just the title and content. */
export default function SplitReveal({
  id, word, vw, cap, tone = 'black', alt = false, kicker, title, children,
}: { id: string; word: string; vw: number; cap: number; tone?: Tone; alt?: boolean; kicker: string; title: string; children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)
    const q = gsap.utils.selector(el)
    const mm = gsap.matchMedia()

    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: q('.sp-pin')[0], start: 'top top', end: '+=170%', scrub: 0.7, pin: true, anticipatePin: 1 },
      })
      gsap.set(q('.sp-content'), { scale: 0.92, opacity: 0.2 })
      tl.to(q('.sp-pin .sp-word .sp-lines'), { scale: 1.12, duration: 0.5 }, 0)
      tl.to(q('.sp-pin .sp-half.top'), { yPercent: -100, duration: 1, ease: 'power3.inOut' }, 0.35)
      tl.to(q('.sp-pin .sp-half.bot'), { yPercent: 100, duration: 1, ease: 'power3.inOut' }, 0.35)
      tl.to(q('.sp-content'), { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.45)
      tl.set(q('.sp-pin .sp-half'), { autoAlpha: 1 }, 1.35)
      tl.set(q('.sp-pin .sp-half'), { autoAlpha: 0 }, 1.36) /* the cut edge leaves with the halves */
      tl.to({}, { duration: 0.7 }) /* hold on the revealed content */
    })

    mm.add('(max-width: 860px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: q('.sp-mband')[0], start: 'top top', end: '+=85%', scrub: 0.5, pin: true, anticipatePin: 1 },
      })
      gsap.set(q('.sp-mhead'), { scale: 0.9, opacity: 0.2 })
      tl.to(q('.sp-mband .sp-half.top'), { yPercent: -100, duration: 1, ease: 'power3.inOut' }, 0.2)
      tl.to(q('.sp-mband .sp-half.bot'), { yPercent: 100, duration: 1, ease: 'power3.inOut' }, 0.2)
      tl.to(q('.sp-mhead'), { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.3)
      tl.set(q('.sp-mband .sp-half'), { autoAlpha: 1 }, 1.2)
      tl.set(q('.sp-mband .sp-half'), { autoAlpha: 0 }, 1.21)
      tl.to({}, { duration: 0.35 })
    })
    return () => mm.revert()
  }, [])

  const word$ = (
    <div className="sp-word"><span className="sp-lines" style={{ fontSize: `min(${vw}vw, ${cap}px)` }}>{word.split('|').map((l, i) => <span key={i} className="sp-line">{l}</span>)}</span></div>
  )
  return (
    <section className={`sp tone-${tone}${alt ? ' alt' : ''}`} id={id} ref={root}>
      {/* phones: a shorter band that reveals just the title */}
      <div className="sp-mband">
        <div className="sp-mhead" aria-hidden="true">
          <span className="kicker">{kicker}</span>
          <h2>{title}</h2>
        </div>
        <div className="sp-half top" aria-hidden="true">{word$}</div>
        <div className="sp-half bot" aria-hidden="true">{word$}<em>Scroll</em></div>
      </div>

      <div className="sp-pin">
        <div className="sp-content">{children}</div>
        <div className="sp-half top" aria-hidden="true">{word$}</div>
        <div className="sp-half bot" aria-hidden="true">{word$}<em>Scroll</em></div>
      </div>
    </section>
  )
}
