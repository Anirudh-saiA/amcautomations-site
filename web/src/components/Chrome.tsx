'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NAV, SITE } from '@/lib/content'

/* the menu: one flat list. AI Content Studio opens For agencies, AI Commerce Operations opens Done for you */
const MENU: { href: string; label: string }[] = NAV

/* floating pill nav with a mobile sheet */
export function Nav({ hasLogo = false }: { hasLogo?: boolean }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const brandRef = useRef<HTMLAnchorElement>(null)

  /* the AMC mark starts centred at the top and glides smoothly to the top left corner as you scroll;
     it turns white while it is over a dark band or the footer */
  useEffect(() => {
    const el = brandRef.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.to(el, {
          x: () => {
            const pad = Math.max(16, Math.min(window.innerWidth * 0.03, 36))
            return -(window.innerWidth / 2 - pad - (el.offsetWidth * 0.84) / 2) /* centre to the top left corner */
          },
          scale: 0.84, ease: 'power2.inOut',
          scrollTrigger: { start: 0, end: '+=420', scrub: 1, invalidateOnRefresh: true },
        })
      }
    })
    /* white mark while something dark is really under it: look at what sits at the mark's centre and read its
       actual background colour (so desktop split bands, mobile bands and the footer all work), once per frame while scrolling */
    const lum = (c: string) => {
      const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null
      const [r, g, b, a = 1] = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number)
      return a < 0.6 ? null : (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    }
    const check = () => {
      const r = el.getBoundingClientRect()
      let hit = false
      for (const n of document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)) {
        if (n === el || el.contains(n)) continue
        if (n.closest('.phead-video')) { hit = true; break }
        const l = lum(getComputedStyle(n).backgroundColor)
        if (l !== null) { hit = l < 0.4; break }
      }
      el.classList.toggle('inv', hit)
    }
    /* scrubbed scroll animations lag behind the scroll position, so check on every animation frame, not on scroll events */
    let frame = 0
    const tick = () => { if (++frame % 2 === 0) check() }
    gsap.ticker.add(tick)
    return () => { ctx.revert(); gsap.ticker.remove(tick) }
  }, [path])

  /* while the menu is open: Escape closes it and the page behind does not scroll */
  useEffect(() => {
    if (!open) return
    const burger = burgerRef.current
    /* keep keyboard focus inside the drawer while it is open */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key !== 'Tab' || !sheetRef.current) return
      /* the burger stays visible (as the X) above the drawer, so it is part of the loop */
      const items = [burger, ...Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a[href]'))].filter(Boolean) as HTMLElement[]
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => sheetRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true }), 80)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      burger?.focus({ preventScroll: true }) /* hand focus back to the hamburger */
    }
  }, [open])

  return (
    <>
      <header className="nav">
        <span aria-hidden="true" />
        <Link ref={brandRef} className="brand brand-pill" href="/" aria-label="AMC automations, home" onClick={() => setOpen(false)}>
          {hasLogo ? <span className="brand-logo" aria-hidden="true" /> : (
            <>
              <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M11 47 L32 17 L53 47" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="47" r="9.5" fill="#3B74EE" /><circle cx="32" cy="17" r="9.5" fill="#EE7A2E" /><circle cx="53" cy="47" r="9.5" fill="#1F9D57" /></svg>
              AMC
            </>
          )}
        </Link>
        <div className="nav-right">
          <button
            ref={burgerRef}
            className="burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>
      <div className={`sheet-backdrop${open ? ' open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <nav id="site-menu" ref={sheetRef} className={`sheet${open ? ' open' : ''}`} aria-label="Main" inert={!open}>
        <span className="sheet-label">Menu</span>
        {MENU.map((n, i) => (
          <Fragment key={n.href}>
            <Link href={n.href} style={{ ['--i' as string]: i }} className={path === n.href ? 'on' : ''} aria-current={path === n.href ? 'page' : undefined} onClick={() => setOpen(false)}>
              <small>0{i + 1}</small>{n.label}
            </Link>
          </Fragment>
        ))}
        <a className="btn orange" style={{ ['--i' as string]: MENU.length }} href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Book a call on WhatsApp</a>
      </nav>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-in">
        <div>
          <div className="brand light">AMC<small>automations</small></div>
          <p className="footer-note">{SITE.approval}</p>
        </div>
        <nav aria-label="Footer">
          <span className="footer-h">Explore</span>
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        </nav>
        <nav aria-label="Company">
          <span className="footer-h">Company</span>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <div className="footer-contact">
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Book a call on WhatsApp</a>
          {SITE.emails.map((m) => <a key={m} href={`mailto:${m}`}>{m}</a>)}
          <span>{SITE.name} · {SITE.person}</span>
        </div>
      </div>
    </footer>
  )
}

/* one place that wires scroll reveals for every [data-reveal] element on the page */
export function Reveals() {
  const path = usePathname()
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    gsap.ticker.lagSmoothing(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let ctx: gsap.Context | undefined
    /* wait until React has finished hydrating this page before touching its DOM */
    const start = window.setTimeout(() => {
      document.documentElement.classList.add('js') /* CSS hides [data-reveal] only when JS is running */
      ctx = gsap.context(() => {
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 90%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: 48, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.09, overwrite: true },
            ),
        })
        ScrollTrigger.refresh()
        /* arriving on /#video, /#d2c or /#outreach: land exactly on that section, after the pinned layout is measured */
        const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null
        if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
      })
    }, 450)
    return () => {
      window.clearTimeout(start)
      ctx?.revert()
    }
  }, [path])
  return null
}
