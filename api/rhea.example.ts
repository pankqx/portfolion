/* ──────────────────────────────────────────────────────────────
   Rhea's real brain — an example serverless function.
   Deploy this on Vercel / Netlify / Cloudflare (rename to rhea.ts),
   set ANTHROPIC_API_KEY on the host, then build the site with
   VITE_RHEA_ENDPOINT=https://your-host/api/rhea

   It receives { input, profile, history } and must return
   { text, emotion, patch?, go? } — the same shape as src/companion/brain.ts.

   Before you store anyone's data on a server: tell visitors what
   Rhea keeps, keep the "Forget me" button working end to end, and
   don't keep more than the conversation needs.
   ────────────────────────────────────────────────────────────── */

const EMOTIONS = ['calm', 'happy', 'giggle', 'shy', 'love', 'surprised', 'sad', 'pout', 'thinking', 'sleepy', 'wink']

type Body = {
  input: string
  profile: { name?: string; likes: string[]; dislikes: string[]; facts: string[]; visits: number }
  history: { who: 'rhea' | 'you'; text: string }[]
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors() })
  const { input, profile, history } = (await req.json()) as Body

  const system = `You are Rhea, a warm, playful, slightly shy companion who lives on the rooftop of Pank's portfolio site.
Speak casually and briefly (1–3 sentences), like a voice call. Keep things sweet and PG.
You know Pank's portfolio and can guide visitors to it (sections: #table, #proofs, #notes, #log, #now, #write).
What you remember about this visitor: name=${profile.name ?? 'unknown'}; likes=${profile.likes.join(', ') || 'none'}; dislikes=${profile.dislikes.join(', ') || 'none'}; facts=${profile.facts.join('; ') || 'none'}; visits=${profile.visits}.
Reply ONLY with JSON: {"text": string, "emotion": one of ${EMOTIONS.join('|')}, "patch"?: {"name"?: string, "addLike"?: string, "addDislike"?: string, "addFact"?: string}, "go"?: string}`

  const messages = [
    ...history.slice(-20).map((t) => ({ role: t.who === 'you' ? 'user' : 'assistant', content: t.text })),
    { role: 'user', content: input },
  ]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 300, system, messages }),
  })
  const data = (await res.json()) as { content?: { text: string }[] }
  let out = { text: 'Sorry, I lost my train of thought. Say that again?', emotion: 'thinking' }
  try {
    out = JSON.parse(data.content?.[0]?.text ?? '')
  } catch {
    if (data.content?.[0]?.text) out = { text: data.content[0].text, emotion: 'calm' }
  }
  return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json', ...cors() } })
}

function cors() {
  return { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST, OPTIONS' }
}
