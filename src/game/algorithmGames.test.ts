import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from '../algorithms/registry'
import { insertionSort } from '../algorithms/sorting/insertionSort'
import { selectionSort } from '../algorithms/sorting/selectionSort'
import { sortCases } from '../algorithms/sorting/sortContract'
import type { Order, SortStep } from '../algorithms/types'
import { beTheAlgorithmReducer, createInitialState } from './beTheAlgorithm'
import { getBoardView } from './boardView'
import { calculateStars } from './scoring'
import { perfectMoves } from './perfectRun'
import type { GameState, Move } from './types'

function play(
  state: GameState,
  steps: readonly SortStep[],
  ...moves: Move[]
): GameState {
  return moves.reduce((s, move) => beTheAlgorithmReducer(s, move, steps), state)
}

describe.each(sortingAlgorithms)('perfect run: $name', (algorithm) => {
  describe.each(['asc', 'desc'] as Order[])('%s', (order) => {
    describe.each(Object.entries(sortCases))('%s', (_name, input) => {
      it('wins with 3 stars and sorts the board', () => {
        const steps = algorithm.run(input, { order })
        let state = createInitialState(steps)

        for (const move of perfectMoves(steps)) {
          expect(state.status).toBe('playing')
          state = beTheAlgorithmReducer(state, move, steps)
        }

        expect(state.status).toBe('won')
        expect(state.mistakes).toBe(0)
        expect(state.lives).toBe(3)
        expect(calculateStars(state.status, state.mistakes)).toBe(3)

        const expected = [...input].sort((a, b) =>
          order === 'asc' ? a - b : b - a,
        )
        expect(getBoardView(input, steps, state.cursor).values).toEqual(
          expected,
        )
      })
    })
  })
})

describe('selection sort game, [3, 1, 2]', () => {
  const steps = selectionSort([3, 1, 2])
  const select = (index: number): Move => ({ type: 'select', index })
  const keep: Move = { type: 'keep' }
  const swap = (a: number, b: number): Move => ({
    type: 'swap',
    indices: [a, b],
  })

  it('starts on the first compare, skipping the pass-start step', () => {
    expect(createInitialState(steps).cursor).toBe(1)
  })

  it('the perfect run is select, keep, swap, select, swap', () => {
    const end = play(
      createInitialState(steps),
      steps,
      select(1),
      keep,
      swap(0, 1),
      select(2),
      swap(1, 2),
    )
    expect(end.status).toBe('won')
    expect(end.cursor).toBe(steps.length)
    expect(end.score).toBe(10 + 12 + 14 + 16 + 18)
    expect(end.mistakes).toBe(0)
  })

  it('keeping when a new smallest was expected costs a life', () => {
    const next = play(createInitialState(steps), steps, keep)
    expect(next.lives).toBe(2)
    expect(next.cursor).toBe(1)
    expect(next.lastResult?.msg).toContain('new smallest')
  })

  it('selecting when keep was expected costs a life', () => {
    const next = play(createInitialState(steps), steps, select(1), select(2))
    expect(next.mistakes).toBe(1)
    expect(next.cursor).toBe(3)
    expect(next.lastResult?.msg).toContain('not smaller')
  })

  it('selecting the wrong box is a mistake', () => {
    const next = play(createInitialState(steps), steps, select(0))
    expect(next.mistakes).toBe(1)
    expect(next.cursor).toBe(1)
  })

  it('the lone swap must be answered with that swap', () => {
    const atSwap = play(createInitialState(steps), steps, select(1), keep)
    expect(atSwap.cursor).toBe(4)

    const wrong = play(atSwap, steps, keep)
    expect(wrong.mistakes).toBe(1)
    expect(wrong.cursor).toBe(4)

    const right = play(atSwap, steps, swap(0, 1))
    expect(right.cursor).toBe(7) // sorted and pass-start steps skipped
    expect(right.mistakes).toBe(0)
  })
})

describe('insertion sort game, [3, 1, 2]', () => {
  const steps = insertionSort([3, 1, 2])
  const swap = (a: number, b: number): Move => ({
    type: 'swap',
    indices: [a, b],
  })

  it('the perfect run is swap, swap, keep', () => {
    const end = play(createInitialState(steps), steps, swap(0, 1), swap(1, 2), {
      type: 'keep',
    })
    expect(end.status).toBe('won')
    expect(end.score).toBe(10 + 12 + 14)
  })

  it('a wrong swap explains why keep was right', () => {
    const next = play(
      createInitialState(steps),
      steps,
      swap(0, 1),
      swap(1, 2),
      swap(0, 1),
    )
    expect(next.mistakes).toBe(1)
    expect(next.lastResult?.msg).toContain('right place')
  })
})
