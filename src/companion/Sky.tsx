import { motion } from 'framer-motion'
import { memo, useMemo, type ReactElement } from 'react'
import type { Emotion } from './emotions'

/* The rooftop at night, printed in riso layers.
   1600×1000 page, sliced to fill any screen from the bottom up. */

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

type B = { x: number; w: number; h: number; tank?: boolean; mast?: boolean }

function skyline(seed: number, base: number, count: number, minH: number, maxH: number): B[] {
  const r = rng(seed)
  const out: B[] = []
  let x = -40
  for (let i = 0; i < count && x < 1640; i++) {
    const w = 60 + r() * 120
    out.push({ x, w, h: minH + r() * (maxH - minH), tank: r() < 0.22, mast: r() < 0.16 })
    x += w + r() * 14
  }
  void base
  return out
}

const haze: Record<Emotion, string> = {
  calm: '#ff48b0', happy: '#ff7ac8', giggle: '#ff7ac8', shy: '#ff48b0', love: '#ff2f9c', surprised: '#ffd84d',
  sad: '#3b6dff', pout: '#ff6b6b', thinking: '#7e6bff', sleepy: '#6a5acd', wink: '#ff7ac8',
}

function Windows({ b, base, seed, lit }: { b: B; base: number; seed: number; lit: number }) {
  const r = rng(seed)
  const cells: ReactElement[] = []
  const cols = Math.max(2, Math.floor(b.w / 18))
  const rows = Math.floor(b.h / 22)
  for (let j = 1; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const on = r() < lit
      if (!on) continue
      const pink = r() < 0.18
      cells.push(
        <rect
          key={`${i}-${j}`}
          className={r() < 0.08 ? 'win-flicker' : undefined}
          style={{ animationDelay: `${r() * 6}s` }}
          x={b.x + 8 + i * ((b.w - 16) / cols)}
          y={base - b.h + j * 22}
          width={7}
          height={10}
          fill={pink ? '#ff7ac8' : '#ffe14d'}
          opacity={0.55 + r() * 0.45}
        />,
      )
    }
  }
  return <>{cells}</>
}

