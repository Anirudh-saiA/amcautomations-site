'use client'
/* This file is an imperative three.js scene: mutating three objects, the camera and refs inside render and
   useFrame is how React Three Fiber works, so the React-compiler purity rules below do not apply here. */
/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'

/* ============================================================
   AMC palette v1
   ============================================================ */
const C = {
  blue1: '#E4EDFE', blue2: '#A5C0FA', blue3: '#3B74EE', blue4: '#2559C9', blue5: '#163A8A',
  orange1: '#FDEBDD', orange2: '#F8B98A', orange3: '#EE7A2E', orange4: '#CC5F1A', orange5: '#8A3D0E',
  green1: '#E3F4EA', green2: '#9ADBB4', green3: '#1F9D57', green4: '#17803F', green5: '#0E5229',
  beige1: '#FFFFFF', beige2: '#FAF7F2', beige3: '#F0E9DD', beige4: '#DDD2C0', beige5: '#B9AB92',
}

/* ============================================================
   Clay look: a fine grain bump map on every material
   ============================================================ */
let grainTex: THREE.CanvasTexture | null = null
function grain() {
  if (grainTex) return grainTex
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(s, s)
  let a = 12345
  const rnd = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + rnd() * 145
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 2)
  grainTex = t
  return t
}

function Clay({ color, rough = 0.9, bump = 0.5 }: { color: string; rough?: number; bump?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={0} bumpMap={grain()} bumpScale={bump} />
}

/* ============================================================
   Terrain: flat in the middle, hills to the sides and back
   ============================================================ */
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
function hill(x: number, z: number) {
  const sx = smooth(8, 16, Math.abs(x))
  const sb = smooth(-4, -17, z)
  const sf = smooth(4.5, 9.5, z)
  const roll = 0.65 + 0.35 * Math.sin(x * 0.4 + z * 0.3)
  return (sx * 2.4 + sb * 2.2) * roll + sf * 1.5 + 0.14 * Math.sin(x * 1.3) * Math.sin(z * 1.1) * (sx + sb + sf)
}

function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(84, 52, 180, 112)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    const col = new Float32Array(p.count * 3)
    const near = new THREE.Color(C.green4)
    const mid = new THREE.Color(C.green3)
    const far = new THREE.Color(C.green2)
    const tmp = new THREE.Color()
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i) - 8
      const h = hill(x, z)
      p.setY(i, h)
      const farK = smooth(-4, -24, z)
      tmp.copy(near).lerp(mid, Math.min(1, h / 2.4)).lerp(far, farK * 0.85)
      col[i * 3] = tmp.r
      col[i * 3 + 1] = tmp.g
      col[i * 3 + 2] = tmp.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} position={[0, 0, -8]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} bumpMap={grain()} bumpScale={0.6} />
    </mesh>
  )
}

function Tree({ x, z, s = 1, color = C.green4 }: { x: number; z: number; s?: number; color?: string }) {
  const y = hill(x, z)
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 1, 10]} />
        <Clay color={C.beige5} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.8, 24, 20]} />
        <Clay color={color} />
      </mesh>
      <mesh position={[-0.28, 1.8, 0.4]} castShadow>
        <sphereGeometry args={[0.36, 18, 14]} />
        <Clay color={C.green3} />
      </mesh>
    </group>
  )
}

/* ============================================================
   Physics world (all in scene units; 1 unit is roughly a metre)
   ============================================================ */
const G = 8 /* gravity, a little gentle so the motion reads */
const BR = 0.27 /* ball radius */
const CZ = 0.5 /* the plane everything sits on */
const FLOOR = 0.03 + BR /* ball-centre height when rolling on the green */
const BOUNCE = 0.38
const C_SLIDE = 0.62 /* viscous drag on the slide */
const FX = { flag: 0, arch: 0 }

/* funnel geometry */
const FUN = { x: -4.6, spout: 3.9, mouth: 5.3, rSpout: 0.36, rMouth: 1.1 }
const wallRho = (y: number) => {
  const k = Math.min(1, Math.max(0, (y - FUN.spout) / (FUN.mouth - FUN.spout)))
  return FUN.rSpout + (FUN.rMouth - FUN.rSpout) * k - BR
}

