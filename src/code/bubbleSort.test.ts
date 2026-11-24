import { describe, expect, it } from 'vitest'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import type { Order } from '../algorithms/types'
import { getBubbleSortListing } from './bubbleSort'
import type { CodeListing } from './listing'
import { lineForAnchor } from './listing'

function lineText(listing: CodeListing, anchor: string): string | undefined {
  const n = lineForAnchor(listing, anchor)
  return n === undefined ? undefined : listing.lines[n - 1]
}

const cases: Record<string, number[]> = {
  'minimum size (3)': [9, 2, 5],
  'maximum size (10)': [42, 17, 68, 5, 91, 30, 77, 12, 56, 3],
  duplicates: [4, 2, 4, 1, 2],
  'already sorted': [1, 2, 3, 4, 5],
  'reverse sorted': [9, 7, 5, 3, 1],
}

describe.each(['asc', 'desc'] as Order[])(
  'bubble sort listing (%s)',
  (order) => {
    const listing = getBubbleSortListing(order)

    it('maps every anchor to a line inside the listing', () => {
      for (const line of Object.values(listing.anchors)) {
        expect(Number.isInteger(line)).toBe(true)
        expect(line).toBeGreaterThanOrEqual(1)
        expect(line).toBeLessThanOrEqual(listing.lines.length)
      }
    })

    it.each(Object.entries(cases))(
      'has an anchor for every step (%s)',
      (_name, input) => {
        for (const step of bubbleSort(input, { order })) {
          expect(lineForAnchor(listing, step.anchor)).toBeDefined()
        }
      },
    )

    it('points the anchors at the right code', () => {
      const op = order === 'asc' ? '>' : '<'
      expect(lineText(listing, 'compare')).toContain(`arr[j] ${op} arr[j + 1]`)
      expect(lineText(listing, 'swap')).toContain('[arr[j], arr[j + 1]] =')
      expect(lineText(listing, 'sorted')).toContain('final place')
    })
  },
)

describe('lineForAnchor', () => {
  it('returns undefined for a missing or unknown anchor', () => {
    const listing = getBubbleSortListing('asc')
    expect(lineForAnchor(listing, undefined)).toBeUndefined()
    expect(lineForAnchor(listing, 'nope')).toBeUndefined()
  })
})
