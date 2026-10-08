# Pank, in print

A personal site printed like a risograph zine. Four inks (pink, blue, yellow, green) on lilac paper, ASCII sculptures, and a rooftop where **Rhea** lives.

```
  ┌─ notebook (/) ───────────────────────────────┐   ┌─ rooftop (#/rhea) ───────────────┐
  │ masthead + ASCII sculpture + PANK in halftone │   │ Rhea, hand-drawn SVG, 11 moods    │
  │ manifesto that stretches as you scroll        │──▶│ chat + voice call + memory card   │
  │ periodic table of skills                      │   │ glyph fireflies, night city, cat  │
  │ print-proof projects (sideways scroll)        │   └───────────────────────────────────┘
  │ field notes · life log · now card · colophon  │
  └───────────────────────────────────────────────┘
```

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Make it yours

Everything personal lives in **`src/content/me.ts`**: name, intro, manifesto, the 20 skill “elements”, projects, blog posts, life log, the now card, stats, uses, testimonials and socials. Every value there is a placeholder. Edit the file and the whole site updates.

- Project art: `src/portfolio/plates.ts` (ASCII plates, one per project `art` key).
- Colours and fonts: the `:root` block in `src/styles/global.css`.

## Rhea

| File | What it does |
| --- | --- |
| `src/companion/Rhea.tsx` | Her drawing and animation rig: blinking, gaze, breathing, hair sway, talking mouth, pat (top of head) and poke (cheek) |
| `src/companion/emotions.ts` | The 11 faces: calm, happy, giggle, shy, love, surprised, sad, pout, thinking, sleepy, wink |
| `src/companion/brain.ts` | Her personality. Runs locally today; knows your portfolio and can take visitors to sections |
| `src/companion/memory.ts` | What she remembers about each visitor (name, likes, dislikes, facts, visits, closeness). Stored in the visitor's browser |
| `src/companion/voice.ts` | Talking out loud (browser speech) and listening (Chrome/Edge/Safari speech recognition) |
| `src/companion/Sky.tsx`, `GlyphField.tsx` | The rooftop at night and the mood-reactive glyph fireflies |

### Give her a real AI brain

1. Deploy `api/rhea.example.ts` as a serverless function with `ANTHROPIC_API_KEY` set.
2. Build with `VITE_RHEA_ENDPOINT=https://your-host/api/rhea` (or set it as a repository variable for the Pages workflow).

If the endpoint fails, she quietly falls back to her local personality.

### Remembering visitors across devices (planned)

`memory.ts` is the swap point: replace `load`/`save`/`forget` with calls to a database. Before storing visitor data on a server, show visitors what's kept and keep **Forget me** working end to end.

## Deploy

`.github/workflows/pages.yml` builds and publishes to GitHub Pages on every push to `main`. One-time setup: **Settings → Pages → Source: GitHub Actions**.
