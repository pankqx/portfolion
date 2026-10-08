import { motion } from 'framer-motion'
import Lenis from 'lenis'
import { useEffect } from 'react'
import Nav from './Nav'
import Hero from './Hero'
import Manifesto from './Manifesto'
import Table from './Table'
import Proofs from './Proofs'
import Notes from './Notes'
import LifeLog from './LifeLog'
import Now from './Now'
import RheaInvite from './RheaInvite'
import Colophon from './Colophon'
import './portfolio.css'

export default function Portfolio() {
  useEffect(() => {
    // Rhea can send visitors to a section from the rooftop
    let goto: string | null = null
    try { goto = sessionStorage.getItem('pf.goto') } catch { /* ignore */ }
    let timer = 0
    const jump = (smooth: (el: HTMLElement) => void) => {
      const el = goto ? (document.querySelector(goto) as HTMLElement | null) : null
      if (el) timer = window.setTimeout(() => { try { sessionStorage.removeItem('pf.goto') } catch { /* ignore */ } smooth(el) }, 700)
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { jump((el) => el.scrollIntoView()); return }
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 })
    let raf = 0
    const tick = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')!.slice(1)
      if (!id || id.startsWith('/')) return
      const el = document.getElementById(id)
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -60 }) }
    }
    document.addEventListener('click', onAnchor)
    jump((el) => lenis.scrollTo(el, { offset: -60, duration: 1.6 }))
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); lenis.destroy(); document.removeEventListener('click', onAnchor) }
  }, [])

  return (
    <motion.div
      className="pf"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.5 }}
    >
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Table />
        <Proofs />
        <Notes />
        <LifeLog />
        <Now />
        <RheaInvite />
      </main>
      <Colophon />
    </motion.div>
  )
}
