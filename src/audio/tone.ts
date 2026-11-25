import { isSoundEnabled } from './sound'

export type SoundKind = 'correct' | 'wrong' | 'win' | 'lose'

export const NOTES: Record<SoundKind, readonly number[]> = {
  correct: [660],
  wrong: [196],
  win: [523, 659, 784],
  lose: [392, 294, 196],
}

const VOLUME = 0.06 // low and fixed on purpose
const NOTE_SECONDS = 0.12

let context: AudioContext | null = null

function getContext(): AudioContext | null {
  const Ctor = (globalThis as { AudioContext?: typeof AudioContext })
    .AudioContext
  if (!Ctor) return null
  // Created on the first sound, which always follows a user action.
  context ??= new Ctor()
  return context
}

export function playSound(kind: SoundKind): void {
  if (!isSoundEnabled()) return
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') void ctx.resume()

    NOTES[kind].forEach((frequency, i) => {
      const start = ctx.currentTime + i * NOTE_SECONDS
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(VOLUME, start)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + NOTE_SECONDS)
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.start(start)
      oscillator.stop(start + NOTE_SECONDS)
    })
  } catch {
    // Sound is a bonus. It must never break the game.
  }
}
