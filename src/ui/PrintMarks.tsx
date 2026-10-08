/* Printer's registration target. Used where the page "bleeds". */
export function RegMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  )
}

/* Crop marks at the four corners of a block */
export function Crops() {
  return (
    <span className="crops" aria-hidden>
      <i /><i /><i /><i />
    </span>
  )
}