/* the slide: a banked S-curve from the funnel spout down to a lip over the green */
const SLIDE = new THREE.CatmullRomCurve3(
  [
    [-4.6, 3.85, 0.5], [-4.5, 3.35, 0.55], [-3.9, 2.95, 0.85], [-2.8, 2.75, 0.62], [-1.6, 2.5, 0.22],
    [-0.4, 2.2, 0.38], [0.8, 1.85, 0.72], [1.9, 1.5, 0.52], [2.9, 1.15, 0.5],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'catmullrom',
  0.5,
)
const SLIDE_LEN = SLIDE.getLength()
const UP = new THREE.Vector3(0, 1, 0)
const TROUGH = 0.16

const fP = new THREE.Vector3()
const fT = new THREE.Vector3()
const fS = new THREE.Vector3()
const fU = new THREE.Vector3()
function frameAt(u: number) {
  const uu = Math.min(1, Math.max(0, u))
  SLIDE.getPointAt(uu, fP)
  SLIDE.getTangentAt(uu, fT)
  fS.crossVectors(fT, UP).normalize()
  fU.crossVectors(fS, fT).normalize()
}

type Phase = 'wait' | 'drop' | 'funnel' | 'slide' | 'air' | 'roll' | 'sink'
type Ball = {
  phase: Phase
  t: number
  pos: THREE.Vector3
  vel: THREE.Vector3
  s: number
  v: number
  theta: number
  mom: number
  sway: number
  squash: number
  hidden: boolean
}
const newBall = (): Ball => ({
  phase: 'wait', t: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3(),
  s: 0, v: 0, theta: 0, mom: 0, sway: 0, squash: 0, hidden: true,
})

/* one step of the ball rolling down the slide. returns 'exit' at the lip */
function stepSlide(b: Ball, dt: number): 'exit' | null {
  frameAt(b.s / SLIDE_LEN)
  const acc = (5 / 7) * G * -fT.y - C_SLIDE * b.v /* rolling sphere */
  b.v = Math.max(0.25, b.v + acc * dt)
  b.s += b.v * dt
  if (b.s >= SLIDE_LEN) {
    frameAt(1)
    b.pos.copy(fP).addScaledVector(fU, BR - TROUGH)
    b.vel.copy(fT).multiplyScalar(b.v)
    return 'exit'
  }
  frameAt(b.s / SLIDE_LEN)
  b.pos.copy(fP).addScaledVector(fU, BR - TROUGH).addScaledVector(fS, b.sway * Math.sin(b.s * 2.3) * 0.07)
  return null
}

/* projectile flight and bounce on the putting green */
function stepAir(b: Ball, dt: number): 'bounce' | 'land' | null {
  b.vel.y -= G * dt
  b.pos.addScaledVector(b.vel, dt)
  if (b.pos.y <= FLOOR && b.vel.y < 0) {
    b.pos.y = FLOOR
    const vy = -b.vel.y * BOUNCE
    b.vel.x *= 0.9
    b.vel.z *= 0.9
    if (vy < 1.1) {
      b.vel.y = 0
      return 'land'
    }
    b.vel.y = vy
    return 'bounce'
  }
  return null
}

/* rolling on grass: constant rolling resistance + a little viscous drag */
function rollSpeed(b: Ball, dt: number, k1: number) {
  const sp = Math.hypot(b.vel.x, b.vel.z)
  if (sp < 1e-4) return 0
  const ns = Math.max(0, sp - (k1 + 0.3 * sp) * dt)
  const k = ns / sp
  b.vel.x *= k
  b.vel.z *= k
  return ns
}

/* Calibrate once: tune grass friction so a ball arrives at the hole slowly, then put the hole there. */
const HOLE_TARGET_X = 5.75
let CAL: { hx: number; hz: number; k1: number; exitSpeed: number } | null = null
function calibrate() {
  if (CAL) return CAL
  /* the slide does not depend on the grass: run it once and reuse its exit state */
  const dt = 1 / 120
  const s0 = newBall()
  s0.phase = 'slide'
  s0.s = 0
  s0.v = 0.9
  s0.sway = 0
  let g0 = 0
  while (g0++ < 20000 && stepSlide(s0, dt) !== 'exit') { /* roll down */ }
  const exitPos = s0.pos.clone()
  const exitVel = s0.vel.clone()
  const exitSpeed = s0.v
  const sim = (k1: number) => {
    const b = newBall()
    b.pos.copy(exitPos)
    b.vel.copy(exitVel)
    let guard = 0
    while (guard++ < 40000 && stepAir(b, dt) !== 'land') { /* fly */ }
    while (guard++ < 80000) {
      const sp = rollSpeed(b, dt, k1)
      b.pos.x += b.vel.x * dt
      b.pos.z += b.vel.z * dt
      if (sp <= 1.0) break
    }
    return { x: b.pos.x, z: b.pos.z, exitSpeed }
  }
  let lo = 0.3
  let hi = 7
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2
    if (sim(mid).x > HOLE_TARGET_X) lo = mid
    else hi = mid
  }
  const k1 = (lo + hi) / 2
  const r = sim(k1)
  CAL = { hx: r.x, hz: r.z, k1, exitSpeed: r.exitSpeed }
  return CAL
}

