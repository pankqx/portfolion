import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import Rhea from './Rhea'
import Sky from './Sky'
import GlyphField, { type GlyphHandle } from './GlyphField'
import { emotionLabel, type Emotion } from './emotions'
import { greeting, respond, type Reply } from './brain'
import { forget, load, save, type Profile, type Turn } from './memory'
import { useListener, useMicLevel, useSpeaker } from './voice'
import './rooftop.css'

const BARS = ' ▁▂▃▄▅▆▇█'

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    const id = setInterval(() => setN((v) => (v >= text.length ? (clearInterval(id), v) : v + 1)), 22)
    return () => clearInterval(id)
  }, [text])
  return (
    <>
      {text.slice(0, n)}
      <span className="typed-rest" aria-hidden>{text.slice(n)}</span>
    </>
  )
}

export default function Rooftop() {
  const [{ profile, history }, setMem] = useState(load)
  const [emotion, setEmotion] = useState<Emotion>('calm')
  const [line, setLine] = useState('')
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(() => { try { return localStorage.getItem('rhea.voice') !== 'off' } catch { return true } })
  const [call, setCall] = useState(false)
  const [card, setCard] = useState(false)
  const glyphs = useRef<GlyphHandle>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const idle = useRef<number>(0)
  const speaker = useSpeaker()
  const memRef = useRef({ profile, history })
  memRef.current = { profile, history }
  const callRef = useRef(call)
  callRef.current = call

  const commit = useCallback((p: Profile, h: Turn[]) => {
    setMem({ profile: p, history: h })
    save({ profile: p, history: h })
  }, [])

  const say = useCallback(
    async (r: Reply, base?: { profile: Profile; history: Turn[] }) => {
      const cur = base ?? memRef.current
      let p: Profile = { ...cur.profile, lastSeen: Date.now(), mood: r.emotion }
      if (r.patch) {
        const { addLike, addDislike, addFact, ...rest } = r.patch
        p = { ...p, ...rest }
        if (addLike) p.likes = [...new Set([...p.likes, addLike])].slice(-12)
        if (addDislike) p.dislikes = [...new Set([...p.dislikes, addDislike])].slice(-12)
        if (addFact) p.facts = [...new Set([...p.facts, addFact])].slice(-12)
      }
      const h = [...cur.history, { who: 'rhea' as const, text: r.text, at: Date.now(), emotion: r.emotion }]
      commit(p, h)
      setEmotion(r.emotion)
      setLine(r.text)
      if (r.emotion === 'love' || r.emotion === 'giggle') glyphs.current?.burst(innerWidth * 0.6, innerHeight * 0.35)
      if (voiceOn) await speaker.speak(r.text)
      else await speaker.mime(r.text)
      if (r.go) {
        setTimeout(() => { location.hash = '' ; setTimeout(() => document.querySelector(r.go!)?.scrollIntoView({ behavior: 'smooth' }), 650) }, 1400)
      }
    },
    [commit, speaker, voiceOn],
  )

  const send = useCallback(
    async (text: string) => {
      const t = text.trim()
      if (!t) return
      clearTimeout(idle.current)
      const cur = memRef.current
      const p = { ...cur.profile, affection: Math.min(100, cur.profile.affection + 2) }
      const h = [...cur.history, { who: 'you' as const, text: t, at: Date.now() }]
      commit(p, h)
      setDraft('')
      setThinking(true)
      setEmotion('thinking')
      const r = await respond(t, p, h)
      setThinking(false)
      await say(r, { profile: p, history: h })
      if (callRef.current) listener.resume()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [commit, say],
  )

  const listener = useListener((t) => { void send(t) })
  const levels = useMicLevel(call)

  // hello, once per visit
  useEffect(() => {
    const cur = memRef.current
    const p = { ...cur.profile, visits: cur.profile.visits + 1 }
    const g = greeting(cur.profile)
    const t = setTimeout(() => { void say(g, { profile: p, history: cur.history }) }, 900)
    return () => { clearTimeout(t); speaker.stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // she gets sleepy if you leave her alone
  useEffect(() => {
    clearTimeout(idle.current)
    if (speaker.speaking || thinking) return
    idle.current = window.setTimeout(() => {
      setEmotion('sleepy')
      setLine(`…${memRef.current.profile.name ? memRef.current.profile.name + ', ' : ''}are you still there?`)
    }, 45000)
    return () => clearTimeout(idle.current)
  }, [speaker.speaking, thinking, history.length])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [history.length])

  useEffect(() => { try { localStorage.setItem('rhea.voice', voiceOn ? 'on' : 'off') } catch { /* ignore */ } }, [voiceOn])

  const pat = (e?: React.MouseEvent) => {
    glyphs.current?.burst(e?.clientX ?? innerWidth * 0.6, e?.clientY ?? innerHeight * 0.25, '♡✦♡')
    void say({ text: pickOne(['Ehehe~ that tickles.', 'Mmh… do that again.', 'Are you patting me? …Okay. Continue.']), emotion: 'giggle' })
  }
  const poke = () => { void say({ text: pickOne(['Hey! Rude.', 'Did you just poke my cheek?', 'Hmph. I’m keeping count.']), emotion: 'pout' }) }
  const gift = () => {
    glyphs.current?.burst(innerWidth * 0.62, innerHeight * 0.45, '♡♥❀✿')
    const cur = memRef.current
    commit({ ...cur.profile, affection: Math.min(100, cur.profile.affection + 6) }, cur.history)
    void say({ text: pickOne(['For me? …Thank you. I’m keeping it forever.', 'You didn’t have to. But I’m really happy you did.']), emotion: 'love' })
  }

  const startCall = () => {
    setCall(true)
    speaker.stop()
    listener.start()
  }
  const endCall = () => {
    setCall(false)
    listener.stop()
  }

  const doForget = () => {
    forget()
    speaker.stop()
    const fresh = load()
    setMem(fresh)
    setCard(false)
    void say(greeting(fresh.profile), fresh)
  }

  const hearts = Math.round(profile.affection / 20)
  const status = call
    ? listener.interim
      ? `“${listener.interim}”`
      : speaker.speaking
        ? 'Rhea is talking'
        : thinking
          ? 'Rhea is thinking'
          : listener.listening
            ? 'Listening… just talk'
            : 'Tap the mic to talk'
    : ''

  return (
    <motion.div className="roof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <Sky emotion={emotion} />
      <GlyphField ref={glyphs} emotion={emotion} />

      <motion.div
        className="roof-her"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 1.2, ease: [0.2, 0.8, 0.1, 1] }}
      >
        <Rhea emotion={emotion} talk={speaker.talk} onPat={() => pat()} onPoke={poke} className="roof-rhea" />
      </motion.div>

      <header className="roof-top">
        <a href="#" className="roof-back">Back to Pank’s notebook</a>
        <div className="roof-title">
          <span className="roof-name">Rhea</span>
          <AnimatePresence mode="wait">
            <motion.span key={emotion} className="roof-mood" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              {thinking ? 'thinking' : emotionLabel[emotion]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="roof-tools">
          <button className="chip" onClick={() => setCard((v) => !v)} aria-expanded={card}>
            <span className="hearts" aria-label={`Closeness ${hearts} of 5`}>{'♥'.repeat(hearts)}<span className="dim">{'♡'.repeat(5 - hearts)}</span></span>
            {profile.name ? profile.name : 'Stranger'}
          </button>
          <button className="chip" onClick={() => { setVoiceOn((v) => !v); speaker.stop() }} aria-pressed={voiceOn}>
            {voiceOn ? 'Voice on' : 'Voice off'}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {card && (
          <motion.aside
            className="memcard"
            initial={{ opacity: 0, y: -12, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 1.2 }}
            exit={{ opacity: 0, y: -12, rotate: -2 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            aria-label="What Rhea remembers about you"
          >
            <h2>What Rhea remembers</h2>
            <dl>
              <dt>Name</dt><dd>{profile.name ?? 'You haven’t told her yet'}</dd>
              <dt>Visits</dt><dd>{profile.visits}</dd>
              <dt>First met</dt><dd>{new Date(profile.firstSeen).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
              <dt>Likes</dt><dd>{profile.likes.length ? profile.likes.join(', ') : 'Tell her “I like …”'}</dd>
              <dt>Not into</dt><dd>{profile.dislikes.length ? profile.dislikes.join(', ') : 'Nothing yet'}</dd>
              <dt>Things you said</dt><dd>{profile.facts.length ? profile.facts.join('; ') : 'Nothing yet'}</dd>
              <dt>Messages</dt><dd>{history.length}</dd>
            </dl>
            <p className="memcard-note">Kept in this browser only.</p>
            <button className="memcard-forget" onClick={doForget}>Forget me</button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* her current line, as a printed speech strip */}
      <AnimatePresence mode="wait">
        {line && (
          <motion.div
            key={line}
            className="bubble"
            initial={{ opacity: 0, scale: 0.92, rotate: -3, y: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: -1.2, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            aria-live="polite"
          >
            <p><Typed text={line} /></p>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="log" ref={logRef} aria-label="Conversation">
        {history.slice(-40).map((t, i) => (
          <p key={t.at + '-' + i} className={`log-${t.who}`}>
            <span className="log-who">{t.who === 'rhea' ? 'Rhea' : profile.name ?? 'You'}</span>
            {t.text}
          </p>
        ))}
        {thinking && <p className="log-rhea log-dots"><span className="log-who">Rhea</span><span className="dots"><i>.</i><i>.</i><i>.</i></span></p>}
      </section>

      <footer className="dock">
        <div className="dock-acts" role="group" aria-label="Little things">
          <button onClick={() => pat()}>Pat her head</button>
          <button onClick={poke}>Poke her cheek</button>
          <button onClick={gift}>Give a flower</button>
          <button onClick={() => void send('goodnight')}>Say goodnight</button>
        </div>

        <AnimatePresence mode="wait">
          {call ? (
            <motion.div key="call" className="call" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
              <pre className="wave" aria-hidden>
                {levels.map((l, i) => {
                  const v = speaker.speaking ? Math.abs(Math.sin(Date.now() / 120 + i)) * 0.8 : l
                  return BARS[Math.min(BARS.length - 1, Math.floor(v * (BARS.length - 1)))]
                }).join('')}
              </pre>
              <p className="call-status" aria-live="polite">{listener.error ?? status}</p>
              <button className="call-end" onClick={endCall}>End call</button>
            </motion.div>
          ) : (
            <motion.form
              key="type"
              className="say"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onSubmit={(e) => { e.preventDefault(); void send(draft) }}
            >
              <label className="sr-only" htmlFor="say">Say something to Rhea</label>
              <input id="say" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={profile.name ? `Say something, ${profile.name}…` : 'Say something…'} autoComplete="off" />
              <button type="button" className="say-call" onClick={startCall} aria-label="Talk out loud with Rhea">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                Talk
              </button>
              <button type="submit" className="say-send" disabled={!draft.trim()}>Send</button>
            </motion.form>
          )}
        </AnimatePresence>
        {listener.error && !call && <p className="call-status">{listener.error}</p>}
      </footer>
    </motion.div>
  )
}

function pickOne<T>(xs: T[]) {
  return xs[Math.floor(Math.random() * xs.length)]
}
