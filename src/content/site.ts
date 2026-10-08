/**
 * ─────────────────────────────────────────────────────────────
 *  EVERYTHING YOU WANT TO EDIT LIVES IN THIS FILE.
 *  Swap the placeholder text, links and numbers below — the whole
 *  site (portfolio + companion) reads from here.
 * ─────────────────────────────────────────────────────────────
 */

export const me = {
  name: 'Pank',
  fullName: '[Your Full Name]',
  handle: 'pankqx',
  version: '0.24',
  tagline: 'A polymath in making.',
  intro:
    '[One or two sentences about who you are. Something like: I write code, words and the occasional bad chord progression — and I keep notes on all of it.]',
  location: '[City, Country]',
  status: '[Currently: MCA student · open to internships]',
  email: 'you@example.com',
  resumeUrl: '#',
  socials: [
    { label: 'GitHub', url: 'https://github.com/pankqx' },
    { label: 'LinkedIn', url: '#' },
    { label: 'Instagram', url: '#' },
    { label: 'X / Twitter', url: '#' },
  ],
}

/** The words the hero ASCII field morphs between. Keep them short (≤ 6 letters). */
export const heroWords = ['PANK', 'CODE', 'WRITE', 'BUILD', 'THINK', 'LEARN']

/** Disciplines — the "polymath index". level is 0–100. */
export const disciplines = [
  { name: 'Software engineering', level: 78, note: '[What you build, stacks you love]', glyph: '{ }' },
  { name: 'Data & machine learning', level: 55, note: '[Models, notebooks, curiosities]', glyph: 'Σ' },
  { name: 'Design', level: 62, note: '[Interfaces, type, taste]', glyph: '◐' },
  { name: 'Writing', level: 58, note: '[Essays, the blog, journaling]', glyph: '¶' },
  { name: 'Photography', level: 40, note: '[Trips, streets, light]', glyph: '◎' },
  { name: 'Music', level: 30, note: '[Instrument, genres]', glyph: '♪' },
  { name: 'Markets', level: 35, note: '[IPOs, investing notes]', glyph: '↗' },
  { name: 'Philosophy', level: 45, note: '[Books, questions you keep asking]', glyph: '∞' },
]

/** "Changelog" of you — a real sequence, newest first. */
export const changelog = [
  { version: '0.24', date: '2026', title: '[Latest milestone]', body: '[What changed in you this year.]' },
  { version: '0.23', date: '2025', title: '[Started MCA at AIMIT]', body: '[A line about it.]' },
  { version: '0.20', date: '2024', title: '[First shipped project]', body: '[A line about it.]' },
  { version: '0.12', date: '20XX', title: '[Wrote first line of code]', body: '[A line about it.]' },
  { version: '0.01', date: '20XX', title: '[Hello, world]', body: '[Where it all began.]' },
]

export type Project = {
  title: string
  year: string
  role: string
  summary: string
  stack: string[]
  link: string
  repo: string
  /** a tiny ASCII "screenshot" placeholder — replace with an image path later */
  ascii: string
}

export const projects: Project[] = [
  {
    title: 'Inklight',
    year: '2026',
    role: '[Solo · design + code]',
    summary: '[A desktop journaling app. Describe the problem, what you built, and one result.]',
    stack: ['[Electron]', '[React]', '[SQLite]'],
    link: '#',
    repo: '#',
    ascii: `┌────────────────────┐
│ ✎  today           │
│ ────────────────── │
│ the light came in  │
│ sideways and I     │
│ wrote it down_     │
└────────────────────┘`,
  },
  {
    title: 'AlgoPath',
    year: '2026',
    role: '[Solo]',
    summary: '[A DSA-in-Python learning app with streaks and a zero-to-FAANG roadmap.]',
    stack: ['[Python]', '[React]', '[Streaks]'],
    link: '#',
    repo: '#',
    ascii: `   ●───●───●
   │   │   │
   ●   ●───●
    \\     /
     ●───●
  day 42 · streak ▲`,
  },
  {
    title: 'PEECE',
    year: '2026',
    role: '[Game design + full stack]',
    summary: '[A multiplayer card-duel web game with realtime chat.]',
    stack: ['[TypeScript]', '[Realtime]', '[Canvas]'],
    link: '#',
    repo: 'https://github.com/pankqx/peece',
    ascii: `╭─────╮ ╭─────╮
│ ♠ 7 │ │ ♥ K │
│     │ │     │
│   7 │ │   K │
╰─────╯ ╰─────╯
  you  vs  house`,
  },
  {
    title: 'HumanTwin',
    year: '2026',
    role: '[Team http dino · GATEWAYS 2026]',
    summary: '[Hackathon entry. What it does, what you did on the team.]',
    stack: ['[AI]', '[Backend]', '[Hackathon]'],
    link: '#',
    repo: '#',
    ascii: `  ( o_o )  ⇄  ( o_o )
   /|_|\\       /|_|\\
    / \\         / \\
   human       twin`,
  },
]

export type Post = {
  title: string
  date: string
  minutes: number
  tags: string[]
  excerpt: string
  url: string
}

export const posts: Post[] = [
  {
    title: '[The first post — why I started writing in public]',
    date: '2026-09-19',
    minutes: 6,
    tags: ['journal'],
    excerpt: '[Two lines of excerpt that make someone want to click.]',
    url: '#',
  },
  { title: '[Trip notes: a place, in pictures]', date: '2026-09-02', minutes: 4, tags: ['travel', 'photos'], excerpt: '[Excerpt]', url: '#' },
  { title: '[Building a journaling app from scratch]', date: '2026-08-21', minutes: 9, tags: ['dev'], excerpt: '[Excerpt]', url: '#' },
  { title: '[What 100 days of DSA taught me]', date: '2026-08-02', minutes: 7, tags: ['dev', 'learning'], excerpt: '[Excerpt]', url: '#' },
  { title: '[On being a beginner at many things]', date: '2026-07-14', minutes: 5, tags: ['essay'], excerpt: '[Excerpt]', url: '#' },
]

export const now = {
  building: '[What you are building right now]',
  reading: '[Book title — Author]',
  learning: '[A skill you are picking up]',
  listening: '[An album on repeat]',
}

/** Companion settings */
export const companion = {
  name: 'Lumi',
  greeting: "Oh — you're here. I was just watching the city lights. What's on your mind?",
}
