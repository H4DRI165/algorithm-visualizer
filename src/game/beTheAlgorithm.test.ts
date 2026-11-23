import { describe, expect, it } from 'vitest'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import type { Order, SortStep } from '../algorithms/types'
import {
  beTheAlgorithmReducer,
  createInitialState,
  getExpectedMove,
} from './beTheAlgorithm'
import { calculateStars } from './scoring'
import type { GameState, Move } from './types'

// bubbleSort([2, 1, 3]) gives these steps:
// 0 compare(0,1)  1 swap(0,1)  2 compare(1,2)  3 sorted(2)
// 4 compare(0,1)  5 sorted(1)  6 sorted(0)
// So the perfect run is: swap, keep, keep.
const steps = bubbleSort([2, 1, 3])
const swap01: Move = { type: 'swap', indices: [0, 1] }
const keep: Move = { type: 'keep' }

function play(
  state: GameState,
  list: readonly SortStep[],
  ...moves: Move[]
): GameState {
  return moves.reduce((s, move) => beTheAlgorithmReducer(s, move, list), state)
}

/** Builds the perfect run straight from the steps, independent of the reducer. */
function perfectMoves(list: readonly SortStep[]): Move[] {
  const moves: Move[] = []
  list.forEach((step, k) => {
    if (step.type !== 'compare') return
    const next = list[k + 1]
    moves.push(
      next?.type === 'swap'
        ? { type: 'swap', indices: step.indices }
        : { type: 'keep' },
    )
  })
  return moves
}

describe('createInitialState', () => {
  it('starts at the first compare step with full lives', () => {
    expect(createInitialState(steps)).toEqual({
      cursor: 0,
      lives: 3,
      score: 0,
      streak: 0,
      mistakes: 0,
      status: 'playing',
    })
  })

  it('accepts a custom number of lives', () => {
    expect(createInitialState(steps, 5).lives).toBe(5)
  })

  it('is already won when there is nothing to play', () => {
    expect(createInitialState([]).status).toBe('won')
  })
})

describe('getExpectedMove', () => {
  it('expects a swap when a swap step follows the compare', () => {
    expect(getExpectedMove(steps, 0)).toMatchObject({
      type: 'swap',
      indices: [0, 1],
    })
  })

  it('expects a keep when no swap follows the compare', () => {
    expect(getExpectedMove(steps, 2)).toEqual({ type: 'keep' })
  })

  it('returns null when the cursor is not on a compare step', () => {
    expect(getExpectedMove(steps, 3)).toBeNull()
    expect(getExpectedMove(steps, 99)).toBeNull()
  })
})

describe('correct moves', () => {
  it('a correct swap skips the swap step and scores 10', () => {
    const next = play(createInitialState(steps), steps, swap01)
    expect(next.cursor).toBe(2)
    expect(next.score).toBe(10)
    expect(next.streak).toBe(1)
    expect(next.lives).toBe(3)
    expect(next.lastResult?.correct).toBe(true)
  })

  it('accepts the swapped pair in either order', () => {
    const reversed: Move = { type: 'swap', indices: [1, 0] }
    const next = play(createInitialState(steps), steps, reversed)
    expect(next.cursor).toBe(2)
    expect(next.mistakes).toBe(0)
  })

  it('a correct keep advances and skips sorted steps automatically', () => {
    const next = play(createInitialState(steps), steps, swap01, keep)
    expect(next.cursor).toBe(4) // step 3 is a sorted step, skipped
    expect(next.score).toBe(10 + 12)
    expect(next.streak).toBe(2)
  })

  it('wins after the last correct move', () => {
    const end = play(createInitialState(steps), steps, swap01, keep, keep)
    expect(end.status).toBe('won')
    expect(end.cursor).toBe(steps.length)
    expect(end.score).toBe(10 + 12 + 14)
    expect(calculateStars(end.status, end.mistakes)).toBe(3)
  })
})

describe('wrong moves', () => {
  it('costs a life, resets the streak and keeps the cursor', () => {
    const next = play(createInitialState(steps), steps, keep)
    expect(next.cursor).toBe(0)
    expect(next.lives).toBe(2)
    expect(next.mistakes).toBe(1)
    expect(next.streak).toBe(0)
    expect(next.score).toBe(0)
    expect(next.status).toBe('playing')
  })

  it('explains the correct move', () => {
    const next = play(createInitialState(steps), steps, keep)
    expect(next.lastResult?.correct).toBe(false)
    expect(next.lastResult?.msg).toContain('swap')
  })

  it('treats a swap of the wrong pair as a mistake', () => {
    const wrongPair: Move = { type: 'swap', indices: [1, 2] }
    const next = play(createInitialState(steps), steps, wrongPair)
    expect(next.mistakes).toBe(1)
    expect(next.cursor).toBe(0)
  })

  it('swapping when a keep is expected is a mistake', () => {
    const wrongPair: Move = { type: 'swap', indices: [1, 2] }
    const next = play(createInitialState(steps), steps, swap01, wrongPair)
    expect(next.mistakes).toBe(1)
    expect(next.cursor).toBe(2)
    expect(next.streak).toBe(0)
    expect(next.score).toBe(10) // points already earned are kept
  })

  it('sets lost when the last life is gone', () => {
    const lost = play(createInitialState(steps), steps, keep, keep, keep)
    expect(lost.lives).toBe(0)
    expect(lost.status).toBe('lost')
  })
})

describe('moves that are ignored', () => {
  it('ignores moves after the game is lost', () => {
    const lost = play(createInitialState(steps, 1), steps, keep)
    expect(lost.status).toBe('lost')
    expect(beTheAlgorithmReducer(lost, swap01, steps)).toBe(lost)
  })

  it('ignores moves after the game is won', () => {
    const won = play(createInitialState(steps), steps, swap01, keep, keep)
    expect(beTheAlgorithmReducer(won, keep, steps)).toBe(won)
  })

  it('ignores Predict-mode moves', () => {
    const state = createInitialState(steps)
    const choose: Move = { type: 'choose', optionId: 'a' }
    expect(beTheAlgorithmReducer(state, choose, steps)).toBe(state)
  })
})

describe('purity', () => {
  it('never mutates the previous state', () => {
    const state = Object.freeze(createInitialState(steps))
    expect(() => beTheAlgorithmReducer(state, keep, steps)).not.toThrow()
    expect(state.lives).toBe(3)
    expect(state.mistakes).toBe(0)
  })
})

const cases: Record<string, number[]> = {
  'minimum size (3)': [9, 2, 5],
  'maximum size (10)': [42, 17, 68, 5, 91, 30, 77, 12, 56, 3],
  duplicates: [4, 2, 4, 1, 2],
  'already sorted': [1, 2, 3, 4, 5],
  'reverse sorted': [9, 7, 5, 3, 1],
}

describe.each(['asc', 'desc'] as Order[])('perfect run (%s)', (order) => {
  describe.each(Object.entries(cases))('%s', (_name, input) => {
    it('wins with 3 stars, 0 mistakes and all lives', () => {
      const list = bubbleSort(input, { order })
      let state = createInitialState(list)

      for (const move of perfectMoves(list)) {
        expect(state.status).toBe('playing')
        state = beTheAlgorithmReducer(state, move, list)
      }

      expect(state.status).toBe('won')
      expect(state.mistakes).toBe(0)
      expect(state.lives).toBe(3)
      expect(calculateStars(state.status, state.mistakes)).toBe(3)
    })
  })
})
