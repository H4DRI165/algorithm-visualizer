import { DEFAULT_LANG, isLang, type Lang } from './listing'

export const LANG_KEY = 'algorithm-visualizer:lang:v1'

function readStored(): Lang {
  try {
    const value = localStorage.getItem(LANG_KEY)
    return isLang(value) ? value : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

let current: Lang = readStored()
const listeners = new Set<() => void>()

export function getLang(): Lang {
  return current
}

export function setLang(value: Lang): void {
  current = value
  try {
    localStorage.setItem(LANG_KEY, value)
  } catch {
    // Storage unavailable: the choice just won't be remembered.
  }
  listeners.forEach((listener) => listener())
}

export function subscribeLang(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
