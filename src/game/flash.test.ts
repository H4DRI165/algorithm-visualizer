import { describe, expect, it } from 'vitest'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { selectionSort } from '../algorithms/sorting/selectionSort'
import { swapAnchorBetween } from './flash'

// bubbleSort([2, 1, 3]):
// 0 compare  1 swap  2 compare  3 sorted  4 compare  5 sorted  6 sorted
const steps = bubbleSort([2, 1, 3])

describe('swapAnchorBetween', () => {
  it('finds the swap inside the range', () => {
    expect(swapAnchorBetween(steps, 0, 2)).toBe('swap')
    expect(swapAnchorBetween(steps, 0, 99)).toBe('swap')
  })

  it('returns undefined when the range has no swap', () => {
    expect(swapAnchorBetween(steps, 2, 4)).toBeUndefined()
    expect(swapAnchorBetween(steps, 0, 1)).toBeUndefined()
    expect(swapAnchorBetween(steps, 3, 3)).toBeUndefined()
  })

  it('finds a lone swap in selection sort', () => {
    // 0 select 1 compare 2 select 3 compare 4 swap 5 sorted ...
    const selection = selectionSort([3, 1, 2])
    expect(swapAnchorBetween(selection, 4, 5)).toBe('swap')
    expect(swapAnchorBetween(selection, 1, 4)).toBeUndefined()
  })
})
