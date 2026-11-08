'use client'
/* An imperative three.js scene: mutating three objects, the camera and refs inside render and useFrame is how
   React Three Fiber works, so the React-compiler purity rules below do not apply to this file. */
/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect */

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { ThreeElements } from '@react-three/fiber'
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
  black3: '#1E1C18', black4: '#3A3732',
}
const INK = '#1E1C18'
type V3 = [number, number, number]

/* ============================================================
   Clay look: a fine grain bump map + a cartoon ink outline
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

const clayCache = new Map<string, THREE.MeshStandardMaterial>()
function clayMat(color: string, rough: number, bump: number) {
  const key = `${color}|${rough}|${bump}`
  let m = clayCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, bumpMap: grain(), bumpScale: bump })
    clayCache.set(key, m)
  }
  return m
}
/* materials are shared by colour, so the scene stays light on the GPU */
function Clay({ color, rough = 0.9, bump = 0.5 }: { color: string; rough?: number; bump?: number }) {
  return <primitive object={clayMat(color, rough, bump)} attach="material" />
}

/* rounded box (replaces the much larger drei helper): geometries are cached per size */
const rbCache = new Map<string, RoundedBoxGeometry>()
function RoundedBox({
  args, radius = 0.1, smoothness = 4, children, ...rest
}: { args: V3; radius?: number; smoothness?: number; children?: React.ReactNode } & Omit<ThreeElements['mesh'], 'args' | 'children'>) {
  const key = `${args.join(',')}|${radius}|${smoothness}`
  let g = rbCache.get(key)
  if (!g) {
    g = new RoundedBoxGeometry(args[0], args[1], args[2], Math.max(1, Math.round(smoothness)), Math.min(radius, Math.min(...args) / 2))
    rbCache.set(key, g)
  }
  return <mesh geometry={g} {...rest}>{children}</mesh>
}

/* a clay mesh with a thin ink outline (inverted hull) so figures and props read like doodles */
function Toon({
  children, color, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1], ink = 0.07, rough = 0.85, bump = 0.3, shadow,
}: {
  children: React.ReactNode; color: string; pos?: V3; rot?: V3; scl?: V3; ink?: number; rough?: number; bump?: number; shadow?: boolean
}) {
  return (
    <group position={pos} rotation={rot} scale={scl}>
      {/* outlined things (people, props) cast shadows; plain scenery (trees, houses) does not, to keep it light */}
      <mesh castShadow={shadow ?? ink > 0}>
        {children}
        <Clay color={color} rough={rough} bump={bump} />
      </mesh>
      {ink > 0 && (
        <mesh scale={1 + ink}>
          {children}
          <meshBasicMaterial color={INK} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  )
}

/* ============================================================
   Terrain: a flat factory yard in the middle, rolling hills around it
   ============================================================ */
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
function hill(x: number, z: number) {
  const sx = smooth(13, 26, Math.abs(x))
  const sb = smooth(-6, -26, z)
  const sf = smooth(7.5, 12, z)
  const roll = 0.6 + 0.4 * Math.sin(x * 0.27 + z * 0.21) * Math.cos(x * 0.13 - z * 0.17)
  return (sx * 2.6 + sb * 1.5) * roll + sf * 1.2 + 0.12 * Math.sin(x * 1.1) * Math.sin(z * 0.9) * (sx + sb + sf)
}

function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(110, 70, 150, 96)
    g.rotateX(-Math.PI / 2)
    const p = g.attributes.position
    const col = new Float32Array(p.count * 3)
    const near = new THREE.Color(C.green3)
    const mid = new THREE.Color(C.green3)
    const far = new THREE.Color(C.green2)
    const tmp = new THREE.Color()
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i) - 12
      const h = hill(x, z)
      p.setY(i, h)
      const farK = smooth(-6, -34, z)
      tmp.copy(near).lerp(mid, Math.min(1, h / 3.5)).lerp(far, farK * 0.8)
      col[i * 3] = tmp.r
      col[i * 3 + 1] = tmp.g
      col[i * 3 + 2] = tmp.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} position={[0, 0, -12]} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} bumpMap={grain()} bumpScale={0.6} />
    </mesh>
  )
}

/* seeded random so the landscape is the same on every load */
function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ============================================================
   Scenery: every tree, house and flower is drawn by just five instanced meshes
   ============================================================ */
type GeoKey = 'sph' | 'cyl' | 'cone' | 'cone4' | 'box'
type Inst = { g: GeoKey; m: THREE.Matrix4; c: string }

function buildScenery() {
  const insts: Inst[] = []
  const base = new THREE.Matrix4()
  const part = new THREE.Matrix4()
  const tmpQ = new THREE.Quaternion()
  const tmpS = new THREE.Vector3()
  const tmpP = new THREE.Vector3()
  const add = (g: GeoKey, p: V3, sc: V3, c: string) => {
    part.compose(tmpP.set(p[0], p[1], p[2]), tmpQ.identity(), tmpS.set(sc[0], sc[1], sc[2]))
    insts.push({ g, m: new THREE.Matrix4().multiplyMatrices(base, part), c })
  }
  const place = (x: number, z: number, s: number, ry = 0) => {
    base.compose(new THREE.Vector3(x, hill(x, z), z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(s, s, s))
  }

  /* trees and bushes */
  const r = rng(7)
  const kinds = ['round', 'pine', 'poplar', 'round', 'pine', 'bush']
  let count = 0
  let guard = 0
  while (count < 80 && guard++ < 2000) {
    const x = (r() - 0.5) * 70
    const z = -34 + r() * 40
    if (Math.abs(x) < 14 && z > -5.6 && z < 6) continue
    if (z > 1.2 && z < 6 && Math.abs(x) < 40) continue
    if (z > 6 || z < -15) continue
    const k = kinds[Math.floor(r() * kinds.length)]
    const far = smooth(-4, -30, z)
    const s = (0.7 + r() * 0.55) * (1 + far * 0.25)
    const tone = Math.floor(r() * 4)
    count++
    place(x, z, s)
    if (k === 'round') {
      const cols = [C.green4, C.green3, C.green5, C.green2]
      add('cyl', [0, 0.7, 0], [0.17, 1.4, 0.17], C.orange5)
      add('sph', [0, 2.0, 0], [1, 1, 1], cols[tone % 4])
      add('sph', [-0.62, 1.75, 0.25], [0.7, 0.7, 0.7], cols[(tone + 1) % 4])
      add('sph', [0.6, 1.85, -0.1], [0.72, 0.72, 0.72], cols[(tone + 2) % 4])
      add('sph', [0.05, 2.75, 0.05], [0.62, 0.62, 0.62], cols[tone % 4])
    } else if (k === 'pine') {
      const cols = [C.green5, C.green4, C.green3]
      add('cyl', [0, 0.45, 0], [0.13, 0.9, 0.13], C.orange5)
      for (let i = 0; i < 4; i++) add('cone', [0, 1.15 + i * 0.72, 0], [1.05 - i * 0.2, 1.25, 1.05 - i * 0.2], cols[(tone + i) % 3])
    } else if (k === 'poplar') {
      const cols = [C.green3, C.green4, C.green2]
      add('cyl', [0, 0.5, 0], [0.1, 1, 0.1], C.orange5)
      add('sph', [0, 2.5, 0], [0.62, 1.6, 0.62], cols[tone % 3])
    } else {
      const cols = [C.green4, C.green3, C.green5]
      add('sph', [0, 0.32, 0], [0.46, 0.46, 0.46], cols[tone % 3])
      add('sph', [0.38, 0.26, 0.1], [0.34, 0.34, 0.34], cols[(tone + 1) % 3])
      add('sph', [-0.34, 0.24, 0.12], [0.32, 0.32, 0.32], cols[(tone + 2) % 3])
    }
  }

  /* little houses far away on the hills */
  const rh = rng(33)
  const walls = [C.beige1, C.beige3, C.orange1, C.blue1, C.green1]
  const roofs = [C.orange3, C.blue4, C.orange4, C.green4, C.blue3]
  for (let i = 0; i < 22; i++) {
    const side = rh() < 0.5 ? -1 : 1
    const x = side * (9.5 + rh() * 17) + (rh() - 0.5) * 3
    const z = -14 - rh() * 14
    const s = 1.0 + rh() * 0.7
    const w = walls[Math.floor(rh() * 5)]
    const ro = roofs[Math.floor(rh() * 5)]
    place(x, z, s, (rh() - 0.5) * 0.8)
    add('box', [0, 0.45, 0], [1.5, 0.9, 1.2], w)
    add('cone4', [0, 1.2, 0], [1.31, 0.72, 1.05], ro)
    add('box', [0.25, 0.28, 0.61], [0.3, 0.56, 0.04], C.orange5)
    add('box', [-0.38, 0.55, 0.61], [0.28, 0.28, 0.04], C.blue2)
    add('box', [0.5, 1.35, -0.1], [0.2, 0.5, 0.2], C.orange5)
  }

  /* flowers on the near lawn */
  const rf = rng(21)
  const fcols = [C.orange3, C.beige1, C.blue2, C.orange2, C.orange1]
  for (let i = 0; i < 40; i++) {
    const x = (rf() - 0.5) * 34
    const z = 4.9 + rf() * 4
    const col = fcols[Math.floor(rf() * fcols.length)]
    const sc = 0.7 + rf() * 0.7
    if (Math.abs(x) < 3.5 && z < 5.4) continue
    place(x, z, sc)
    add('cyl', [0, 0.12, 0], [0.012, 0.24, 0.012], C.green4)
    add('sph', [0, 0.26, 0], [0.07, 0.07, 0.07], col)
  }

  /* group by shape and build one InstancedMesh each */
  const geos: Record<GeoKey, THREE.BufferGeometry> = {
    sph: new THREE.SphereGeometry(1, 14, 10),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
    cone: new THREE.ConeGeometry(1, 1, 12),
    cone4: new THREE.ConeGeometry(1, 1, 4).rotateY(Math.PI / 4),
    box: new THREE.BoxGeometry(1, 1, 1),
  }
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, metalness: 0, bumpMap: grain(), bumpScale: 0.35 })
  const group = new THREE.Group()
  const col = new THREE.Color()
  ;(Object.keys(geos) as GeoKey[]).forEach((g) => {
    const list = insts.filter((i) => i.g === g)
    if (!list.length) return
    const mesh = new THREE.InstancedMesh(geos[g], mat, list.length)
    list.forEach((it, idx) => {
      mesh.setMatrixAt(idx, it.m)
      mesh.setColorAt(idx, col.set(it.c))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.frustumCulled = false
    group.add(mesh)
  })
  return group
}

function Scenery() {
  const group = useMemo(() => buildScenery(), [])
  return <primitive object={group} />
}

/* ============================================================
   Clouds: fat, puffy clay clouds that drift slowly across the sky
   ============================================================ */
let cloudM: THREE.MeshStandardMaterial | null = null
let cloudBaseM: THREE.MeshStandardMaterial | null = null
const cloudMat = () => (cloudM ??= new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.95, bumpMap: grain(), bumpScale: 0.6, fog: false }))
const cloudBaseMat = () => (cloudBaseM ??= new THREE.MeshStandardMaterial({ color: C.blue1, roughness: 1, emissive: C.blue1, emissiveIntensity: 0.7, fog: false }))
const PUFFS: [number, number, number, number][] = [
  [0, 0, 0, 1.2], [-1.4, -0.15, 0.1, 0.9], [1.45, -0.1, 0, 0.95], [0.5, 0.62, 0, 0.85],
  [-0.65, 0.55, 0.1, 0.72], [2.45, -0.3, 0, 0.62], [-2.4, -0.3, 0, 0.62], [1.2, 0.5, 0.2, 0.6],
]
function PuffCloud({ x, y, z, s, speed }: { x: number; y: number; z: number; s: number; speed: number }) {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (g.current) g.current.position.x = ((x + clock.elapsedTime * speed + 46) % 92) - 46
  })
  return (
    <group ref={g} position={[x, y, z]} scale={s}>
      {PUFFS.map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} scale={[1, 0.92, 0.9]}>
          <sphereGeometry args={[r, 24, 18]} />
          <primitive object={cloudMat()} attach="material" />
        </mesh>
      ))}
      {/* a soft flat underside, so they read as clouds and not as a bunch of balls */}
      <mesh position={[0, -0.78, 0]} scale={[3.6, 0.55, 1.1]}>
        <sphereGeometry args={[1, 24, 12]} />
        <primitive object={cloudBaseMat()} attach="material" />
      </mesh>
    </group>
  )
}