/* ============================================================
   Scenery built from clay primitives
   ============================================================ */
function Funnel() {
  const geo = useMemo(() => {
    const k = (FUN.rMouth - FUN.rSpout) / (FUN.mouth - FUN.spout)
    const pts = [
      [FUN.rSpout, -0.35], [FUN.rSpout, 0], [FUN.rMouth, FUN.mouth - FUN.spout], [FUN.rMouth + 0.07, FUN.mouth - FUN.spout + 0.04],
      [FUN.rMouth - 0.03, FUN.mouth - FUN.spout + 0.06], [FUN.rSpout - 0.07 + k * 0.05, 0.06], [FUN.rSpout - 0.07, -0.35],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    /* leave the camera side open so you can watch the ball spiral down */
    return new THREE.LatheGeometry(pts, 64, 0.95, Math.PI * 2 - 1.9)
  }, [])
  return (
    <group position={[FUN.x, FUN.spout, CZ]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={C.beige3} roughness={0.9} side={THREE.DoubleSide} bumpMap={grain()} bumpScale={0.4} />
      </mesh>
      <mesh position={[0, FUN.mouth - FUN.spout + 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[FUN.rMouth + 0.01, 0.09, 14, 48]} />
        <Clay color={C.orange3} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x * 0.9, -1.95, -0.2]} rotation={[0, 0, x > 0 ? -0.1 : 0.1]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 3.9, 10]} />
          <Clay color={C.orange5} />
        </mesh>
      ))}
    </group>
  )
}

function Hopper() {
  /* a crane arm holding the dispenser above the funnel */
  return (
    <group>
      <mesh position={[-6.0, 3.3, CZ]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 6.6, 12]} />
        <Clay color={C.orange5} />
      </mesh>
      <mesh position={[-5.15, 6.55, CZ]} castShadow>
        <boxGeometry args={[1.9, 0.16, 0.2]} />
        <Clay color={C.orange5} />
      </mesh>
      <group position={[-4.08, 6.25, CZ]}>
        <RoundedBox args={[1.0, 0.7, 0.8]} radius={0.16} smoothness={5} castShadow>
          <Clay color={C.orange3} />
        </RoundedBox>
        <mesh position={[0, -0.38, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.2, 0.22, 20]} />
          <Clay color={C.blue5} />
        </mesh>
        <mesh position={[0, 0.2, 0.41]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          <Clay color={C.beige1} />
        </mesh>
      </group>
    </group>
  )
}

