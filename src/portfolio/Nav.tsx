import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState } from 'react'
import { me } from '../content/me'
import RheaFace from '../companion/RheaFace'

const links = [
  { href: '#table', label: 'Table' },
  { href: '#proofs', label: 'Proofs' },
  { href: '#notes', label: 'Notes' },
  { href: '#log', label: 'Log' },
  { href: '#now', label: 'Now' },
  { href: '#write', label: 'Write' },
]

export default function Nav() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(y > 40)
    setHidden(y > 600 && y > prev + 4)
    if (y < prev - 4) setHidden(false)
  })

  return (
    <motion.header
      className={`nav ${solid ? 'is-solid' : ''}`}
      animate={{ y: hidden ? -90 : 0 }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.1, 1] }}
    >
      <a href="#top" className="nav-mark" aria-label={`${me.name}, back to top`}>
        <span className="nav-dot" aria-hidden />
        {me.name}
      </a>
      <nav aria-label="Sections">
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <a href="#/rhea" className="nav-rhea">
        <span className="nav-rhea-face" aria-hidden>
          <RheaFace />
        </span>
        <span>Talk to Rhea</span>
      </a>
    </motion.header>
  )
}
