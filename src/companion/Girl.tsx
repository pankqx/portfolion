import { AnimatePresence, motion, useMotionTemplate, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import './girl.css'

export type Emotion =
  | 'neutral'
  | 'happy'
  | 'shy'
  | 'surprised'
  | 'thinking'
  | 'sad'
  | 'laughing'
  | 'sleepy'
  | 'love'

type Props = {
  emotion: Emotion
  talking?: boolean
  /** gaze direction, each -1..1 */
  look?: { x: number; y: number }
  onPat?: () => void
  onPoke?: () => void
  className?: string
  /** smaller, simplified render for the portfolio peek */
  compact?: boolean
}

/* Pose per emotion: head tilt (deg), head lift (px), brow lift, brow tilt, blush, eye shape */
const POSE: Record<Emotion, { tilt: number; lift: number; brow: number; browTilt: number; blush: number; eyes: 'open' | 'smile' | 'wide' | 'half' }> = {
  neutral: { tilt: 0, lift: 0, brow: 0, browTilt: 0, blush: 0.22, eyes: 'open' },
  happy: { tilt: -4, lift: -3, brow: -3, browTilt: 0, blush: 0.42, eyes: 'smile' },
  shy: { tilt: 6, lift: 4, brow: 2, browTilt: -8, blush: 0.85, eyes: 'open' },
  surprised: { tilt: -2, lift: -8, brow: -9, browTilt: 0, blush: 0.25, eyes: 'wide' },
  thinking: { tilt: 8, lift: 0, brow: -2, browTilt: 6, blush: 0.2, eyes: 'open' },
  sad: { tilt: 3, lift: 5, brow: 1, browTilt: -12, blush: 0.2, eyes: 'half' },
  laughing: { tilt: -7, lift: -4, brow: -4, browTilt: 0, blush: 0.55, eyes: 'smile' },
  sleepy: { tilt: 10, lift: 6, brow: 2, browTilt: -3, blush: 0.25, eyes: 'half' },
  love: { tilt: -5, lift: -2, brow: -3, browTilt: -4, blush: 0.8, eyes: 'open' },
}

const LINE = '#24183f'

function useBlink(paused: boolean) {
  const [closed, setClosed] = useState(false)
  useEffect(() => {
    if (paused) return
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setClosed(true)
        window.setTimeout(() => setClosed(false), 130)
        // occasional double blink
        if (Math.random() < 0.2)
          window.setTimeout(() => {
            setClosed(true)
            window.setTimeout(() => setClosed(false), 110)
          }, 260)
        loop()
      }, 2200 + Math.random() * 3200)
    }
    loop()
    return () => window.clearTimeout(t)
  }, [paused])
  return closed
}

function useMouthFlap(talking: boolean) {
  const [open, setOpen] = useState(0)
  useEffect(() => {
    if (!talking) {
      setOpen(0)
      return
    }
    const id = window.setInterval(() => setOpen(Math.random() < 0.25 ? 0 : 0.4 + Math.random() * 0.6), 95)
    return () => window.clearInterval(id)
  }, [talking])
  return open
}

