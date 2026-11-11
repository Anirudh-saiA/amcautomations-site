'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* scroll-linked motion for the AI Content Studio page: hero drift, a progress line through the steps,
   and the workflow cards lighting up one after another */
export default function AgencyMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia()
    const t = window.setTimeout(() => {
      const ctx = gsap.context(() => {
        const hero = document.querySelector('.phead.has-video')
        if (hero) {
          gsap.to('.phead.has-video .phead-video', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
          gsap.to('.phead.has-video .phead-in', { yPercent: -12, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: hero, start: '20% top', end: 'bottom 20%', scrub: true } })
        }
        const pipe = document.querySelector<HTMLElement>('.pipe')
        if (pipe) {
          const steps = Array.from(pipe.querySelectorAll('li'))
          ScrollTrigger.create({
            trigger: pipe, start: 'top 75%', end: 'bottom 60%', scrub: true,
            onUpdate: (s) => {
              pipe.style.setProperty('--p', String(s.progress))
              steps.forEach((li, i) => li.classList.toggle('lit', s.progress >= i / steps.length + 0.05))
            },
          })
        }
        const flow = document.querySelector('.flow')
        if (flow) {
          const items = Array.from(flow.querySelectorAll('li'))
          items.forEach((li, i) => ScrollTrigger.create({
            trigger: li, start: 'top 70%', end: 'bottom 30%',
            toggleClass: { targets: li, className: 'on' },
          }))
        }
        gsap.utils.toArray<HTMLElement>('.svc li, .aud article').forEach((el) =>
          ScrollTrigger.create({ trigger: el, start: 'top 62%', end: 'bottom 38%', toggleClass: { targets: el, className: 'on' } }))
        mm.add('(min-width: 861px)', () => {
          gsap.utils.toArray<HTMLElement>('.clips > *').forEach((c, i) =>
            gsap.fromTo(c, { yPercent: 8 + (i % 2) * 6 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.clips', start: 'top bottom', end: 'bottom top', scrub: true } }))
        })
      })
      ;(window as unknown as { __agencyCtx?: gsap.Context }).__agencyCtx = ctx
    }, 400)
    return () => {
      window.clearTimeout(t)
      mm.revert()
      ;(window as unknown as { __agencyCtx?: gsap.Context }).__agencyCtx?.revert()
    }
  }, [])
  return null
}
