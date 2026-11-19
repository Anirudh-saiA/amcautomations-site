'use client'

import { useEffect, useRef } from 'react'
import { autoplay } from '@/lib/autoplay'

/* a looping background video for a page header: fades in once it plays, pauses off screen,
   phones get the lighter file, reduced motion keeps the still poster */
export default function PageVideo({ name }: { name: string }) {
  const vid = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = vid.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.classList.add('on'); return }
    v.src = `/assets/clips/${name}${window.innerWidth <= 700 ? '-540' : ''}.mp4`
    const show = () => v.classList.add('on')
    v.addEventListener('playing', show, { once: true })
    /* if the browser blocks autoplay, show the still poster instead of an empty header */
    const stop = autoplay(v, show)
    return () => { stop(); v.removeEventListener('playing', show) }
  }, [name])

  return (
    <>
      <video ref={vid} className="phead-video" poster={`/assets/clips/${name}-poster.jpg`} muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
    </>
  )
}
