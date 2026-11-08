'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PRODUCTS } from '@/lib/content'

/* A pinned scroll story. As you scroll, the four products take turns on stage.
   Below 861px (or with reduced motion) it is just a normal stacked list. */
export default function Story() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia()
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.story-card')
      const names = gsap.utils.toArray<HTMLElement>('.story-name')
      const n = cards.length
      gsap.set(cards, { opacity: 0, y: 60, scale: 0.94 })
      gsap.set(cards[0], { opacity: 1, y: 0, scale: 1 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.story-pin', start: 'top top', end: `+=${n * 70}%`, scrub: 0.6, pin: true, anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999))
            names.forEach((el, k) => el.classList.toggle('on', k === i))
          },
        },
      })
      tl.fromTo('.story-bar-fill', { scaleX: 0 }, { scaleX: 1, duration: n }, 0)
      for (let i = 1; i < n; i++) {
        tl.to(cards[i - 1], { opacity: 0, y: -50, scale: 0.94, duration: 0.22 }, i - 0.28)
        tl.fromTo(cards[i], { opacity: 0, y: 60, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.25 }, i - 0.12)
      }
      names[0]?.classList.add('on')
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="story" id="story" ref={root}>
      <div className="story-pin">
        <div className="story-left">
          <span className="kicker">What we sell</span>
          <h2>Four products. Pick the one that hurts most.</h2>
          <ul className="story-names">
            {PRODUCTS.map((e, i) => (
              <li className={`story-name ${e.tone}`} key={e.title}>
                <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                {e.title}
              </li>
            ))}
          </ul>
          <span className="story-bar" aria-hidden="true"><span className="story-bar-fill" /></span>
        </div>
        <div className="story-stage">
          {PRODUCTS.map((e) => (
            <article className={`story-card ${e.tone}`} key={e.title}>
              <span className="tag">{e.tag}</span>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
