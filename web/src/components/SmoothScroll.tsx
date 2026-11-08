'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* inertia scrolling, driven by GSAP's own ticker so pinned sections and scrubbed motion stay in step */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 })
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    /* the open menu locks the page */
    const obs = new MutationObserver(() => (document.body.style.overflow === 'hidden' ? lenis.stop() : lenis.start()))
    obs.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => { obs.disconnect(); gsap.ticker.remove(tick); lenis.destroy(); delete (window as unknown as { __lenis?: Lenis }).__lenis }
  }, [])
  return null
}
