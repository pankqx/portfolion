import { motion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'framer-motion'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import './riso.css'

/* Shared: how far the two ink drums slip apart. Scroll fast and the print misregisters. */
export function useMisregister(): MotionValue<number> {
  const { scrollY } = useScroll()
  const vel = useVelocity(scrollY)
  const raw = useTransform(vel, [-3000, 0, 3000], [-16, 0, 16], { clamp: true })
  return useSpring(raw, { stiffness: 260, damping: 28, mass: 0.6 })
}

type Props = {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  /** resting offset in px — a print is never perfectly registered */
  rest?: number
  /** multiplier for scroll-driven slip */
  slip?: number
  top?: 'pink' | 'blue' | 'yellow'
  bottom?: 'pink' | 'blue' | 'ink'
}

export default function Riso({ children, as: Tag = 'span', className = '', style, rest = 2, slip = 1, top = 'pink', bottom = 'blue' }: Props) {
  const m = useMisregister()
  const x = useTransform(m, (v) => rest + v * slip)
  const y = useTransform(m, (v) => rest * 0.6 - v * slip * 0.35)
  return (
    <Tag className={`riso ${className}`} style={style}>
      <span className={`riso-layer riso-${bottom}`}>{children}</span>
      <motion.span aria-hidden className={`riso-layer riso-top riso-${top}`} style={{ x, y }}>
        {children}
      </motion.span>
    </Tag>
  )
}
