import { describe, expect, it } from 'vitest'
import { countInversions } from '../algorithms/sorting/sortContract'
import type { Order } from '../algorithms/types'
import { BoxValuesSchema } from '../schemas/boxes'
import { PRESETS, makePreset } from './presets'

function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const orders: Order[] = ['asc', 'desc']
const sizes = [3, 4, 5, 6, 7, 8, 9, 10]

describe.each(PRESETS)('preset $id', ({ id }) => {
  it.each(orders)('always gives a valid array (%s)', (order) => {
    const rng = seeded(7)
    for (const size of sizes) {
      for (let round = 0; round < 20; round++) {
        const values = makePreset(id, size, order, rng)
        expect(values).toHaveLength(size)
        expect(BoxValuesSchema.safeParse(values).success).toBe(true)
      }
    }
  })
})

describe('preset shapes', () => {
  it.each(orders)('sorted is already in order (%s)', (order) => {
    const rng = seeded(1)
    for (const size of sizes) {
      const values = makePreset('sorted', size, order, rng)
      expect(countInversions(values, order)).toBe(0)
    }
  })

  it.each(orders)('reversed is the worst case (%s)', (order) => {
    const rng = seeded(2)
    for (const size of sizes) {
      const values = makePreset('reversed', size, order, rng)
      expect(countInversions(values, order)).toBe((size * (size - 1)) / 2)
    }
  })

  it.each(orders)('nearly-sorted has exactly one inversion (%s)', (order) => {
    const rng = seeded(3)
    for (const size of sizes) {
      for (let round = 0; round < 20; round++) {
        const values = makePreset('nearly-sorted', size, order, rng)
        expect(countInversions(values, order)).toBe(1)
      }
    }
  })

  it('duplicates always repeats at least one value', () => {
    const rng = seeded(4)
    for (const size of sizes) {
      for (let round = 0; round < 20; round++) {
        const values = makePreset('duplicates', size, 'asc', rng)
        expect(new Set(values).size).toBeLessThan(values.length)
      }
    }
  })

  it('clamps the size to 3 to 10', () => {
    expect(makePreset('random', 1, 'asc')).toHaveLength(3)
    expect(makePreset('random', 99, 'asc')).toHaveLength(10)
  })
})
