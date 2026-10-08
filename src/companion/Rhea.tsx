import { AnimatePresence, motion, type MotionValue } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import { faces, type Emotion, type EyeMode, type MouthMode } from './emotions'

/* ──────────────────────────────────────────────────────────────
   Rhea. Drawn by hand in SVG, printed in four riso inks.
   Coordinates live in a 600×800 page; her face centre is (300, 310).
   Fills sit a hair off the ink lines, the way a riso drum slips.
   ────────────────────────────────────────────────────────────── */

const C = {
  ink: '#1c1650',
  skin: '#fde6ec',
  skin2: '#f7c3d6',
  skin3: '#ef9fbf',
  hair: '#2b2896',
  hairDeep: '#191565',
  hairHi: '#ff5cb8',
  iris: '#0a7fd0',
  irisDeep: '#123a8f',
  gold: '#ffe14d',
  cardi: '#ffe14d',
  cardiDeep: '#f5b93a',
  top: '#ff6ec4',
  mouth: '#9b1659',
  tongue: '#ff7aa8',
  paper: '#fffaf6',
}

const EYE = { L: { cx: 257, cy: 321 }, R: { cx: 343, cy: 321 } }

/* Fringe: tapered clumps hanging from the hairline, parted a touch left of centre.
   Each tip is [x, y, sweep] — sweep bends the clump toward the sides. */
const TIPS: [number, number, number][] = [
  [206, 356, -18], [236, 308, -12], [268, 300, -6], [300, 290, 2], [332, 300, 8], [364, 306, 12], [394, 356, 18],
]
/* valleys between clumps — shallow, so the fringe reads as one soft mass with a few see-through slits */
const VALLEYS: [number, number][] = [[222, 262], [252, 262], [284, 246], [316, 248], [348, 262], [378, 262]]
function fringePath(dy = 0) {
  let d = `M194 ${214 + dy}`
  let px = 194, py = 214
  TIPS.forEach(([tx, ty, sw], i) => {
    d += ` C${px + sw * 0.1} ${py + (ty - py) * 0.5 + dy} ${tx - sw * 0.8} ${ty - 18 + dy} ${tx} ${ty + dy}`
    const [vx, vy] = VALLEYS[i] ?? [404, 214]
    d += ` C${tx + 2 - sw * 0.2} ${ty - 22 + dy} ${vx + sw * 0.25} ${vy + (ty - vy) * 0.35 + dy} ${vx} ${vy + dy}`
    px = vx; py = vy
  })
  d += ` C412 196 384 150 300 148 C216 150 188 196 194 ${214 + dy} Z`
  return d
}
const FRINGE = fringePath()
const FRINGE_SHADOW = fringePath(9)

function browPath(side: 'L' | 'R', [i, m, o]: [number, number, number]) {
  if (side === 'L') return `M283 ${283 + i} Q258 ${270 + m} 226 ${281 + o}`
  return `M317 ${283 + i} Q342 ${270 + m} 374 ${281 + o}`
}

function mouthPath(mode: MouthMode): { d: string; fill: boolean } {
  switch (mode) {
    case 'smile': return { d: 'M287 389 Q300 398 313 389', fill: false }
    case 'open': return { d: 'M282 386 Q300 390 318 386 Q315 406 300 408 Q285 406 282 386 Z', fill: true }
    case 'grin': return { d: 'M278 384 Q300 389 322 384 Q318 410 300 412 Q282 410 278 384 Z', fill: true }
    case 'wave': return { d: 'M287 393 Q293 388 300 392 Q307 396 313 391', fill: false }
    case 'cat': return { d: 'M284 389 Q292 398 300 390 Q308 398 316 389', fill: false }
    case 'o': return { d: 'M300 386 Q308 386 308 396 Q308 406 300 406 Q292 406 292 396 Q292 386 300 386 Z', fill: true }
    case 'frown': return { d: 'M287 397 Q300 388 313 397', fill: false }
    case 'pursed': return { d: 'M294 393 Q300 387 306 393 Q300 398 294 393 Z', fill: true }
    case 'side': return { d: 'M290 395 Q303 395 313 388', fill: false }
    case 'yawn': return { d: 'M294 391 Q300 388 306 391 Q306 401 300 402 Q294 401 294 391 Z', fill: true }
  }
}

