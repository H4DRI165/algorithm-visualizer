import { describe, expect, it } from 'vitest'
import type { Order, SortStep } from '../types'
import { bubbleSort } from './bubbleSort'

function replay(input: readonly number[], steps: SortStep[]): number[] {
  const arr = [...input]
  for (const step of steps) {
    if (step.type === 'swap') {
      const [x, y] = step.indices
      const a = arr[x]
      const b = arr[y]
      if (a === undefined || b === undefined) throw new Error('bad index')
      arr[x] = b
      arr[y] = a
    }
  }
  return arr
}

function countInversions(input: readonly number[], order: Order): number {
  let count = 0
  for (let i = 0; i < input.length; i++) {
    for (let j = i + 1; j < input.length; j++) {
      const a = input[i]
      const b = input[j]
      if (a === undefined || b === undefined) continue
      if (order === 'asc' ? a > b : a < b) count++
    }
  }
  return count
}

const cases: Record<string, number[]> = {
  'minimum size (3)': [9, 2, 5],
  'maximum size (10)': [42, 17, 68, 5, 91, 30, 77, 12, 56, 3],
  duplicates: [4, 2, 4, 1, 2],
  'already sorted': [1, 2, 3, 4, 5],
  'reverse sorted': [9, 7, 5, 3, 1],
}

const orders: Order[] = ['asc', 'desc']

describe.each(orders)('bubbleSort (%s)', (order) => {
  describe.each(Object.entries(cases))('%s', (_name, input) => {
    const steps = bubbleSort(input, { order })

    it('replaying the swaps produces a sorted array', () => {
      const expected = [...input].sort((a, b) =>
        order === 'asc' ? a - b : b - a,
      )
      expect(replay(input, steps)).toEqual(expected)
    })

    it('marks every index as sorted exactly once', () => {
      const marked = steps
        .filter((s) => s.type === 'sorted')
        .map((s) => (s.type === 'sorted' ? s.index : -1))
        .sort((a, b) => a - b)
      expect(marked).toEqual(input.map((_v, i) => i))
    })

    it('swap count equals the number of inversions', () => {
      const swaps = steps.filter((s) => s.type === 'swap').length
      expect(swaps).toBe(countInversions(input, order))
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
})

describe('bubbleSort (general)', () => {
  it('does not mutate the input array', () => {
    const input = [3, 1, 2]
    const copy = [...input]
    bubbleSort(input)
    expect(input).toEqual(copy)
  })

  it('defaults to ascending order', () => {
    const input = [3, 1, 2]
    expect(replay(input, bubbleSort(input))).toEqual([1, 2, 3])
  })

  it('gives every step an anchor and a message', () => {
    for (const step of bubbleSort([5, 1, 4])) {
      expect(step.anchor).not.toBe('')
      expect(step.msg).not.toBe('')
    }
  })
})