function Sky() {
  return (
    <group>
      <PuffCloud x={-30} y={9.2} z={-30} s={2.6} speed={0.35} />
      <PuffCloud x={-5} y={11.6} z={-36} s={3.4} speed={0.25} />
      <PuffCloud x={24} y={8.8} z={-30} s={2.4} speed={0.4} />
      <PuffCloud x={42} y={11.2} z={-38} s={3.2} speed={0.2} />
      <PuffCloud x={-16} y={7.4} z={-26} s={1.8} speed={0.5} />
      <PuffCloud x={12} y={7.8} z={-27} s={2.0} speed={0.45} />
      <PuffCloud x={-42} y={8} z={-30} s={2.2} speed={0.3} />
    </group>
  )
}

/* ============================================================
   Shared state: what each station is doing right now
   ============================================================ */
const FX = {
  draw: 0, /* designer: 0..1 drawing progress */
  work: [-1, -1, -1] as number[], /* assemble, pack, label: item progress or -1 */
  chute: 0, /* 1 while a box slides to the truck */
  wave: 0, /* 1 for a moment when the truck is full and leaves */
  shipped: 0, /* parcels delivered to the truck so far: drives the results board */
}

/* ============================================================
   Doodle people
   ============================================================ */
type Role = 'designer' | 'assembleA' | 'assembleB' | 'packer' | 'stamper' | 'loader' | 'driver'
type Hat = 'beret' | 'hard' | 'cap' | 'tuft' | 'bun' | 'none'

type Outfit = 'vest' | 'overalls' | 'apron' | 'smock'
const OUTFIT: Record<Role, Outfit> = {
  designer: 'smock', assembleA: 'vest', assembleB: 'vest', packer: 'apron', stamper: 'overalls', loader: 'vest', driver: 'vest',
}

/* what each person wears over the base body: hi-vis vest, dungarees, packing apron or designer smock */
function OutfitMesh({ kind }: { kind: Outfit }) {
  if (kind === 'vest')
    return (
      <group>
        <Toon color={C.orange3} pos={[0, 0.7, 0]} scl={[1.1, 1.0, 1.14]} ink={0}><capsuleGeometry args={[0.245, 0.3, 8, 14]} /></Toon>
        {[0.6, 0.8].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.27, 0.028, 8, 28]} /><meshStandardMaterial color={C.beige1} roughness={0.7} /></mesh>
        ))}
        <Toon color={C.black4} pos={[0, 0.5, 0]} rot={[Math.PI / 2, 0, 0]} ink={0}><torusGeometry args={[0.265, 0.035, 8, 28]} /></Toon>
        <Toon color={C.black4} pos={[0.2, 0.46, 0.18]} ink={0.1}><boxGeometry args={[0.13, 0.12, 0.08]} /></Toon>
      </group>
    )
  if (kind === 'overalls')
    return (
      <group>
        <Toon color={C.blue4} pos={[0, 0.5, 0]} ink={0}><cylinderGeometry args={[0.262, 0.245, 0.36, 18]} /></Toon>
        <Toon color={C.blue4} pos={[0, 0.7, 0.2]} scl={[1.05, 1.1, 0.32]} ink={0}><sphereGeometry args={[0.2, 14, 10]} /></Toon>
        {[-0.13, 0.13].map((x) => (
          <group key={x}>
            <Toon color={C.blue4} pos={[x, 0.9, 0.12]} rot={[0.35, 0, x > 0 ? -0.12 : 0.12]} ink={0}><boxGeometry args={[0.07, 0.3, 0.04]} /></Toon>
            <mesh position={[x, 0.8, 0.22]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color={C.orange3} /></mesh>
          </group>
        ))}
        <Toon color={C.blue5} pos={[0, 0.62, 0.27]} ink={0}><boxGeometry args={[0.16, 0.1, 0.03]} /></Toon>
      </group>
    )
  if (kind === 'apron')
    return (
      <group>
        <Toon color={C.beige1} pos={[0, 0.62, 0.2]} scl={[0.95, 1.4, 0.3]} ink={0.03}><sphereGeometry args={[0.2, 14, 12]} /></Toon>
        <Toon color={C.orange3} pos={[0, 0.5, 0.27]} ink={0.1}><boxGeometry args={[0.22, 0.13, 0.03]} /></Toon>
        {[-0.14, 0.14].map((x) => (
          <Toon key={x} color={C.beige1} pos={[x, 0.93, 0.1]} rot={[0.4, 0, x > 0 ? -0.15 : 0.15]} ink={0}><boxGeometry args={[0.05, 0.26, 0.03]} /></Toon>
        ))}
      </group>
    )
  /* designer smock with a pen pocket */
  return (
    <group>
      <Toon color={C.beige3} pos={[0, 0.5, 0]} ink={0}><cylinderGeometry args={[0.27, 0.3, 0.42, 18]} /></Toon>
      <Toon color={C.beige1} pos={[-0.13, 0.56, 0.27]} ink={0.1}><boxGeometry args={[0.13, 0.13, 0.03]} /></Toon>
      <mesh position={[-0.16, 0.65, 0.27]}><cylinderGeometry args={[0.012, 0.012, 0.1, 6]} /><meshStandardMaterial color={C.orange3} /></mesh>
      <mesh position={[-0.11, 0.65, 0.27]}><cylinderGeometry args={[0.012, 0.012, 0.1, 6]} /><meshStandardMaterial color={C.blue3} /></mesh>
    </group>
  )
}

