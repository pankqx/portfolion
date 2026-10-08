import Rhea from './Rhea'

/* Rhea's face, cropped tight — used in the nav and invites. */
export default function RheaFace({ emotion = 'happy' as const }: { emotion?: 'happy' | 'wink' | 'calm' }) {
  return <Rhea emotion={emotion} viewBox="200 196 200 200" live={false} />
}
