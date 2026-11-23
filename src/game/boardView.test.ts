import { describe, expect, it } from 'vitest'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { getBoardView } from './boardView'

// bubbleSort([2, 1, 3]):
// 0 compare(0,1)  1 swap(0,1)  2 compare(1,2)  3 sorted(2)
// 4 compare(0,1)  5 sorted(1)  6 sorted(0)
const input = [2, 1, 3]
const steps = bubbleSort(input)

describe('getBoardView', () => {
  it('starts with the first pair highlighted', () => {
    const view = getBoardView(input, steps, 0)
    expect(view.values).toEqual([2, 1, 3])
    expect(view.states).toEqual(['comparing', 'comparing', 'idle'])
  })

  it('applies swaps before the cursor', () => {
    const view = getBoardView(input, steps, 2)
    expect(view.values).toEqual([1, 2, 3])
    expect(view.states).toEqual(['idle', 'comparing', 'comparing'])
  })

  it('marks sorted boxes behind the cursor', () => {
    const view = getBoardView(input, steps, 4)
    expect(view.states).toEqual(['comparing', 'comparing', 'sorted'])
  })

  it('shows everything sorted at the end', () => {
    const view = getBoardView(input, steps, steps.length)
    expect(view.values).toEqual([1, 2, 3])
    expect(view.states).toEqual(['sorted', 'sorted', 'sorted'])
  })

  it('does not mutate the input', () => {
    const copy = [...input]
    getBoardView(input, steps, steps.length)
    expect(input).toEqual(copy)
  })
})
