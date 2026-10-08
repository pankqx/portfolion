import { useEffect, useRef } from 'react'

/* A raymarched shape, printed in characters.
   Two canvases — blue plate and pink plate — overprint with multiply,
   exactly like two riso drums. The cursor turns the specimen. */

type V3 = [number, number, number]
const RAMP = ' .·:-=+*≈%#@'

function rotY([x, y, z]: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [x * c + z * s, y, -x * s + z * c]
}
function rotX([x, y, z]: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a)
  return [x, y * c - z * s, y * s + z * c]
}
const len3 = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z)

// four specimens: knot-ish torus, gyroid pearl, hollow cube, double ring
const shapes = [
  (p: V3) => {
    const q = Math.sqrt(p[0] * p[0] + p[2] * p[2]) - 0.95
    return Math.sqrt(q * q + p[1] * p[1]) - 0.36 + 0.05 * Math.sin(6 * Math.atan2(p[2], p[0]) + p[1] * 4)
  },
  (p: V3) => {
    const g = Math.sin(p[0] * 5) * Math.cos(p[1] * 5) + Math.sin(p[1] * 5) * Math.cos(p[2] * 5) + Math.sin(p[2] * 5) * Math.cos(p[0] * 5)
    return Math.max(len3(p[0], p[1], p[2]) - 1.15, Math.abs(g) / 5 - 0.07)
  },
  (p: V3) => {
    const qx = Math.abs(p[0]) - 0.8, qy = Math.abs(p[1]) - 0.8, qz = Math.abs(p[2]) - 0.8
    const box = len3(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - 0.06
    return Math.max(box, -(len3(p[0], p[1], p[2]) - 1.02))
  },
  (p: V3) => {
    const a = (() => { const q = Math.sqrt(p[0] * p[0] + p[1] * p[1]) - 0.8; return Math.sqrt(q * q + p[2] * p[2]) - 0.2 })()
    const b = (() => { const q = Math.sqrt((p[0] - 0.4) * (p[0] - 0.4) + p[2] * p[2]) - 0.8; return Math.sqrt(q * q + p[1] * p[1]) - 0.2 })()
    return Math.min(a, b)
  },
]
export const SHAPE_NAMES = ['the loop', 'the pearl', 'the hollow', 'the link']

type Props = {
  className?: string
  cell?: number
  shape?: number
  onShape?: (i: number) => void
  ink?: { a: string; b: string }
  interactive?: boolean
}

export default function AsciiSculpture({ className, cell = 11, shape = 0, onShape, ink = { a: '#0078bf', b: '#ff48b0' }, interactive = true }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const ca = useRef<HTMLCanvasElement>(null)
  const cb = useRef<HTMLCanvasElement>(null)
  const state = useRef({ shape, morph: 1, from: shape, mx: 0, my: 0, tx: 0, ty: 0, drag: 0 })

  useEffect(() => {
    const s = state.current
    if (shape !== s.shape) {
      s.from = s.shape
      s.shape = shape
      s.morph = 0
    }
  }, [shape])

  useEffect(() => {
    const el = wrap.current!, A = ca.current!, B = cb.current!
    const ga = A.getContext('2d')!, gb = B.getContext('2d')!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, cols = 0, rows = 0, raf = 0, visible = true, t0 = performance.now()
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const cw = cell * 0.62, ch = cell

    const resize = () => {
      const r = el.getBoundingClientRect()
      W = r.width; H = r.height
      for (const c of [A, B]) {
        c.width = W * dpr; c.height = H * dpr
        c.style.width = W + 'px'; c.style.height = H + 'px'
      }
      cols = Math.floor(W / cw); rows = Math.floor(H / ch)
      for (const g of [ga, gb]) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0)
        g.font = `500 ${cell}px "Martian Mono Variable", ui-monospace, monospace`
        g.textBaseline = 'top'
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      state.current.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      state.current.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    if (interactive) window.addEventListener('pointermove', onMove)

    const sdf = (p: V3, s: typeof state.current) => {
      const k = s.morph < 1 ? s.morph * s.morph * (3 - 2 * s.morph) : 1
      const d1 = shapes[s.shape](p)
      if (k >= 1) return d1
      return shapes[s.from](p) * (1 - k) + d1 * k
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || !W) return
      const s = state.current
      const t = reduce ? 0 : (now - t0) / 1000
      s.mx += (s.tx - s.mx) * 0.06
      s.my += (s.ty - s.my) * 0.06
      if (s.morph < 1) s.morph = Math.min(1, s.morph + 0.018)
      const ay = t * 0.35 + s.mx * 1.1
      const ax = 0.35 + s.my * 0.6 + Math.sin(t * 0.4) * 0.15
      ga.clearRect(0, 0, W, H); gb.clearRect(0, 0, W, H)
      ga.fillStyle = ink.a; gb.fillStyle = ink.b
      const aspect = (cols * cw) / (rows * ch)
      const light = [0.55, 0.65, -0.52] as V3
      const fov = aspect < 1 ? 0.9 / aspect : 0.9
      for (let j = 0; j < rows; j++) {
        const v = (0.5 - j / rows) * fov
        for (let i = 0; i < cols; i++) {
          const u = (i / cols - 0.5) * aspect * fov
          // ray from camera at z=-3.4
          let ro: V3 = [0, 0, -3.4]
          let rd: V3 = [u, v, 1]
          const l = len3(rd[0], rd[1], rd[2]); rd = [rd[0] / l, rd[1] / l, rd[2] / l]
          ro = rotX(rotY(ro, ay), ax); rd = rotX(rotY(rd, ay), ax)
          let d = 0, hit = false, steps = 0
          for (; steps < 38; steps++) {
            const p: V3 = [ro[0] + rd[0] * d, ro[1] + rd[1] * d, ro[2] + rd[2] * d]
            const h = sdf(p, s)
            if (h < 0.004) { hit = true; break }
            d += h * 0.9
            if (d > 6) break
          }
          if (!hit) continue
          const p: V3 = [ro[0] + rd[0] * d, ro[1] + rd[1] * d, ro[2] + rd[2] * d]
          const e = 0.01
          const nx = sdf([p[0] + e, p[1], p[2]], s) - sdf([p[0] - e, p[1], p[2]], s)
          const ny = sdf([p[0], p[1] + e, p[2]], s) - sdf([p[0], p[1] - e, p[2]], s)
          const nz = sdf([p[0], p[1], p[2] + e], s) - sdf([p[0], p[1], p[2] - e], s)
          const nl = len3(nx, ny, nz) || 1
          const lw = rotX(rotY(light, ay), ax)
          const diff = Math.max(0, (nx * lw[0] + ny * lw[1] + nz * lw[2]) / nl)
          const ao = 1 - steps / 38
          const lum = Math.min(1, 0.12 + diff * 0.85 * (0.5 + ao * 0.5))
          const x = i * cw, y = j * ch
          const ci = Math.max(1, Math.floor(lum * (RAMP.length - 1)))
          ga.fillText(RAMP[ci], x, y)
          // pink plate prints the shadows, offset a hair
          if (lum < 0.5) gb.fillText(RAMP[Math.min(RAMP.length - 1, Math.floor((1 - lum) * (RAMP.length - 1)))], x + 2, y + 1)
        }
      }
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [cell, ink.a, ink.b, interactive])

  return (
    <div
      ref={wrap}
      className={className}
      style={{ position: 'relative', cursor: onShape ? 'pointer' : undefined }}
      onClick={() => onShape?.((state.current.shape + 1) % shapes.length)}
      role={onShape ? 'button' : 'img'}
      aria-label={onShape ? `ASCII sculpture: ${SHAPE_NAMES[shape]}. Click to change shape.` : 'ASCII sculpture'}
      tabIndex={onShape ? 0 : undefined}
      onKeyDown={(e) => { if (onShape && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onShape((state.current.shape + 1) % shapes.length) } }}
    >
      <canvas ref={ca} style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply' }} />
      <canvas ref={cb} style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply' }} />
    </div>
  )
}
