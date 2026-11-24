import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from '../algorithms/registry'
import { sortCases } from '../algorithms/sorting/sortContract'
import type { Order } from '../algorithms/types'
import { lineForAnchor } from './listing'

const asc = (order: Order, a: string, b: string) => (order === 'asc' ? a : b)

const expectations: Record<string, (order: Order) => Record<string, string>> = {
  'bubble-sort': (order) => ({
    compare: `arr[j] ${asc(order, '>', '<')} arr[j + 1]`,
    swap: '[arr[j], arr[j + 1]] =',
    sorted: 'final place',
  }),
  'selection-sort': (order) => ({
    start: 'let min = i',
    compare: `arr[j] ${asc(order, '<', '>')} arr[min]`,
    select: 'min = j',
    swap: '[arr[i], arr[min]] =',
    sorted: 'final place',
    done: 'return arr',
  }),
  'insertion-sort': (order) => ({
    start: 'for (let i = 1',
    compare: `arr[j - 1] ${asc(order, '>', '<')} arr[j]`,
    swap: '[arr[j - 1], arr[j]] =',
    sorted: 'is now sorted',
  }),
}

describe.each(sortingAlgorithms)('$name listing', (algorithm) => {
  describe.each(['asc', 'desc'] as Order[])('%s', (order) => {
    const listing = algorithm.listing(order)

    it('maps every anchor to a line inside the listing', () => {
      for (const line of Object.values(listing.anchors)) {
        expect(Number.isInteger(line)).toBe(true)
        expect(line).toBeGreaterThanOrEqual(1)
        expect(line).toBeLessThanOrEqual(listing.lines.length)
      }
    })

    it.each(Object.entries(sortCases))(
      'has an anchor for every step (%s)',
      (_name, input) => {
        for (const step of algorithm.run(input, { order })) {
          expect(lineForAnchor(listing, step.anchor)).toBeDefined()
        }
      },
    )

    it('points each anchor at the right code', () => {
      const expected = expectations[algorithm.id]?.(order)
      expect(expected).toBeDefined()
      for (const [anchor, text] of Object.entries(expected ?? {})) {
        const n = lineForAnchor(listing, anchor)
        expect(n).toBeDefined()
        expect(listing.lines[(n ?? 1) - 1]).toContain(text)
      }
    })
  })
})
