import { motion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { log } from '../content/me'
import Riso from '../ui/Riso'

const tagInk: Record<string, string> = { now: 'var(--pink)', build: 'var(--blue)', study: 'var(--yellow)', work: 'var(--teal)', life: 'var(--pink)' }

export default function LifeLog() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const draw = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section className="sec lifelog" id="log" aria-labelledby="log-title">
      <div className="sec-head">
        <h2 className="sec-title" id="log-title">
          <Riso top="pink" bottom="ink">Life, logged</Riso>
        </h2>
        <p className="sec-lede">Everything about me, newest first. The thread fills in as you read down.</p>
      </div>

      <ol className="ll" ref={ref}>
        <svg className="ll-thread" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden>
          <line x1="5" y1="0" x2="5" y2="100" stroke="rgba(36,32,74,.18)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="2 6" />
          <motion.line x1="5" y1="0" x2="5" y2="100" stroke="var(--pink)" strokeWidth="3" vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
        </svg>
        {log.map((e, i) => (
          <motion.li
            key={i}
            className="ll-item"
            initial={{ opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: '-35% 0px -35% 0px' }}
            transition={{ duration: 0.4 }}
          >
            <span className="ll-year">{e.year}</span>
            <span className="ll-dot" style={{ background: tagInk[e.tag] ?? 'var(--ink)' }} aria-hidden />
            <div className="ll-body">
              <h3>{e.title}</h3>
              <p>{e.body}</p>
              <span className="ll-tag mono" style={{ ['--acc' as string]: tagInk[e.tag] ?? 'var(--ink)' }}>{e.tag}</span>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  )
}
