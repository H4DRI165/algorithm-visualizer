import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from '../algorithms/registry'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { insertionSort } from '../algorithms/sorting/insertionSort'
import { selectionSort } from '../algorithms/sorting/selectionSort'
import { sortCases } from '../algorithms/sorting/sortContract'
import type { Order, SortStep } from '../algorithms/types'
import {
  OPTION_COUNT,
  createPredictState,
  getPredictOptions,
  getPredictPrompt,
  optionForStep,
  perfectPredictMoves,
  predictReducer,
} from './predict'
import { calculateStars } from './scoring'
import type { GameState, Move } from './types'

const choose = (optionId: string): Move => ({ type: 'choose', optionId })

function play(
  state: GameState,
  steps: readonly SortStep[],
  ...moves: Move[]
): GameState {
  return moves.reduce((s, move) => predictReducer(s, move, steps), state)
}

// bubbleSort([2, 1, 3]) steps:
// 0 compare(0,1)  1 swap(0,1)  2 compare(1,2)  3 sorted(2)
// 4 compare(0,1)  5 sorted(1)  6 sorted(0)
// Asked steps: 0, 1, 2, 4. Perfect run: compare:1,2  swap:1,2  compare:2,3  compare:1,2
const steps = bubbleSort([2, 1, 3])

describe('optionForStep', () => {
  it('uses 1-based positions in the id and label', () => {
    const step = steps[0]
    expect(step && optionForStep(step)).toEqual({
      id: 'compare:1,2',
      label: 'Compare positions 1 and 2',
    })
  })

  it('a compare and a swap of the same pair are different options', () => {
    const compare = steps[0]
    const swap = steps[1]
    expect(compare && optionForStep(compare)?.id).not.toBe(
      swap && optionForStep(swap)?.id,
    )
  })

  it('never asks about sorted steps', () => {
    const sorted = steps[3]
    expect(sorted?.type).toBe('sorted')
    expect(sorted && optionForStep(sorted)).toBeNull()
  })
})

describe.each(sortingAlgorithms)('predict options: $name', (algorithm) => {
  describe.each(['asc', 'desc'] as Order[])('%s', (order) => {
    describe.each(Object.entries(sortCases))('%s', (_name, input) => {
      const list = algorithm.run(input, { order })
      const cursors = list.flatMap((s, k) => (s.type === 'sorted' ? [] : [k]))

      it('always offers 3 options: exactly one correct, no duplicates', () => {
        for (const cursor of cursors) {
          const step = list[cursor]
          const correct = step ? optionForStep(step) : null
          const options = getPredictOptions(list, cursor)

          expect(correct).not.toBeNull()
          expect(options).toHaveLength(OPTION_COUNT)
          expect(new Set(options.map((o) => o.id)).size).toBe(OPTION_COUNT)
          expect(new Set(options.map((o) => o.label)).size).toBe(OPTION_COUNT)
          expect(options.filter((o) => o.id === correct?.id)).toHaveLength(1)
        }
      })

      it('is deterministic and puts the answer in slot cursor % 3', () => {
        for (const cursor of cursors) {
          const step = list[cursor]
          const correct = step ? optionForStep(step) : null
          const options = getPredictOptions(list, cursor)
          expect(getPredictOptions(list, cursor)).toEqual(options)
          expect(options[cursor % OPTION_COUNT]?.id).toBe(correct?.id)
        }
      })

      it('a perfect run wins with 3 stars and no mistakes', () => {
        let state = createPredictState(list)
        for (const move of perfectPredictMoves(list)) {
          expect(state.status).toBe('playing')
          state = predictReducer(state, move, list)
        }
        expect(state.status).toBe('won')
        expect(state.mistakes).toBe(0)
        expect(state.lives).toBe(3)
        expect(calculateStars(state.status, state.mistakes)).toBe(3)
      })
    })
  })
})

