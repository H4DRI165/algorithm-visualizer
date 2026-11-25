import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from '../algorithms/registry'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { selectionSort } from '../algorithms/sorting/selectionSort'
import { sortCases } from '../algorithms/sorting/sortContract'
import type { Order } from '../algorithms/types'
import {
  RACE_STAR_RULES,
  countWork,
  createRaceState,
  positionForWork,
  raceMessage,
  raceReducer,
  raceWinner,
} from './race'
import { calculateStars } from './scoring'
import { getWatchView } from './watchView'

// bubbleSort([2, 1, 3]):
// 0 compare  1 swap  2 compare  3 sorted  4 compare  5 sorted  6 sorted
// Work steps are 0, 1, 2 and 4, so the total is 4 operations.
const steps = bubbleSort([2, 1, 3])

describe('countWork', () => {
  it('counts comparisons and swaps only', () => {
    expect(countWork(steps)).toBe(4)
    expect(countWork([])).toBe(0)
  })

  it('bubble and selection tie on [3, 1, 2]', () => {
    expect(countWork(bubbleSort([3, 1, 2]))).toBe(5)
    expect(countWork(selectionSort([3, 1, 2]))).toBe(5)
  })
})

describe('raceWinner', () => {
  it('fewer operations wins, equal is a tie', () => {
    expect(raceWinner(5, 10)).toBe('a')
    expect(raceWinner(10, 5)).toBe('b')
    expect(raceWinner(5, 5)).toBe('tie')
  })
})

describe('positionForWork', () => {
  it('maps operations to a number of steps', () => {
    expect(positionForWork(steps, 0)).toBe(0)
    expect(positionForWork(steps, 1)).toBe(1)
    expect(positionForWork(steps, 2)).toBe(2)
    expect(positionForWork(steps, 3)).toBe(3)
  })

  it('shows every step once all the work is done', () => {
    expect(positionForWork(steps, 4)).toBe(steps.length)
    expect(positionForWork(steps, 99)).toBe(steps.length)
  })

  it('treats zero or negative work as the start', () => {
    expect(positionForWork(steps, -3)).toBe(0)
  })
})

describe.each(sortingAlgorithms)('race positions: $name', (algorithm) => {
  describe.each(['asc', 'desc'] as Order[])('%s', (order) => {
    describe.each(Object.entries(sortCases))('%s', (_name, input) => {
      const list = algorithm.run(input, { order })
      const work = countWork(list)

      it('never goes backwards and stays in range', () => {
        let last = 0
        for (let w = 0; w <= work + 2; w++) {
          const position = positionForWork(list, w)
          expect(position).toBeGreaterThanOrEqual(last)
          expect(position).toBeLessThanOrEqual(list.length)
          last = position
        }
      })

      it('shows a sorted board when the work is done', () => {
        const view = getWatchView(input, list, positionForWork(list, work))
        const expected = [...input].sort((a, b) =>
          order === 'asc' ? a - b : b - a,
        )
        expect(view.values).toEqual(expected)
      })
    })
  })
})

describe('raceReducer', () => {
  it('a correct guess scores 10 and finishes the guessing', () => {
    const next = raceReducer(createRaceState(), 'a', 'a')
    expect(next).toEqual({
      guess: 'a',
      correct: true,
      score: 10,
      status: 'guessed',
    })
  })

  it('a wrong guess scores nothing', () => {
    const next = raceReducer(createRaceState(), 'b', 'a')
    expect(next.correct).toBe(false)
    expect(next.score).toBe(0)
    expect(next.status).toBe('guessed')
  })

  it('a tie can be the right answer', () => {
    expect(raceReducer(createRaceState(), 'tie', 'tie').correct).toBe(true)
  })

  it('ignores a second guess', () => {
    const first = raceReducer(createRaceState(), 'a', 'a')
    expect(raceReducer(first, 'b', 'a')).toBe(first)
  })

  it('never mutates the previous state', () => {
    const state = Object.freeze(createRaceState())
    expect(() => raceReducer(state, 'a', 'b')).not.toThrow()
    expect(state.guess).toBeNull()
  })
})

describe('race stars', () => {
  it('a right guess is 3 stars and a wrong one is 1', () => {
    expect(calculateStars('won', 0, RACE_STAR_RULES)).toBe(3)
    expect(calculateStars('won', 1, RACE_STAR_RULES)).toBe(1)
  })
})

describe('raceMessage', () => {
  it('names the winner and both operation counts', () => {
    expect(raceMessage('Bubble Sort', 'Insertion Sort', 11, 6, true)).toBe(
      'Correct! Insertion Sort wins with 6 operations against 11.',
    )
    expect(raceMessage('Bubble Sort', 'Insertion Sort', 6, 11, false)).toBe(
      'Not quite. Bubble Sort wins with 6 operations against 11.',
    )
  })

  it('describes a tie', () => {
    expect(raceMessage('A', 'B', 5, 5, true)).toBe(
      'Correct! It is a tie: both need 5 operations.',
    )
  })
})
