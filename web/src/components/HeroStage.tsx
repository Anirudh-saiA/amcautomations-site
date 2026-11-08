'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/* palette v1 only, as CSS variables */
const K = {
  k3: 'var(--black-3)', k4: 'var(--black-4)',
  w: 'var(--beige-1)', b2: 'var(--beige-2)', b3: 'var(--beige-3)', b4: 'var(--beige-4)',
  bl1: 'var(--blue-1)', bl2: 'var(--blue-2)', bl3: 'var(--blue-3)', bl4: 'var(--blue-4)', bl5: 'var(--blue-5)',
  or1: 'var(--orange-1)', or2: 'var(--orange-2)', or3: 'var(--orange-3)', or4: 'var(--orange-4)',
  gr1: 'var(--green-1)', gr2: 'var(--green-2)', gr3: 'var(--green-3)', gr4: 'var(--green-4)', gr5: 'var(--green-5)',
}

const CHAPTERS = ['Describe it in plain words', 'The agent gets built', 'It runs, around the clock']
const LINE1 = 'Follow up every new lead on WhatsApp,'
const LINE2 = 'research them first, then book a call.'
const NODES = [
  { t: 'New lead', s: 'Instagram ad', f: K.bl1, d: K.bl4 },
  { t: 'Research', s: 'Reads her site', f: K.bl1, d: K.bl4 },
  { t: 'Write', s: 'One real detail', f: K.or1, d: K.or4 },
  { t: 'Send', s: 'On WhatsApp', f: K.gr1, d: K.gr4 },
]
const TOTAL = 17

/* A looping, video-style scene: you type a prompt, the agent is built, then it runs
   (a worker carries documents from one server to another). Palette colours only. */
