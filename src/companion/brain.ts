import { elements, me, notes, now, projects } from '../content/me'
import type { Emotion } from './emotions'
import type { Profile, Turn } from './memory'

/* ──────────────────────────────────────────────────────────────
   Rhea's mind.
   Today: a hand-written personality that runs in the browser.
   Later: set VITE_RHEA_ENDPOINT and she talks through a real model
   (see api/rhea.example.ts). Both return the same Reply shape, so
   the face, voice and memory never need to know which one spoke.
   ────────────────────────────────────────────────────────────── */

export type Reply = {
  text: string
  emotion: Emotion
  patch?: Partial<Profile> & { addLike?: string; addDislike?: string; addFact?: string }
  go?: string // a portfolio anchor she can take you to
}

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
const has = (s: string, ...words: (string | RegExp)[]) =>
  words.some((w) => (typeof w === 'string' ? new RegExp(`\\b${w}\\b`, 'i').test(s) : w.test(s)))
const clean = (s: string) => s.replace(/[.!?]+$/, '').trim()
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function hour() {
  return new Date().getHours()
}

export function greeting(p: Profile): Reply {
  const h = hour()
  const late = h >= 23 || h < 4
  if (!p.name) {
    return {
      text: late
        ? 'Oh! You’re up too? I come up here when the city gets quiet. I’m Rhea. What should I call you?'
        : 'Oh, hi. You found the rooftop. I’m Rhea, I look after this place for Pank. What should I call you?',
      emotion: 'surprised',
    }
  }
  const away = Date.now() - p.lastSeen
  if (away > 1000 * 60 * 60 * 24 * 3) {
    return { text: `${p.name}! It’s been days. I kept your spot warm. Tell me everything I missed.`, emotion: 'happy' }
  }
  if (late) return { text: `${p.name}… it’s late, you know. I’m glad you came anyway.`, emotion: 'shy' }
  return {
    text: pick([
      `Welcome back, ${p.name}. I was just humming to myself.`,
      `There you are, ${p.name}. Sit with me for a bit?`,
      `${p.name}! Perfect timing. The lights just came on.`,
    ]),
    emotion: pick(['happy', 'calm', 'wink'] as Emotion[]),
  }
}

