import type { Order } from '../algorithms/types'
import { MAX_BOXES, MAX_VALUE, MIN_BOXES, MIN_VALUE } from '../schemas/boxes'

export type Rng = () => number

export const PRESETS = [
  { id: 'random', label: 'Random' },
  { id: 'nearly-sorted', label: 'Nearly sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'duplicates', label: 'Duplicates' },
  { id: 'sorted', label: 'Already sorted' },
] as const

export type PresetId = (typeof PRESETS)[number]['id']

function distinctValues(count: number, rng: Rng): number[] {
  const pool = Array.from(
    { length: MAX_VALUE - MIN_VALUE + 1 },
    (_, i) => MIN_VALUE + i,
  )
  for (let i = 0; i < count; i++) {
    const k = i + Math.floor(rng() * (pool.length - i))
    const a = pool[i]
    const b = pool[k]
    if (a === undefined || b === undefined) continue
    pool[i] = b
    pool[k] = a
  }
  return pool.slice(0, count)
}

export function makePreset(
  id: PresetId,
  size: number,
  order: Order,
  rng: Rng = Math.random,
): number[] {
  const n = Math.min(Math.max(Math.round(size), MIN_BOXES), MAX_BOXES)

  switch (id) {
    case 'random':
      return Array.from(
        { length: n },
        () => MIN_VALUE + Math.floor(rng() * (MAX_VALUE - MIN_VALUE + 1)),
      )
    case 'duplicates': {
      const kinds = distinctValues(Math.min(3, n - 1), rng)
      return Array.from(
        { length: n },
        () => kinds[Math.floor(rng() * kinds.length)] ?? MIN_VALUE,
      )
    }
    default: {
      const inOrder = distinctValues(n, rng).sort((a, b) =>
        order === 'asc' ? a - b : b - a,
      )
      if (id === 'sorted') return inOrder
      if (id === 'reversed') return inOrder.reverse()

      const k = Math.floor(rng() * (n - 1))
      const a = inOrder[k]
      const b = inOrder[k + 1]
      if (a !== undefined && b !== undefined) {
        inOrder[k] = b
        inOrder[k + 1] = a
      }
      return inOrder
    }
  }
}