/* big shiny eyes, brows, a little nose and an open smile */
function Face() {
  return (
    <group>
      {[-0.125, 0.125].map((x) => (
        <group key={x} position={[x, 0.05, 0.285]}>
          <mesh><sphereGeometry args={[0.082, 14, 12]} /><meshBasicMaterial color={C.beige1} /></mesh>
          <mesh position={[0, -0.004, 0.058]}><sphereGeometry args={[0.052, 12, 10]} /><meshBasicMaterial color={INK} /></mesh>
          <mesh position={[0.018, 0.02, 0.098]}><sphereGeometry args={[0.018, 8, 8]} /><meshBasicMaterial color={C.beige1} /></mesh>
          <mesh position={[0, 0.115, 0.01]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]}><boxGeometry args={[0.09, 0.018, 0.02]} /><meshBasicMaterial color={INK} /></mesh>
        </group>
      ))}
      <mesh position={[0, -0.025, 0.345]} scale={[1, 0.8, 0.8]}><sphereGeometry args={[0.03, 10, 8]} /><meshStandardMaterial color={C.orange4} roughness={0.9} /></mesh>
      <mesh position={[0, -0.1, 0.318]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.075, 0.016, 6, 14, Math.PI]} /><meshBasicMaterial color={INK} /></mesh>
      {[-0.215, 0.215].map((x) => (
        <mesh key={x} position={[x, -0.045, 0.255]} scale={[1, 0.65, 0.4]}><sphereGeometry args={[0.058, 8, 8]} /><meshBasicMaterial color={C.orange3} transparent opacity={0.5} /></mesh>
      ))}
    </group>
  )
}

function Doodle({
  role, position, body, skin = C.orange2, hat = 'none', hatColor = C.orange3, s = 1, face = 0,
}: { role: Role; position: V3; body: string; skin?: string; hat?: Hat; hatColor?: string; s?: number; face?: number }) {
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const armA = useRef<THREE.Group>(null) /* character's left on screen */
  const armB = useRef<THREE.Group>(null)
  const phase = useMemo(() => (position[0] * 1.7) % 6, [position])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    const r = root.current, h = head.current, a = armA.current, b = armB.current
    if (!r || !h || !a || !b) return
    const bob = Math.abs(Math.sin(t * 2.2)) * 0.02
    r.position.y = position[1] + bob
    h.rotation.z = Math.sin(t * 1.4) * 0.06
    h.rotation.y = 0
    a.rotation.set(0, 0, 0.12 + Math.sin(t * 1.8) * 0.05)
    b.rotation.set(0, 0, -0.12 - Math.sin(t * 1.8 + 1) * 0.05)

    if (role === 'designer') {
      const d = FX.draw
      const drawing = d > 0.02 && d < 1
      if (drawing) {
        h.rotation.y = -0.55
        a.rotation.set(-0.3, 0, 2.2 + Math.sin(t * 15) * 0.2) /* drawing arm up at the board */
        b.rotation.set(0, 0, -0.2)
      } else {
        a.rotation.set(0, 0, 2.7 + Math.sin(t * 5) * 0.25) /* proud wave when the drawing is done */
      }
    } else if (role === 'assembleA' || role === 'assembleB') {
      const w = FX.work[0]
      if (w >= 0) {
        const k = role === 'assembleA' ? 0 : 1.6
        a.rotation.set(-1.15 - Math.abs(Math.sin(t * 9 + k)) * 0.9, 0, 0.1)
        b.rotation.set(-0.9, 0, -0.1)
        h.rotation.x = 0.15
      }
    } else if (role === 'packer') {
      const w = FX.work[1]
      if (w >= 0) {
        a.rotation.set(-1.25 + Math.sin(t * 7) * 0.18, 0, 0.1)
        b.rotation.set(-1.25 - Math.sin(t * 7) * 0.18, 0, -0.1)
        r.position.y += Math.sin(t * 7) * 0.012
      }
    } else if (role === 'stamper') {
      const w = FX.work[2]
      if (w >= 0) {
        const lift = w < 0.3 ? w / 0.3 : w < 0.42 ? 1 - (w - 0.3) / 0.12 : Math.max(0, 0.0)
        a.rotation.set(-(0.6 + lift * 1.25), 0, 0.1)
        b.rotation.set(-0.5, 0, -0.1)
      }
    } else if (role === 'loader') {
      if (FX.chute > 0.1) {
        a.rotation.set(-1.0 + Math.sin(t * 8) * 0.3, 0, 0.1)
        b.rotation.set(-1.0 - Math.sin(t * 8) * 0.3, 0, -0.1)
      } else {
        b.rotation.set(0, 0, -2.6 - Math.sin(t * 6) * 0.3) /* waving at the truck */
      }
    } else if (role === 'driver') {
      b.rotation.set(0, 0, -2.5 - Math.sin(t * 5 + FX.wave * 3) * 0.3)
    }
  })

  const outfit = OUTFIT[role]
  const pants = outfit === 'overalls' ? C.blue5 : C.black4
  const hand = role === 'designer' ? skin : C.beige1

  return (
    <group ref={root} position={position} rotation={[0, face, 0]} scale={s}>
      {/* trousers and work boots */}
      {[-0.13, 0.13].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Toon color={pants} pos={[0, 0.23, 0]} ink={0.09}><capsuleGeometry args={[0.078, 0.2, 6, 10]} /></Toon>
          <Toon color={C.black3} pos={[0, 0.07, 0.045]} scl={[1, 0.72, 1.55]} ink={0.1}><sphereGeometry args={[0.1, 12, 10]} /></Toon>
        </group>
      ))}
      {/* torso, outfit and name badge */}
      <Toon color={body} pos={[0, 0.7, 0]} ink={0.06}><capsuleGeometry args={[0.245, 0.3, 8, 14]} /></Toon>
      <OutfitMesh kind={outfit} />
      <Toon color={C.beige1} pos={[0.12, 0.84, 0.27]} ink={0.12}><boxGeometry args={[0.1, 0.06, 0.02]} /></Toon>
      <mesh position={[0.12, 0.84, 0.285]}><boxGeometry args={[0.07, 0.012, 0.01]} /><meshBasicMaterial color={C.orange3} /></mesh>
      {/* arms with sleeves and gloves */}
      <group ref={armA} position={[-0.29, 0.92, 0]}>
        <Toon color={body} pos={[0, -0.18, 0]} ink={0.12}><capsuleGeometry args={[0.068, 0.2, 6, 10]} /></Toon>
        <Toon color={hand} pos={[0, -0.37, 0]} ink={0.12}><sphereGeometry args={[0.085, 12, 10]} /></Toon>
        <Prop role={role} side="a" />
      </group>
      <group ref={armB} position={[0.29, 0.92, 0]}>
        <Toon color={body} pos={[0, -0.18, 0]} ink={0.12}><capsuleGeometry args={[0.068, 0.2, 6, 10]} /></Toon>
        <Toon color={hand} pos={[0, -0.37, 0]} ink={0.12}><sphereGeometry args={[0.085, 12, 10]} /></Toon>
        <Prop role={role} side="b" />
      </group>
      {/* head */}
      <group ref={head} position={[0, 1.32, 0]}>
        <Toon color={skin} ink={0.05}><sphereGeometry args={[0.37, 26, 20]} /></Toon>
        {[-0.36, 0.36].map((x) => (
          <Toon key={x} color={skin} pos={[x, -0.02, 0]} ink={0.1}><sphereGeometry args={[0.075, 10, 8]} /></Toon>
        ))}
        <Face />
        <HatMesh hat={hat} color={hatColor} />
      </group>
    </group>
  )
}

