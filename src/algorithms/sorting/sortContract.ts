import { describe, expect, it } from 'vitest'
import type { Order, SortStep } from '../types'

export const sortCases: Record<string, number[]> = {
  'minimum size (3)': [9, 2, 5],
  'maximum size (10)': [42, 17, 68, 5, 91, 30, 77, 12, 56, 3],
  duplicates: [4, 2, 4, 1, 2],
  'already sorted': [1, 2, 3, 4, 5],
  'reverse sorted': [9, 7, 5, 3, 1],
}

export function replay(
  input: readonly number[],
  steps: readonly SortStep[],
): number[] {
  const arr = [...input]
  for (const step of steps) {
    if (step.type !== 'swap') continue
    const [x, y] = step.indices
    const a = arr[x]
    const b = arr[y]
    if (a === undefined || b === undefined) throw new Error('bad index')
    arr[x] = b
    arr[y] = a
  }
  return arr
}

export function countInversions(
  input: readonly number[],
  order: Order,
): number {
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

type SortFn = (input: readonly number[], opts: { order: Order }) => SortStep[]

/** Rules every sorting algorithm must follow. */
export function describeSortContract(name: string, sort: SortFn) {
  describe.each(['asc', 'desc'] as Order[])(
    `${name} contract (%s)`,
    (order) => {
      describe.each(Object.entries(sortCases))('%s', (_name, input) => {
        const steps = sort(input, { order })

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

        it('does not mutate the input array', () => {
          const copy = [...input]
          sort(input, { order })
          expect(input).toEqual(copy)
        })

        it('gives every step an anchor and a message', () => {
          for (const step of steps) {
            expect(step.anchor).not.toBe('')
            expect(step.msg).not.toBe('')
          }
        })
      })
    },
  )
}