function talkPath(o: number) {
  const w = 13 - o * 2
  const h = 4 + o * 15
  return `M${300 - w} 388 Q300 ${390 - o * 1.5} ${300 + w} 388 Q${300 + w - 2} ${388 + h} 300 ${389 + h} Q${300 - w + 2} ${388 + h} ${300 - w} 388 Z`
}

/* An eye is drawn for the left side and mirrored for the right. */
function Eye({ side, mode, uid }: { side: 'L' | 'R'; mode: EyeMode; uid: string }) {
  const { cx, cy } = EYE[side]
  const flip = side === 'R' ? `translate(${cx * 2} 0) scale(-1 1)` : undefined
  const almond = `M${cx - 29} ${cy + 3} Q${cx - 20} ${cy - 17} ${cx + 3} ${cy - 17} Q${cx + 23} ${cy - 15} ${cx + 28} ${cy - 1} Q${cx + 21} ${cy + 15} ${cx + 1} ${cy + 15} Q${cx - 17} ${cy + 15} ${cx - 29} ${cy + 3} Z`
  const clip = `eye-${side}-${uid}`

  if (mode === 'smile') {
    return (
      <g transform={`translate(${cx} ${cy}) scale(1.2) translate(${-cx} ${-cy})`}><g transform={flip}>
        <path d={`M${cx - 25} ${cy + 5} Q${cx} ${cy - 15} ${cx + 25} ${cy + 5}`} fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" />
        <path d={`M${cx - 25} ${cy + 5} l-9 -3 M${cx - 21} ${cy - 1} l-8 -7`} stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      </g></g>
    )
  }
  if (mode === 'closed') {
    return (
      <g transform={`translate(${cx} ${cy}) scale(1.2) translate(${-cx} ${-cy})`}><g transform={flip}>
        <path d={`M${cx - 27} ${cy + 3} Q${cx} ${cy + 14} ${cx + 27} ${cy + 1}`} fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" />
        <path d={`M${cx - 27} ${cy + 3} l-8 1 M${cx - 22} ${cy + 7} l-6 5 M${cx - 12} ${cy + 10} l-3 6`} stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" />
      </g></g>
    )
  }

  const wide = mode === 'wide'
  const r = wide ? 13.5 : 16
  return (
    <g transform={`translate(${cx} ${cy}) scale(1.2) translate(${-cx} ${-cy})`}>
    <g transform={flip}>
      <defs>
        <clipPath id={clip}>
          <path d={almond} transform={wide ? `translate(${cx} ${cy}) scale(1.08 1.18) translate(${-cx} ${-cy})` : undefined} />
        </clipPath>
      </defs>
      <path d={almond} fill={C.paper} transform={wide ? `translate(${cx} ${cy}) scale(1.08 1.18) translate(${-cx} ${-cy})` : undefined} />
      <g clipPath={`url(#${clip})`}>
        <path d={`M${cx - 34} ${cy - 20} L${cx + 34} ${cy - 20} L${cx + 34} ${cy - 8} Q${cx} ${cy - 13} ${cx - 34} ${cy - 2} Z`} fill="#c9cdf2" />
        {/* the iris group is moved by the gaze loop */}
        <g className="rhea-iris" data-side={side}>
          {mode === 'heart' ? (
            <path
              d={`M${cx} ${cy + 13} C${cx - 22} ${cy} ${cx - 16} ${cy - 18} ${cx} ${cy - 7} C${cx + 16} ${cy - 18} ${cx + 22} ${cy} ${cx} ${cy + 13} Z`}
              fill="#ff3fa4"
              stroke={C.mouth}
              strokeWidth="1.5"
            />
          ) : (
            <>
              <ellipse cx={cx + 1} cy={cy} rx={r} ry={r * 1.12} fill={`url(#iris-${uid})`} />
              <ellipse cx={cx + 1} cy={cy} rx={r} ry={r * 1.12} fill="none" stroke={C.irisDeep} strokeWidth="2" />
              <path d={`M${cx - r + 2} ${cy - 4} A${r} ${r} 0 0 1 ${cx + r} ${cy - 4} L${cx + r} ${cy - 18} L${cx - r} ${cy - 18} Z`} fill={C.irisDeep} opacity=".45" />
              <path d={`M${cx - r + 4} ${cy + 6} A${r - 3} ${r - 3} 0 0 0 ${cx + r - 2} ${cy + 6}`} fill="none" stroke={C.gold} strokeWidth="2.4" opacity=".9" />
              <ellipse cx={cx + 1} cy={cy + 1} rx={wide ? 4.5 : 7} ry={wide ? 5 : 8.5} fill={C.ink} />
            </>
          )}
          <ellipse cx={cx - 5} cy={cy - 7} rx={wide ? 5.5 : 5} ry={wide ? 6 : 5.6} fill="#fff" />
          <path d={`M${cx + 7} ${cy - 11} l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z`} fill="#fff" opacity=".9" />
          <circle cx={cx + 7} cy={cy + 6} r="2" fill="#fff" />
        </g>
        {mode === 'half' && <path d={`M${cx - 34} ${cy - 22} L${cx + 34} ${cy - 22} L${cx + 34} ${cy - 1} Q${cx} ${cy + 4} ${cx - 34} ${cy + 2} Z`} fill={C.skin2} />}
      </g>
      {/* lids and lashes */}
      {mode === 'half' ? (
        <path d={`M${cx - 30} ${cy + 3} Q${cx} ${cy + 2} ${cx + 29} ${cy - 1}`} fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" />
      ) : (
        <path
          d={`M${cx - 36} ${cy + 1} Q${cx - 24} ${cy - 21} ${cx + 3} ${cy - 20} Q${cx + 25} ${cy - 18} ${cx + 30} ${cy - 1} Q${cx + 22} ${cy - 13} ${cx + 3} ${cy - 15} Q${cx - 18} ${cy - 15} ${cx - 29} ${cy + 3} Z`}
          fill={C.ink}
          stroke={C.ink}
          strokeWidth="1.4"
          strokeLinejoin="round"
          transform={wide ? `translate(0 -3)` : undefined}
        />
      )}
      <path
        d={`M${cx - 33} ${cy - 1} q-7 -2 -11 -9 M${cx - 29} ${cy - 8} q-5 -4 -7 -12 M${cx - 21} ${cy - 14} q-2 -5 -2 -11`}
        fill="none"
        stroke={C.ink}
        strokeWidth="2.6"
        strokeLinecap="round"
        transform={mode === 'half' ? 'translate(2 8)' : wide ? 'translate(0 -3)' : undefined}
      />
      <path d={`M${cx - 26} ${cy + 9} l-4 4 M${cx - 18} ${cy + 13} l-2 4`} stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" />
      <path d={`M${cx - 22} ${cy + 13} Q${cx} ${cy + 19} ${cx + 22} ${cy + 11}`} fill="none" stroke={C.skin3} strokeWidth="2" strokeLinecap="round" />
      {/* double-lid crease */}
      <path d={`M${cx - 22} ${cy - 22} Q${cx} ${cy - 30} ${cx + 22} ${cy - 22}`} fill="none" stroke={C.skin3} strokeWidth="1.6" strokeLinecap="round" opacity=".8" transform={mode === 'half' ? 'translate(0 6)' : undefined} />
    </g>
    </g>
  )
}