function HatMesh({ hat, color }: { hat: Hat; color: string }) {
  if (hat === 'none') return null
  if (hat === 'hard')
    return (
      <group>
        <Toon color={color} pos={[0, 0.2, 0]} scl={[1, 0.8, 1]} ink={0.06}><sphereGeometry args={[0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></Toon>
        <Toon color={color} pos={[0, 0.2, 0.14]} scl={[1, 0.25, 1]} ink={0.08}><cylinderGeometry args={[0.38, 0.38, 0.05, 20]} /></Toon>
      </group>
    )
  if (hat === 'cap')
    return (
      <group>
        <Toon color={color} pos={[0, 0.18, 0]} ink={0.06}><sphereGeometry args={[0.35, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></Toon>
        <Toon color={color} pos={[0, 0.17, 0.33]} scl={[1, 0.22, 1]} ink={0.1}><cylinderGeometry args={[0.2, 0.2, 0.05, 16]} /></Toon>
      </group>
    )
  if (hat === 'beret')
    return (
      <Toon color={color} pos={[0.06, 0.3, 0]} rot={[0, 0, -0.2]} scl={[1.2, 0.45, 1.1]} ink={0.07}><sphereGeometry args={[0.3, 18, 12]} /></Toon>
    )
  if (hat === 'bun')
    return (
      <group>
        <Toon color={color} pos={[0, 0.2, -0.03]} ink={0.05}><sphereGeometry args={[0.36, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></Toon>
        <Toon color={color} pos={[0, 0.42, -0.05]} ink={0.1}><sphereGeometry args={[0.13, 10, 8]} /></Toon>
      </group>
    )
  return (
    <group>
      <Toon color={color} pos={[0, 0.2, -0.02]} ink={0.05}><sphereGeometry args={[0.36, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></Toon>
      <Toon color={color} pos={[0.04, 0.46, 0.02]} rot={[0, 0, -0.35]} ink={0.12}><coneGeometry args={[0.07, 0.2, 8]} /></Toon>
    </group>
  )
}

/* what each worker holds */
function Prop({ role, side }: { role: Role; side: 'a' | 'b' }) {
  if (role === 'designer' && side === 'a')
    return (
      <group position={[0, -0.4, 0.04]}>
        <Toon color={C.orange3} pos={[0, 0.0, 0]} rot={[Math.PI / 2, 0, 0]} ink={0.15}><cylinderGeometry args={[0.025, 0.025, 0.3, 8]} /></Toon>
        <Toon color={C.black3} pos={[0, 0, 0.17]} rot={[Math.PI / 2, 0, 0]} ink={0}><coneGeometry args={[0.025, 0.07, 8]} /></Toon>
      </group>
    )
  if ((role === 'assembleA' || role === 'assembleB') && side === 'a')
    return (
      <group position={[0, -0.4, 0.05]}>
        <Toon color={C.orange5} pos={[0, 0, 0.1]} rot={[Math.PI / 2, 0, 0]} ink={0.12}><cylinderGeometry args={[0.025, 0.025, 0.32, 8]} /></Toon>
        <Toon color={C.black4} pos={[0, 0, 0.28]} ink={0.1}><boxGeometry args={[0.13, 0.1, 0.1]} /></Toon>
      </group>
    )
  if (role === 'packer' && side === 'a')
    return (
      <Toon color={C.blue3} pos={[0, -0.42, 0.1]} ink={0.1}><boxGeometry args={[0.1, 0.12, 0.24]} /></Toon>
    )
  if (role === 'stamper' && side === 'a')
    return (
      <group position={[0, -0.42, 0.06]}>
        <Toon color={C.orange5} pos={[0, 0, 0]} ink={0.12}><cylinderGeometry args={[0.04, 0.04, 0.2, 8]} /></Toon>
        <Toon color={C.green3} pos={[0, -0.14, 0]} ink={0.1}><cylinderGeometry args={[0.13, 0.13, 0.06, 14]} /></Toon>
      </group>
    )
  return null
}

/* ============================================================
   Line geometry
   ============================================================ */
const BELT_Y = 1.04
const BELT_Z = 0.5
const X0 = -6.4
const XE = 4.3
const CHX = XE + 0.15 /* where the slide to the truck starts */
const VB = 1.05
const ST = [{ x: -3.9, dur: 1.8 }, { x: -1.1, dur: 1.6 }, { x: 1.7, dur: 1.5 }]
const GAP = 1.15
const DRAW_DUR = 3.4
const TZ = 3.7
const DOCK = 5.1
const BED_X = -0.55
const slotLocal = (i: number): V3 => [BED_X - 0.62 + (i % 3) * 0.62, 1.02, i < 3 ? -0.3 : 0.3]

function Belt() {
  const stripes = useRef<(THREE.Mesh | null)[]>([])
  const len = XE + 0.3 - (X0 - 0.5)
  const cx = (XE + 0.3 + X0 - 0.5) / 2
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    stripes.current.forEach((m, i) => {
      if (m) m.position.x = X0 - 0.4 + ((i * 0.5 + t * VB) % len)
    })
  })
  return (
    <group>
      <RoundedBox args={[len, 0.22, 0.95]} radius={0.08} smoothness={4} position={[cx, BELT_Y - 0.12, BELT_Z]} castShadow receiveShadow>
        <Clay color={C.black4} rough={0.9} bump={0.2} />
      </RoundedBox>
      {Array.from({ length: Math.ceil(len / 0.5) }).map((_, i) => (
        <mesh key={i} ref={(m) => { stripes.current[i] = m }} position={[X0 + i * 0.5, BELT_Y - 0.005, BELT_Z]}>
          <boxGeometry args={[0.09, 0.015, 0.8]} />
          <meshStandardMaterial color={C.black3} roughness={1} />
        </mesh>
      ))}
      {[-0.43, 0.43].map((z) => (
        <RoundedBox key={z} args={[len, 0.1, 0.06]} radius={0.03} position={[cx, BELT_Y + 0.02, BELT_Z + z]}>
          <Clay color={C.orange3} />
        </RoundedBox>
      ))}
      {[-5.6, -3.4, -1.2, 1.0, 3.2].map((x) => (
        <group key={x}>
          {[-0.36, 0.36].map((z) => (
            <mesh key={z} position={[x, 0.45, BELT_Z + z]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 0.9, 10]} />
              <Clay color={C.beige5} />
            </mesh>
          ))}
        </group>
      ))}
      {/* end roller + slide to the truck */}
      <mesh position={[XE + 0.3, BELT_Y - 0.1, BELT_Z]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.9, 14]} />
        <Clay color={C.beige4} />
      </mesh>
      <group position={[CHX, 0, 0]}>
        <RoundedBox args={[0.95, 0.08, 2.5]} radius={0.04} position={[0, 0.98, 1.7]} rotation={[-0.05, 0, 0]} castShadow>
          <Clay color={C.orange3} />
        </RoundedBox>
        {[-0.5, 0.5].map((x) => (
          <RoundedBox key={x} args={[0.07, 0.16, 2.5]} radius={0.03} position={[x, 1.08, 1.7]} rotation={[-0.05, 0, 0]}>
            <Clay color={C.blue3} />
          </RoundedBox>
        ))}
        {[0.8, 2.2].map((z) => (
          <mesh key={z} position={[0, 0.48, z]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.96, 8]} />
            <Clay color={C.orange5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* overhead gantry with bunting and a round icon sign over each station */
function Gantry() {
  const flags = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    flags.current.forEach((m, i) => {
      if (m) m.rotation.z = Math.sin(clock.elapsedTime * 2.4 + i * 0.7) * 0.12
    })
  })
  const colors = [C.orange3, C.blue3, C.green3, C.orange2, C.blue2, C.beige1]
  const nFlags = 36
  return (
    <group>
      {[-8.4, 6.4].map((x) => (
        <mesh key={x} position={[x, 1.75, -1.15]} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 3.5, 12]} />
          <Clay color={C.beige5} />
        </mesh>
      ))}
      <RoundedBox args={[14.8, 0.16, 0.16]} radius={0.05} position={[-1.0, 3.5, -1.15]} castShadow>
        <Clay color={C.orange5} />
      </RoundedBox>
      {Array.from({ length: nFlags }).map((_, i) => {
        const x = -8.2 + (i / (nFlags - 1)) * 14.4
        const sag = Math.sin((i / (nFlags - 1)) * Math.PI) * 0.22
        return (
          <mesh key={i} ref={(m) => { flags.current[i] = m }} position={[x, 3.38 - sag, -1.1]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 0.28, 3]} />
            <meshStandardMaterial color={colors[i % colors.length]} roughness={0.9} />
          </mesh>
        )
      })}
      <Sign x={-7.0} tone={C.orange3}><Pencil /></Sign>
      <Sign x={ST[0].x} tone={C.blue3}><GearIcon /></Sign>
      <Sign x={ST[1].x} tone={C.beige5}><BoxIcon /></Sign>
      <Sign x={ST[2].x} tone={C.green3}><TagIcon /></Sign>
      <Sign x={4.6} tone={C.blue5}><ArrowIcon /></Sign>
    </group>
  )
}

function Sign({ x, tone, children }: { x: number; tone: string; children: React.ReactNode }) {
  return (
    <group position={[x, 3.0, -1.1]}>
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.012, 0.012, 0.5, 5]} /><meshStandardMaterial color={C.beige5} /></mesh>
      <Toon color={tone} pos={[0, -0.15, 0]} rot={[Math.PI / 2, 0, 0]} ink={0.06}><cylinderGeometry args={[0.36, 0.36, 0.08, 28]} /></Toon>
      <group position={[0, -0.15, 0.06]}>{children}</group>
    </group>
  )
}
const Pencil = () => (
  <group rotation={[0, 0, -0.7]}>
    <mesh><cylinderGeometry args={[0.045, 0.045, 0.4, 8]} /><meshStandardMaterial color={C.orange1} /></mesh>
    <mesh position={[0, -0.24, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.045, 0.09, 8]} /><meshStandardMaterial color={C.orange2} /></mesh>
  </group>
)
const GearIcon = () => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 16]} /><meshStandardMaterial color={C.beige1} /></mesh>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2
      return <mesh key={i} position={[Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0]} rotation={[0, 0, a]}><boxGeometry args={[0.09, 0.07, 0.05]} /><meshStandardMaterial color={C.beige1} /></mesh>
    })}
  </group>
)
const BoxIcon = () => (
  <mesh><boxGeometry args={[0.3, 0.26, 0.06]} /><meshStandardMaterial color={C.orange1} /></mesh>
)
const TagIcon = () => (
  <group rotation={[0, 0, 0.5]}>
    <mesh><boxGeometry args={[0.32, 0.2, 0.05]} /><meshStandardMaterial color={C.beige1} /></mesh>
    <mesh position={[-0.11, 0, 0.03]}><cylinderGeometry args={[0.025, 0.025, 0.02, 8]} /><meshStandardMaterial color={C.green3} /></mesh>
  </group>
)
const ArrowIcon = () => (
  <group>
    <mesh position={[-0.05, 0, 0]}><boxGeometry args={[0.2, 0.09, 0.05]} /><meshStandardMaterial color={C.beige1} /></mesh>
    <mesh position={[0.13, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.1, 0.16, 3]} /><meshStandardMaterial color={C.beige1} /></mesh>
  </group>
)

