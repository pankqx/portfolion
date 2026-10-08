import { motion } from 'framer-motion'
import { useState } from 'react'
import { me } from '../content/me'
import AsciiSculpture, { SHAPE_NAMES } from '../ui/AsciiSculpture'
import { RegMark } from '../ui/PrintMarks'

const letters = me.name.toUpperCase().split('')

export default function Hero() {
  const [shape, setShape] = useState(0)
  return (
    <section className="hero" id="top" aria-label="Introduction">
      <RegMark className="reg reg-tl" />
      <RegMark className="reg reg-tr" />
      <RegMark className="reg reg-bl" />
      <RegMark className="reg reg-br" />

      <div className="hero-slug mono">
        <span>Issue 01</span>
        <span>{me.coords}</span>
        <span className="hero-bars" aria-hidden>
          <i style={{ background: 'var(--pink)' }} />
          <i style={{ background: 'var(--blue)' }} />
          <i style={{ background: 'var(--yellow)' }} />
          <i style={{ background: 'var(--ink)' }} />
          <i className="halftone-ink" />
        </span>
      </div>

      <div className="hero-copy">
        <motion.p
          className="hero-lede"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8, ease: [0.2, 0.7, 0.1, 1] }}
        >
          {me.intro}
        </motion.p>
        <motion.div
          className="hero-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <span className="hero-status">
            <span className="pulse" aria-hidden />
            {me.status}
          </span>
          <span className="mono hero-loc">{me.location}</span>
        </motion.div>
      </div>

      <div className="hero-sculpt">
        <div className="hero-sun halftone-pink" aria-hidden />
        <AsciiSculpture className="hero-ascii" shape={shape} onShape={setShape} cell={12} />
        <p className="hero-caption mono">
          Specimen {shape + 1}/4, {SHAPE_NAMES[shape]}. Click to swap.
        </p>
      </div>

      <svg className="hero-stamp" viewBox="0 0 200 200" aria-hidden>
        <defs>
          <path id="stampPath" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="var(--yellow)" style={{ mixBlendMode: 'multiply' }} />
        <text>
          <textPath href="#stampPath" startOffset="0">
            {`${me.tagline} ✳ ${me.tagline} ✳ `}
          </textPath>
        </text>
        <text x="100" y="112" textAnchor="middle" className="stamp-mid">✳</text>
      </svg>

      <h1 className="hero-name" aria-label={me.name}>
        {letters.map((ch, i) => (
          <span className="hero-letter" key={i} aria-hidden>
            <motion.span
              className="hl hl-blue"
              initial={{ x: 60, y: -40, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 1.1, ease: [0.2, 0.8, 0.1, 1] }}
            >
              {ch}
            </motion.span>
            <motion.span
              className="hl hl-pink"
              initial={{ x: -80, y: 30, opacity: 0 }}
              animate={{ x: 4, y: 3, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 1.2, ease: [0.2, 0.8, 0.1, 1] }}
            >
              {ch}
            </motion.span>
          </span>
        ))}
      </h1>
    </section>
  )
}
