import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from '../algorithms/registry'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { sortCases } from '../algorithms/sorting/sortContract'
import type { Order } from '../algorithms/types'
import {
  START_MESSAGE,
  beatReducer,
  countSwaps,
  createBeatState,
  extraSwaps,
  getBeatBoxStates,
  isSorted,
  perfectBeatClicks,
  resultMessage,
  type BeatState,
} from './beatTheAlgorithm'

function click(
  state: BeatState,
  indices: number[],
  order: Order = 'asc',
): BeatState {
  return indices.reduce(
    (s, index) => beatReducer(s, { type: 'pick', index }, order),
    state,
  )
}

describe('isSorted', () => {
  it('checks ascending and descending order', () => {
    expect(isSorted([1, 2, 3], 'asc')).toBe(true)
    expect(isSorted([2, 1, 3], 'asc')).toBe(false)
    expect(isSorted([3, 2, 1], 'desc')).toBe(true)
    expect(isSorted([1, 2, 3], 'desc')).toBe(false)
  })

  it('treats duplicates as in order', () => {
    expect(isSorted([1, 2, 2, 3], 'asc')).toBe(true)
    expect(isSorted([3, 2, 2, 1], 'desc')).toBe(true)
  })
})

describe('createBeatState', () => {
  it('starts playing with a copy of the input', () => {
    const input = [3, 1, 2]
    const state = createBeatState(input, 'asc')
    expect(state).toEqual({
      values: [3, 1, 2],
      selected: null,
      swaps: 0,
      status: 'playing',
      message: START_MESSAGE,
    })
    expect(state.values).not.toBe(input)
  })

  it('is already won when the input is sorted', () => {
    expect(createBeatState([1, 2, 3], 'asc').status).toBe('won')
  })
})

describe('beatReducer', () => {
  const start = createBeatState([3, 1, 2], 'asc')

  it('the first pick selects a box without swapping', () => {
    const next = click(start, [1])
    expect(next.selected).toBe(1)
    expect(next.swaps).toBe(0)
    expect(next.values).toEqual([3, 1, 2])
  })

  it('picking the same box again deselects it', () => {
    const next = click(start, [1, 1])
    expect(next.selected).toBeNull()
    expect(next.swaps).toBe(0)
  })

  it('the second pick swaps the two boxes and counts one swap', () => {
    const next = click(start, [0, 1])
    expect(next.values).toEqual([1, 3, 2])
    expect(next.swaps).toBe(1)
    expect(next.selected).toBeNull()
    expect(next.status).toBe('playing')
    expect(next.message).toBe('Swapped 3 and 1.')
  })

  it('any two boxes can swap, not only neighbours', () => {
    expect(click(start, [0, 2]).values).toEqual([2, 1, 3])
  })

  it('ignores picks outside the board', () => {
    expect(click(start, [-1])).toBe(start)
    expect(click(start, [3])).toBe(start)
    expect(click(start, [1.5])).toBe(start)
  })

  it('wins when the swap sorts the array', () => {
    const won = click(createBeatState([2, 1, 3], 'asc'), [0, 1])
    expect(won.status).toBe('won')
    expect(won.swaps).toBe(1)
    expect(won.message).toContain('in order')
  })

  it('follows the order of the level', () => {
    const won = click(createBeatState([1, 2, 3], 'desc'), [0, 2], 'desc')
    expect(won.values).toEqual([3, 2, 1])
    expect(won.status).toBe('won')
  })

  it('ignores picks after the game is won', () => {
    const won = click(createBeatState([2, 1, 3], 'asc'), [0, 1])
    expect(click(won, [0])).toBe(won)
  })

  it('never mutates the previous state', () => {
    const state = Object.freeze(createBeatState([3, 1, 2], 'asc'))
    Object.freeze(state.values)
    expect(() => click(state, [0, 1])).not.toThrow()
    expect(state.values).toEqual([3, 1, 2])
    expect(state.swaps).toBe(0)
  })
})

describe('swap counts and results', () => {
  it('counts the swap steps of an algorithm', () => {
    expect(countSwaps(bubbleSort([2, 1, 3]))).toBe(1)
    expect(countSwaps([])).toBe(0)
  })

  it('extra swaps never go below zero', () => {
    expect(extraSwaps(5, 3)).toBe(2)
    expect(extraSwaps(3, 3)).toBe(0)
    expect(extraSwaps(2, 3)).toBe(0)
  })

  it('describes beating, matching and losing to the algorithm', () => {
    expect(resultMessage(2, 6)).toContain('You beat it')
    expect(resultMessage(3, 3)).toContain('matched')
    expect(resultMessage(5, 3)).toContain('fewer swaps')
    expect(resultMessage(1, 3)).toContain('1 swap and')
  })
})

describe('getBeatBoxStates', () => {
  it('marks the picked box, and everything once won', () => {
    const state = createBeatState([3, 1, 2], 'asc')
    expect(getBeatBoxStates(state)).toEqual(['idle', 'idle', 'idle'])
    expect(getBeatBoxStates(click(state, [1]))).toEqual([
      'idle',
      'selected',
      'idle',
    ])
    const won = click(createBeatState([2, 1, 3], 'asc'), [0, 1])
    expect(getBeatBoxStates(won)).toEqual(['sorted', 'sorted', 'sorted'])
  })
})

describe.each(sortingAlgorithms)('perfect beat run: $name', (algorithm) => {
  describe.each(['asc', 'desc'] as Order[])('%s', (order) => {
    describe.each(Object.entries(sortCases))('%s', (_name, input) => {
      it('clicking the algorithm swaps wins with the same swap count', () => {
        const steps = algorithm.run(input, { order })
        let state = createBeatState(input, order)

        for (const pair of perfectBeatClicks(steps)) {
          expect(state.status).toBe('playing')
          state = click(state, pair, order)
        }

        expect(state.status).toBe('won')
        expect(state.swaps).toBe(countSwaps(steps))
        expect(extraSwaps(state.swaps, countSwaps(steps))).toBe(0)
      })
    })
  })
})