/* the designer's board: he draws a bar chart and a rising line graph, stroke by stroke */
function Board() {
  const axes = useRef<(THREE.Mesh | null)[]>([])
  const bars = useRef<(THREE.Mesh | null)[]>([])
  const segs = useRef<(THREE.Mesh | null)[]>([])
  const dots = useRef<(THREE.Mesh | null)[]>([])
  const BASE = -0.42
  const X = [-0.4, -0.13, 0.14, 0.41]
  const H = [0.28, 0.46, 0.62, 0.84]
  const COL = [C.blue3, C.orange3, C.green3, C.blue5]
  const pts: [number, number][] = X.map((x, i) => [x, BASE + H[i] + 0.1])
  const win = (d: number, a: number, b: number) => Math.min(1, Math.max(0, (d - a) / (b - a)))
  useFrame(() => {
    const d = FX.draw >= 1 ? 1 : FX.draw
    /* axes first */
    const ax = axes.current[0], ay = axes.current[1]
    if (ax) { const k = win(d, 0, 0.1); ax.visible = k > 0.001; ax.scale.x = Math.max(0.001, 1.4 * k); ax.position.x = -0.65 + 0.7 * k }
    if (ay) { const k = win(d, 0.08, 0.18); ay.visible = k > 0.001; ay.scale.y = Math.max(0.001, 0.98 * k); ay.position.y = BASE + 0.49 * k }
    /* bars grow one by one */
    for (let i = 0; i < 4; i++) {
      const b = bars.current[i]
      if (!b) continue
      const k = win(d, 0.18 + i * 0.11, 0.29 + i * 0.11)
      b.visible = k > 0.001
      b.scale.y = Math.max(0.001, H[i] * k)
      b.position.y = BASE + (H[i] * k) / 2
    }
    /* then the line graph joins the bar tops */
    for (let j = 0; j < 3; j++) {
      const sg = segs.current[j]
      if (!sg) continue
      const k = win(d, 0.64 + j * 0.08, 0.72 + j * 0.08)
      const [x1, y1] = pts[j], [x2, y2] = pts[j + 1]
      const len = Math.hypot(x2 - x1, y2 - y1)
      sg.visible = k > 0.001
      sg.scale.x = Math.max(0.001, len * k)
      sg.position.set(x1 + ((x2 - x1) * k) / 2, y1 + ((y2 - y1) * k) / 2, 0.02)
      sg.rotation.z = Math.atan2(y2 - y1, x2 - x1)
    }
    for (let j = 0; j < 4; j++) {
      const dt = dots.current[j]
      if (!dt) continue
      const k = win(d, 0.6 + j * 0.08, 0.66 + j * 0.08)
      dt.visible = k > 0.001
      dt.scale.setScalar(Math.max(0.001, k))
    }
  })
  return (
    <group position={[-8.9, 0, -0.4]}>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.95, -0.1]} rotation={[0, 0, x > 0 ? -0.07 : 0.07]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 1.9, 8]} />
          <Clay color={C.orange5} />
        </mesh>
      ))}
      <Toon color={C.beige1} pos={[0, 1.7, 0]} ink={0.04}><boxGeometry args={[1.7, 1.2, 0.08]} /></Toon>
      <mesh position={[0, 1.08, 0.05]}><boxGeometry args={[1.5, 0.05, 0.1]} /><meshStandardMaterial color={C.orange3} /></mesh>
      <group position={[0, 1.78, 0.06]}>
        <mesh ref={(m) => { axes.current[0] = m }} position={[-0.65, BASE, 0.01]}><boxGeometry args={[1, 0.035, 0.02]} /><meshBasicMaterial color={C.black4} /></mesh>
        <mesh ref={(m) => { axes.current[1] = m }} position={[-0.65, BASE, 0.01]}><boxGeometry args={[0.035, 1, 0.02]} /><meshBasicMaterial color={C.black4} /></mesh>
        {X.map((x, i) => (
          <mesh key={i} ref={(m) => { bars.current[i] = m }} position={[x, BASE, 0.01]}>
            <boxGeometry args={[0.18, 1, 0.02]} />
            <meshBasicMaterial color={COL[i]} />
          </mesh>
        ))}
        {[0, 1, 2].map((j) => (
          <mesh key={j} ref={(m) => { segs.current[j] = m }}><boxGeometry args={[1, 0.04, 0.025]} /><meshBasicMaterial color={C.orange4} /></mesh>
        ))}
        {pts.map(([x, y], j) => (
          <mesh key={j} ref={(m) => { dots.current[j] = m }} position={[x, y, 0.03]}><sphereGeometry args={[0.055, 10, 8]} /><meshBasicMaterial color={C.blue5} /></mesh>
        ))}
      </group>
    </group>
  )
}

