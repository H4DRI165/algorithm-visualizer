import { describe, expect, it } from 'vitest'
import type { Order } from '../types'
import { insertionSort } from './insertionSort'
import {
  countInversions,
  describeSortContract,
  sortCases,
} from './sortContract'

describeSortContract('insertionSort', insertionSort)

describe.each(['asc', 'desc'] as Order[])(
  'insertionSort details (%s)',
  (order) => {
    describe.each(Object.entries(sortCases))('%s', (_name, input) => {
      const steps = insertionSort(input, { order })

      it('swap count equals the number of inversions', () => {
        const swaps = steps.filter((s) => s.type === 'swap').length
        expect(swaps).toBe(countInversions(input, order))
      })

      it('only ever compares neighbours', () => {
        for (const step of steps) {
          if (step.type !== 'compare') continue
          expect(step.indices[1] - step.indices[0]).toBe(1)
        }
      })

      it('every swap directly follows a compare of the same pair', () => {
        steps.forEach((step, k) => {
          if (step.type !== 'swap') return
          const prev = steps[k - 1]
          expect(prev?.type).toBe('compare')
          if (prev?.type === 'compare') {
            expect(prev.indices).toEqual(step.indices)
          }
        })
      })
    })
  },
)

describe('insertionSort comparisons', () => {
  it('needs only n-1 compares on sorted input', () => {
    const steps = insertionSort([1, 2, 3, 4, 5])
    expect(steps.filter((s) => s.type === 'compare')).toHaveLength(4)
  })

  it('needs n(n-1)/2 compares on reversed input', () => {
    const steps = insertionSort([5, 4, 3, 2, 1])
    expect(steps.filter((s) => s.type === 'compare')).toHaveLength(10)
  })
})

describe('insertionSort([3, 1, 2])', () => {
  it('produces the expected step sequence', () => {
    const types = insertionSort([3, 1, 2]).map((s) => s.type)
    expect(types).toEqual([
      'sorted',
      'compare',
      'swap',
      'sorted',
      'compare',
      'swap',
      'compare',
      'sorted',
    ])
  })
})
