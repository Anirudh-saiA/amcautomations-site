'use client'

import { useEffect, useRef } from 'react'
import { autoplay } from '@/lib/autoplay'

/* a square, black-outlined video box that loops silently while it is on screen.
   Every screen gets the 1080 file (the box is never wider than about 700px); reduced motion keeps the still poster. */
export default function LoopVideo({ name, label }: { name: string; label: string }) {
  const vid = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = vid.current
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.src = `/assets/clips/${name}-1080.mp4`
    return autoplay(v)
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
