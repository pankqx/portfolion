/* ─────────────────────────────────────────────────────────────
   EVERYTHING ABOUT YOU LIVES HERE.
   Every string below is a placeholder — edit freely.
   The site re-reads this file; no component holds its own copy.
   ───────────────────────────────────────────────────────────── */

export const me = {
  name: 'Pank',
  fullName: 'Your Full Name',
  tagline: 'a polymath in making',
  location: 'Mangaluru, India',
  coords: '12.91° N, 74.85° E',
  email: 'hello@yourname.dev',
  status: 'Open to internships & strange collaborations',
  intro:
    'I build software, write things down, take photographs, and keep a list of forty other things I want to get good at. This site is the working notebook: unfinished on purpose.',
  manifesto: [
    'I would rather be a beginner at nine things',
    'than an expert at one thing I stopped loving.',
    'Curiosity is the job.',
    'Craft is how I pay rent to it.',
  ],
  socials: [
    { label: 'GitHub', handle: '@yourhandle', href: 'https://github.com/' },
    { label: 'LinkedIn', handle: 'in/yourname', href: 'https://linkedin.com/' },
    { label: 'Instagram', handle: '@yourhandle', href: 'https://instagram.com/' },
    { label: 'X', handle: '@yourhandle', href: 'https://x.com/' },
    { label: 'Read.cv', handle: 'yourname', href: 'https://read.cv/' },
  ],
}

/* The periodic table of you. `group` decides the ink colour.
   level: 1–5, how deep you are. since: the year you started. */
export type Group = 'build' | 'make' | 'think' | 'move'
export const elements: {
  sym: string
  name: string
  group: Group
  level: number
  since: string
  note: string
}[] = [
  { sym: 'Py', name: 'Python', group: 'build', level: 5, since: '2021', note: 'First language I dreamed in. DSA, scripts, small tools.' },
  { sym: 'Ts', name: 'TypeScript', group: 'build', level: 4, since: '2023', note: 'Where most of my web work lives now.' },
  { sym: 'Rx', name: 'React', group: 'build', level: 4, since: '2023', note: 'Interfaces that feel like objects, not pages.' },
  { sym: 'Ds', name: 'Data Structures', group: 'build', level: 4, since: '2022', note: 'Practising daily. Trees are my favourite.' },
  { sym: 'Db', name: 'Databases', group: 'build', level: 3, since: '2023', note: 'Postgres, SQLite, and a lot of migrations.' },
  { sym: 'Ai', name: 'Applied AI', group: 'build', level: 3, since: '2024', note: 'Agents, retrieval, and companions that remember.' },
  { sym: 'Ux', name: 'Interface Design', group: 'make', level: 4, since: '2022', note: 'Type first, colour second, chrome last.' },
  { sym: 'Ph', name: 'Photography', group: 'make', level: 3, since: '2020', note: 'Street, trips, and the light at 5:40 pm.' },
  { sym: 'Wr', name: 'Writing', group: 'make', level: 3, since: '2019', note: 'Journals, essays, and this site’s field notes.' },
  { sym: 'Il', name: 'Illustration', group: 'make', level: 2, since: '2025', note: 'Learning to draw what I code.' },
  { sym: 'Mu', name: 'Music', group: 'make', level: 2, since: '2024', note: 'Placeholder — instrument / genre here.' },
  { sym: 'Ec', name: 'Economics', group: 'think', level: 2, since: '2024', note: 'Markets, IPOs, and why people buy things.' },
  { sym: 'Ph', name: 'Philosophy', group: 'think', level: 2, since: '2023', note: 'Mostly questions. Some good ones.' },
  { sym: 'Ps', name: 'Psychology', group: 'think', level: 2, since: '2024', note: 'Habits, attention, and how we change.' },
  { sym: 'Ma', name: 'Mathematics', group: 'think', level: 3, since: '2018', note: 'Discrete math and probability, on purpose.' },
  { sym: 'Lg', name: 'Languages', group: 'think', level: 2, since: '2022', note: 'English, Kannada, Hindi, + one more soon.' },
  { sym: 'Tr', name: 'Travel', group: 'move', level: 3, since: '2021', note: 'Trips that turn into photo stories.' },
  { sym: 'Ft', name: 'Fitness', group: 'move', level: 2, since: '2025', note: 'Placeholder — your sport / routine here.' },
  { sym: 'Ck', name: 'Cooking', group: 'move', level: 2, since: '2022', note: 'Three dishes, cooked very well.' },
  { sym: 'Sp', name: 'Public Speaking', group: 'move', level: 2, since: '2025', note: 'Hackathon pitches count, right?' },
]

