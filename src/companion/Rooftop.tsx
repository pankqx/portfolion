import { useState } from 'react'
import Rhea from './Rhea'
import { faces, type Emotion } from './emotions'

export default function Rooftop() {
  const [e, setE] = useState<Emotion>((new URLSearchParams(location.hash.split('?')[1]).get('e') as Emotion) || 'calm')
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#16134d', display: 'grid', placeItems: 'center' }}>
      <Rhea emotion={e} className="test" />
      <div style={{ position: 'fixed', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
        {Object.keys(faces).map((k) => <button key={k} onClick={() => setE(k as Emotion)}>{k}</button>)}
      </div>
      <style>{`.test{height:100vh;width:auto}`}</style>
    </div>
  )
}
