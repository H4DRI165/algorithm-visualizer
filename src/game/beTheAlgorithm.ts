import type { SortStep } from '../algorithms/types'
import { DEFAULT_LIVES, pointsForCorrect } from './scoring'
import type { GameState, Move } from './types'

export type ExpectedMove =
  | { type: 'keep'; msg?: string }
  | { type: 'swap'; indices: [number, number]; msg: string }
  | { type: 'select'; index: number; msg: string }

const DEFAULT_KEEP_MSG = 'This pair is already in order, so keep it'

function sameIndices(a: [number, number], b: [number, number]): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])
}

function skipToPrompt(steps: readonly SortStep[], from: number): number {
  let i = from
  while (i < steps.length) {
    const type = steps[i]?.type
    if (type === 'compare' || type === 'swap') break
    i++
  }
  return i
}

interface Resolved {
  expected: ExpectedMove
  consumed: number
}

function resolve(steps: readonly SortStep[], cursor: number): Resolved | null {
  const current = steps[cursor]
  if (current === undefined) return null

  if (current.type === 'swap') {
    return {
      expected: { type: 'swap', indices: current.indices, msg: current.msg },
      consumed: 1,
    }
  }
  if (current.type !== 'compare') return null

  const next = steps[cursor + 1]
  if (next?.type === 'swap' && sameIndices(next.indices, current.indices)) {
    return {
      expected: { type: 'swap', indices: next.indices, msg: next.msg },
      consumed: 2,
    }
  }
  if (next?.type === 'select') {
    return {
      expected: { type: 'select', index: next.index, msg: next.msg },
      consumed: 2,
    }
  }
  const keep: ExpectedMove =
    current.keepMsg === undefined
      ? { type: 'keep' }
      : { type: 'keep', msg: current.keepMsg }
  return { expected: keep, consumed: 1 }
}

export function getExpectedMove(
  steps: readonly SortStep[],
  cursor: number,
): ExpectedMove | null {
  return resolve(steps, cursor)?.expected ?? null
}

export function createInitialState(
  steps: readonly SortStep[],
  lives: number = DEFAULT_LIVES,
): GameState {
  const cursor = skipToPrompt(steps, 0)
  return {
    cursor,
    lives,
    score: 0,
    streak: 0,
    mistakes: 0,
    status: cursor >= steps.length ? 'won' : 'playing',
  }
}

function matches(move: Move, expected: ExpectedMove): boolean {
  switch (expected.type) {
    case 'keep':
      return move.type === 'keep'
    case 'swap':
      return move.type === 'swap' && sameIndices(move.indices, expected.indices)
    case 'select':
      return move.type === 'select' && move.index === expected.index
  }
}

function explain(expected: ExpectedMove): string {
  return expected.type === 'keep'
    ? (expected.msg ?? DEFAULT_KEEP_MSG)
    : expected.msg
}

export function beTheAlgorithmReducer(
  state: GameState,
  move: Move,
  steps: readonly SortStep[],
): GameState {
  if (state.status !== 'playing') return state
  if (move.type === 'choose') return state

  const resolved = resolve(steps, state.cursor)
  if (resolved === null) return state
  const { expected, consumed } = resolved

  if (matches(move, expected)) {
    const cursor = skipToPrompt(steps, state.cursor + consumed)
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