describe('getPredictPrompt', () => {
  it('asks what happens first, then what happens next', () => {
    expect(getPredictPrompt(steps, 0)?.question).toBe(
      'What does the algorithm do first?',
    )
    expect(getPredictPrompt(steps, 1)?.question).toBe(
      'What does the algorithm do next?',
    )
  })

  it('returns null for sorted steps and outside the list', () => {
    expect(getPredictPrompt(steps, 3)).toBeNull()
    expect(getPredictPrompt(steps, 99)).toBeNull()
  })
})

describe('createPredictState', () => {
  it('starts on the first step that is not a sorted step', () => {
    expect(createPredictState(steps)).toEqual({
      cursor: 0,
      lives: 3,
      score: 0,
      streak: 0,
      mistakes: 0,
      status: 'playing',
    })
    // Selection sort opens with a select step, which is asked.
    expect(createPredictState(selectionSort([3, 1, 2])).cursor).toBe(0)
    // Insertion sort opens with a sorted step, which is skipped.
    expect(createPredictState(insertionSort([3, 1, 2])).cursor).toBe(1)
  })

  it('accepts custom lives and is won when there is nothing to play', () => {
    expect(createPredictState(steps, 5).lives).toBe(5)
    expect(createPredictState([]).status).toBe('won')
  })
})

describe('predictReducer', () => {
  it('a correct answer advances, scores and skips sorted steps', () => {
    const start = createPredictState(steps)
    const one = play(start, steps, choose('compare:1,2'))
    expect(one.cursor).toBe(1)
    expect(one.score).toBe(10)
    expect(one.lastResult?.correct).toBe(true)

    const three = play(one, steps, choose('swap:1,2'), choose('compare:2,3'))
    expect(three.cursor).toBe(4) // step 3 is sorted, skipped
    expect(three.score).toBe(10 + 12 + 14)
    expect(three.streak).toBe(3)
  })

  it('wins after the last correct answer', () => {
    const end = play(
      createPredictState(steps),
      steps,
      choose('compare:1,2'),
      choose('swap:1,2'),
      choose('compare:2,3'),
      choose('compare:1,2'),
    )
    expect(end.status).toBe('won')
    expect(end.cursor).toBe(steps.length)
    expect(end.score).toBe(10 + 12 + 14 + 16)
  })

  it('a wrong answer costs a life, resets the streak and explains', () => {
    const start = play(createPredictState(steps), steps, choose('compare:1,2'))
    const next = play(start, steps, choose('compare:2,3'))
    expect(next.cursor).toBe(1)
    expect(next.lives).toBe(2)
    expect(next.mistakes).toBe(1)
    expect(next.streak).toBe(0)
    expect(next.score).toBe(10)
    expect(next.lastResult?.correct).toBe(false)
    expect(next.lastResult?.msg).toContain('Swap positions 1 and 2')
  })

  it('an unknown option id is a mistake', () => {
    const next = play(createPredictState(steps), steps, choose('nope'))
    expect(next.mistakes).toBe(1)
    expect(next.cursor).toBe(0)
  })

  it('sets lost when the last life is gone', () => {
    const lost = play(
      createPredictState(steps, 2),
      steps,
      choose('x'),
      choose('y'),
    )
    expect(lost.lives).toBe(0)
    expect(lost.status).toBe('lost')
  })

  it('ignores Be-the-algorithm moves and moves after the game ends', () => {
    const start = createPredictState(steps)
    expect(predictReducer(start, { type: 'keep' }, steps)).toBe(start)
    expect(
      predictReducer(start, { type: 'swap', indices: [0, 1] }, steps),
    ).toBe(start)

    const lost = play(createPredictState(steps, 1), steps, choose('x'))
    expect(predictReducer(lost, choose('compare:1,2'), steps)).toBe(lost)
  })

  it('never mutates the previous state', () => {
    const state = Object.freeze(createPredictState(steps))
    expect(() => predictReducer(state, choose('x'), steps)).not.toThrow()
    expect(state.lives).toBe(3)
  })
})