/* ---------- the factory building behind the line ---------- */
function Factory() {
  const puffs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    puffs.current.forEach((m, i) => {
      if (!m) return
      const t = ((clock.elapsedTime * 0.35 + i * 0.25) % 1)
      m.position.set(0.1 + t * 0.9, 4.5 + t * 2.2, 0)
      m.scale.setScalar(0.25 + t * 0.7)
      ;(m.material as THREE.MeshStandardMaterial).opacity = 0.7 * (1 - t)
    })
  })
  const win = [-9.5, -7, -4.2, 4.2, 7, 9.5]
  return (
    <group position={[-0.1, 0, -3.4]}>
      <RoundedBox args={[22.5, 3.2, 2.4]} radius={0.12} smoothness={4} position={[0, 1.6, 0]} castShadow receiveShadow>
        <Clay color={C.beige3} />
      </RoundedBox>
      {[-1, 1].map((k) => (
        <RoundedBox key={k} args={[22.9, 0.16, 1.7]} radius={0.05} position={[0, 3.55, k * 0.7]} rotation={[k * 0.42, 0, 0]} castShadow>
          <Clay color={C.blue4} />
        </RoundedBox>
      ))}
      <RoundedBox args={[2.6, 2.3, 0.12]} radius={0.08} position={[0, 1.2, 1.22]}>
        <Clay color={C.orange3} />
      </RoundedBox>
      {[-0.9, -0.3, 0.3, 0.9].map((y) => (
        <mesh key={y} position={[0, 1.2 + y * 0.9, 1.29]}><boxGeometry args={[2.4, 0.03, 0.02]} /><meshStandardMaterial color={C.orange4} /></mesh>
      ))}
      {win.map((x) => (
        <group key={x} position={[x, 1.85, 1.22]}>
          <Toon color={C.blue2} ink={0.06}><boxGeometry args={[1.1, 0.8, 0.06]} /></Toon>
          <mesh position={[0, 0, 0.04]}><boxGeometry args={[0.04, 0.8, 0.02]} /><meshStandardMaterial color={C.beige1} /></mesh>
        </group>
      ))}
      {/* chimney with smoke */}
      <group position={[9.4, 0, 0.2]}>
        <Toon color={C.orange4} pos={[0, 3.7, 0]} ink={0}><cylinderGeometry args={[0.3, 0.38, 1.9, 14]} /></Toon>
        <Toon color={C.beige1} pos={[0, 4.65, 0]} ink={0}><cylinderGeometry args={[0.34, 0.3, 0.14, 14]} /></Toon>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} ref={(m) => { puffs.current[i] = m }}>
            <sphereGeometry args={[1, 12, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} roughness={1} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ============================================================
   The simulation: parcels ride the belt, stop at each station, then slide into the truck
   ============================================================ */
type Item = { st: 'free' | 'belt' | 'work' | 'chute'; x: number; stage: number; p: number; t: number; ct: number; slot: number; pop: number }
type Truck = { st: 'away' | 'in' | 'loading' | 'out'; x: number; v: number; t: number; load: number; arrived: number; wheel: number }
const N_ITEMS = 7
const SIM = {
  items: Array.from({ length: N_ITEMS }, (): Item => ({ st: 'free', x: X0, stage: 0, p: 0, t: 0, ct: 0, slot: 0, pop: 0 })),
  truck: { st: 'away', x: -16, v: 0, t: 1.0, load: 0, arrived: 0, wheel: 0 } as Truck,
  draw: 0,
  pending: false,
}

function simStep(h: number) {
  const T = SIM.truck
  /* designer: draws, then a new parcel is released onto the belt */
  SIM.draw += h / DRAW_DUR
  FX.draw = Math.min(1, SIM.draw)
  if (SIM.draw >= 1 && !SIM.pending && SIM.draw < 1 + h * 2) SIM.pending = true
  if (SIM.draw >= 1.35) SIM.draw = 0
  FX.work[0] = FX.work[1] = FX.work[2] = -1
  FX.chute = 0

  if (SIM.pending) {
    const free = SIM.items.find((i) => i.st === 'free')
    const clear = !SIM.items.some((i) => (i.st === 'belt' || i.st === 'work') && i.x < X0 + GAP)
    if (free && clear) {
      Object.assign(free, { st: 'belt', x: X0, stage: 0, p: 0, t: 0, ct: 0, pop: 0 })
      SIM.pending = false
    }
  }

  /* belt */
  const act = SIM.items.filter((i) => i.st === 'belt' || i.st === 'work').sort((a, b) => b.x - a.x)
  let ahead: Item | null = null
  for (const it of act) {
    it.pop = Math.min(1, it.pop + h * 3)
    if (it.st === 'work') {
      it.t += h
      const k = it.stage
      it.p = it.t / ST[k].dur
      if (it.p >= 1) {
        it.stage += 1
        it.st = 'belt'
        it.t = 0
        it.p = 0
      } else FX.work[k] = it.p
    } else {
      let nx = it.x + VB * h
      const limit = ahead ? ahead.x - GAP : Infinity
      if (nx > limit) nx = Math.max(it.x, limit)
      const k = it.stage
      if (k < 3 && it.x < ST[k].x && nx >= ST[k].x) {
        nx = ST[k].x
        it.st = 'work'
        it.t = 0
        it.p = 0
        FX.work[k] = 0
      }
      it.x = nx
      if (it.stage === 3 && it.x >= XE) {
        it.x = XE
        if (T.st === 'loading' && T.load < 6 && !SIM.items.some((o) => o.st === 'chute')) {
          it.st = 'chute'
          it.ct = 0
          it.slot = T.load
          T.load += 1
        }
      }
    }
    ahead = it
  }

  /* slide to the truck */
  for (const it of SIM.items) {
    if (it.st !== 'chute') continue
    it.ct += h / 1.15
    FX.chute = 1
    if (it.ct >= 1) {
      it.st = 'free'
      T.arrived += 1
      FX.shipped += 1
    }
  }

  /* truck: in from the left, load six parcels, drive away to the right, loop */
  switch (T.st) {
    case 'away':
      T.t -= h
      if (T.t <= 0) {
        T.st = 'in'
        T.x = -16
        T.v = 3
      }
      break
    case 'in': {
      const d = DOCK - T.x
      T.v = Math.min(4.6, 0.8 + d * 0.8)
      T.x += T.v * h
      if (d < 0.03) {
        T.x = DOCK
        T.v = 0
        T.st = 'loading'
        T.t = 0
      }
      break
    }
    case 'loading':
      if (T.arrived >= 6) {
        T.t += h
        FX.wave = 1
        if (T.t > 1.4) {
          T.st = 'out'
          T.v = 0
        }
      }
      break
    case 'out':
      T.v = Math.min(5.2, T.v + 2.4 * h)
      T.x += T.v * h
      if (T.x > 17) {
        T.st = 'away'
        T.t = 3.0
        T.load = 0
        T.arrived = 0
        FX.wave = 0
      }
      break
  }
  T.wheel += (T.v * h) / 0.34
}

/* ============================================================
   Parcels (a toy robot that gets built, boxed, labelled and stamped)
   ============================================================ */
type Views = {
  root: THREE.Group | null; robot: THREE.Group | null; head: THREE.Group | null; box: THREE.Group | null
  flapA: THREE.Group | null; flapB: THREE.Group | null; label: THREE.Group | null; stamp: THREE.Group | null
}
const ease = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function ParcelModel({ v }: { v: Views }) {
  return (
    <group ref={(g) => { v.root = g }} visible={false}>
      <group ref={(g) => { v.robot = g }}>
        <Toon color={C.orange3} pos={[0, 0.26, 0]} ink={0.07}><boxGeometry args={[0.5, 0.5, 0.5]} /></Toon>
        <mesh position={[0, 0.27, 0.26]}><boxGeometry args={[0.28, 0.14, 0.02]} /><meshStandardMaterial color={C.orange1} /></mesh>
        <group ref={(g) => { v.head = g }} position={[0, 0.72, 0]}>
          <Toon color={C.blue3} ink={0.07}><sphereGeometry args={[0.25, 20, 16]} /></Toon>
          {[-0.09, 0.09].map((x) => (
            <mesh key={x} position={[x, 0.03, 0.22]}><sphereGeometry args={[0.04, 8, 8]} /><meshBasicMaterial color={C.beige1} /></mesh>
          ))}
          <Toon color={C.orange3} pos={[0, 0.34, 0]} ink={0.12}><sphereGeometry args={[0.06, 10, 8]} /></Toon>
          <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.012, 0.012, 0.12, 5]} /><meshBasicMaterial color={INK} /></mesh>
        </group>
      </group>
      <group ref={(g) => { v.box = g }} visible={false}>
        <Toon color={C.beige5} pos={[0, 0.42, 0]} ink={0.05}><boxGeometry args={[0.86, 0.84, 0.86]} /></Toon>
        <group ref={(g) => { v.flapA = g }} position={[0, 0.84, -0.43]}>
          <Toon color={C.beige4} pos={[0, 0, 0.21]} ink={0.05}><boxGeometry args={[0.86, 0.04, 0.44]} /></Toon>
        </group>
        <group ref={(g) => { v.flapB = g }} position={[0, 0.84, 0.43]}>
          <Toon color={C.beige4} pos={[0, 0, -0.21]} ink={0.05}><boxGeometry args={[0.86, 0.04, 0.44]} /></Toon>
        </group>
        <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.16, 0.012, 0.9]} /><meshStandardMaterial color={C.blue3} /></mesh>
        <group ref={(g) => { v.label = g }} position={[0, 0.5, 0.44]} visible={false}>
          <mesh><boxGeometry args={[0.5, 0.32, 0.02]} /><meshStandardMaterial color={C.beige1} /></mesh>
          <mesh position={[-0.04, 0.06, 0.015]}><boxGeometry args={[0.3, 0.035, 0.01]} /><meshBasicMaterial color={C.black4} /></mesh>
          <mesh position={[-0.1, -0.02, 0.015]}><boxGeometry args={[0.18, 0.035, 0.01]} /><meshBasicMaterial color={C.black4} /></mesh>
          <mesh position={[0.14, -0.08, 0.015]}><boxGeometry args={[0.12, 0.05, 0.01]} /><meshBasicMaterial color={C.orange3} /></mesh>
        </group>
        <group ref={(g) => { v.stamp = g }} position={[0.18, 0.38, 0.45]} visible={false}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.17, 0.17, 0.02, 20]} /><meshStandardMaterial color={C.green3} /></mesh>
          <mesh position={[-0.04, -0.01, 0.015]} rotation={[0, 0, -0.8]}><boxGeometry args={[0.1, 0.035, 0.01]} /><meshBasicMaterial color={C.beige1} /></mesh>
          <mesh position={[0.04, 0.02, 0.015]} rotation={[0, 0, 0.8]}><boxGeometry args={[0.2, 0.035, 0.01]} /><meshBasicMaterial color={C.beige1} /></mesh>
        </group>
      </group>
    </group>
  )
}