function SkyInner({ emotion }: { emotion: Emotion }) {
  const far = useMemo(() => skyline(7, 880, 26, 160, 360), [])
  const mid = useMemo(() => skyline(19, 900, 20, 120, 280), [])
  const stars = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 26 }, () => ({ x: r() * 1600, y: r() * 520, s: 4 + r() * 9, d: r() * 4 }))
  }, [])

  // string lights hang in a catenary
  const bulbs = useMemo(() => {
    const pts: { x: number; y: number }[] = []
    for (let i = 0; i <= 22; i++) {
      const t = i / 22
      pts.push({ x: t * 1600, y: 120 + 40 * t + Math.sin(t * Math.PI) * 170 })
    }
    return pts
  }, [])

  return (
    <svg className="sky" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0930" />
          <stop offset="0.55" stopColor="#1a1660" />
          <stop offset="1" stopColor="#2c2290" />
        </linearGradient>
        <radialGradient id="hazeg" cx="0.5" cy="1" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id="stardots" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <circle cx="3" cy="3" r="0.9" fill="#cfd0ff" />
          <circle cx="14" cy="11" r="0.6" fill="#ffd1ec" />
        </pattern>
        <linearGradient id="starfade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="starmask"><rect width="1600" height="1000" fill="url(#starfade)" /></mask>
        <pattern id="moondots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
          <circle cx="4.5" cy="4.5" r="2.2" fill="#f5b93a" />
        </pattern>
        <radialGradient id="bulbglow">
          <stop offset="0" stopColor="#ffe14d" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffe14d" stopOpacity="0" />
        </radialGradient>
        <pattern id="ledge" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#2a1f7a" />
          <circle cx="8" cy="8" r="2.2" fill="#3a2ea0" />
        </pattern>
      </defs>

      <rect width="1600" height="1000" fill="url(#skyg)" />
      <motion.rect
        width="1600"
        height="1000"
        fill={haze[emotion]}
        mask="url(#hazemask)"
        animate={{ fill: haze[emotion] }}
        transition={{ duration: 1.2 }}
        opacity={0.5}
        style={{ mixBlendMode: 'screen' }}
      />
      <mask id="hazemask"><rect width="1600" height="1000" fill="url(#hazeg)" /></mask>
      <rect width="1600" height="1000" fill="url(#stardots)" mask="url(#starmask)" opacity=".8" />

      {stars.map((s, i) => (
        <path
          key={i}
          className="twinkle"
          style={{ animationDelay: `${s.d}s` }}
          transform={`translate(${s.x} ${s.y}) scale(${s.s / 10})`}
          d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z"
          fill={i % 3 ? '#fff6d0' : '#ffb3df'}
        />
      ))}

      {/* moon: pink plate slipped under the yellow plate */}
      <g className="moon">
        <circle cx="1268" cy="236" r="148" fill="#ff48b0" opacity=".55" transform="translate(-12 8)" />
        <circle cx="1268" cy="236" r="148" fill="#ffe14d" />
        <circle cx="1268" cy="236" r="148" fill="url(#moondots)" opacity=".6" />
        <circle cx="1220" cy="200" r="26" fill="#f5b93a" opacity=".55" />
        <circle cx="1310" cy="290" r="18" fill="#f5b93a" opacity=".5" />
        <circle cx="1300" cy="180" r="10" fill="#f5b93a" opacity=".5" />
      </g>

      {/* ascii clouds drifting */}
      <g className="clouds" fontFamily="'Martian Mono Variable', monospace" fontSize="18" fill="#b9b4ff" opacity=".42">
        <text className="cloud c1" x="80" y="300">
          <tspan x="80" dy="0">{'      .--~~~~--.'}</tspan>
          <tspan x="80" dy="20">{'  .--(  ~  ~   )~~--.'}</tspan>
          <tspan x="80" dy="20">{' (___~~~___~~~____~~__)'}</tspan>
        </text>
        <text className="cloud c2" x="900" y="430">
          <tspan x="900" dy="0">{'    _.~~~~~~._'}</tspan>
          <tspan x="900" dy="20">{' .~(   ~~  ~   )~.'}</tspan>
          <tspan x="900" dy="20">{'(___~~____~~______)'}</tspan>
        </text>
      </g>

      {/* far city */}
      <g>
        {far.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={880 - b.h} width={b.w} height={b.h + 20} fill="#231c78" />
            {b.mast && <path d={`M${b.x + b.w / 2} ${880 - b.h} l0 -60`} stroke="#231c78" strokeWidth="4" />}
            {b.mast && <circle className="blink-red" cx={b.x + b.w / 2} cy={880 - b.h - 60} r="4" fill="#ff4f6d" />}
            <Windows b={b} base={880} seed={i * 13 + 1} lit={0.18} />
          </g>
        ))}
      </g>
      {/* mid city */}
      <g>
        {mid.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={910 - b.h} width={b.w} height={b.h + 20} fill="#170f55" />
            {b.tank && (
              <g fill="#170f55">
                <rect x={b.x + 16} y={910 - b.h - 44} width="40" height="34" rx="4" />
                <path d={`M${b.x + 20} ${910 - b.h - 10} l-6 10 M${b.x + 52} ${910 - b.h - 10} l6 10`} stroke="#170f55" strokeWidth="4" />
                <path d={`M${b.x + 12} ${910 - b.h - 44} L${b.x + 36} ${910 - b.h - 62} L${b.x + 60} ${910 - b.h - 44} Z`} />
              </g>
            )}
            <Windows b={b} base={910} seed={i * 31 + 7} lit={0.28} />
          </g>
        ))}
      </g>

      {/* string lights */}
      <path d={`M${bulbs.map((p) => `${p.x} ${p.y}`).join(' L')}`} fill="none" stroke="#0b0930" strokeWidth="2.5" />
      {bulbs.map((p, i) => (
        <g key={i} className="bulb" style={{ animationDelay: `${(i % 5) * 0.4}s` }}>
          <circle cx={p.x} cy={p.y + 12} r="24" fill="url(#bulbglow)" opacity=".55" />
          <path d={`M${p.x} ${p.y} l0 6`} stroke="#0b0930" strokeWidth="2" />
          <ellipse cx={p.x} cy={p.y + 13} rx="5" ry="7" fill={i % 4 === 1 ? '#ff9ad5' : '#fff1a8'} />
        </g>
      ))}

      {/* rooftop ledge with a cat who has opinions */}
      <rect x="0" y="905" width="1600" height="95" fill="url(#ledge)" />
      <rect x="0" y="896" width="1600" height="14" fill="#3b2fae" />
      <rect x="0" y="896" width="1600" height="3" fill="#ff7ac8" opacity=".6" />
      <g className="cat" transform="translate(1490 896)">
        <path d="M0 0 C-2 -30 6 -48 22 -52 L18 -66 L30 -56 C36 -57 42 -57 46 -56 L58 -66 L54 -52 C66 -46 70 -30 66 0 Z" fill="#0b0930" />
        <path className="cat-tail" d="M64 -4 C92 -4 100 -30 88 -44" fill="none" stroke="#0b0930" strokeWidth="7" strokeLinecap="round" />
        <circle className="cat-eye" cx="28" cy="-40" r="3" fill="#ffe14d" />
        <circle className="cat-eye" cx="44" cy="-40" r="3" fill="#ffe14d" />
      </g>
      {/* a plant, because rooftops need one */}
      <g transform="translate(1360 896)">
        <path d="M-26 0 L-20 -40 L20 -40 L26 0 Z" fill="#ff48b0" />
        <path d="M-20 -40 L20 -40" stroke="#0b0930" strokeWidth="3" />
        <path d="M0 -40 C-10 -80 -40 -90 -50 -110 M0 -40 C6 -90 30 -100 40 -126 M0 -40 C-4 -70 10 -96 0 -132" fill="none" stroke="#00a95c" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="-44" cy="-104" rx="14" ry="7" fill="#00a95c" transform="rotate(-30 -44 -104)" />
        <ellipse cx="36" cy="-120" rx="14" ry="7" fill="#00a95c" transform="rotate(-50 36 -120)" />
        <ellipse cx="0" cy="-128" rx="7" ry="14" fill="#00a95c" />
      </g>
    </svg>
  )
}

export default memo(SkyInner)
