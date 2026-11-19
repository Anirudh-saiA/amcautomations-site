/* Starts a silent looping video when it is on screen and pauses it when it is not.
   Phones in Low Power Mode, data savers and some browsers refuse to autoplay: when that happens the poster
   image stays visible (onBlocked) and playback is tried again on the first touch, click, key or scroll,
   which every browser allows. Returns a cleanup function. */
export function autoplay(v: HTMLVideoElement, onBlocked?: () => void) {
  v.muted = true
  v.defaultMuted = true
  v.playsInline = true
  let visible = false
  let blockedReported = false
  const events: (keyof WindowEventMap)[] = ['touchstart', 'pointerdown', 'keydown', 'scroll']
  const retry = () => { if (visible) attempt() }
  const unbind = () => events.forEach((e) => window.removeEventListener(e, retry))
  const attempt = () => {
    const p = v.play()
    if (p && typeof p.then === 'function') {
      p.then(unbind).catch(() => {
        if (!blockedReported) { blockedReported = true; onBlocked?.() }
        events.forEach((e) => window.addEventListener(e, retry, { once: true, passive: true }))
      })
    }
  }
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) attempt(); else v.pause()
  }, { threshold: 0.05 })
  io.observe(v)
  const onVis = () => { if (document.visibilityState === 'visible' && visible && v.paused) attempt() }
  document.addEventListener('visibilitychange', onVis)
  return () => { io.disconnect(); unbind(); document.removeEventListener('visibilitychange', onVis) }
}
