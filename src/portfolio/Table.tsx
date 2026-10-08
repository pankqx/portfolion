import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { elements, groups, type Group } from '../content/me'
import Riso from '../ui/Riso'

const ink: Record<Group, string> = { build: 'var(--blue)', make: 'var(--pink)', think: 'var(--yellow)', move: 'var(--teal)' }

export default function Table() {
  const [sel, setSel] = useState(0)
  const [filter, setFilter] = useState<Group | null>(null)
  const e = elements[sel]

  return (
    <section className="sec tbl" id="table" aria-labelledby="table-title">
      <div className="sec-head">
        <h2 className="sec-title" id="table-title">
          <Riso>Periodic table of Pank</Riso>
        </h2>
        <p className="sec-lede">
          Twenty things I’m made of, sorted by what they do for me. Tap any square to read its note. The deeper the ink, the further I’ve gone.
        </p>
      </div>

      <div className="tbl-legend" role="group" aria-label="Filter by group">
        {(Object.keys(groups) as Group[]).map((g) => (
          <button
            key={g}
            className={`tbl-key ${filter === g ? 'on' : ''}`}
            onClick={() => setFilter(filter === g ? null : g)}
            aria-pressed={filter === g}
          >
            <i style={{ background: ink[g] }} />
            {groups[g].label}
          </button>
        ))}
      </div>

      <div className="tbl-wrap">
        <ol className="tbl-grid">
          {elements.map((el, i) => (
            <li key={el.name}>
              <button
                className={`el ${sel === i ? 'is-sel' : ''} ${filter && filter !== el.group ? 'is-dim' : ''}`}
                style={{ ['--acc' as string]: ink[el.group], ['--lvl' as string]: el.level / 5 }}
                onClick={() => setSel(i)}
                onMouseEnter={() => setSel(i)}
                aria-pressed={sel === i}
              >
                <span className="el-n mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="el-sym">{el.sym}</span>
                <span className="el-name">{el.name}</span>
                <span className="el-lvl" aria-label={`Depth ${el.level} of 5`}>
                  {Array.from({ length: 5 }, (_, k) => (
                    <i key={k} className={k < el.level ? 'f' : ''} />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <aside className="tbl-card" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={sel}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28 }}
            >
              <div className="tc-top mono">
                <span>No. {String(sel + 1).padStart(2, '0')}</span>
                <span>since {e.since}</span>
              </div>
              <div className="tc-sym" style={{ ['--acc' as string]: ink[e.group] }}>
                <span className="tc-sym-a">{e.sym}</span>
                <span className="tc-sym-b" aria-hidden>{e.sym}</span>
              </div>
              <h3 className="tc-name">{e.name}</h3>
              <p className="tc-group mono">{groups[e.group].blurb}</p>
              <p className="tc-note">{e.note}</p>
              <div className="tc-meter" aria-label={`Depth ${e.level} of 5`}>
                <span style={{ width: `${e.level * 20}%`, background: ink[e.group] }} />
              </div>
              <p className="tc-scale mono"><span>dabbling</span><span>fluent</span></p>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </section>
  )
}
