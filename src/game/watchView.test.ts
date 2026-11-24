import { describe, expect, it } from 'vitest'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { START_CAPTION, getWatchView } from './watchView'

// bubbleSort([2, 1, 3]):
// 0 compare(0,1)  1 swap(0,1)  2 compare(1,2)  3 sorted(2)
// 4 compare(0,1)  5 sorted(1)  6 sorted(0)
const input = [2, 1, 3]
const steps = bubbleSort(input)

describe('getWatchView', () => {
  it('position 0 is the untouched start', () => {
    const view = getWatchView(input, steps, 0)
    expect(view.values).toEqual([2, 1, 3])
    expect(view.states).toEqual(['idle', 'idle', 'idle'])
    expect(view.caption).toBe(START_CAPTION)
    expect(view.comparisons).toBe(0)
    expect(view.swaps).toBe(0)
  })

  it('shows a compare step as comparing', () => {
    const view = getWatchView(input, steps, 1)
    expect(view.states).toEqual(['comparing', 'comparing', 'idle'])
    expect(view.caption).toBe('Compare 2 and 1')
    expect(view.comparisons).toBe(1)
  })

  it('shows a swap step already applied and marked swapping', () => {
    const view = getWatchView(input, steps, 2)
    expect(view.values).toEqual([1, 2, 3])
    expect(view.states).toEqual(['swapping', 'swapping', 'idle'])
    expect(view.caption).toBe('2 > 1, so swap them')
    expect(view.swaps).toBe(1)
  })

  it('marks sorted boxes', () => {
    const view = getWatchView(input, steps, 4)
    expect(view.states).toEqual(['idle', 'idle', 'sorted'])
    expect(view.caption).toBe('3 is now in its final place')
  })

  it('shows everything sorted at the end, with totals', () => {
    const view = getWatchView(input, steps, steps.length)
    expect(view.values).toEqual([1, 2, 3])
    expect(view.states).toEqual(['sorted', 'sorted', 'sorted'])
    expect(view.comparisons).toBe(3)
    expect(view.swaps).toBe(1)
  })

  it('clamps positions outside the range', () => {
    expect(getWatchView(input, steps, 99)).toEqual(
      getWatchView(input, steps, steps.length),
    )
    expect(getWatchView(input, steps, -5)).toEqual(
      getWatchView(input, steps, 0),
    )
  })

  it('does not mutate the input', () => {
    const copy = [...input]
    getWatchView(input, steps, steps.length)
    expect(input).toEqual(copy)
  })
})