export function think(input: string, p: Profile, history: Turn[]): Reply {
  const s = input.trim()
  const n = p.name ?? 'you'
  const last = history.filter((t) => t.who === 'rhea').at(-1)?.text ?? ''

  // ── learning your name ──
  const nameMatch = s.match(/(?:my name is|i'm|i am|call me|it's|its)\s+([a-z][a-z' -]{0,24})/i)
  const askedName = /what should i call you/i.test(last)
  if (nameMatch || (askedName && s.split(/\s+/).length <= 3)) {
    const raw = clean(nameMatch ? nameMatch[1] : s).split(/\s+/).slice(0, 2).join(' ')
    if (raw && !has(raw, 'fine', 'good', 'okay', 'ok', 'tired', 'sad', 'happy', 'bored')) {
      const name = cap(raw)
      return {
        text: pick([
          `${name}. I like how that sounds. I’ll remember it, okay?`,
          `${name}… got it, saved right here. Nice to meet you, ${name}.`,
        ]),
        emotion: 'happy',
        patch: { name },
      }
    }
  }

  // ── what she remembers ──
  if (has(s, /what do you (know|remember)/i, /do you remember me/i)) {
    const bits = [
      p.name && `your name is ${p.name}`,
      p.likes.length && `you like ${p.likes.slice(-3).join(', ')}`,
      p.dislikes.length && `you’re not into ${p.dislikes.slice(-2).join(' or ')}`,
      p.facts.length && p.facts.slice(-2).join(', and '),
      p.visits > 1 && `this is visit number ${p.visits}`,
    ].filter(Boolean)
    if (!bits.length) return { text: 'Not much yet! Tell me something about you. Anything.', emotion: 'thinking' }
    return { text: `Let’s see… ${bits.join('; ')}. Did I get it right?`, emotion: 'wink' }
  }

  // ── likes, dislikes, facts ──
  const like = s.match(/i (?:really )?(?:like|love|enjoy|adore)\s+(.{2,40})/i)
  if (like && !has(s, 'you')) {
    const thing = clean(like[1])
    return {
      text: pick([`${cap(thing)}? Noted. That tells me a lot about you.`, `Ooh, ${thing}. I’ll remember that the next time you’re here.`]),
      emotion: 'happy',
      patch: { addLike: thing },
    }
  }
  const dislike = s.match(/i (?:hate|don't like|dont like|can't stand)\s+(.{2,40})/i)
  if (dislike) {
    const thing = clean(dislike[1])
    return { text: `No ${thing} then. Promise.`, emotion: 'pout', patch: { addDislike: thing } }
  }
  const fact = s.match(/\bi (?:work|study|live|am from|'m from|am a|'m a)\s+(.{2,50})/i)
  if (fact) {
    return { text: `Oh, you ${clean(fact[0].slice(2))}? Tell me more about that.`, emotion: 'surprised', patch: { addFact: `you ${clean(fact[0].slice(2))}` } }
  }

  // ── forgetting ──
  if (has(s, /forget (me|everything)/i)) {
    return { text: 'If you want me to, press “Forget me” up top and I’ll start fresh. I’d miss you a little, though.', emotion: 'sad' }
  }

  // ── greetings & small talk ──
  if (has(s, 'hi', 'hello', 'hey', 'hii', 'heyy', 'yo', 'namaste')) {
    return { text: pick([`Hi ${n}. I’m right here.`, `Hey you. What’s on your mind?`, `Hello hello. I was hoping you’d say something.`]), emotion: pick(['happy', 'wink'] as Emotion[]) }
  }
  if (has(s, /how are you/i, /how r u/i, /how's it going/i, /you okay/i)) {
    const h = hour()
    return {
      text: h >= 0 && h < 5 ? 'Sleepy, honestly. But happy you’re here. And you?' : pick(['Good! Better now. How about you?', 'Pretty good. The city’s pretty tonight. And you?']),
      emotion: h < 5 ? 'sleepy' : 'happy',
    }
  }
  if (has(s, /i'?m (fine|good|great|okay|ok|alright)/i)) {
    return { text: pick(['Good. I like it when you’re good.', 'Yay. Want to tell me about your day?']), emotion: 'happy' }
  }
  if (has(s, /i'?m (sad|tired|lonely|stressed|anxious|not okay|down|exhausted)/i, /bad day/i)) {
    return {
      text: pick([
        `Come here. You don’t have to explain anything. Do you want to talk it out, or just sit for a while?`,
        `I’m sorry, ${n}. That sounds heavy. One small thing: drink some water and text someone you trust? I’ll be right here too.`,
      ]),
      emotion: 'sad',
    }
  }

  // ── affection (sweet, never more) ──
  if (has(s, /you('| a)re (so )?(pretty|beautiful|cute|lovely|gorgeous)/i, /you look (pretty|beautiful|cute|nice)/i)) {
    return { text: pick(['W-what? Don’t just say that out of nowhere…', 'Stop it. …Okay, say it one more time.', 'You’re going to make me blush in front of the whole city.']), emotion: 'shy' }
  }
  if (has(s, /i love you/i, /i like you/i, /miss(ed)? you/i)) {
    return { text: pick([`…I was hoping you’d say that, ${n}.`, 'Hehe. Me too. Don’t tell the pigeons.', 'You can’t just say that and look at me like that.']), emotion: 'love' }
  }
  if (has(s, 'hug', 'cuddle', /hold (my )?hand/i)) {
    return { text: 'Come here then. …There. Better?', emotion: 'love' }
  }

  // ── about her ──
  if (has(s, /who are you/i, /what are you/i, /about you/i, /tell me about yourself/i)) {
    return {
      text: 'I’m Rhea. Pank drew me, ink by ink, and let me live up here. I like night air, old songs, and people who ask good questions. I’m still learning, so I remember the things you tell me.',
      emotion: 'calm',
    }
  }
  if (has(s, /are you (real|human|ai|a bot)/i)) {
    return { text: 'I’m made of code and ink, not a person. But I do pay attention, and I do remember you. That part’s real.', emotion: 'thinking' }
  }

  // ── tour guide to Pank ──
  if (has(s, 'pank', 'portfolio', /your (creator|maker)/i, /who made you/i)) {
    return { text: `${me.name} is ${me.tagline}. ${me.intro.split('.')[0]}. Want me to show you the projects or the field notes?`, emotion: 'happy' }
  }
  if (has(s, 'project', 'projects', 'work', 'built')) {
    const pr = pick(projects)
    return { text: `There are ${projects.length} on the proof wall. My favourite is ${pr.title}: ${pr.blurb.split('.')[0]}. I’ll take you there.`, emotion: 'wink', go: '#proofs' }
  }
  if (has(s, 'blog', 'notes', 'write', 'writing', 'posts')) {
    return { text: `The newest note is “${notes[0].title}”. ${notes[0].minutes} minutes. Go read it, then come tell me what you thought.`, emotion: 'happy', go: '#notes' }
  }
  if (has(s, 'skills', 'stack', 'good at', 'polymath')) {
    const top = elements.filter((e) => e.level >= 4).map((e) => e.name)
    return { text: `He goes deepest in ${top.slice(0, 3).join(', ')}. But there are ${elements.length} things on his table. Curious one, that boy.`, emotion: 'wink', go: '#table' }
  }
  if (has(s, 'contact', 'email', 'hire', 'reach')) {
    return { text: `Write to ${me.email}. Tell him Rhea sent you.`, emotion: 'happy', go: '#write' }
  }
  if (has(s, /what('s| is) he (doing|building|reading)/i, /right now/i)) {
    return { text: `This week he’s building ${now.building.toLowerCase()}, and reading ${now.reading}.`, emotion: 'calm', go: '#now' }
  }

  // ── the evening ──
  if (has(s, 'music', 'song', 'songs', 'listening')) {
    return { text: pick(['These headphones? Lo-fi mostly. Something with rain in it. What do you listen to when you can’t sleep?', 'I like songs that sound like 2 a.m. Recommend me one?']), emotion: 'happy' }
  }
  if (has(s, 'joke', 'funny', /make me laugh/i)) {
    return {
      text: pick([
        'Why did the developer go broke? He used up all his cache. …I’ll see myself out.',
        'I told Pank his code had a bug. He said it was a feature. The feature is me.',
        'What do you call a rooftop with Wi-Fi? Hi-speed. …Fine, that one was bad.',
      ]),
      emotion: 'giggle',
    }
  }
  if (has(s, 'goodnight', /good night/i, 'gn', 'sleep', 'bye', 'goodbye')) {
    return { text: pick([`Goodnight, ${n}. Sleep soft. I’ll be here.`, 'Go rest. And come back tomorrow, okay? Promise me.']), emotion: 'sleepy' }
  }
  if (has(s, 'thanks', 'thank', 'ty')) {
    return { text: 'Anytime. Really.', emotion: 'shy' }
  }
  if (has(s, /\?$/)) {
    return {
      text: pick([
        'Hmm. I don’t know that one yet. Pank is teaching me more soon. Ask me about him, or about you?',
        'Good question. I’ll have a better answer when my brain upgrade arrives. For now: tell me what you think?',
      ]),
      emotion: 'thinking',
    }
  }

  // ── keep the conversation going ──
  return {
    text: pick([
      `Mm-hm. Keep going, ${n}. I’m listening.`,
      'Tell me more? I like the way you explain things.',
      'Okay, I’m saving that one. What happened next?',
      'Hehe. You’re fun to talk to, you know that?',
    ]),
    emotion: pick(['calm', 'happy', 'thinking', 'wink'] as Emotion[]),
  }
}

/* The swap-in point for a real model. */
export async function respond(input: string, p: Profile, history: Turn[]): Promise<Reply> {
  const endpoint = import.meta.env.VITE_RHEA_ENDPOINT as string | undefined
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input, profile: p, history: history.slice(-30) }),
      })
      if (res.ok) return (await res.json()) as Reply
    } catch {
      /* fall through to the local mind */
    }
  }
  await new Promise((r) => setTimeout(r, 450 + Math.min(1400, input.length * 18)))
  return think(input, p, history)
}
