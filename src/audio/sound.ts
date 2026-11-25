export const SOUND_KEY = 'algorithm-visualizer:sound:v1'

function readStored(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'on'
  } catch {
    return false
  }
}

// Off by default. Only an explicit "on" is remembered.
let enabled = readStored()
const listeners = new Set<() => void>()

export function isSoundEnabled(): boolean {
  return enabled
}

export function setSoundEnabled(value: boolean): void {
  enabled = value
  try {
    localStorage.setItem(SOUND_KEY, value ? 'on' : 'off')
  } catch {
    // Storage unavailable: the choice just won't be remembered.
  }
  listeners.forEach((listener) => listener())
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