function poseParcel(it: Item, v: Views, truckX: number) {
  const root = v.root
  if (!root) return
  root.visible = it.st !== 'free'
  if (it.st === 'free') return
  /* where it sits */
  let x = it.x, y = BELT_Y, z = BELT_Z, s = 1
  if (it.st === 'chute') {
    const q = it.ct
    const slot = slotLocal(it.slot)
    const sx = XE + 0.2
    if (q < 0.62) {
      const u = q / 0.62
      x = sx + (CHX - sx) * u
      y = BELT_Y + 0.0 - 0.06 * u
      z = BELT_Z + 0.9 + u * 1.5
    } else {
      const u = (q - 0.62) / 0.38
      const wx = truckX + slot[0]
      const wz = TZ + slot[2]
      x = CHX + (wx - CHX) * ease(u)
      z = BELT_Z + 2.4 + (wz - BELT_Z - 2.4) * ease(u)
      y = BELT_Y - 0.06 + (slot[1] - 0.55 - (BELT_Y - 0.06)) * u * u + Math.sin(u * Math.PI) * 0.35
    }
    s = 0.62
  }
  const pop = ease(it.pop)
  root.position.set(x, y, z)
  root.scale.setScalar(s * (0.2 + 0.8 * pop))

  /* what it looks like */
  const working = it.st === 'work'
  const stage = it.stage
  const p = working ? it.p : 0
  const robot = v.robot, head = v.head, box = v.box
  if (!robot || !head || !box) return
  /* assemble: the head hops on */
  if (stage === 0) {
    head.visible = working && p > 0.25
    const k = ease(clamp01((p - 0.25) / 0.5))
    head.position.y = 0.72 + (1 - k) * 0.62 + (p > 0.75 ? Math.sin((p - 0.75) * 8 * Math.PI) * 0.03 : 0)
  } else {
    head.visible = true
    head.position.y = 0.72
  }
  /* pack: box grows around it, flaps close */
  let boxK = 0, flap = 1.5
  if (stage === 1 && working) {
    boxK = ease(clamp01(p / 0.45))
    flap = 1.55 * (1 - ease(clamp01((p - 0.5) / 0.4)))
  } else if (stage >= 2) {
    boxK = 1
    flap = 0
  }
  box.visible = boxK > 0.02
  box.scale.set(boxK, boxK, boxK)
  robot.visible = boxK < 0.6
  if (v.flapA) v.flapA.rotation.x = -flap
  if (v.flapB) v.flapB.rotation.x = flap
  /* label + stamp */
  const labelOn = stage >= 3 || (stage === 2 && working && p > 0.2)
  const stampOn = stage >= 3 || (stage === 2 && working && p > 0.55)
  if (v.label) {
    v.label.visible = labelOn
    v.label.scale.setScalar(stage >= 3 ? 1 : ease(clamp01((p - 0.2) / 0.2)))
  }
  if (v.stamp) {
    v.stamp.visible = stampOn
    v.stamp.scale.setScalar(stage >= 3 ? 1 : 0.6 + 0.4 * ease(clamp01((p - 0.55) / 0.1)))
  }
}

/* ---------- the truck ---------- */
function TruckModel({ g, wheels }: { g: React.RefObject<THREE.Group | null>; wheels: React.MutableRefObject<(THREE.Group | null)[]> }) {
  const driverRoot = useRef<THREE.Group>(null)
  void driverRoot
  return (
    <group ref={g} position={[-16, 0, TZ]}>
      {/* chassis and bed */}
      <RoundedBox args={[3.35, 0.22, 1.4]} radius={0.07} position={[-0.2, 0.55, 0]} castShadow receiveShadow>
        <Clay color={C.black4} />
      </RoundedBox>
      <Toon color={C.beige1} pos={[BED_X, 0.74, 0]} ink={0.04}><boxGeometry args={[1.95, 0.1, 1.3]} /></Toon>
      {[-0.62, 0.62].map((z) => (
        <Toon key={z} color={C.beige1} pos={[BED_X, 0.95, z]} ink={0.05} scl={[1, z > 0 ? 0.7 : 1, 1]}>
          <boxGeometry args={[1.95, 0.32, 0.06]} />
        </Toon>
      ))}
      <Toon color={C.beige1} pos={[BED_X - 0.95, 0.95, 0]} ink={0.05}><boxGeometry args={[0.06, 0.32, 1.3]} /></Toon>
      <Toon color={C.orange3} pos={[BED_X, 0.84, 0.66]} ink={0}><boxGeometry args={[1.95, 0.08, 0.02]} /></Toon>
      {/* cab */}
      <RoundedBox args={[1.05, 0.8, 1.3]} radius={0.16} smoothness={5} position={[1.1, 1.05, 0]} castShadow>
        <Clay color={C.blue3} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.5, 1.1]} radius={0.05} position={[1.64, 1.1, 0]}>
        <Clay color={C.blue1} rough={0.5} bump={0.1} />
      </RoundedBox>
      <Toon color={C.blue5} pos={[1.52, 0.72, 0]} ink={0.04}><boxGeometry args={[0.2, 0.2, 1.4]} /></Toon>
      {[-0.4, 0.4].map((z) => (
        <mesh key={z} position={[1.63, 0.8, z]}><sphereGeometry args={[0.09, 10, 8]} /><meshStandardMaterial color={C.orange1} emissive={C.orange2} emissiveIntensity={0.5} /></mesh>
      ))}
      {/* wheels */}
      {[[-1.15, 0.7], [-1.15, -0.7], [1.1, 0.7], [1.1, -0.7]].map(([x, z], i) => (
        <group key={i} position={[x, 0.34, z]} ref={(w) => { wheels.current[i] = w }}>
          <Toon color={C.black3} rot={[Math.PI / 2, 0, 0]} ink={0.05}><cylinderGeometry args={[0.34, 0.34, 0.2, 18]} /></Toon>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z > 0 ? 0.11 : -0.11]}><cylinderGeometry args={[0.15, 0.15, 0.02, 12]} /><meshStandardMaterial color={C.beige4} /></mesh>
          <mesh position={[0.2, 0, z > 0 ? 0.12 : -0.12]}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color={INK} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ---------- ties the simulation to everything you see ---------- */
function Line() {
  const views = useRef<Views[]>(
    Array.from({ length: N_ITEMS }, () => ({ root: null, robot: null, head: null, box: null, flapA: null, flapB: null, label: null, stamp: null })),
  )
  const truck = useRef<THREE.Group>(null)
  const wheels = useRef<(THREE.Group | null)[]>([])
  const slots = useRef<(THREE.Group | null)[]>([])
  const acc = useRef(0)
  const STEP = 1 / 120

  useFrame((_, rawDt) => {
    acc.current += Math.min(rawDt, 0.25)
    let guard = 0
    while (acc.current >= STEP && guard++ < 120) {
      simStep(STEP)
      acc.current -= STEP
    }
    if (guard >= 120) acc.current = 0
    const T = SIM.truck
    for (let i = 0; i < N_ITEMS; i++) poseParcel(SIM.items[i], views.current[i], T.x)
    if (truck.current) {
      truck.current.position.x = T.x
      truck.current.visible = T.st !== 'away'
    }
    wheels.current.forEach((w) => { if (w) w.rotation.z = -T.wheel })
    slots.current.forEach((s, i) => {
      if (!s) return
      const show = T.st !== 'away' && i < T.arrived
      s.visible = show
    })
  })

  return (
    <group>
      {views.current.map((v, i) => <ParcelModel key={i} v={v} />)}
      <TruckModel g={truck} wheels={wheels} />
      {/* parcels that have been loaded ride with the truck */}
      <TruckCargo truck={truck} slots={slots} />
    </group>
  )
}

/* loaded boxes are placed relative to the truck each frame */
function TruckCargo({ truck, slots }: { truck: React.RefObject<THREE.Group | null>; slots: React.MutableRefObject<(THREE.Group | null)[]> }) {
  useFrame(() => {
    const t = truck.current
    if (!t) return
    slots.current.forEach((s, i) => {
      if (!s) return
      const l = slotLocal(i)
      s.position.set(t.position.x + l[0], l[1] - 0.55, TZ + l[2])
    })
  })
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} ref={(g) => { slots.current[i] = g }} visible={false} scale={0.62}>
          <Toon color={C.beige5} pos={[0, 0.42, 0]} ink={0.05}><boxGeometry args={[0.86, 0.84, 0.86]} /></Toon>
          <mesh position={[0, 0.85, 0]}><boxGeometry args={[0.16, 0.012, 0.9]} /><meshStandardMaterial color={C.blue3} /></mesh>
          <mesh position={[0, 0.5, 0.44]}><boxGeometry args={[0.5, 0.32, 0.02]} /><meshStandardMaterial color={C.beige1} /></mesh>
          <mesh position={[0.18, 0.38, 0.45]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.02, 16]} /><meshStandardMaterial color={C.green3} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ============================================================
   Results board: bar chart, rising line graph and a progress row that react to every parcel shipped
   ============================================================ */
