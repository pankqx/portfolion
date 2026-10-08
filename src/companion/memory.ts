/* Per-visitor memory. Lives in this browser only, for now.
   Later: swap `store` for a server so Rhea remembers people across devices —
   tell visitors what is kept and let them erase it (the "Forget me" button). */

export type Turn = { who: 'rhea' | 'you'; text: string; at: number; emotion?: string }

export type Profile = {
  id: string
  name?: string
  firstSeen: number
  lastSeen: number
  visits: number
  likes: string[]
  dislikes: string[]
  facts: string[]
  mood?: string
  affection: number // 0–100, grows as you talk
}

const KEY = 'rhea.v1'

type Saved = { profile: Profile; history: Turn[] }

function fresh(): Saved {
  const now = Date.now()
  return {
    profile: {
      id: crypto.randomUUID?.() ?? String(now),
      firstSeen: now,
      lastSeen: now,
      visits: 0,
      likes: [],
      dislikes: [],
      facts: [],
      affection: 10,
    },
    history: [],
  }
}

export function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    const s = JSON.parse(raw) as Saved
    return { profile: { ...fresh().profile, ...s.profile }, history: s.history ?? [] }
  } catch {
    return fresh()
  }
}

export function save(s: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ profile: s.profile, history: s.history.slice(-200) }))
  } catch {
    /* private mode — she just won't remember */
  }
}

export function forget() {
  try { localStorage.removeItem(KEY) } catch { /* nothing to forget */ }
}
