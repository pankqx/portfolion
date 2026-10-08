import { notes } from '../content/me'
import Riso from '../ui/Riso'

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

export default function Notes() {
  const [lead, ...rest] = notes
  return (
    <section className="sec notes" id="notes" aria-labelledby="notes-title">
      <div className="sec-head">
        <h2 className="sec-title" id="notes-title">
          <Riso top="yellow" bottom="pink">Field notes</Riso>
        </h2>
        <p className="sec-lede">Essays, dev logs and photo stories. Written slowly, published whenever they’re honest enough.</p>
      </div>

      <div className="notes-grid">
        <a className="note-lead" href={lead.href}>
          <div className="note-lead-art halftone-blue" aria-hidden>
            <span className="note-lead-glyph">{lead.title.charAt(0)}</span>
          </div>
          <p className="note-meta mono">
            <span>{fmt(lead.date)}</span>
            <span>{lead.minutes} min read</span>
            <span>{lead.kind}</span>
          </p>
          <h3 className="note-lead-title">{lead.title}</h3>
          <p className="note-lead-ex">{lead.excerpt}</p>
          <span className="note-read">Read the note</span>
        </a>

        <ol className="note-list">
          {rest.map((n) => (
            <li key={n.title}>
              <a href={n.href} className="note-row">
                <span className="note-date mono">{fmt(n.date)}</span>
                <span className="note-title">{n.title}</span>
                <span className="note-kind mono">{n.kind}, {n.minutes} min</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <a className="btn btn-blue notes-all" href="#">Every note, ever</a>
    </section>
  )
}