function Dashboard() {
  const bars = useRef<(THREE.Mesh | null)[]>([])
  const pts = useRef<(THREE.Mesh | null)[]>([])
  const segs = useRef<(THREE.Mesh | null)[]>([])
  const lights = useRef<(THREE.Mesh | null)[]>([])
  const lamp = useRef<THREE.Mesh>(null)
  const hs = useRef([0.2, 0.34, 0.46, 0.4, 0.6, 0.74])
  const BASE = -0.52
  useFrame(({ clock }, dt) => {
    const k = Math.min(1, Math.min(dt, 0.05) * 3)
    const s = FX.shipped
    const cyc = (s % 12) / 12
    for (let i = 0; i < 6; i++) {
      const target = Math.min(0.98, 0.16 + i * 0.07 + cyc * 0.46 + Math.sin(i * 1.7 + s * 0.6) * 0.04)
      hs.current[i] += (target - hs.current[i]) * k
      const b = bars.current[i]
      if (b && i < 5) {
        b.scale.y = Math.max(0.02, hs.current[i])
        b.position.y = BASE + hs.current[i] / 2
      }
    }
    /* line graph over the same trend */
    const P: [number, number][] = []
    for (let i = 0; i < 6; i++) P.push([0.5 + i * 0.17, BASE + 0.05 + hs.current[i] * 0.95])
    for (let i = 0; i < 6; i++) pts.current[i]?.position.set(P[i][0], P[i][1], 0.07)
    for (let i = 0; i < 5; i++) {
      const sg = segs.current[i]
      if (!sg) continue
      const [x1, y1] = P[i], [x2, y2] = P[i + 1]
      sg.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0.07)
      sg.rotation.z = Math.atan2(y2 - y1, x2 - x1)
      sg.scale.x = Math.hypot(x2 - x1, y2 - y1)
    }
    /* progress row */
    const filled = s % 11
    lights.current.forEach((m, i) => {
      if (!m) return
      ;(m.material as THREE.MeshStandardMaterial).color.set(i < filled ? C.green3 : C.beige4)
    })
    if (lamp.current) {
      const on = FX.wave > 0 || Math.sin(clock.elapsedTime * 3) > 0.6
      ;(lamp.current.material as THREE.MeshStandardMaterial).color.set(on ? C.orange3 : C.orange5)
    }
  })
  const barCols = [C.blue2, C.blue3, C.orange2, C.orange3, C.green3]
  return (
    <group position={[8.9, 0, -0.6]}>
      {[-1.25, 1.25].map((x) => (
        <mesh key={x} position={[x, 0.75, -0.1]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 1.5, 10]} />
          <Clay color={C.beige5} />
        </mesh>
      ))}
      <group position={[0, 2.35, 0]}>
        <Toon color={C.beige1} ink={0.04}><boxGeometry args={[3.1, 2.1, 0.12]} /></Toon>
        <Toon color={C.blue4} pos={[0, 0.88, 0.07]} ink={0}><boxGeometry args={[3.1, 0.34, 0.04]} /></Toon>
        <mesh ref={lamp} position={[1.35, 0.88, 0.1]}><sphereGeometry args={[0.07, 10, 8]} /><meshStandardMaterial color={C.orange5} /></mesh>
        {[-1.3, -1.12, -0.94].map((x, i) => (
          <mesh key={x} position={[x, 0.88, 0.1]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color={[C.orange3, C.blue2, C.green2][i]} /></mesh>
        ))}
        {/* bar chart */}
        <group position={[-0.62, 0.05, 0.08]}>
          <mesh position={[0.3, BASE - 0.02, 0]}><boxGeometry args={[1.5, 0.03, 0.02]} /><meshStandardMaterial color={C.beige5} /></mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} ref={(m) => { bars.current[i] = m }} position={[-0.3 + i * 0.28, BASE + 0.1, 0.03]}>
              <boxGeometry args={[0.2, 1, 0.05]} />
              <meshStandardMaterial color={barCols[i]} roughness={0.8} />
            </mesh>
          ))}
        </group>
        {/* line graph */}
        <group position={[0.35, 0.05, 0.08]}>
          <mesh position={[0.75, BASE - 0.02, 0]}><boxGeometry args={[1.2, 0.03, 0.02]} /><meshStandardMaterial color={C.beige5} /></mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} ref={(m) => { segs.current[i] = m }}><boxGeometry args={[1, 0.045, 0.03]} /><meshStandardMaterial color={C.orange3} /></mesh>
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} ref={(m) => { pts.current[i] = m }}><sphereGeometry args={[0.06, 10, 8]} /><meshStandardMaterial color={C.blue5} /></mesh>
          ))}
        </group>
        {/* progress row */}
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} ref={(m) => { lights.current[i] = m }} position={[-1.25 + i * 0.25, -0.93, 0.1]}>
            <sphereGeometry args={[0.07, 10, 8]} />
            <meshStandardMaterial color={C.beige4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ============================================================
   Road and yard
   ============================================================ */
function Yard() {
  return (
    <group>
      {/* paved yard under the line */}
      <mesh position={[-1.0, 0.012, 0.4]} receiveShadow>
        <boxGeometry args={[20.5, 0.03, 4.6]} />
        <Clay color={C.beige4} rough={1} bump={0.4} />
      </mesh>
      {/* road across the front */}
      <mesh position={[0, 0.015, TZ]} receiveShadow>
        <boxGeometry args={[90, 0.03, 2.8]} />
        <Clay color={C.black4} rough={1} bump={0.4} />
      </mesh>
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[-29 + i * 2, 0.04, TZ]}>
          <boxGeometry args={[0.9, 0.012, 0.1]} />
          <meshStandardMaterial color={C.beige2} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/* ============================================================
   Camera, light, world
   ============================================================ */
function Rig() {
  const { camera, size, pointer } = useThree()
  const snapped = useRef('')
  useFrame(() => {
    const aspect = size.width / size.height
    /* the factory is ~17 units wide: fit that with margin, but never closer than 21.
       The camera stays low so there is real sky above the roofs. */
    /* desktop: show the whole line, board to results board, with margin. phones: crop to the middle of the line */
    const wide = aspect >= 1.3
    const z = wide ? Math.max(29 / (0.536 * aspect), 31) : Math.max(15.5 / (0.536 * aspect), 23)
    const tx = 0.2 + pointer.x * 0.7
    const ty = (wide ? 5.2 : 3.6) + pointer.y * 0.25
    const key = `${size.width}x${size.height}`
    if (snapped.current !== key) {
      snapped.current = key
      camera.position.set(tx, ty, z)
    }
    camera.position.x += (tx - camera.position.x) * 0.05
    camera.position.y += (ty - camera.position.y) * 0.05
    camera.position.z += (z - camera.position.z) * 0.08
    camera.lookAt(wide ? 0.2 : -1.2, wide ? 1.3 : 1.5, 0.5) /* phones: sit the scene lower so there is no empty lawn */
  })
  return null
}

/* compiles shaders without blocking the page, tells the page the first frame is on screen,
   refreshes shadows at a third of the frame rate and lowers the resolution if the GPU is struggling */
function Boot({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera, setDpr } = useThree()
  const done = useRef(false)
  const perf = useRef({ n: 0, t: 0, dpr: typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 1.25), frame: 0 })
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    const r = gl as unknown as { compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown> }
    r.compileAsync?.(scene, camera).catch(() => {})
  }, [gl, scene, camera])
  useFrame((_, dt) => {
    const p = perf.current
    gl.shadowMap.needsUpdate = p.frame++ % 3 === 0
    if (!done.current) {
      done.current = true
      onReady()
    }
    /* adaptive resolution: after ~1.5 s of slow frames, drop the pixel ratio a step (down to 0.75) */
    p.n++
    p.t += Math.min(dt, 0.2)
    if (p.n >= 90) {
      const avg = p.t / p.n
      p.n = 0
      p.t = 0
      if (avg > 0.026 && p.dpr > 0.8) {
        p.dpr = Math.max(0.75, p.dpr - 0.25)
        setDpr(p.dpr)
      }
    }
  })
  return null
}

function World({ onReady }: { onReady: () => void }) {
  return (
    <>
      <fog attach="fog" args={[C.blue1, 34, 95]} />
      <hemisphereLight args={['#E4EDFE', '#1F9D57', 0.95]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-6, 14, 10]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={9}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0006}
      />
      <Rig />
      <Boot onReady={onReady} />
      <Sky />
      <Ground />
      <Scenery />
      <Yard />
      <Factory />
      <Gantry />
      <Belt />
      <Board />
      <Dashboard />
      <Line />
      {/* a low platform for the crew */}
      <RoundedBox args={[19.4, 0.3, 1.25]} radius={0.08} smoothness={3} position={[-1.2, 0.15, -0.45]} castShadow receiveShadow>
        <Clay color={C.beige4} rough={1} bump={0.3} />
      </RoundedBox>
      {/* the crew, all behind the belt and facing us */}
      <Doodle role="designer" position={[-7.1, 0.3, -0.35]} s={1.2} body={C.blue5} skin={C.orange2} hat="beret" hatColor={C.green3} />
      <Doodle role="assembleA" position={[-4.6, 0.3, -0.45]} s={1.2} body={C.orange3} skin={C.orange1} hat="hard" hatColor={C.orange2} face={0.2} />
      <Doodle role="assembleB" position={[-3.2, 0.3, -0.45]} s={1.2} body={C.green3} skin={C.orange2} hat="hard" hatColor={C.beige1} face={-0.2} />
      <Doodle role="packer" position={[-1.1, 0.3, -0.45]} s={1.2} body={C.blue3} skin={C.beige4} hat="cap" hatColor={C.orange3} />
      <Doodle role="stamper" position={[1.7, 0.3, -0.45]} s={1.2} body={C.orange4} skin={C.orange1} hat="tuft" hatColor={C.black4} />
      <Doodle role="loader" position={[3.7, 0.3, -0.45]} s={1.2} body={C.green4} skin={C.orange2} hat="bun" hatColor={C.orange5} face={-0.15} />
    </>
  )
}

export default function ClayScene({ onReady }: { onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.06 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="scene" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.25]}
        camera={{ fov: 30, position: [-0.55, 4.4, 20], near: 0.1, far: 160 }}
        frameloop={reduce ? 'demand' : visible ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <World onReady={() => onReady?.()} />
      </Canvas>
    </div>
  )
}