type Props = {
  emotion: Emotion
  talk?: MotionValue<number>
  className?: string
  viewBox?: string
  live?: boolean
  onPat?: () => void
  onPoke?: () => void
}

export default function Rhea({ emotion, talk, className, viewBox = '0 0 600 800', live = true, onPat, onPoke }: Props) {
  const uid = useId().replace(/:/g, '')
  const face = faces[emotion]
  const [blink, setBlink] = useState(false)
  const root = useRef<SVGSVGElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const faceRef = useRef(face)
  faceRef.current = face

  // blinking: irregular, sometimes double
  useEffect(() => {
    if (!live) return
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 130)
        if (Math.random() < 0.22) {
          window.setTimeout(() => setBlink(true), 260)
          window.setTimeout(() => setBlink(false), 390)
        }
        loop()
      }, 2200 + Math.random() * 3800)
    }
    loop()
    return () => clearTimeout(t)
  }, [live])

  // continuous life: breath, sway, gaze, talking mouth
  useEffect(() => {
    if (!live) return
    const svg = root.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / innerWidth - 0.5) * 2
      pointer.current.y = (e.clientY / innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)
    let raf = 0
    const g = { x: 0, y: 0, tilt: 0 }
    const q = (s: string) => svg.querySelector(s) as SVGGElement | null
    const start = performance.now()
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const t = reduce ? 0 : (now - start) / 1000
      const f = faceRef.current
      const follow = f.gaze[0] === 0 && f.gaze[1] === 0
      const tx = follow ? Math.max(-1, Math.min(1, pointer.current.x * 1.2)) : f.gaze[0]
      const ty = follow ? Math.max(-1, Math.min(1, pointer.current.y * 1.2 - 0.1)) : f.gaze[1]
      g.x += (tx - g.x) * 0.08
      g.y += (ty - g.y) * 0.08
      g.tilt += (f.tilt + (follow ? pointer.current.x * 2 : 0) - g.tilt) * 0.05
      const breath = Math.sin(t * 1.6) * 0.5 + 0.5
      const sway = Math.sin(t * 0.7)
      q('.rhea-body')?.setAttribute('transform', `translate(0 ${-breath * 2.2}) scale(1 ${1 + breath * 0.006})`)
      q('.rhea-head')?.setAttribute('transform', `translate(${g.x * 6} ${g.y * 3 - breath * 2.6}) rotate(${g.tilt + sway * 0.8} 300 450)`)
      q('.rhea-hair-back')?.setAttribute('transform', `translate(${g.x * 3} ${-breath * 2}) rotate(${g.tilt * 0.6 + sway * 0.5} 300 450)`)
      q('.rhea-lockL')?.setAttribute('transform', `rotate(${Math.sin(t * 1.1) * 1.4} 222 270)`)
      q('.rhea-lockR')?.setAttribute('transform', `rotate(${Math.sin(t * 1.1 + 1) * -1.4} 378 270)`)
      svg.querySelectorAll<SVGGElement>('.rhea-iris').forEach((el) => {
        el.setAttribute('transform', `translate(${g.x * 8} ${g.y * 5})`)
      })
      const mouth = q('.rhea-mouth-talk') as SVGPathElement | null
      const rest = q('.rhea-mouth-rest')
      const o = talk ? talk.get() : 0
      if (mouth && rest) {
        if (o > 0.04) {
          mouth.setAttribute('d', talkPath(Math.min(1, o)))
          mouth.style.display = ''
          rest.style.display = 'none'
        } else {
          mouth.style.display = 'none'
          rest.style.display = ''
        }
      }
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove) }
  }, [live, talk])

  const eyeL: EyeMode = blink ? 'closed' : face.eyeL
  const eyeR: EyeMode = blink ? 'closed' : face.eyeR
  const m = mouthPath(face.mouth)

  return (
    <svg ref={root} className={className} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Rhea, looking ${emotion}`}>
      <defs>
        <radialGradient id={`iris-${uid}`} cx="0.45" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#4fd2ff" />
          <stop offset="0.55" stopColor={C.iris} />
          <stop offset="1" stopColor={C.irisDeep} />
        </radialGradient>
        <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.hair} />
          <stop offset="1" stopColor={C.hairDeep} />
        </linearGradient>
        <pattern id={`dots-${uid}`} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.35" fill={C.skin3} />
        </pattern>
        <pattern id={`blushdots-${uid}`} width="4.4" height="4.4" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="2.2" cy="2.2" r="1.5" fill="#ff4fa6" />
        </pattern>
        <pattern id={`knit-${uid}`} width="12" height="10" patternUnits="userSpaceOnUse">
          <rect width="12" height="10" fill={C.cardi} />
          <path d="M1 2 L6 7 L11 2" fill="none" stroke={C.cardiDeep} strokeWidth="1.4" />
        </pattern>
        <pattern id={`hairhatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
          <rect width="6" height="6" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="6" stroke={C.hairHi} strokeWidth="1.6" />
        </pattern>
        <clipPath id={`face-${uid}`}>
          <path d="M204 292 C204 218 248 182 300 182 C352 182 396 218 396 292 C396 348 380 386 346 410 C326 424 314 430 300 430 C286 430 274 424 254 410 C220 386 204 348 204 292 Z" />
        </clipPath>
        <radialGradient id={`cheek-${uid}`}>
          <stop offset="0" stopColor="#ff6bb5" stopOpacity=".75" />
          <stop offset="1" stopColor="#ff6bb5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── hair, behind everything ── */}
      <g className="rhea-hair-back">
        <path transform="translate(-7 -3)" d="M300 128 C176 126 118 214 116 326 C114 430 96 520 70 628 C58 690 74 760 112 800 L488 800 C526 760 542 690 530 628 C504 520 486 430 484 326 C482 214 424 130 300 128 Z" fill={C.hairHi} opacity=".9" />
        <path transform="translate(7 -2)" d="M300 128 C176 126 118 214 116 326 C114 430 96 520 70 628 C58 690 74 760 112 800 L488 800 C526 760 542 690 530 628 C504 520 486 430 484 326 C482 214 424 130 300 128 Z" fill="#43c6ff" opacity=".75" />
        <path
          transform="translate(3 2)"
          d="M300 128 C176 126 118 214 116 326 C114 430 96 520 70 628 C58 690 74 760 112 800 L488 800 C526 760 542 690 530 628 C504 520 486 430 484 326 C482 214 424 130 300 128 Z"
          fill={`url(#hair-${uid})`}
        />
        <path
          d="M300 128 C176 126 118 214 116 326 C114 430 96 520 70 628 C58 690 74 760 112 800 M488 800 C526 760 542 690 530 628 C504 520 486 430 484 326 C482 214 424 130 300 128"
          fill="none"
          stroke={C.ink}
          strokeWidth="3"
        />
        {/* waves */}
        <path d="M128 470 C108 540 100 600 120 680 M472 470 C492 540 500 600 480 680 M150 380 C138 450 136 520 150 600 M452 380 C464 450 466 520 450 600" fill="none" stroke={C.hairHi} strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      </g>

      {/* ── body ── */}
      <g className="rhea-body">
        {/* neck */}
        <path d="M274 392 L272 480 Q300 496 328 480 L326 392 Z" fill={C.skin} stroke={C.ink} strokeWidth="2.6" />
        <path d="M274 414 Q300 446 326 414 L326 446 Q300 468 274 446 Z" fill={`url(#dots-${uid})`} opacity=".9" />
        {/* top */}
        <path transform="translate(2 2)" d="M196 560 Q300 600 404 560 L420 800 L180 800 Z" fill={C.top} />
        <path d="M232 520 Q300 612 368 520" fill={C.skin} stroke={C.ink} strokeWidth="2.6" />
        <path d="M250 540 Q275 552 290 548 M350 540 Q325 552 310 548" fill="none" stroke={C.skin3} strokeWidth="2" strokeLinecap="round" />
        {/* top neckline */}
        <path d="M228 524 Q300 624 372 524" fill="none" stroke={C.ink} strokeWidth="2.6" />
        {/* pendant */}
        <path d="M262 500 Q300 560 338 500" fill="none" stroke={C.gold} strokeWidth="1.6" />
        <path d="M300 553 l5 7 -5 7 -5 -7 Z" fill={C.gold} stroke={C.ink} strokeWidth="1.4" />
        {/* cardigan */}
        <path
          transform="translate(3 2)"
          d="M100 800 C104 660 150 572 236 516 Q250 600 270 700 L282 800 Z M500 800 C496 660 450 572 364 516 Q350 600 330 700 L318 800 Z"
          fill={`url(#knit-${uid})`}
        />
        <path
          d="M100 800 C104 660 150 572 236 516 Q250 600 270 700 L282 800 M500 800 C496 660 450 572 364 516 Q350 600 330 700 L318 800"
          fill="none"
          stroke={C.ink}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M236 516 Q246 600 262 690 M364 516 Q354 600 338 690" fill="none" stroke={C.cardiDeep} strokeWidth="9" opacity=".7" />
        <circle cx="272" cy="720" r="7" fill={C.iris} stroke={C.ink} strokeWidth="2" />
        <circle cx="276" cy="770" r="7" fill={C.iris} stroke={C.ink} strokeWidth="2" />
        {/* shoulder folds */}
        <path d="M160 640 Q175 610 200 600 M440 640 Q425 610 400 600" fill="none" stroke={C.cardiDeep} strokeWidth="3" strokeLinecap="round" />
        {/* headphones resting round her neck */}
        <path d="M222 486 Q300 548 378 486" fill="none" stroke={C.ink} strokeWidth="9" strokeLinecap="round" />
        <path d="M222 486 Q300 548 378 486" fill="none" stroke="#ff7cc6" strokeWidth="5" strokeLinecap="round" />
        <g>
          <rect x="196" y="462" width="36" height="52" rx="16" fill="#ff7cc6" stroke={C.ink} strokeWidth="2.6" transform="rotate(-24 214 488)" />
          <rect x="203" y="471" width="22" height="34" rx="10" fill={C.paper} stroke={C.ink} strokeWidth="1.8" transform="rotate(-24 214 488)" />
          <rect x="368" y="462" width="36" height="52" rx="16" fill="#ff7cc6" stroke={C.ink} strokeWidth="2.6" transform="rotate(24 386 488)" />
          <rect x="375" y="471" width="22" height="34" rx="10" fill={C.paper} stroke={C.ink} strokeWidth="1.8" transform="rotate(24 386 488)" />
          <text x="378" y="495" fontSize="12" fill={C.hairHi} transform="rotate(24 386 488)" fontFamily="sans-serif">♪</text>
        </g>
      </g>

      {/* ── head ── */}
      <g className="rhea-head">
        {/* face */}
        <path
          d="M204 292 C204 218 248 182 300 182 C352 182 396 218 396 292 C396 348 380 386 346 410 C326 424 314 430 300 430 C286 430 274 424 254 410 C220 386 204 348 204 292 Z"
          fill={C.skin}
          stroke={C.ink}
          strokeWidth="2.8"
          onClick={onPoke}
          style={{ cursor: onPoke ? 'pointer' : undefined }}
        />
        {/* ears + earrings */}
        <path d="M206 300 C190 296 186 330 206 344" fill={C.skin} stroke={C.ink} strokeWidth="2.4" />
        <path d="M394 300 C410 296 414 330 394 344" fill={C.skin} stroke={C.ink} strokeWidth="2.4" />
        <circle cx="200" cy="356" r="7" fill="none" stroke={C.gold} strokeWidth="3" />
        <circle cx="400" cy="356" r="7" fill="none" stroke={C.gold} strokeWidth="3" />
        <path d="M400 363 l0 10" stroke={C.gold} strokeWidth="2" />
        <path d="M400 373 l4 6 -4 6 -4 -6 Z" fill="#ff5cb8" stroke={C.ink} strokeWidth="1" />

        {/* blush: halftone + glow; intensity follows emotion */}
        <motion.g animate={{ opacity: face.blush }} transition={{ duration: 0.6 }}>
          <ellipse cx="238" cy="366" rx="30" ry="15" fill={`url(#cheek-${uid})`} />
          <ellipse cx="362" cy="366" rx="30" ry="15" fill={`url(#cheek-${uid})`} />
          <ellipse cx="238" cy="366" rx="22" ry="10" fill={`url(#blushdots-${uid})`} opacity=".55" />
          <ellipse cx="362" cy="366" rx="22" ry="10" fill={`url(#blushdots-${uid})`} opacity=".55" />
          <path d="M226 360 l-4 9 M236 360 l-4 9 M246 360 l-4 9 M354 360 l-4 9 M364 360 l-4 9 M374 360 l-4 9" stroke="#ff3fa4" strokeWidth="1.8" strokeLinecap="round" opacity={face.blush > 0.8 ? 1 : 0} />
        </motion.g>

        {/* freckles + beauty mark — hers alone */}
        <g fill={C.skin3}>
          <circle cx="276" cy="350" r="1.6" /><circle cx="284" cy="356" r="1.3" /><circle cx="270" cy="358" r="1.2" />
          <circle cx="324" cy="350" r="1.6" /><circle cx="316" cy="356" r="1.3" /><circle cx="330" cy="358" r="1.2" />
        </g>
        <circle cx="366" cy="344" r="2" fill={C.ink} />

        {/* nose */}
        <path d="M303 344 Q309 362 299 368" fill="none" stroke={C.skin3} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="303" cy="356" r="1.6" fill="#fff" opacity=".9" />

        {/* eyes */}
        <Eye side="L" mode={eyeL} uid={uid} />
        <Eye side="R" mode={eyeR} uid={uid} />

        {/* mouth */}
        <g className="rhea-mouth-rest">
          {m.fill ? (
            <>
              <path d={m.d} fill={C.mouth} stroke={C.ink} strokeWidth="2.2" strokeLinejoin="round" />
              {(face.mouth === 'open' || face.mouth === 'grin') && (
                <>
                  <path d={face.mouth === 'grin' ? 'M286 403 Q300 396 314 403 Q308 411 300 411 Q292 411 286 403 Z' : 'M288 401 Q300 395 312 401 Q307 407 300 407 Q293 407 288 401 Z'} fill={C.tongue} />
                  <path d={face.mouth === 'grin' ? 'M281 386 Q300 391 319 386 L318 390 Q300 395 282 390 Z' : 'M284 387 Q300 391 316 387 L315 390 Q300 394 285 390 Z'} fill="#fff" />
                </>
              )}
            </>
          ) : (
            <path d={m.d} fill="none" stroke={C.mouth} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {face.mouth === 'pursed' && <ellipse cx="342" cy="384" rx="15" ry="11" fill={C.skin2} opacity=".9" />}
          {!m.fill && <path d="M293 395 Q300 400 307 395" fill="none" stroke="#ff8fbd" strokeWidth="3" strokeLinecap="round" opacity=".7" />}
          {/* lip gloss */}
          <path d="M292 384 Q300 381 308 384" fill="none" stroke="#ff7aa8" strokeWidth="1.4" opacity={m.fill ? 0 : 0.6} />
        </g>
        <path className="rhea-mouth-talk" d="" fill={C.mouth} stroke={C.ink} strokeWidth="2.2" style={{ display: 'none' }} />

        {/* ── front hair: curtain bangs + face-framing locks ── */}
        <g>
          {/* crown */}
          <path transform="translate(2 1)" d="M196 240 C200 170 250 128 300 128 C350 128 400 170 404 240 C390 196 350 166 300 160 C250 166 210 196 196 240 Z" fill={`url(#hair-${uid})`} />
          <path d={FRINGE_SHADOW} fill={C.skin2} opacity=".75" clipPath={`url(#face-${uid})`} />
          <path transform="translate(2 2)" d={FRINGE} fill={`url(#hair-${uid})`} />
          <path d={FRINGE} fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
          {/* parting strands */}
          <path d="M298 176 C294 210 294 240 298 272 M268 184 C258 220 258 250 264 282 M332 184 C340 220 340 252 334 284 M240 200 C228 236 228 270 234 296 M362 200 C372 236 372 270 364 298" fill="none" stroke={C.hairDeep} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
          {/* sheen: pink print plate, slipped */}
          <path d="M226 186 C246 164 272 152 296 150 C276 160 258 172 244 190 Z M374 186 C354 164 328 152 304 150 C324 160 342 172 356 190 Z" fill={`url(#hairhatch-${uid})`} opacity=".85" />
          <path d="M240 172 Q268 150 300 146 Q332 150 360 172" fill="none" stroke={C.hairHi} strokeWidth="3" strokeLinecap="round" opacity=".75" />
          {/* hair clip: a little four-point star in gold */}
          <g transform="translate(372 214) rotate(18)">
            <path d="M0 -13 L3.4 -3.4 L13 0 L3.4 3.4 L0 13 L-3.4 3.4 L-13 0 L-3.4 -3.4 Z" fill={C.gold} stroke={C.ink} strokeWidth="1.8" strokeLinejoin="round" />
            <rect x="-15" y="12" width="30" height="5" rx="2.5" fill="#ff5cb8" stroke={C.ink} strokeWidth="1.6" />
          </g>
        </g>
        {/* brows */}
        <motion.path animate={{ d: browPath('L', face.brow) }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} fill="none" stroke={C.hairDeep} strokeWidth="3.4" strokeLinecap="round" opacity=".6" />
        <motion.path animate={{ d: browPath('R', face.brow) }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} fill="none" stroke={C.hairDeep} strokeWidth="3.4" strokeLinecap="round" opacity=".6" />

        {/* locks falling past the face */}
        <g className="rhea-lockL">
          <path transform="translate(2 2)" d="M198 262 C178 330 182 410 166 500 C160 548 172 590 194 612 C196 570 204 524 214 474 C218 410 212 330 206 276 Z" fill={`url(#hair-${uid})`} />
          <path d="M198 262 C178 330 182 410 166 500 C160 548 172 590 194 612 C196 570 204 524 214 474 C218 410 212 330 206 276" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M198 340 C194 400 190 450 184 520" fill="none" stroke={C.hairHi} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
        </g>
        <g className="rhea-lockR">
          <path transform="translate(2 2)" d="M402 262 C422 330 418 410 434 500 C440 548 428 590 406 612 C404 570 396 524 386 474 C382 410 388 330 394 276 Z" fill={`url(#hair-${uid})`} />
          <path d="M402 262 C422 330 418 410 434 500 C440 548 428 590 406 612 C404 570 396 524 386 474 C382 410 388 330 394 276" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M402 340 C406 400 410 450 416 520" fill="none" stroke={C.hairHi} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
        </g>
        {/* ahoge — one stubborn strand */}
        <path d="M298 130 C290 102 312 92 322 104 C314 100 304 108 306 128" fill={C.hair} stroke={C.ink} strokeWidth="2.2" />

        {/* pat zone: the top of her head */}
        {onPat && <ellipse cx="300" cy="170" rx="110" ry="48" fill="transparent" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onPat() }} />}

        {/* flourishes */}
        <AnimatePresence mode="wait">
          {face.mark && (
            <motion.g
              key={face.mark}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              style={{ transformOrigin: '420px 220px', transformBox: 'view-box' }}
            >
              {face.mark === 'sparkle' && (
                <g fill={C.gold} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M436 196 L441 210 L455 215 L441 220 L436 234 L431 220 L417 215 L431 210 Z" />
                  <path d="M162 214 L165 222 L173 225 L165 228 L162 236 L159 228 L151 225 L159 222 Z" />
                </g>
              )}
              {face.mark === 'heart' && (
                <path d="M440 228 C420 212 426 192 440 200 C454 192 460 212 440 228 Z" fill="#ff3fa4" stroke={C.ink} strokeWidth="2" />
              )}
              {face.mark === 'sweat' && (
                <path d="M408 226 C400 240 404 250 412 250 C420 250 422 240 408 226 Z" fill="#8fd8ff" stroke={C.ink} strokeWidth="2" />
              )}
              {face.mark === 'tear' && (
                <motion.path
                  d="M232 336 C226 348 228 356 234 356 C240 356 242 348 232 336 Z"
                  fill="#8fd8ff"
                  stroke={C.ink}
                  strokeWidth="1.6"
                  animate={{ y: [0, 26, 26], opacity: [1, 1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeIn' }}
                />
              )}
              {face.mark === 'puff' && (
                <g fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round">
                  <path d="M424 236 l14 -6 M428 250 l16 0 M424 264 l14 6" />
                </g>
              )}
              {face.mark === 'q' && (
                <text x="430" y="214" fontSize="46" fontWeight="800" fill={C.gold} stroke={C.ink} strokeWidth="1.6" fontFamily="'Anybody Variable', sans-serif">?</text>
              )}
              {face.mark === 'zz' && (
                <g fontFamily="'Anybody Variable', sans-serif" fontWeight="800" fill={C.paper} stroke={C.ink} strokeWidth="1.2">
                  <motion.text x="426" y="230" fontSize="22" animate={{ y: [0, -14], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>z</motion.text>
                  <motion.text x="446" y="206" fontSize="30" animate={{ y: [0, -14], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.7 }}>Z</motion.text>
                </g>
              )}
            </motion.g>
          )}
        </AnimatePresence>
      </g>
    </svg>
  )
}
