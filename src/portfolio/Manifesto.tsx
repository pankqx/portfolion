import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { elements, me, stats } from '../content/me'

function Line({ text, i, total }: { text: string; i: number; total: number }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  // each line stretches open as it reaches the middle of the screen
  const stretch = useTransform(scrollYProgress, [0, 1], [56, i % 2 ? 132 : 112])
  const fontStretch = useTransform(stretch, (v) => `${v}%`)
  const ink = useTransform(scrollYProgress, [0.3, 1], ['#b9b3cf', i === total - 1 ? '#ff48b0' : '#24204a'])
  return (
    <motion.p ref={ref} className="mf-line" style={{ fontStretch, color: ink, textAlign: i % 2 ? 'right' : 'left' }}>
      {text}
    </motion.p>
  )
}

export default function Manifesto() {
  const words = [...new Set(elements.map((e) => e.name))]
  return (
    <>
      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          {[0, 1].map((k) => (
            <span key={k}>
              {words.map((w) => (
                <span key={w}>
                  {w} <b>✳</b>{' '}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="sec mf" aria-label="Manifesto">
        <div className="mf-text">
          {me.manifesto.map((l, i) => (
            <Line key={i} text={l} i={i} total={me.manifesto.length} />
          ))}
        </div>
        <ul className="stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="stat-v">{s.value}</span>
              <span className="stat-l">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
