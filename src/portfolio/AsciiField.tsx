import { useEffect, useRef } from 'react'

type Props = {
  words: string[]
  /** seconds each word holds */
  hold?: number
  className?: string
}

const RAMP = ' .·:-=+*%#@'
const GLITCH = '01<>/\\{}[]|_~^'

/**
 * A living ASCII field. Words are rasterised into a character grid and the
 * field dissolves from one word to the next. The cursor stirs the characters.
 */
export function AsciiField({ words, hold = 3.4, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cols = 0
    let rows = 0
    let cw = 0
    let ch = 0
    let dpr = 1
    let masks: Float32Array[] = []
    let seeds = new Float32Array(0)
    let raf = 0
    let last = 0
    const mouse = { x: -999, y: -999, vx: 0, vy: 0, heat: 0 }

    const build = () => {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      const fs = r.width < 640 ? 9 : r.width < 1100 ? 11 : 12
      cw = fs * 0.62
      ch = fs * 1.18
      cols = Math.ceil(r.width / cw)
      rows = Math.ceil(r.height / ch)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `400 ${fs}px "Spline Sans Mono", monospace`
      ctx.textBaseline = 'top'

      seeds = new Float32Array(cols * rows)
      for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random()

      // rasterise each word into a cols×rows mask
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const o = off.getContext('2d', { willReadFrequently: true })!
      masks = words.map((w) => {
        o.clearRect(0, 0, cols, rows)
        o.fillStyle = '#fff'
        o.textAlign = 'center'
        o.textBaseline = 'middle'
        // characters are ~1.9× taller than wide, so squash the font vertically
        let size = rows * 1.15
        o.font = `400 ${size}px Gloock, serif`
        const scaleX = ch / cw
        let width = o.measureText(w).width * scaleX
        const maxW = cols * (r.width < 640 ? 0.94 : 0.82)
        if (width > maxW) size *= maxW / width
        o.font = `400 ${size}px Gloock, serif`
        o.save()
        o.translate(cols / 2, rows * 0.5)
        o.scale(scaleX, 1)
        o.fillText(w, 0, size * 0.04)
        o.restore()
        const data = o.getImageData(0, 0, cols, rows).data
        const m = new Float32Array(cols * rows)
        for (let i = 0; i < m.length; i++) m[i] = data[i * 4 + 3] / 255
        return m
      })
    }

    const noise = (x: number, y: number, t: number) =>
      (Math.sin(x * 0.11 + t * 0.7) + Math.sin(y * 0.23 - t * 0.5) + Math.sin((x + y) * 0.07 + t * 0.3)) / 6 + 0.5

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (now - last < 33) return // ~30fps is plenty for type
      last = now
      const t = now / 1000
      const r = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, r.width, r.height)
      if (!masks.length) return

      const cycle = t / hold
      const i0 = Math.floor(cycle) % masks.length
      const i1 = (i0 + 1) % masks.length
      const phase = cycle - Math.floor(cycle)
      // morph during the last 35% of each hold
      const k = phase < 0.65 ? 0 : (phase - 0.65) / 0.35
      const a = masks[i0]
      const b = masks[i1]

      mouse.heat *= 0.93
      const mx = mouse.x / cw
      const my = mouse.y / ch
      const radius = 10 + mouse.heat * 6

      const buckets: [string, number, number][][] = [[], [], [], []]

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x
          const s = seeds[idx]
          // per-cell dissolve: each cell flips at its own moment
          const m = k > s ? b[idx] : a[idx]
          const flicker = Math.abs(k - s) < 0.06 && k > 0 ? 1 : 0
          let v = m * 0.92 + noise(x, y, t) * 0.22 - 0.06
          const dx = x - mx
          const dy = (y - my) * (ch / cw)
          const d = Math.sqrt(dx * dx + dy * dy)
          let stirred = 0
          if (d < radius) {
            stirred = 1 - d / radius
            v += stirred * 0.35
          }
          if (v < 0.12) continue
          let c: string
          if (flicker || stirred > 0.55) c = GLITCH[(s * 97 + t * 12) % GLITCH.length | 0]
          else c = RAMP[Math.min(RAMP.length - 1, (v * RAMP.length) | 0)]
          if (c === ' ') continue
          const bucket = m > 0.5 ? (stirred > 0.3 ? 3 : 0) : v > 0.42 ? 1 : 2
          buckets[bucket].push([c, x * cw, y * ch])
        }
      }

      const styles = ['#ffb347', 'rgba(185,179,201,.55)', 'rgba(127,132,173,.28)', '#f2a5c0']
      for (let bi = 0; bi < 4; bi++) {
        ctx.fillStyle = styles[bi]
        const list = buckets[bi]
        for (let j = 0; j < list.length; j++) ctx.fillText(list[j][0], list[j][1], list[j][2])
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const nx = e.clientX - r.left
      const ny = e.clientY - r.top
      mouse.heat = Math.min(1.5, mouse.heat + Math.hypot(nx - mouse.x, ny - mouse.y) / 400)
      mouse.x = nx
      mouse.y = ny
    }
    const onLeave = () => {
      mouse.x = -999
      mouse.y = -999
    }

    const start = () => {
      build()
      if (reduce) {
        draw(performance.now())
        cancelAnimationFrame(raf)
      } else raf = requestAnimationFrame(draw)
    }

    document.fonts.ready.then(start)
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      start()
    })
    ro.observe(canvas)
    window.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [words, hold])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
