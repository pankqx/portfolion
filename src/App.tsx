import { Girl, type Emotion } from './companion/Girl'
const E: Emotion[] = ['neutral','happy','shy','surprised','thinking','sad','laughing','sleepy','love']
export default function App() {
  const q = new URLSearchParams(location.search).get('e') as Emotion | null
  if (q) return <div style={{width:600,height:860,background:'#0c1030'}}><Girl emotion={q}/></div>
  return <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,background:'#0c1030'}}>
    {E.map(e=> <div key={e} style={{height:440}}><Girl emotion={e}/><p style={{textAlign:'center'}}>{e}</p></div>)}
  </div>
}
