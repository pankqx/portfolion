export type Emotion =
  | 'calm'
  | 'happy'
  | 'giggle'
  | 'shy'
  | 'love'
  | 'surprised'
  | 'sad'
  | 'pout'
  | 'thinking'
  | 'sleepy'
  | 'wink'

export type EyeMode = 'open' | 'smile' | 'closed' | 'heart' | 'wide' | 'half'
export type MouthMode = 'smile' | 'open' | 'grin' | 'wave' | 'cat' | 'o' | 'frown' | 'pursed' | 'side' | 'yawn'

export type Face = {
  eyeL: EyeMode
  eyeR: EyeMode
  /** brow heights: inner, middle, outer — negative = raised */
  brow: [number, number, number]
  mouth: MouthMode
  blush: number
  tilt: number
  gaze: [number, number]
  /** extra flourish rendered near her head */
  mark?: 'sparkle' | 'tear' | 'sweat' | 'heart' | 'zz' | 'q' | 'puff'
}

export const faces: Record<Emotion, Face> = {
  calm: { eyeL: 'open', eyeR: 'open', brow: [0, 0, 0], mouth: 'smile', blush: 0.35, tilt: 0, gaze: [0, 0] },
  happy: { eyeL: 'open', eyeR: 'open', brow: [-3, -4, -2], mouth: 'open', blush: 0.55, tilt: -3, gaze: [0, 0], mark: 'sparkle' },
  giggle: { eyeL: 'smile', eyeR: 'smile', brow: [-4, -5, -2], mouth: 'grin', blush: 0.75, tilt: 5, gaze: [0, 0], mark: 'sparkle' },
  shy: { eyeL: 'open', eyeR: 'open', brow: [-5, -2, 2], mouth: 'wave', blush: 1, tilt: 6, gaze: [-0.8, 0.55], mark: 'sweat' },
  love: { eyeL: 'heart', eyeR: 'heart', brow: [-4, -3, 0], mouth: 'cat', blush: 0.9, tilt: -4, gaze: [0, 0], mark: 'heart' },
  surprised: { eyeL: 'wide', eyeR: 'wide', brow: [-10, -11, -8], mouth: 'o', blush: 0.4, tilt: 0, gaze: [0, -0.1] },
  sad: { eyeL: 'open', eyeR: 'open', brow: [-9, -3, 4], mouth: 'frown', blush: 0.3, tilt: 4, gaze: [0.2, 0.6], mark: 'tear' },
  pout: { eyeL: 'half', eyeR: 'open', brow: [6, 1, -2], mouth: 'pursed', blush: 0.7, tilt: -5, gaze: [0.7, 0], mark: 'puff' },
  thinking: { eyeL: 'open', eyeR: 'open', brow: [-2, -6, -1], mouth: 'side', blush: 0.3, tilt: 4, gaze: [-0.75, -0.85], mark: 'q' },
  sleepy: { eyeL: 'half', eyeR: 'half', brow: [-1, 1, 2], mouth: 'yawn', blush: 0.4, tilt: 7, gaze: [0, 0.4], mark: 'zz' },
  wink: { eyeL: 'open', eyeR: 'smile', brow: [-3, -5, -3], mouth: 'cat', blush: 0.6, tilt: -6, gaze: [0, 0], mark: 'sparkle' },
}

export const emotionLabel: Record<Emotion, string> = {
  calm: 'content',
  happy: 'happy',
  giggle: 'giggling',
  shy: 'shy',
  love: 'smitten',
  surprised: 'surprised',
  sad: 'a little sad',
  pout: 'pouting',
  thinking: 'thinking',
  sleepy: 'sleepy',
  wink: 'playful',
}
