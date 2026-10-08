import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { Emotion } from './emotions'

/* Fireflies made of type. They rise around her, shy away from your cursor,
   and change with her mood. Call burst() for a handful of hearts. */

const SETS: Record<Emotion, { glyphs: string; colors: string[]; rise: number }> = {
  calm: { glyphs: '·∙°✧⋆✦.', colors: ['#fff1a8', '#ffb3df', '#a9d8ff'], rise: 1 },
  happy: { glyphs: '✦✧⋆*✺·', colors: ['#ffe14d', '#fff1a8', '#ff9ad5'], rise: 1.4 },
  giggle: { glyphs: '✦✧♪♫*·', colors: ['#ffe14d', '#ff9ad5', '#fff'], rise: 1.6 },
  shy: { glyphs: '♡·°✧', colors: ['#ff9ad5', '#ffb3df', '#fff1a8'], rise: 0.9 },
  love: { glyphs: '♡♥❤︎♡·', colors: ['#ff48b0', '#ff9ad5', '#ffb3df'], rise: 1.3 },
  surprised: { glyphs: '!✦·*', colors: ['#ffe14d', '#fff'], rise: 2 },
  sad: { glyphs: '|╎¦:·', colors: ['#7fb4ff', '#a9d8ff', '#5c7bff'], rise: -2.2 },
  pout: { glyphs: '#%*·', colors: ['#ff6b6b', '#ff9ad5'], rise: 0.8 },
  thinking: { glyphs: '?…·∴∵', colors: ['#c3b8ff', '#fff1a8'], rise: 0.7 },
  sleepy: { glyphs: 'zZz·°', colors: ['#c3b8ff', '#a9d8ff'], rise: 0.5 },
  wink: { glyphs: '✦♡✧·', colors: ['#ffe14d', '#ff9ad5'], rise: 1.3 },
}

type P = { x: number; y: number; vx: number; vy: number; g: string; c: string; s: number; life: number; max: number; tw: number }

export type GlyphHandle = { burst: (x: number, y: number, glyphs?: string) => void }

export default forwardRef<GlyphHandle, { emotion: Emotion }>(function GlyphField({ emotion }, ref) {
  const cv = useRef<HTMLCanvasElement>(null)
  const parts = useRef<P[]>([])
  const mood = useRef(emotion)
  mood.current = emotion

  useImperativeHandle(ref, () => ({
    burst(x, y, glyphs = '♡♥♡✦') {
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 1.5 + Math.random() * 3.5
        parts.current.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, g: glyphs[i % glyphs.length],
          c: ['#ff48b0', '#ff9ad5', '#ffe14d'][i % 3], s: 16 + Math.random() * 18, life: 0, max: 70 + Math.random() * 40, tw: Math.random() * 6,
        })
      }
    },
  }))

  useEffect(() => {
    const c = cv.current!
    const g = c.getContext('2d')!
    const dpr = Math.min(devicePixelRatio || 1, 2)
    let W = 0, H = 0, raf = 0
    const m = { x: -999, y: -999 }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = () => {
      W = innerWidth; H = innerHeight
      c.width = W * dpr; c.height = H * dpr
      c.style.width = W + 'px'; c.style.height = H + 'px'
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    addEventListener('resize', resize)
    const mv = (e: PointerEvent) => { m.x = e.clientX; m.y = e.clientY }
    addEventListener('pointermove', mv)

    const spawn = () => {
      const set = SETS[mood.current]
      const down = set.rise < 0
      parts.current.push({
        x: Math.random() * W,
        y: down ? -20 : H + 20,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -set.rise * (0.4 + Math.random() * 0.9),
        g: set.glyphs[Math.floor(Math.random() * set.glyphs.length)],
        c: set.colors[Math.floor(Math.random() * set.colors.length)],
        s: 10 + Math.random() * 16,
        life: 0,
        max: 400 + Math.random() * 400,
        tw: Math.random() * 6,
      })
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      g.clearRect(0, 0, W, H)
      const target = reduce ? 0 : Math.min(90, Math.floor(W / 16))
      if (parts.current.length < target && Math.random() < 0.5) spawn()
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      const keep: P[] = []
      for (const p of parts.current) {
        p.life++
        const dx = p.x - m.x, dy = p.y - m.y
        const d2 = dx * dx + dy * dy
        if (d2 < 14000) { const f = (14000 - d2) / 14000; p.vx += (dx / Math.sqrt(d2 + 1)) * f * 0.6; p.vy += (dy / Math.sqrt(d2 + 1)) * f * 0.6 }
        p.vx *= 0.97
        if (Math.abs(p.vy) > 4) p.vy *= 0.95
        p.x += p.vx + Math.sin((p.life + p.tw * 50) / 40) * 0.3
        p.y += p.vy
        const fade = Math.min(1, p.life / 40, (p.max - p.life) / 60)
        if (fade <= 0 || p.y < -40 || p.y > H + 40) continue
        const twinkle = 0.65 + 0.35 * Math.sin(p.life / 9 + p.tw)
        g.globalAlpha = Math.max(0, fade * twinkle)
        g.fillStyle = p.c
        g.shadowColor = p.c
        g.shadowBlur = 10
        g.font = `600 ${p.s}px "Martian Mono Variable", monospace`
        g.fillText(p.g, p.x, p.y)
        keep.push(p)
      }
      g.globalAlpha = 1
      g.shadowBlur = 0
      parts.current = keep
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', mv) }
  }, [])

  return <canvas ref={cv} className="glyphs" aria-hidden />
})