/* ── Eye ─────────────────────────────────────────────── */
function Eye({ cx, cy, mirror, shape, closed, look, love, id }: { cx: number; cy: number; mirror?: boolean; shape: 'open' | 'smile' | 'wide' | 'half'; closed: boolean; look: { x: number; y: number }; love: boolean; id: string }) {
  const s = mirror ? -1 : 1
  const scaleTarget = closed ? 0.08 : shape === 'half' ? 0.55 : shape === 'wide' ? 1.08 : 1
  const sy = useSpring(1, { stiffness: 900, damping: 40 })
  const lx = useSpring(0, { stiffness: 120, damping: 18 })
  const ly = useSpring(0, { stiffness: 120, damping: 18 })
  useEffect(() => sy.set(scaleTarget), [scaleTarget, sy])
  useEffect(() => {
    lx.set(look.x * 7 * s)
    ly.set(look.y * 5)
  }, [look.x, look.y, s, lx, ly])
  const lidT = useMotionTemplate`scale(1 ${sy})`
  const irisT = useMotionTemplate`translate(${lx} ${ly})`
  const irisScale = shape === 'wide' ? 0.82 : 1

  const sclera = 'M -36 6 C -34 -27 26 -36 38 -10 C 40 18 -16 32 -36 6 Z'

  return (
    <g transform={`translate(${cx} ${cy}) scale(${s * 1.06} 1.1)`}>
      {shape === 'smile' ? (
        <g>
          <path d="M -34 8 Q 0 -24 36 6" fill="none" stroke={LINE} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 34 6 L 46 -2" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : (
        <motion.g transform={lidT}>
          <clipPath id={`clip-${id}`}>
            <path d={sclera} />
          </clipPath>
          <path d={sclera} fill="#fff8f5" />
          <g clipPath={`url(#clip-${id})`}>
            {/* lid shadow on the white */}
            <path d="M -40 -40 L 44 -40 L 44 -12 C 20 -24 -20 -24 -40 -6 Z" fill="#e2c3dd" opacity="0.75" />
            <motion.g transform={irisT}>
              <g transform={`translate(2 1) scale(${irisScale})`}>
                <ellipse rx="21" ry="27" fill="url(#iris)" />
                <ellipse rx="21" ry="27" fill="none" stroke="#3a1c5c" strokeWidth="2.2" />
                <ellipse cy="3" rx="9" ry="12" fill="#2a1240" />
                {/* lower iris glow */}
                <path d="M -14 10 Q 0 22 14 10 Q 0 16 -14 10 Z" fill="#ffd58f" opacity="0.8" />
                {love ? (
                  <path d="M -9 -12 c -4 -6 -12 -2 -9 4 l 9 8 l 9 -8 c 3 -6 -5 -10 -9 -4 z" fill="#ff7aa2" stroke="#fff" strokeWidth="1.5" />
                ) : (
                  <>
                    <ellipse cx="-7" cy="-9" rx="6.5" ry="7.5" fill="#fff" />
                    <circle cx="8" cy="9" r="3" fill="#fff" opacity="0.9" />
                  </>
                )}
              </g>
            </motion.g>
          </g>
          {/* upper lash line with wing */}
          <path d="M -41 8 C -38 -31 28 -40 42 -12 L 52 -24 L 47 -6 C 43 -9 41 -11 39 -12 C 28 -30 -30 -28 -36 7 Z" fill={LINE} />
          {/* little lash flicks */}
          <path d="M 26 -26 L 30 -35 M 35 -19 L 43 -26" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
          {/* lower lash */}
          <path d="M -26 20 Q 6 30 36 8" fill="none" stroke="#7a3f62" strokeWidth="1.8" strokeLinecap="round" /><path d="M 30 14 L 36 20" stroke="#7a3f62" strokeWidth="1.6" strokeLinecap="round" />
          {/* lid crease */}
          <path d="M -30 -32 Q 4 -48 38 -28" fill="none" stroke="#b27a92" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        </motion.g>
      )}
    </g>
  )
}

