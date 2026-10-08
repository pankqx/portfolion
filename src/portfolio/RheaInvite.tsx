import { motion } from 'framer-motion'
import { useState } from 'react'
import Rhea from '../companion/Rhea'
import type { Emotion } from '../companion/emotions'

/* The door to the rooftop. She peeks up from the bottom of the page. */
export default function RheaInvite() {
  const [mood, setMood] = useState<Emotion>('calm')
  return (
    <section className="invite" aria-labelledby="invite-title" onMouseEnter={() => setMood('happy')} onMouseLeave={() => setMood('calm')}>
      <div className="invite-stars" aria-hidden />
      <div className="invite-copy">
        <h2 id="invite-title" className="invite-title">
          There’s someone<br />on the rooftop.
        </h2>
        <p className="invite-lede">
          Rhea lives up there. She talks, out loud if you let her, remembers what you tell her, and knows this notebook better than I do.
        </p>
        <a href="#/rhea" className="btn invite-btn" onFocus={() => setMood('wink')} onMouseEnter={() => setMood('wink')}>
          Go up and say hi
        </a>
      </div>
      <motion.div
        className="invite-her"
        initial={{ y: 120 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ type: 'spring', stiffness: 70, damping: 14 }}
      >
        <Rhea emotion={mood} viewBox="60 100 480 520" />
      </motion.div>
    </section>
  )
}
