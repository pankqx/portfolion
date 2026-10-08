import { AnimatePresence, MotionConfig } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import Portfolio from './portfolio/Portfolio'
import Grain from './ui/Grain'

const Rooftop = lazy(() => import('./companion/Rooftop'))

type Route = 'home' | 'rhea'

function readRoute(): Route {
  return location.hash.startsWith('#/rhea') ? 'rhea' : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.route = route
    document.title = route === 'rhea' ? 'Rhea, on the rooftop' : 'Pank, in print'
  }, [route])

  return (
    <MotionConfig reducedMotion="user">
      <Grain />
      <AnimatePresence mode="wait">
        {route === 'home' ? (
          <Portfolio key="home" />
        ) : (
          <Suspense key="rhea" fallback={<div style={{ position: 'fixed', inset: 0, background: 'var(--night-2)' }} />}>
            <Rooftop />
          </Suspense>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
