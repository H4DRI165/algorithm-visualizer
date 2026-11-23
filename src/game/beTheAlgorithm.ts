import type { SortStep } from '../algorithms/types'
import { DEFAULT_LIVES, pointsForCorrect } from './scoring'
import type { GameState, Move } from './types'

export type ExpectedMove =
  { type: 'keep' } | { type: 'swap'; indices: [number, number]; msg: string }

function skipToCompare(steps: readonly SortStep[], from: number): number {
  let i = from
  while (i < steps.length && steps[i]?.type !== 'compare') i++
  return i
}

export function getExpectedMove(
  steps: readonly SortStep[],
  cursor: number,
): ExpectedMove | null {
  const current = steps[cursor]
  if (current?.type !== 'compare') return null
  const next = steps[cursor + 1]
  if (next?.type === 'swap') {
    return { type: 'swap', indices: next.indices, msg: next.msg }
  }
  return { type: 'keep' }
}

export function createInitialState(
  steps: readonly SortStep[],
  lives: number = DEFAULT_LIVES,
): GameState {
  const cursor = skipToCompare(steps, 0)
  return {
    cursor,
    lives,
    score: 0,
    streak: 0,
    mistakes: 0,
    status: cursor >= steps.length ? 'won' : 'playing',
  }
}

function sameIndices(a: [number, number], b: [number, number]): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])
}

function matches(move: Move, expected: ExpectedMove): boolean {
  if (expected.type === 'keep') return move.type === 'keep'
  return move.type === 'swap' && sameIndices(move.indices, expected.indices)
}

function explain(expected: ExpectedMove): string {
  return expected.type === 'swap'
    ? expected.msg
    : 'This pair is already in order, so keep it'
}

export function beTheAlgorithmReducer(
  state: GameState,
  move: Move,
  steps: readonly SortStep[],
): GameState {
  if (state.status !== 'playing') return state
  if (move.type === 'choose') return state

  const expected = getExpectedMove(steps, state.cursor)
  if (expected === null) return state

  if (matches(move, expected)) {
    const consumed = expected.type === 'swap' ? 2 : 1
    const cursor = skipToCompare(steps, state.cursor + consumed)
    return {
      ...state,
      cursor,
      score: state.score + pointsForCorrect(state.streak),
      streak: state.streak + 1,
      status: cursor >= steps.length ? 'won' : 'playing',
      lastResult: { correct: true, msg: `Correct! ${explain(expected)}` },
    }
  }

  const lives = state.lives - 1
  return {
    ...state,
    lives,
    mistakes: state.mistakes + 1,
    streak: 0,
    status: lives <= 0 ? 'lost' : 'playing',
    lastResult: { correct: false, msg: `Not quite. ${explain(expected)}` },
  }
}
