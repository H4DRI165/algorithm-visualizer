import { describe, expect, it } from 'vitest'
import type { Order } from '../types'
import { selectionSort } from './selectionSort'
import { describeSortContract, sortCases } from './sortContract'

describeSortContract('selectionSort', selectionSort)

describe.each(['asc', 'desc'] as Order[])(
  'selectionSort details (%s)',
  (order) => {
    describe.each(Object.entries(sortCases))('%s', (_name, input) => {
      const steps = selectionSort(input, { order })

      it('always compares n(n-1)/2 pairs', () => {
        const n = input.length
        const compares = steps.filter((s) => s.type === 'compare').length
        expect(compares).toBe((n * (n - 1)) / 2)
      })

      it('makes at most n-1 swaps', () => {
        const swaps = steps.filter((s) => s.type === 'swap').length
        expect(swaps).toBeLessThanOrEqual(input.length - 1)
      })

      it('swaps the extreme of the unsorted part into place', () => {
        const arr = [...input]
        for (const step of steps) {
          if (step.type !== 'swap') continue
          const [i, m] = step.indices
          const rest = arr.slice(i)
          const target = order === 'asc' ? Math.min(...rest) : Math.max(...rest)
          expect(arr[m]).toBe(target)
          const a = arr[i]
          const b = arr[m]
          if (a === undefined || b === undefined) throw new Error('bad index')
          arr[i] = b
          arr[m] = a
        }
      })
    })
  },
)

describe('selectionSort([3, 1, 2])', () => {
  it('produces the expected step sequence', () => {
    const types = selectionSort([3, 1, 2]).map((s) => s.type)
    expect(types).toEqual([
      'select',
      'compare',
      'select',
      'compare',
      'swap',
      'sorted',
      'select',
      'compare',
      'select',
      'swap',
      'sorted',
      'sorted',
    ])
  })

  it('compares the current smallest with the candidate', () => {
    const steps = selectionSort([3, 1, 2])
    const compares = steps.flatMap((s) => (s.type === 'compare' ? [s] : []))
    expect(compares.map((s) => s.indices)).toEqual([
      [0, 1],
      [1, 2],
      [1, 2],
    ])
  })

  it('skips the swap when the smallest is already in place', () => {
    const steps = selectionSort([1, 2, 3])
    expect(steps.some((s) => s.type === 'swap')).toBe(false)
  })
})