/* ── Mouth ───────────────────────────────────────────── */
const MOUTH_FILL = '#7e2647'
function Mouth({ emotion, open }: { emotion: Emotion; open: number }) {
  let key: string = emotion
  let node: React.ReactNode
  if (open > 0 && emotion !== 'laughing') {
    key = 'talk'
    const ry = 3 + open * 8
    node = (
      <>
        <ellipse cy={ry * 0.4} rx={9 + open * 3} ry={ry} fill={MOUTH_FILL} stroke={LINE} strokeWidth="1.6" />
        <ellipse cy={ry * 0.9} rx={6} ry={ry * 0.35} fill="#f08aa0" />
      </>
    )
  } else
    switch (emotion) {
      case 'happy':
        node = (
          <>
            <path d="M -17 -3 Q 0 2 17 -3 Q 13 16 0 17 Q -13 16 -17 -3 Z" fill={MOUTH_FILL} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
            <ellipse cy="11" rx="8" ry="4" fill="#f08aa0" />
          </>
        )
        break
      case 'laughing':
        node = (
          <>
            <path d="M -23 -5 Q 0 0 23 -5 Q 19 25 0 26 Q -19 25 -23 -5 Z" fill={MOUTH_FILL} stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M -19 -3.5 Q 0 1 19 -3.5 L 18 1.5 Q 0 5 -18 1.5 Z" fill="#fff" />
            <ellipse cy="17" rx="10" ry="5" fill="#f08aa0" />
          </>
        )
        break
      case 'shy':
        node = <path d="M -11 2 Q -5.5 -3 0 2 Q 5.5 -3 11 2" fill="none" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
        break
      case 'surprised':
        node = <ellipse cy="4" rx="7" ry="9" fill={MOUTH_FILL} stroke={LINE} strokeWidth="1.8" />
        break
      case 'sad':
        node = <path d="M -11 5 Q 0 -4 11 5" fill="none" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
        break
      case 'thinking':
        node = <path d="M -9 3 Q 3 0 12 -3" fill="none" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
        break
      case 'sleepy':
        node = <ellipse cy="3" rx="4" ry="5" fill={MOUTH_FILL} stroke={LINE} strokeWidth="1.6" />
        break
      case 'love':
        node = <path d="M -14 -1 Q -7 7 0 1 Q 7 7 14 -1" fill="none" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
        break
      default:
        node = <path d="M -12 0 Q 0 7 12 0" fill="none" stroke={LINE} strokeWidth="2.4" strokeLinecap="round" />
    }
  return (
    <g transform="translate(300 418)">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.g key={key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: key === 'talk' ? 0.05 : 0.18 }}>
          {node}
        </motion.g>
      </AnimatePresence>
    </g>
  )
}