export const groups: Record<Group, { label: string; blurb: string }> = {
  build: { label: 'Things I build with', blurb: 'code, systems, machines' },
  make: { label: 'Things I make', blurb: 'images, words, sound' },
  think: { label: 'Things I think about', blurb: 'ideas that change the work' },
  move: { label: 'Things I do away from the desk', blurb: 'body, road, kitchen' },
}

/* Projects — shown as print proofs. `art` picks an ASCII plate. */
export const projects: {
  title: string
  year: string
  kind: string
  blurb: string
  stack: string[]
  role: string
  outcome: string
  art: 'journal' | 'cards' | 'graph' | 'twin' | 'calendar' | 'quiz'
  links: { label: string; href: string }[]
}[] = [
  {
    title: 'Project One',
    year: '2026',
    kind: 'Desktop app',
    blurb: 'A calm desktop journal that writes back. Replace this with one sentence on what it does and who it is for.',
    stack: ['Electron', 'React', 'SQLite'],
    role: 'Solo — design & build',
    outcome: 'Placeholder metric: 120 daily entries',
    art: 'journal',
    links: [{ label: 'Source', href: '#' }, { label: 'Case study', href: '#' }],
  },
  {
    title: 'Project Two',
    year: '2026',
    kind: 'Web game',
    blurb: 'A realtime card duel with chat. Replace with your own one-liner.',
    stack: ['TypeScript', 'React', 'WebSockets'],
    role: 'Lead developer',
    outcome: 'Placeholder: 40 players in week one',
    art: 'cards',
    links: [{ label: 'Play', href: '#' }, { label: 'Source', href: '#' }],
  },
  {
    title: 'Project Three',
    year: '2026',
    kind: 'Learning platform',
    blurb: 'A roadmap from zero to interview-ready, with streaks. Replace me.',
    stack: ['Python', 'FastAPI', 'React'],
    role: 'Solo',
    outcome: 'Placeholder: 300 problems mapped',
    art: 'graph',
    links: [{ label: 'Live', href: '#' }],
  },
  {
    title: 'Project Four',
    year: '2026',
    kind: 'Hackathon — AI',
    blurb: 'A digital twin that learns how you work. Replace with your story.',
    stack: ['LLMs', 'Node', 'Vector DB'],
    role: 'Team of 4 — frontend & pitch',
    outcome: 'Placeholder: finalist',
    art: 'twin',
    links: [{ label: 'Deck', href: '#' }, { label: 'Source', href: '#' }],
  },
  {
    title: 'Project Five',
    year: '2025',
    kind: 'Internal tool',
    blurb: 'Leave requests without the spreadsheet. Replace me.',
    stack: ['React', 'Express', 'MongoDB'],
    role: 'Frontend',
    outcome: 'Placeholder: used by 1 department',
    art: 'calendar',
    links: [{ label: 'Source', href: '#' }],
  },
  {
    title: 'Project Six',
    year: '2025',
    kind: 'Mobile-first web',
    blurb: 'Quick quizzes with honest feedback. Replace me.',
    stack: ['JavaScript', 'CSS'],
    role: 'Solo',
    outcome: 'Placeholder: 1k plays',
    art: 'quiz',
    links: [{ label: 'Try it', href: '#' }],
  },
]