function SlideTrack() {
  const { trough, rails, struts } = useMemo(() => {
    const N = 170
    const NU = 11
    const w = 0.42
    const pos: number[] = []
    const idx: number[] = []
    const railA: THREE.Vector3[] = []
    const railB: THREE.Vector3[] = []
    for (let i = 0; i <= N; i++) {
      frameAt(i / N)
      for (let k = 0; k < NU; k++) {
        const u = (k / (NU - 1)) * 2 - 1
        const v = -TROUGH + 0.34 * Math.pow(Math.abs(u), 2.4)
        pos.push(fP.x + fS.x * u * w + fU.x * v, fP.y + fS.y * u * w + fU.y * v, fP.z + fS.z * u * w + fU.z * v)
      }
      railA.push(fP.clone().addScaledVector(fS, w).addScaledVector(fU, 0.18))
      railB.push(fP.clone().addScaledVector(fS, -w).addScaledVector(fU, 0.18))
    }
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < NU - 1; k++) {
        const a = i * NU + k
        const b = a + 1
        const c = a + NU
        const d = c + 1
        idx.push(a, c, b, b, c, d)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    const uv: number[] = []
    for (let i = 0; i <= N; i++) for (let k = 0; k < NU; k++) uv.push(k / (NU - 1), (i / N) * 12)
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    const ra = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railA), 120, 0.055, 8, false)
    const rb = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railB), 120, 0.055, 8, false)
    const st: { x: number; y: number; z: number }[] = []
    for (let k = 1; k < 9; k++) {
      frameAt(k / 9)
      if (fP.y > 0.9) st.push({ x: fP.x, y: fP.y - 0.22, z: fP.z })
    }
    return { trough: g, rails: [ra, rb], struts: st }
  }, [])
  return (
    <group>
      <mesh geometry={trough} castShadow receiveShadow>
        <meshStandardMaterial color={C.orange3} roughness={0.85} side={THREE.DoubleSide} bumpMap={grain()} bumpScale={0.4} />
      </mesh>
      {rails.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <Clay color={C.blue3} />
        </mesh>
      ))}
      {struts.map((s, i) => (
        <mesh key={i} position={[s.x, s.y / 2, s.z]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, s.y, 10]} />
          <Clay color={C.orange5} />
        </mesh>
      ))}
    </group>
  )
}

function Gear({ r = 0.34, color, dir, teeth = 9, position }: { r?: number; color: string; dir: number; teeth?: number; position: [number, number, number] }) {
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += dir * (1.1 + FX.arch * 4) * Math.min(dt, 0.05)
  })
  return (
    <group ref={g} position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, 0.14, 28]} />
        <Clay color={color} />
      </mesh>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (r + 0.05), Math.sin(a) * (r + 0.05), 0]} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[0.14, 0.13, 0.14]} />
            <Clay color={color} />
          </mesh>
        )
      })}
      <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
        <Clay color={C.beige1} />
      </mesh>
    </group>
  )
}

