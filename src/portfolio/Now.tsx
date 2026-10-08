import { now, testimonials, uses } from '../content/me'
import Riso from '../ui/Riso'

const rows: [keyof typeof now, string][] = [
  ['building', 'Building'],
  ['reading', 'Reading'],
  ['learning', 'Learning'],
  ['listening', 'On repeat'],
  ['watching', 'Watching'],
  ['thinking', 'Stuck on'],
]

export default function Now() {
  return (
    <section className="sec now" id="now" aria-labelledby="now-title">
      <div className="sec-head">
        <h2 className="sec-title" id="now-title">
          <Riso top="blue" bottom="ink">Right now</Riso>
        </h2>
        <p className="sec-lede">A checkout card for this month of my life. Updated {new Date(now.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.</p>
      </div>

      <div className="now-grid">
        <div className="now-card">
          <div className="now-card-head">
            <span>Library of Pank</span>
            <span className="mono">card no. 2026/10</span>
          </div>
          <dl>
            {rows.map(([k, label]) => (
              <div className="now-row" key={k}>
                <dt className="mono">{label}</dt>
                <dd>{now[k]}</dd>
              </div>
            ))}
          </dl>
          <span className="now-stamp" aria-hidden>Checked out</span>
        </div>

        <div className="uses">
          <h3 className="uses-title">What’s on the desk</h3>
          {uses.map((u) => (
            <div className="uses-group" key={u.group}>
              <h4 className="mono">{u.group}</h4>
              <ul>
                {u.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="quotes">
          {testimonials.map((t, i) => (
            <figure className="quote" key={i} style={{ rotate: `${[-1.6, 1.2, -0.6][i % 3]}deg` }}>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <b>{t.who}</b>
                <span className="mono">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