export default function HeroStage() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const q = <T extends Element = SVGElement>(s: string) => el.querySelector(s) as T
    const qa = <T extends Element = SVGElement>(s: string) => Array.from(el.querySelectorAll(s)) as T[]
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const pa = q('#pa'), pb = q('#pb'), pc = q('#pc')
    const l1 = q<SVGTextElement>('#l1'), l2 = q<SVGTextElement>('#l2'), caret = q('#caret')
    const nodes = qa('.node'), links = qa<SVGPathElement>('.dl'), robot = q('#robot'), eyes = qa('.eye')
    const ready = q('#ready'), btn = q('#btn')
    const wk = q('#wk'), bob = q('#bob'), legL = q('#legL'), legR = q('#legR'), wdoc = q('#wdoc')
    const pks = qa('.pk'), ledsB = qa('.ledB'), ok = q('#ok'), booked = q('#booked')
    const cap = q<HTMLElement>('.vid-cap'), dots = qa<HTMLElement>('.vid-dot'), fill = q('.vid-fill')

    const setChapter = (i: number) => {
      cap.textContent = CHAPTERS[i]
      dots.forEach((d, k) => d.classList.toggle('on', k === i))
    }
    const moveCaret = (t: SVGTextElement, y: number) => {
      gsap.set(caret, { attr: { x: 74 + t.getComputedTextLength(), y } })
    }

    if (reduce) {
      gsap.set([pa, pb], { autoAlpha: 0 })
      gsap.set(pc, { autoAlpha: 1 })
      gsap.set(wk, { x: 436 }); gsap.set(wdoc, { autoAlpha: 0 })
      gsap.set([ok, booked], { autoAlpha: 1, scale: 1 })
      gsap.set(ledsB, { attr: { fill: K.gr2 } })
      gsap.set(fill, { scaleX: 1 })
      setChapter(2)
      return
    }

    gsap.set([legL, legR], { transformOrigin: '50% 0%' })

    /* stroke-draw lengths */
    links.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }) })

    let io: IntersectionObserver | undefined
    const ctx = gsap.context(() => {
      gsap.from(el, { y: 44, opacity: 0, scale: 0.97, duration: 1.1, ease: 'power3.out', delay: 0.3 })

      const reset = () => {
        l1.textContent = ''; l2.textContent = ''
        gsap.set(caret, { attr: { x: 74, y: 160 } })
        gsap.set(ledsB, { attr: { fill: K.or3 } })
        gsap.set(pks, { autoAlpha: 0 })
        gsap.set(wdoc, { autoAlpha: 1 })
        setChapter(0)
      }

      const tl = gsap.timeline({ repeat: -1, delay: 0.9 })
      tl.call(reset, [], 0)
      tl.set(pa, { autoAlpha: 1, y: 0 }, 0).set([pb, pc], { autoAlpha: 0 }, 0)
      tl.set(nodes, { autoAlpha: 0 }, 0).set(links, { strokeDashoffset: (_, t: SVGPathElement) => t.getTotalLength() }, 0)
      tl.set([robot, ready, ok, booked], { autoAlpha: 0 }, 0)
      tl.set(wk, { x: 170 }, 0)

      /* 1 · describe it: the prompt types itself, then Build is pressed */
      tl.fromTo(pa, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0.05)
      const a = { n: 0 }, b = { n: 0 }
      tl.to(a, { n: LINE1.length, duration: 1.8, ease: 'none', onUpdate: () => { l1.textContent = LINE1.slice(0, Math.round(a.n)); moveCaret(l1, 160) } }, 0.7)
      tl.to(b, { n: LINE2.length, duration: 1.7, ease: 'none', onUpdate: () => { l2.textContent = LINE2.slice(0, Math.round(b.n)); moveCaret(l2, 198) } }, 2.7)
      tl.to(btn, { scale: 0.92, svgOrigin: '502 240', duration: 0.12, yoyo: true, repeat: 1 }, 4.5)
      tl.to(pa, { autoAlpha: 0, y: -14, duration: 0.4, ease: 'power2.in' }, 4.95)

      /* 2 · the agent gets built */
      tl.call(() => setChapter(1), [], 5.2)
      tl.set(pb, { autoAlpha: 1 }, 5.2)
      NODES.forEach((_, i) => {
        const cx = 36 + i * 150 + 62
        tl.fromTo(nodes[i], { scale: 0.6, autoAlpha: 0, svgOrigin: `${cx} 108` }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, 5.4 + i * 0.6)
        if (i < 3) tl.to(links[i], { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, 5.75 + i * 0.6)
      })
      links.slice(3).forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 7.8 + i * 0.08))
      tl.fromTo(robot, { scale: 0.3, autoAlpha: 0, svgOrigin: '320 338' }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2.2)' }, 8.1)
      tl.fromTo(ready, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }, 8.9)
      ;[9.3, 10.0].forEach((t) => tl.to(eyes, { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: 1 }, t))
      tl.to(pb, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 10.1)

      /* 3 · it runs: a worker carries a document from one server to the other */
      tl.call(() => setChapter(2), [], 10.5)
      tl.fromTo(pc, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 10.5)
      tl.fromTo(wk, { x: 170 }, { x: 436, duration: 3.4, ease: 'none' }, 11.2)
      tl.fromTo(legL, { rotation: 28 }, { rotation: -28, duration: 0.28, yoyo: true, repeat: 11, ease: 'sine.inOut' }, 11.2)
      tl.fromTo(legR, { rotation: -28 }, { rotation: 28, duration: 0.28, yoyo: true, repeat: 11, ease: 'sine.inOut' }, 11.2)
      tl.fromTo(bob, { y: 0 }, { y: -4, duration: 0.28, yoyo: true, repeat: 11, ease: 'sine.inOut' }, 11.2)
      pks.forEach((p, i) => {
        const t = 11.3 + i * 0.75
        tl.set(p, { autoAlpha: 1, x: 168, y: 200, rotation: -8 }, t)
        tl.to(p, { x: 496, duration: 1.5, ease: 'power1.inOut' }, t)
        tl.to(p, { y: 140, duration: 0.75, ease: 'sine.out', yoyo: true, repeat: 1 }, t)
        tl.set(p, { autoAlpha: 0 }, t + 1.5)
        tl.set(ledsB[i], { attr: { fill: K.gr2 } }, t + 1.5)
      })
      tl.set(wdoc, { autoAlpha: 0 }, 14.6)
      tl.fromTo(ok, { scale: 0, autoAlpha: 0, svgOrigin: '544 120' }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(3)' }, 14.7)
      tl.fromTo(booked, { scale: 0, autoAlpha: 0, svgOrigin: '400 78' }, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(2.4)' }, 15.0)
      tl.to(pc, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 16.6)

      tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: 'none' }, 0)
      /* no work while the hero is off screen */
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.05 })
      io.observe(el)
    }, root)

    return () => { io?.disconnect(); ctx.revert() }
  }, [])

  return (
    <div className="vid" ref={root} role="img" aria-label="Looping animation: a prompt is typed, an agent is built, then it carries documents between two servers and books a call">
      <div className="vid-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <b>agent-studio</b>
        <em><i />Live</em>
      </div>

      <svg viewBox="0 0 640 380" className="vid-svg" aria-hidden="true" focusable="false">
        {/* 1 · prompt */}
        <g id="pa" className="ph">
          <rect x="48" y="62" width="544" height="214" rx="26" fill={K.w} stroke={K.k3} strokeWidth="2.5" />
          <circle cx="82" cy="98" r="8" fill={K.or3} />
          <text x="100" y="104" className="vt" fontSize="15" fontWeight="700" fill={K.bl4}>New agent</text>
          <text id="l1" x="74" y="160" className="vt" fontSize="23" fontWeight="600" fill={K.k3} />
          <text id="l2" x="74" y="198" className="vt" fontSize="23" fontWeight="600" fill={K.k3} />
          <rect id="caret" className="caret" x="74" y="160" width="3" height="26" rx="1.5" fill={K.bl3} transform="translate(0,-21)" />
          <g id="btn">
            <rect x="440" y="222" width="124" height="38" rx="19" fill={K.or3} stroke={K.k3} strokeWidth="2.5" />
            <text x="502" y="246" textAnchor="middle" className="vt" fontSize="15" fontWeight="800" fill={K.k3}>Build agent</text>
          </g>
        </g>

        {/* 2 · build */}
        <g id="pb" className="ph off">
          {NODES.map((n, i) => {
            const x = 36 + i * 150
            return (
              <g className="node" key={n.t}>
                <rect x={x} y="60" width="124" height="96" rx="20" fill={n.f} stroke={K.k3} strokeWidth="2.5" />
                <circle cx={x + 26} cy="86" r="12" fill={n.d} />
                <text x={x + 26} y="91" textAnchor="middle" className="vt" fontSize="14" fontWeight="800" fill={K.w}>{i + 1}</text>
                <text x={x + 14} y="124" className="vt" fontSize="18" fontWeight="800" fill={K.k3}>{n.t}</text>
                <text x={x + 14} y="144" className="vt" fontSize="12.5" fontWeight="600" fill={K.k4}>{n.s}</text>
              </g>
            )
          })}
          {[0, 1, 2].map((i) => (
            <path key={i} className="dl" d={`M${36 + i * 150 + 124} 108 H${36 + (i + 1) * 150}`} stroke={K.k3} strokeWidth="3" strokeLinecap="round" fill="none" />
          ))}
          {[0, 1, 2, 3].map((i) => {
            const x = 36 + i * 150 + 62
            return <path key={i} className="dl" d={`M${x} 156 C${x} 190 320 170 320 206`} stroke={K.b4} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" fill="none" />
          })}
          <g id="robot">
            <line x1="320" y1="206" x2="320" y2="222" stroke={K.k3} strokeWidth="3" strokeLinecap="round" />
            <circle cx="320" cy="202" r="7" fill={K.or3} stroke={K.k3} strokeWidth="2.5" />
            <rect x="266" y="222" width="108" height="86" rx="28" fill={K.bl3} stroke={K.k3} strokeWidth="2.5" />
            <rect x="256" y="248" width="9" height="26" rx="4.5" fill={K.or3} stroke={K.k3} strokeWidth="2" />
            <rect x="375" y="248" width="9" height="26" rx="4.5" fill={K.or3} stroke={K.k3} strokeWidth="2" />
            <rect x="280" y="236" width="80" height="48" rx="18" fill={K.w} />
            <circle className="eye" cx="305" cy="257" r="6.5" fill={K.k3} />
            <circle className="eye" cx="335" cy="257" r="6.5" fill={K.k3} />
            <path d="M310 270 Q320 278 330 270" stroke={K.k3} strokeWidth="3" strokeLinecap="round" fill="none" />
            <rect x="286" y="308" width="68" height="26" rx="12" fill={K.bl4} stroke={K.k3} strokeWidth="2.5" />
          </g>
          <g id="ready">
            <rect x="436" y="296" width="156" height="36" rx="18" fill={K.gr4} stroke={K.k3} strokeWidth="2.5" />
            <text x="514" y="320" textAnchor="middle" className="vt" fontSize="15" fontWeight="800" fill={K.w}>Agent ready</text>
          </g>
        </g>

        {/* 3 · run */}
        <g id="pc" className="ph off">
          <line x1="20" y1="302" x2="620" y2="302" stroke={K.b4} strokeWidth="4" strokeLinecap="round" />
          {/* server A */}
          <rect x="40" y="130" width="112" height="172" rx="18" fill={K.bl4} stroke={K.k3} strokeWidth="2.5" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="54" y={146 + i * 50} width="84" height="38" rx="9" fill={K.bl5} />
              <circle cx="124" cy={165 + i * 50} r="4.5" fill={K.gr2} className="led" style={{ animationDelay: `${i * 0.3}s` }} />
              <rect x="64" y={160 + i * 50} width="34" height="6" rx="3" fill={K.bl2} />
            </g>
          ))}
          <text x="96" y="326" textAnchor="middle" className="vt" fontSize="15" fontWeight="800" fill={K.k3}>Your CRM</text>
          {/* server B */}
          <rect x="488" y="130" width="112" height="172" rx="18" fill={K.gr4} stroke={K.k3} strokeWidth="2.5" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x="502" y={146 + i * 50} width="84" height="38" rx="9" fill={K.gr5} />
              <circle className="ledB" cx="572" cy={165 + i * 50} r="4.5" fill={K.or3} />
              <rect x="512" y={160 + i * 50} width="34" height="6" rx="3" fill={K.gr2} />
            </g>
          ))}
          <text x="544" y="326" textAnchor="middle" className="vt" fontSize="15" fontWeight="800" fill={K.k3}>Customer inbox</text>

          {/* flying documents */}
          {[0, 1, 2].map((i) => (
            <g className="pk" key={i}>
              <rect x="0" y="0" width="20" height="26" rx="4" fill={K.w} stroke={K.k3} strokeWidth="2" />
              <rect x="4" y="7" width="12" height="3" rx="1.5" fill={K.bl3} />
              <rect x="4" y="13" width="9" height="3" rx="1.5" fill={K.or3} />
            </g>
          ))}

          {/* the worker, feet at (0,302) */}
          <g id="wk" transform="translate(0 302)">
            <g id="wkin">
              <ellipse cx="0" cy="2" rx="22" ry="5" fill={K.k3} opacity="0.12" />
              <g id="bob">
                <rect id="legR" x="-9" y="-36" width="8" height="36" rx="4" fill={K.bl5} stroke={K.k3} strokeWidth="2" />
                <rect id="legL" x="1" y="-36" width="8" height="36" rx="4" fill={K.bl4} stroke={K.k3} strokeWidth="2" />
                <rect x="-16" y="-70" width="32" height="40" rx="12" fill={K.or3} stroke={K.k3} strokeWidth="2.5" />
                <rect x="-16" y="-54" width="32" height="5" fill={K.w} />
                <circle cx="0" cy="-86" r="16" fill={K.w} stroke={K.k3} strokeWidth="2.5" />
                <path d="M-17 -90 a17 15 0 0 1 34 0 z" fill={K.bl3} stroke={K.k3} strokeWidth="2.5" strokeLinejoin="round" />
                <circle cx="-5" cy="-84" r="2.4" fill={K.k3} />
                <circle cx="6" cy="-84" r="2.4" fill={K.k3} />
                <path d="M-4 -78 Q0 -74 5 -78" stroke={K.k3} strokeWidth="2" strokeLinecap="round" fill="none" />
                <rect x="8" y="-62" width="20" height="9" rx="4.5" fill={K.or3} stroke={K.k3} strokeWidth="2" />
                <g id="wdoc">
                  <rect x="18" y="-82" width="24" height="30" rx="4" fill={K.w} stroke={K.k3} strokeWidth="2.2" />
                  <rect x="23" y="-74" width="14" height="3" rx="1.5" fill={K.bl3} />
                  <rect x="23" y="-67" width="10" height="3" rx="1.5" fill={K.or3} />
                </g>
              </g>
            </g>
          </g>

          <g id="ok">
            <circle cx="544" cy="104" r="17" fill={K.gr3} stroke={K.k3} strokeWidth="2.5" />
            <path d="M536 104 l6 6 l11 -12" stroke={K.w} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          <g id="booked">
            <rect x="318" y="58" width="164" height="38" rx="19" fill={K.or3} stroke={K.k3} strokeWidth="2.5" />
            <text x="400" y="83" textAnchor="middle" className="vt" fontSize="16" fontWeight="800" fill={K.k3}>Call booked</text>
          </g>
        </g>
      </svg>

      <div className="vid-ctl">
        <span className="vid-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor" /></svg>
        </span>
        <span className="vid-cap" aria-hidden="true">{CHAPTERS[0]}</span>
        <span className="vid-dots" aria-hidden="true"><i className="vid-dot on" /><i className="vid-dot" /><i className="vid-dot" /></span>
        <span className="vid-prog" aria-hidden="true"><span className="vid-fill" /></span>
      </div>
    </div>
  )
}
