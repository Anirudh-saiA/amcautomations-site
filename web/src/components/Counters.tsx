'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* numbers in the "At a glance" strip count up once when they scroll into view */
export default function Counters() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const fmt = (v: number) => Math.round(v).toLocaleString('en-US')
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count)
        if (!end) return
        const o = { v: 0 }
        el.textContent = '0'
        gsap.to(o, {
          v: end, duration: 2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = fmt(o.v) },
        })
      })
    })
    return () => ctx.revert()
  }, [])
  return null
}