/* the AUTOPILOT gateway the slide runs through */
function Arch() {
  const X = 0.15
  const dots: [number, string][] = [[-0.3, C.green3], [0, C.orange3], [0.3, C.blue3]]
  return (
    <group position={[X, 0, CZ]} rotation={[0, 0.6, 0]}>
      {[-1.15, 1.15].map((z) => (
        <RoundedBox key={z} args={[0.55, 3.5, 0.55]} radius={0.12} smoothness={4} position={[0, 1.75, z]} castShadow receiveShadow>
          <Clay color={C.beige3} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.9, 0.6, 3.1]} radius={0.16} smoothness={4} position={[0, 3.6, 0]} castShadow>
        <Clay color={C.blue5} />
      </RoundedBox>
      {dots.map(([z, c]) => (
        <mesh key={z} position={[0.0, 3.95, z]}>
          <sphereGeometry args={[0.1, 14, 12]} />
          <Clay color={c} />
        </mesh>
      ))}
      <Gear color={C.blue3} dir={1} position={[0.0, 3.6, 1.62]} />
      <Gear color={C.orange3} dir={-1} position={[0.0, 3.6, -1.62]} />
    </group>
  )
}

/* the putting green, the hole and the flag */
function Green() {
  const { hx, hz } = calibrate()
  const flag = useRef<THREE.Group>(null)
  useFrame(({ clock }, dt) => {
    FX.flag = Math.max(0, FX.flag - Math.min(dt, 0.05) * 1.6)
    FX.arch = Math.max(0, FX.arch - Math.min(dt, 0.05) * 0.8)
    if (flag.current) {
      flag.current.rotation.y = Math.sin(clock.elapsedTime * 3.2) * 0.22 + FX.flag * Math.sin(clock.elapsedTime * 28) * 0.5
      flag.current.scale.y = 1 + FX.flag * 0.25
    }
  })
  const cx = hx - 0.8
  return (
    <group>
      <mesh position={[cx, 0.015, hz]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.6, 0.06, 64]} />
        <Clay color={C.green2} rough={0.95} bump={0.45} />
      </mesh>
      <mesh position={[cx, 0.05, hz]} receiveShadow>
        <cylinderGeometry args={[2.1, 2.1, 0.03, 64]} />
        <Clay color="#B8E6CB" rough={0.95} bump={0.3} />
      </mesh>
      <mesh position={[hx, 0.07, hz]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#0a1a10" />
      </mesh>
      <mesh position={[hx, 0.065, hz]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.41, 0.04, 10, 32]} />
        <Clay color={C.beige1} />
      </mesh>
      <group position={[hx + 0.34, 0, hz - 0.1]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 1.9, 8]} />
          <Clay color={C.beige1} />
        </mesh>
        <group ref={flag} position={[0, 1.6, 0]}>
          <mesh position={[0.28, 0, 0]} castShadow>
            <boxGeometry args={[0.56, 0.34, 0.03]} />
            <Clay color={C.orange3} />
          </mesh>
        </group>
      </group>
      {[1.7, 2.35].map((dx, i) => (
        <mesh key={dx} position={[hx + dx, 0.42, hz - 0.6 + i * 0.9]} castShadow>
          <sphereGeometry args={[0.55 + i * 0.12, 20, 16]} />
          <Clay color={i ? C.green4 : C.green5} />
        </mesh>
      ))}
    </group>
  )
}

/* ============================================================
   The loop: hopper -> funnel spiral -> slide -> air -> green -> hole
   ============================================================ */
const BALL_COLORS = [C.blue3, C.orange3, C.beige1, C.green3, C.orange2, C.blue2]
const N_BALLS = 6
const SPAWN_GAP = 1.55

