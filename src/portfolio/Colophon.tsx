import { me } from '../content/me'
import AsciiSculpture from '../ui/AsciiSculpture'
import Riso from '../ui/Riso'

export default function Colophon() {
  const year = new Date().getFullYear()
  return (
    <footer className="colo" id="write">
      <div className="colo-top">
        <p className="colo-kicker">Got an idea, a job, or a strange question?</p>
        <a className="colo-mail" href={`mailto:${me.email}`}>
          <Riso slip={1.6} rest={3}>{me.email}</Riso>
        </a>
      </div>

      <div className="colo-grid">
        <ul className="colo-social">
          {me.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                <span>{s.label}</span>
                <span className="mono">{s.handle}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="colo-ascii">
          <AsciiSculpture className="colo-sculpt" shape={3} cell={9} interactive />
        </div>
        <div className="colo-note">
          <h3>Colophon</h3>
          <p>
            Set in Anybody and Martian Mono. Printed in four inks, pink, blue, yellow and green, on lilac paper. Scroll fast and the plates slip out of register, the way a real riso does.
          </p>
          <p>Built with React and Framer Motion. Rhea drawn by hand, line by line.</p>
        </div>
      </div>

      <div className="colo-base mono">
        <span>© {year} {me.fullName}</span>
        <span>{me.location}</span>
        <a href="#top">Back to the top</a>
      </div>
    </footer>
  )
}
