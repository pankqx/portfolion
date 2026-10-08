import { motion, useScroll, useTransform } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { projects } from '../content/me'
import Riso from '../ui/Riso'
import { Crops } from '../ui/PrintMarks'
import { plates } from './plates'

const inks = ['var(--pink)', 'var(--blue)', 'var(--yellow)', 'var(--teal)']

/* Projects as print proofs, pinned and pulled sideways by scroll. */
export default function Proofs() {
  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist])
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return
      setDist(Math.max(0, track.current.scrollWidth - innerWidth))
    }
    measure()
    addEventListener('resize', measure)
    return () => removeEventListener('resize', measure)
  }, [])

  return (
    <section className="proofs" id="proofs" ref={wrap} style={{ height: `calc(100vh + ${dist}px)` }} aria-labelledby="proofs-title">
      <div className="proofs-pin">
        <div className="proofs-head">
          <h2 className="sec-title" id="proofs-title">
            <Riso>Proofs</Riso>
          </h2>
          <p className="sec-lede">
            Things I’ve shipped, pulled off the press before they’re perfect. Scroll to leaf through them.
          </p>
          <div className="proofs-progress" aria-hidden>
            <motion.span style={{ width: bar }} />
          </div>
        </div>
        <motion.div className="proofs-track" ref={track} style={{ x }}>
          {projects.map((p, i) => (
            <article className="proof" key={p.title} style={{ ['--acc' as string]: inks[i % inks.length], rotate: `${(i % 2 ? 1 : -1) * 0.8}deg` }}>
              <Crops />
              <div className="proof-plate">
                <pre className="proof-art proof-art-a" aria-hidden>{plates[p.art]}</pre>
                <pre className="proof-art proof-art-b" aria-hidden>{plates[p.art]}</pre>
                <span className="proof-no mono">Proof {i + 1} of {projects.length}</span>
              </div>
              <div className="proof-body">
                <p className="proof-kind mono">{p.kind}, {p.year}</p>
                <h3 className="proof-title">{p.title}</h3>
                <p className="proof-blurb">{p.blurb}</p>
                <dl className="proof-meta">
                  <dt>Role</dt><dd>{p.role}</dd>
                  <dt>Stack</dt><dd>{p.stack.join(', ')}</dd>
                  <dt>Result</dt><dd>{p.outcome}</dd>
                </dl>
                <div className="proof-links">
                  {p.links.map((l) => (
                    <a key={l.label} href={l.href} className="proof-link">{l.label}</a>
                  ))}
                </div>
              </div>
            </article>
          ))}
          <article className="proof proof-end">
            <p className="proof-end-big">Next proof is on the press.</p>
            <p className="proof-end-small">Want to be in it? <a href="#write">Write to me.</a></p>
          </article>
        </motion.div>
      </div>
    </section>
  )
}
