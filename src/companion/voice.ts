import { useMotionValue, type MotionValue } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

/* Speaking: the browser's own voices. Her mouth follows word boundaries. */
const PREFERRED = [/natural/i, /aria/i, /jenny/i, /sonia/i, /samantha/i, /google uk english female/i, /zira/i, /female/i, /karen/i, /moira/i, /tessa/i]

function bestVoice(): SpeechSynthesisVoice | undefined {
  const vs = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'))
  for (const re of PREFERRED) {
    const v = vs.find((x) => re.test(x.name))
    if (v) return v
  }
  return vs[0]
}

export function useSpeaker(): { talk: MotionValue<number>; speak: (text: string) => Promise<void>; mime: (text: string) => Promise<void>; stop: () => void; speaking: boolean; supported: boolean } {
  const talk = useMotionValue(0)
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const raf = useRef(0)
  const pulse = useRef(0)

  useEffect(() => {
    if (!supported) return
    speechSynthesis.getVoices()
    const h = () => speechSynthesis.getVoices()
    speechSynthesis.addEventListener?.('voiceschanged', h)
    return () => speechSynthesis.removeEventListener?.('voiceschanged', h)
  }, [supported])

  const animate = useCallback(
    (on: boolean) => {
      cancelAnimationFrame(raf.current)
      if (!on) { talk.set(0); return }
      const t0 = performance.now()
      const loop = (now: number) => {
        const t = (now - t0) / 1000
        pulse.current *= 0.9
        // syllable-ish flutter + a kick on each word
        const v = 0.25 + 0.35 * Math.abs(Math.sin(t * 13)) * Math.abs(Math.sin(t * 3.1)) + pulse.current
        talk.set(Math.min(1, v))
        raf.current = requestAnimationFrame(loop)
      }
      raf.current = requestAnimationFrame(loop)
    },
    [talk],
  )

  const stop = useCallback(() => {
    if (supported) speechSynthesis.cancel()
    animate(false)
    setSpeaking(false)
  }, [animate, supported])

  // a silent "fake speak" for when voice is off: the mouth still moves while text types
  const mouthOnly = useCallback(
    (text: string) =>
      new Promise<void>((res) => {
        setSpeaking(true)
        animate(true)
        setTimeout(() => { animate(false); setSpeaking(false); res() }, Math.min(5200, 300 + text.length * 38))
      }),
    [animate],
  )

  const speak = useCallback(
    (text: string) => {
      const nav = navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }
      if (!supported || nav.userActivation?.hasBeenActive === false) return mouthOnly(text)
      return new Promise<void>((res) => {
        speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text.replace(/[~♡✦]/g, ''))
        const v = bestVoice()
        if (v) u.voice = v
        u.pitch = 1.18
        u.rate = 1.02
        u.onstart = () => { setSpeaking(true); animate(true) }
        u.onboundary = () => { pulse.current = 0.45 }
        const done = () => { animate(false); setSpeaking(false); res() }
        u.onend = done
        u.onerror = done
        speechSynthesis.speak(u)
        // some browsers never fire onstart for muted tabs
        setTimeout(() => { if (!speechSynthesis.speaking) done() }, 8000 + text.length * 80)
      })
    },
    [animate, mouthOnly, supported],
  )

  return { talk, speak: speak as (t: string) => Promise<void>, mime: mouthOnly, stop, speaking, supported }
}

/* Listening: Web Speech recognition (Chrome, Edge, Safari 17+). */
type Rec = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

export function useListener(onFinal: (text: string) => void) {
  const Ctor = (typeof window !== 'undefined' &&
    ((window as unknown as { SpeechRecognition?: new () => Rec }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition)) as (new () => Rec) | undefined
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<Rec | null>(null)
  const want = useRef(false)
  const cb = useRef(onFinal)
  cb.current = onFinal

  const start = useCallback(() => {
    if (!Ctor) { setError('Voice input needs Chrome, Edge or Safari. You can still type to her.'); return }
    setError(null)
    want.current = true
    if (rec.current) { try { rec.current.start() } catch { /* already running */ } return }
    const r = new Ctor()
    r.continuous = false
    r.interimResults = true
    r.lang = 'en-IN'
    r.onresult = (e) => {
      let txt = ''
      let final = false
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript
        if (e.results[i].isFinal) final = true
      }
      setInterim(txt)
      if (final && txt.trim()) { setInterim(''); cb.current(txt.trim()) }
    }
    r.onerror = (e) => {
      if (e.error === 'not-allowed') { setError('Microphone is blocked. Allow it in the address bar to talk out loud.'); want.current = false }
    }
    r.onend = () => { setListening(false) }
    rec.current = r
    try { r.start(); setListening(true) } catch { /* ignore */ }
  }, [Ctor])

  const resume = useCallback(() => {
    if (!want.current || !rec.current) return
    try { rec.current.start(); setListening(true) } catch { /* already running */ }
  }, [])

  const stop = useCallback(() => {
    want.current = false
    rec.current?.abort()
    setListening(false)
    setInterim('')
  }, [])

  return { start, stop, resume, listening, interim, error, supported: !!Ctor, wanted: want }
}

/* Mic level for the ASCII waveform while in a call. */
export function useMicLevel(active: boolean) {
  const [levels, setLevels] = useState<number[]>(() => Array(24).fill(0))
  useEffect(() => {
    if (!active || !navigator.mediaDevices) return
    let ctx: AudioContext | undefined, stream: MediaStream | undefined, raf = 0, dead = false
    navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
      if (dead) { s.getTracks().forEach((t) => t.stop()); return }
      stream = s
      ctx = new AudioContext()
      const an = ctx.createAnalyser()
      an.fftSize = 64
      ctx.createMediaStreamSource(s).connect(an)
      const buf = new Uint8Array(an.frequencyBinCount)
      const loop = () => {
        an.getByteFrequencyData(buf)
        setLevels(Array.from({ length: 24 }, (_, i) => buf[i + 2] / 255))
        raf = requestAnimationFrame(loop)
      }
      loop()
    }).catch(() => { /* permission denied: bars stay flat */ })
    return () => { dead = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); ctx?.close() }
  }, [active])
  return levels
}