function Balls() {
  const cal = calibrate()
  const hole = useMemo(() => new THREE.Vector3(cal.hx, FLOOR, cal.hz), [cal])
  const balls = useRef<Ball[]>([])
  if (balls.current.length === 0) {
    for (let i = 0; i < N_BALLS; i++) {
      const b = newBall()
      b.t = 0.6 + i * SPAWN_GAP
      b.sway = ((i * 37) % 10) / 10 - 0.5
      balls.current.push(b)
    }
  }
  const outer = useRef<(THREE.Group | null)[]>([])
  const inner = useRef<(THREE.Group | null)[]>([])
  const puffs = useRef<{ m: THREE.Mesh | null; t: number }[]>(Array.from({ length: 6 }, () => ({ m: null, t: 9 })))
  const bits = useRef<{ m: THREE.Mesh | null; t: number; v: THREE.Vector3 }[]>(Array.from({ length: 12 }, () => ({ m: null, t: 9, v: new THREE.Vector3() })))
  const q = useMemo(() => new THREE.Quaternion(), [])
  const ax = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const bitCols = [C.orange3, C.blue3, C.green3, C.orange2, C.blue2]

  const puff = (x: number, z: number) => {
    const p = puffs.current.find((e) => e.t >= 1) ?? puffs.current[0]
    p.t = 0
    if (p.m) p.m.position.set(x, 0.1, z)
  }
  const burst = () => {
    bits.current.forEach((b, i) => {
      b.t = 0
      const a = (i / bits.current.length) * Math.PI * 2
      b.v.set(Math.cos(a) * (0.8 + (i % 3) * 0.4), 3.2 + (i % 4) * 0.5, Math.sin(a) * (0.8 + (i % 2) * 0.5))
      if (b.m) b.m.position.set(hole.x, 0.2, hole.z)
    })
    FX.flag = 1
  }
  const roll = (i: number, up: THREE.Vector3, v: THREE.Vector3, dt: number) => {
    const m = inner.current[i]
    if (!m) return
    ax.copy(up).cross(v)
    const len = ax.length()
    if (len < 1e-4) return
    q.setFromAxisAngle(ax.divideScalar(len), (v.length() * dt) / BR)
    m.quaternion.premultiply(q)
  }

  const acc = useRef(0)
  const STEP = 1 / 120

  /* one fixed physics step for one ball */
  const stepBall = (i: number, b: Ball, h: number) => {
    switch (b.phase) {
      case 'wait': {
        b.hidden = true
        b.t -= h
        if (b.t <= 0) {
          b.phase = 'drop'
          b.pos.set(FUN.x + 0.52, 5.85, CZ)
          b.vel.set(0, -0.4, 0)
          b.hidden = false
          b.squash = 0
        }
        break
      }
      case 'drop': {
        b.vel.y -= G * h
        b.pos.y += b.vel.y * h
        if (b.pos.y <= FUN.mouth && 0.52 >= wallRho(b.pos.y)) {
          b.phase = 'funnel'
          b.theta = 0
          b.mom = 0.52 * 0.52 * 3.2 /* angular momentum, conserved as the radius shrinks */
          b.squash = 0.4
        }
        break
      }
      case 'funnel': {
        b.vel.y = Math.max(-3.4, b.vel.y - 0.55 * G * h)
        b.pos.y += b.vel.y * h
        const rho = Math.max(0.05, wallRho(b.pos.y))
        const w = Math.min(15, b.mom / (rho * rho))
        b.theta += w * h
        b.pos.x = FUN.x + rho * Math.cos(b.theta)
        b.pos.z = CZ + rho * Math.sin(b.theta)
        const m = inner.current[i]
        if (m) m.rotation.x += h * 6
        if (b.pos.y <= FUN.spout + 0.02) {
          b.phase = 'slide'
          b.s = 0
          b.v = Math.min(2.2, Math.abs(b.vel.y) * 0.7) + 0.5
        }
        break
      }
      case 'slide': {
        if (stepSlide(b, h) === 'exit') b.phase = 'air'
        frameAt(b.s / SLIDE_LEN)
        roll(i, fU, fT, h * b.v)
        break
      }
      case 'air': {
        const e = stepAir(b, h)
        const m = inner.current[i]
        if (m) m.rotation.x += h * 6
        if (e) {
          b.squash = e === 'bounce' ? 0.7 : 0.4
          puff(b.pos.x, b.pos.z)
          if (e === 'land') b.phase = 'roll'
        }
        break
      }
      case 'roll': {
        const sp = rollSpeed(b, h, cal.k1)
        /* a very gentle bowl around the cup keeps every ball honest */
        tmp.set(hole.x - b.pos.x, 0, hole.z - b.pos.z)
        const d = tmp.length()
        if (d < 1.0 && d > 1e-3) {
          const pull = 1.6 * (1 - d / 1.0)
          b.vel.x += (tmp.x / d) * pull * h
          b.vel.z += (tmp.z / d) * pull * h
        }
        if (sp < 0.06 && d > 0.4) {
          b.vel.x += (tmp.x / Math.max(d, 1e-3)) * 0.8 * h
          b.vel.z += (tmp.z / Math.max(d, 1e-3)) * 0.8 * h
        }
        b.pos.x += b.vel.x * h
        b.pos.z += b.vel.z * h
        roll(i, UP, b.vel, h)
        if (d < 0.4 && sp < 2.6) {
          b.phase = 'sink'
          b.t = 0
        }
        break
      }
      case 'sink': {
        b.t += h
        b.pos.x += (hole.x - b.pos.x) * Math.min(1, h * 10)
        b.pos.z += (hole.z - b.pos.z) * Math.min(1, h * 10)
        b.vel.y -= G * h
        b.pos.y += b.vel.y * h
        if (b.pos.y < FLOOR - 0.45) {
          b.phase = 'wait'
          b.hidden = true
          b.t = 1.0
          b.vel.set(0, 0, 0)
          burst()
        }
        break
      }
    }
  }

  useFrame((_, rawDt) => {
    /* fixed-step physics: stays correct at any frame rate */
    acc.current += Math.min(rawDt, 0.25)
    let guard = 0
    while (acc.current >= STEP && guard++ < 120) {
      for (let i = 0; i < N_BALLS; i++) stepBall(i, balls.current[i], STEP)
      acc.current -= STEP
    }
    if (guard >= 120) acc.current = 0

    const dt = Math.min(rawDt, 0.05)
    let underArch = false
    for (let i = 0; i < N_BALLS; i++) {
      const b = balls.current[i]
      const og = outer.current[i]
      if (!og) continue
      og.visible = !b.hidden
      og.position.copy(b.pos)
      b.squash = Math.max(0, b.squash - dt * 3.2)
      const sq = b.squash * Math.sin(b.squash * 9)
      og.scale.set(1 + 0.22 * sq, 1 - 0.3 * sq, 1 + 0.22 * sq)
      if (b.phase === 'slide' && Math.abs(b.pos.x - 0.15) < 0.9) underArch = true
    }
    if (underArch) FX.arch = Math.min(1, FX.arch + dt * 6)
    /* dust puffs */
    puffs.current.forEach((p) => {
      if (!p.m) return
      p.t = Math.min(1, p.t + dt * 2.2)
      p.m.visible = p.t < 1
      const s = 0.15 + p.t * 0.55
      p.m.scale.setScalar(s)
      ;(p.m.material as THREE.MeshStandardMaterial).opacity = 0.55 * (1 - p.t)
    })
    /* confetti from the cup */
    bits.current.forEach((b) => {
      if (!b.m) return
      b.t = Math.min(1.2, b.t + dt)
      b.m.visible = b.t < 1.1
      if (b.t < 1.1) {
        b.v.y -= G * 0.6 * dt
        b.m.position.addScaledVector(b.v, dt)
        b.m.rotation.x += dt * 9
        b.m.rotation.z += dt * 7
        b.m.scale.setScalar(Math.max(0, 1 - b.t / 1.1))
      }
    })
  })

  return (
    <group>
      {Array.from({ length: N_BALLS }).map((_, i) => (
        <group key={i} ref={(g) => { outer.current[i] = g }} visible={false}>
          <group ref={(g) => { inner.current[i] = g }}>
            <mesh castShadow>
              <sphereGeometry args={[BR, 32, 24]} />
              <Clay color={BALL_COLORS[i % BALL_COLORS.length]} rough={0.8} bump={0.3} />
            </mesh>
            {/* dimples make the rolling visible */}
            {[[0.17, 0.08, 0.06], [-0.1, 0.15, 0.09], [0.02, -0.18, 0.07], [-0.15, -0.06, -0.11]].map((d, k) => (
              <mesh key={k} position={d.map((v) => (v * BR) / 0.2) as [number, number, number]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshStandardMaterial color="#3A3732" roughness={1} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
      {puffs.current.map((p, i) => (
        <mesh key={i} ref={(m) => { p.m = m }} visible={false}>
          <sphereGeometry args={[1, 14, 12]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.5} roughness={1} depthWrite={false} />
        </mesh>
      ))}
      {bits.current.map((b, i) => (
        <mesh key={i} ref={(m) => { b.m = m }} visible={false}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={bitCols[i % bitCols.length]} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ============================================================
   Decor
   ============================================================ */
function Windmill() {
  const blades = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z -= Math.min(dt, 0.05) * 0.9
  })
  const x = 3.4
  const z = -6
  const y = hill(x, z)
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.42, 2.2, 14]} />
        <Clay color={C.beige3} />
      </mesh>
      <group ref={blades} position={[0, 2.25, 0.3]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <mesh position={[0, 0.85, 0]} castShadow>
              <boxGeometry args={[0.32, 1.6, 0.06]} />
              <Clay color={C.blue3} />
            </mesh>
          </group>
        ))}
        <mesh>
          <sphereGeometry args={[0.16, 14, 12]} />
          <Clay color={C.orange3} />
        </mesh>
      </group>
    </group>
  )
}

function Balloon({ position, color, stripe, s = 1 }: { position: [number, number, number]; color: string; stripe: string; s?: number }) {
  return (
    <Float speed={1.2} floatIntensity={0.7} rotationIntensity={0.15}>
      <group position={position} scale={s}>
        <mesh scale={[1, 1.18, 1]} castShadow>
          <sphereGeometry args={[0.7, 26, 20]} />
          <Clay color={color} />
        </mesh>
        <mesh position={[0, 0.05, 0]} scale={[1.01, 1.19, 0.3]} castShadow>
          <sphereGeometry args={[0.7, 26, 20]} />
          <Clay color={stripe} />
        </mesh>
        <mesh position={[0, -1.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.22, 0.3]} />
          <Clay color={C.orange5} />
        </mesh>
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, -0.85, 0]} rotation={[0, 0, x > 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 5]} />
            <Clay color={C.beige5} />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

function Cloud({ x, y, z, s, speed }: { x: number; y: number; z: number; s: number; speed: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (g.current) g.current.position.x = ((x + clock.elapsedTime * speed + 24) % 48) - 24
  })
  const puffs: [number, number, number, number][] = [[0, 0, 0, 1], [-1, -0.15, 0.1, 0.75], [1.05, -0.1, 0, 0.8], [0.3, 0.45, 0, 0.7]]
  return (
    <group ref={g} position={[x, y, z]} scale={s}>
      {puffs.map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <sphereGeometry args={[r, 20, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.35} bumpMap={grain()} bumpScale={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ============================================================
   Camera: centred on the scene, fit to the screen, slight pointer parallax
   ============================================================ */
function Rig() {
  const { camera, size, pointer } = useThree()
  const snapped = useRef('')
  useFrame(() => {
    const aspect = size.width / size.height
    /* the scene is ~13 units wide and ~7 tall: fit the width, but never get closer than 22.5 */
    const z = Math.max(14.5 / (0.536 * aspect), 25.5)
    const tx = 0.1 + pointer.x * 0.8
    const ty = 5.2 + pointer.y * 0.3
    const key = `${size.width}x${size.height}`
    if (snapped.current !== key) {
      snapped.current = key
      camera.position.set(tx, ty, z)
    }
    camera.position.x += (tx - camera.position.x) * 0.05
    camera.position.y += (ty - camera.position.y) * 0.05
    camera.position.z += (z - camera.position.z) * 0.08
    camera.lookAt(0.1, 2.0, CZ)
  })
  return null
}

function World() {
  return (
    <>
      <fog attach="fog" args={['#D7E5FA', 26, 64]} />
      <hemisphereLight args={['#E4EDFE', '#1F9D57', 0.9]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[-5, 12, 9]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={11}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={44}
        shadow-bias={-0.0006}
      />
      <Rig />
      <Ground />
      <Hopper />
      <Funnel />
      <SlideTrack />
      <Arch />
      <Green />
      <Balls />
      <Windmill />
      <Balloon position={[-1.9, 5.4, -3]} color={C.orange3} stripe={C.blue3} />
      <Balloon position={[3.0, 5.6, -5]} color={C.blue3} stripe={C.beige1} s={0.75} />
      <Cloud x={-9} y={6.4} z={-10} s={1.5} speed={0.25} />
      <Cloud x={3} y={7.2} z={-13} s={1.8} speed={0.18} />
      <Cloud x={12} y={6.0} z={-11} s={1.3} speed={0.3} />
      <Tree x={-8.6} z={0.5} s={1.2} />
      <Tree x={-7.4} z={-2.2} s={0.85} color={C.green3} />
      <Tree x={-10} z={-3} s={1.4} color={C.green5} />
      <Tree x={8.9} z={0.8} s={1.15} />
      <Tree x={10.4} z={-1.6} s={1.4} color={C.green3} />
      <Tree x={7.6} z={-4.2} s={0.9} color={C.green5} />
    </>
  )
}

export default function ClayScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="scene" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ fov: 30, position: [0.4, 5.2, 22.5], near: 0.1, far: 120 }}
        frameloop={reduce ? 'demand' : visible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true }}
      >
        <World />
      </Canvas>
    </div>
  )
}