/* ── Emotes: little anime marks that float around her ── */
function Emotes({ emotion }: { emotion: Emotion }) {
  return (
    <AnimatePresence>
      {emotion === 'love' && (
        <motion.g key="hearts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${430 + i * 22} ${250 - i * 30}) scale(${1 - i * 0.2})`}><path className="emote-float" style={{ animationDelay: `${i * 0.7}s` }} d="M 0 0 c -6 -9 -20 -3 -14 7 l 14 13 l 14 -13 c 6 -10 -8 -16 -14 -7 z" fill="#ff7aa2" stroke={LINE} strokeWidth="2" /></g>
          ))}
        </motion.g>
      )}
      {(emotion === 'happy' || emotion === 'laughing') && (
        <motion.g key="sparkles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {[
            [452, 196, 1],
            [150, 230, 0.7],
            [470, 300, 0.55],
          ].map(([x, y, sc], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${sc})`}><path className="emote-twinkle" style={{ animationDelay: `${i * 0.4}s` }} d="M 0 -16 Q 2 -2 16 0 Q 2 2 0 16 Q -2 2 -16 0 Q -2 -2 0 -16 Z" fill="#ffd27a" stroke={LINE} strokeWidth="1.5" /></g>
          ))}
        </motion.g>
      )}
      {(emotion === 'shy' || emotion === 'surprised') && (
        <motion.path key="sweat" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} d="M 404 236 C 396 252 398 264 408 264 C 418 264 418 252 404 236 Z" fill="#bfe3ff" stroke={LINE} strokeWidth="2" />
      )}
      {emotion === 'surprised' && (
        <motion.g key="burst" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} stroke={LINE} strokeWidth="4" strokeLinecap="round">
          <path d="M 420 150 L 436 126" />
          <path d="M 440 168 L 466 154" />
          <path d="M 446 192 L 474 192" />
        </motion.g>
      )}
      {emotion === 'sad' && (
        <motion.path key="tear" className="emote-tear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} d="M 230 362 C 224 374 225 384 232 384 C 239 384 239 374 230 362 Z" fill="#bfe3ff" stroke={LINE} strokeWidth="1.6" />
      )}
      {emotion === 'thinking' && (
        <motion.g key="dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} fill="#efe7d6" stroke={LINE} strokeWidth="2">
          <circle className="emote-dot" cx="430" cy="196" r="6" />
          <circle className="emote-dot" style={{ animationDelay: '.2s' }} cx="452" cy="176" r="8" />
          <circle className="emote-dot" style={{ animationDelay: '.4s' }} cx="480" cy="150" r="11" />
        </motion.g>
      )}
      {emotion === 'sleepy' && (
        <motion.g key="zzz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} fontFamily="Gloock, serif" fill="#efe7d6">
          <text className="emote-float" x="420" y="210" fontSize="22">z</text>
          <text className="emote-float" style={{ animationDelay: '.8s' }} x="440" y="180" fontSize="30">z</text>
          <text className="emote-float" style={{ animationDelay: '1.6s' }} x="466" y="146" fontSize="40">Z</text>
        </motion.g>
      )}
    </AnimatePresence>
  )
}

/* ── Lumi ────────────────────────────────────────────── */
export function Girl({ emotion, talking = false, look = { x: 0, y: 0 }, onPat, onPoke, className, compact }: Props) {
  const pose = POSE[emotion]
  const blink = useBlink(pose.eyes === 'smile')
  const mouthOpen = useMouthFlap(talking)

  const tilt = useSpring(0, { stiffness: 90, damping: 14 })
  const lift = useSpring(0, { stiffness: 90, damping: 14 })
  const brow = useSpring(0, { stiffness: 200, damping: 18 })
  const browTilt = useSpring(0, { stiffness: 200, damping: 18 })
  const blush = useSpring(0.2, { stiffness: 60, damping: 20 })

  useEffect(() => {
    tilt.set(pose.tilt + look.x * 3)
    lift.set(pose.lift + look.y * 2)
  }, [pose.tilt, pose.lift, look.x, look.y, tilt, lift])
  useEffect(() => {
    brow.set(pose.brow)
    browTilt.set(pose.browTilt)
    blush.set(pose.blush)
  }, [pose.brow, pose.browTilt, pose.blush, brow, browTilt, blush])

  const headT = useMotionTemplate`translate(0 ${lift}) rotate(${tilt} 300 470)`
  const browL = useMotionTemplate`translate(0 ${brow}) rotate(${browTilt} 250 286)`
  const negTilt = useSpring(0, { stiffness: 200, damping: 18 })
  useEffect(() => negTilt.set(-pose.browTilt), [pose.browTilt, negTilt])
  const browR = useMotionTemplate`translate(0 ${brow}) rotate(${negTilt} 350 286)`

  return (
    <svg className={`girl ${className ?? ''}`} viewBox="0 0 600 860" role="img" aria-label={`Lumi, looking ${emotion}`}>
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0e8" />
          <stop offset="1" stopColor="#f7d2c6" />
        </linearGradient>
        <linearGradient id="hair" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#2f2f78" />
          <stop offset="0.55" stopColor="#1d1f55" />
          <stop offset="1" stopColor="#3c2a72" />
        </linearGradient>
        <linearGradient id="hairRim" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#9d8cff" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#9d8cff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="iris" cx="0.5" cy="0.62" r="0.62">
          <stop offset="0" stopColor="#ffcf8a" />
          <stop offset="0.45" stopColor="#e2789d" />
          <stop offset="1" stopColor="#4b2a7a" />
        </radialGradient>
        <linearGradient id="knit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4dcf6" />
          <stop offset="1" stopColor="#a99ad8" />
        </linearGradient>
        <radialGradient id="blushG">
          <stop offset="0" stopColor="#ff7f9f" />
          <stop offset="1" stopColor="#ff7f9f" stopOpacity="0" />
        </radialGradient>
        <clipPath id="faceClip">
          <path d="M 203 262 C 201 338 226 398 260 436 C 278 455 291 463 300 464 C 309 463 322 455 340 436 C 374 398 399 338 397 262 C 397 166 203 166 203 262 Z" />
        </clipPath>
      </defs>

      <g className="girl-breathe">
        {/* hair, back mass */}
        <g className="girl-sway">
          <path
            d="M 300 100 C 420 100 470 190 465 320 C 462 430 480 520 505 610 C 520 670 545 725 532 795 C 508 768 482 772 462 742 C 448 784 414 776 400 752 C 380 770 340 760 330 740 L 270 740 C 260 760 220 770 200 752 C 186 776 152 784 138 742 C 118 772 92 768 68 795 C 55 725 80 670 95 610 C 120 520 138 430 135 320 C 130 190 180 100 300 100 Z"
            fill="url(#hair)"
            stroke={LINE}
            strokeWidth="2.4"
          />
          <path d="M 300 100 C 420 100 470 190 465 320 C 462 430 480 520 505 610 C 520 670 545 725 532 795" fill="none" stroke="url(#hairRim)" strokeWidth="10" opacity="0.7" />
          {/* strand lines */}
          <path d="M 160 420 C 150 520 130 620 120 720 M 440 420 C 452 520 470 620 482 720 M 190 500 C 180 580 172 650 176 720 M 412 500 C 422 580 430 650 426 720" fill="none" stroke="#4a3d96" strokeWidth="2" opacity="0.6" />
        </g>

        {/* body + sweater (raised so the neck sits short) */}
        <g transform="translate(0 -40)">
        <path d="M 268 420 L 266 548 Q 300 566 334 548 L 332 420 Z" fill="url(#skin)" stroke={LINE} strokeWidth="2" />
        <path d="M 272 470 Q 300 500 328 470 L 328 492 Q 300 515 272 492 Z" fill="#e6b2a8" opacity="0.7" />
        <path
          d="M 58 900 C 74 720 118 640 190 610 C 232 594 262 572 272 545 Q 300 578 328 545 C 338 572 368 594 410 610 C 482 640 532 730 542 900 Z"
          fill="url(#knit)"
          stroke={LINE}
          strokeWidth="2.4"
        />
        <g stroke="#8d7cc8" strokeWidth="1.6" opacity="0.55" fill="none">
          <path d="M 150 700 C 148 760 146 810 146 860 M 200 650 C 196 730 194 800 194 860 M 400 650 C 404 730 406 800 406 860 M 450 700 C 452 760 454 810 454 860" />
          <path d="M 120 760 Q 150 752 180 760 M 420 760 Q 450 752 480 760" />
        </g>
        <path d="M 262 550 Q 300 606 338 550" fill="none" stroke="#f3eefc" strokeWidth="11" strokeLinecap="round" />
        <path d="M 262 550 Q 300 606 338 550" fill="none" stroke={LINE} strokeWidth="1.6" />
        {/* moon pendant */}
        <path d="M 278 560 Q 300 605 322 560" fill="none" stroke="#c9a65a" strokeWidth="1.2" />
        <path className="girl-pendant" d="M 304 596 A 10 10 0 1 0 308 614 A 8 8 0 1 1 304 596 Z" fill="#ffb347" stroke={LINE} strokeWidth="1.4" />

        </g>
        {/* head */}
        <motion.g transform={headT}>
          <g onClick={onPoke} style={{ cursor: onPoke ? 'pointer' : undefined }}>
            <path d="M 203 262 C 201 338 226 398 260 436 C 278 455 291 463 300 464 C 309 463 322 455 340 436 C 374 398 399 338 397 262 C 397 166 203 166 203 262 Z" fill="url(#skin)" stroke={LINE} strokeWidth="2.4" />
            <g clipPath="url(#faceClip)">
              {/* shadow cast by bangs */}
              <path d="M 200 288 Q 300 322 400 288 L 400 302 Q 300 336 200 302 Z" fill="#eab8b0" opacity="0.4" />
              {/* moonlight rim on the right cheek */}
              <path d="M 392 260 C 390 340 370 400 336 446" fill="none" stroke="#c8bdff" strokeWidth="6" opacity="0.35" />
            </g>

            {/* blush */}
            <motion.g style={{ opacity: blush }}>
              <ellipse cx="234" cy="390" rx="26" ry="12" fill="url(#blushG)" />
              <ellipse cx="366" cy="390" rx="26" ry="12" fill="url(#blushG)" />
              {(emotion === 'shy' || emotion === 'love') && (
                <g stroke="#e0607f" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M 220 396 L 226 386 M 230 397 L 236 387 M 240 397 L 246 387" />
                  <path d="M 356 397 L 362 387 M 366 397 L 372 387 M 376 396 L 382 386" />
                </g>
              )}
            </motion.g>

            <Eye id="l" cx={247} cy={342} mirror shape={pose.eyes} closed={blink} look={look} love={emotion === 'love'} />
            <Eye id="r" cx={353} cy={342} shape={pose.eyes} closed={blink} look={look} love={emotion === 'love'} />

            <path d="M 302 380 Q 307 387 300 391" fill="none" stroke="#d48f88" strokeWidth="2" strokeLinecap="round" />
            <Mouth emotion={emotion} open={mouthOpen} />
          </g>

          {/* side locks in front of the shoulders */}
          <g className="girl-sway-l">
            <path d="M 214 228 C 190 330 186 430 176 522 C 168 592 148 652 160 712 C 186 668 202 606 214 540 C 224 470 230 380 234 300 Z" fill="url(#hair)" stroke={LINE} strokeWidth="2.2" />
            <path d="M 206 330 C 198 420 192 500 182 590" fill="none" stroke="#4a3d96" strokeWidth="1.8" />
          </g>
          <g className="girl-sway-r">
            <path d="M 386 228 C 410 330 414 430 424 522 C 432 592 452 652 440 712 C 414 668 398 606 386 540 C 376 470 370 380 366 300 Z" fill="url(#hair)" stroke={LINE} strokeWidth="2.2" />
            <path d="M 394 330 C 402 420 408 500 418 590" fill="none" stroke="#7d6ce6" strokeWidth="1.8" opacity="0.8" />
          </g>

          {/* bangs */}
          <g onClick={onPat} style={{ cursor: onPat ? 'pointer' : undefined }}>
            <path
              d="M 196 330 C 186 200 236 108 300 108 C 364 108 416 200 404 330 C 396 300 392 270 380 246 C 384 270 380 296 370 312 C 364 284 352 258 338 238 C 342 262 338 284 326 300 C 322 272 312 250 298 234 C 300 258 294 280 282 296 C 278 268 268 248 254 236 C 254 262 248 286 236 304 C 232 276 224 256 214 244 C 214 272 206 304 196 330 Z"
              fill="url(#hair)"
              stroke={LINE}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <path d="M 262 140 C 290 180 300 214 298 234 M 330 136 C 344 170 344 210 338 238 M 232 170 C 248 200 254 222 254 236 M 372 176 C 380 200 382 226 380 246 M 214 210 C 214 226 214 236 214 244" fill="none" stroke="#4a3d96" strokeWidth="2" strokeLinecap="round" />
            {/* angel-ring sheen */}
            <path d="M 226 182 C 250 150 350 146 374 182" fill="none" stroke="#a596ff" strokeWidth="8" strokeLinecap="round" strokeDasharray="20 9 12 9" opacity="0.55" />
            <path d="M 262 156 C 284 146 316 146 338 156" fill="none" stroke="#efeaff" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="8 14" opacity="0.8" />
            {/* ahoge */}
            <path className="girl-ahoge" d="M 300 114 C 290 80 322 72 334 48 C 324 80 314 94 308 114 Z" fill="url(#hair)" stroke={LINE} strokeWidth="2" />
            {/* crescent hair clip */}
            <path d="M 384 206 A 15 15 0 1 0 392 234 A 12 12 0 1 1 384 206 Z" fill="#ffb347" stroke={LINE} strokeWidth="1.8" />
            <path d="M 404 204 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 z" fill="#ffe2a6" stroke={LINE} strokeWidth="1.2" />
          </g>
          <motion.path transform={browL} d="M 220 290 Q 248 278 278 287" fill="none" stroke="#2f2470" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />
          <motion.path transform={browR} d="M 322 287 Q 352 278 380 290" fill="none" stroke="#2f2470" strokeWidth="3.6" strokeLinecap="round" opacity="0.85" />
        </motion.g>
      </g>

      {!compact && <Emotes emotion={emotion} />}
    </svg>
  )
}
