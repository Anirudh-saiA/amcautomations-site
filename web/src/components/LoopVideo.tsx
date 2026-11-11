'use client'

import { useEffect, useRef } from 'react'

/* a square, black-outlined video box that loops silently while it is on screen.
   Phones get the 1080 file, everything else the 4K one; reduced motion keeps the still poster. */
export default function LoopVideo({ name, label }: { name: string; label: string }) {
  const vid = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = vid.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.src = `/assets/clips/${name}${window.innerWidth <= 700 ? '-1080' : ''}.mp4`
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.2 })
    io.observe(v)
    return () => io.disconnect()
  }, [name])

  return (
    <div className="win win-square" role="group" aria-label={label}>
      <div className="win-body">
        <video
          ref={vid}
          className="win-video"
          poster={`/assets/clips/${name}-poster.jpg`}
          width={2160}
          height={2160}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
        />
      </div>
    </div>
  )
}