/* Field notes — your blog. Point `href` at the real post later. */
export const notes: {
  title: string
  date: string
  minutes: number
  tags: string[]
  excerpt: string
  href: string
  kind: 'essay' | 'photo story' | 'dev log' | 'list'
}[] = [
  { title: 'Your featured post title goes here, and it can be a little long', date: '2026-10-02', minutes: 9, tags: ['dev log', 'journal'], excerpt: 'Two or three lines that make someone want to read the whole thing. Write the first sentence of the post here.', href: '#', kind: 'essay' },
  { title: 'A trip, told in twelve photographs', date: '2026-09-18', minutes: 6, tags: ['travel', 'photo'], excerpt: 'Placeholder excerpt for a photo story.', href: '#', kind: 'photo story' },
  { title: 'What I learned shipping a game in a week', date: '2026-09-05', minutes: 7, tags: ['games', 'build'], excerpt: 'Placeholder excerpt.', href: '#', kind: 'dev log' },
  { title: 'Forty things I want to be decent at', date: '2026-08-21', minutes: 4, tags: ['polymath'], excerpt: 'Placeholder excerpt.', href: '#', kind: 'list' },
  { title: 'Notes on attention, from a person with none', date: '2026-08-02', minutes: 5, tags: ['mind'], excerpt: 'Placeholder excerpt.', href: '#', kind: 'essay' },
  { title: 'Rejected, and what came after', date: '2026-07-14', minutes: 8, tags: ['career'], excerpt: 'Placeholder excerpt.', href: '#', kind: 'essay' },
]

/* The life log — your timeline, oldest at the bottom. */
export const log: { year: string; title: string; body: string; tag: string }[] = [
  { year: '2026', title: 'Placeholder — this year’s big thing', body: 'One or two sentences. What changed, what you shipped, who you met.', tag: 'now' },
  { year: '2026', title: 'Placeholder — a hackathon', body: 'Team, problem, what you built in 36 hours.', tag: 'build' },
  { year: '2025', title: 'Started your master’s degree', body: 'Placeholder — college, course, why you chose it.', tag: 'study' },
  { year: '2025', title: 'Placeholder — first internship', body: 'Where, what you worked on, one lesson.', tag: 'work' },
  { year: '2024', title: 'Placeholder — first trip alone', body: 'Where you went and the photo you still look at.', tag: 'life' },
  { year: '2022', title: 'Graduated', body: 'Placeholder — degree, college, a highlight.', tag: 'study' },
  { year: '2021', title: 'Wrote your first program', body: 'Placeholder — what it did, how it broke.', tag: 'build' },
  { year: '20XX', title: 'Born curious', body: 'Placeholder — hometown, a childhood obsession.', tag: 'life' },
]

/* Right now. */
export const now = {
  building: 'A placeholder project you are working on this week',
  reading: 'Book title — Author',
  learning: 'Something you are learning, e.g. graph algorithms',
  listening: 'Album — Artist',
  watching: 'A film or series',
  thinking: 'A question you cannot stop thinking about',
  updated: '2026-10-09',
}

export const stats: { value: string; label: string }[] = [
  { value: '27', label: 'repositories, most of them alive' },
  { value: '412', label: 'DSA problems solved' },
  { value: '9', label: 'disciplines in progress' },
  { value: '3', label: 'hackathons survived' },
  { value: '∞', label: 'tabs open right now' },
]

export const uses: { group: string; items: string[] }[] = [
  { group: 'Desk', items: ['Laptop model', 'Monitor', 'Keyboard', 'Notebook & pen'] },
  { group: 'Software', items: ['VS Code', 'Figma', 'Obsidian', 'Arc'] },
  { group: 'Camera', items: ['Camera body', 'Lens', 'Phone'] },
  { group: 'Habits', items: ['Daily commit', 'Morning pages', 'Long walks'] },
]

export const testimonials: { quote: string; who: string; role: string }[] = [
  { quote: 'Placeholder — a line a teammate or mentor said about working with you.', who: 'Name Surname', role: 'Mentor, Company' },
  { quote: 'Placeholder — a second quote. Keep these short and specific.', who: 'Name Surname', role: 'Teammate, Hackathon' },
  { quote: 'Placeholder — a third, from a professor or client.', who: 'Name Surname', role: 'Professor' },
]
