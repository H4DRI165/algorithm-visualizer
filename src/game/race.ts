import type { SortStep } from '../algorithms/types'
import { pointsForCorrect, type StarRules } from './scoring'

export type RaceGuess = 'a' | 'b' | 'tie'

/** One right guess is 3 stars. A wrong guess counts as 1 mistake: 1 star. */
export const RACE_STAR_RULES: StarRules = { two: 0, three: 0 }

export interface RaceState {
  guess: RaceGuess | null
  correct: boolean
  score: number
  status: 'guessing' | 'guessed'
}

/** Operations = comparisons + swaps. Display-only steps do not count. */
export function countWork(steps: readonly SortStep[]): number {
  return steps.filter((s) => s.type === 'compare' || s.type === 'swap').length
}

export function raceWinner(workA: number, workB: number): RaceGuess {
  if (workA === workB) return 'tie'
  return workA < workB ? 'a' : 'b'
}

/**
 * How many steps to show after `work` operations. Reaching the total shows
 * every step, so trailing `sorted` steps appear when the algorithm finishes.
 */
export function positionForWork(
  steps: readonly SortStep[],
  work: number,
): number {
  if (work <= 0) return 0
  if (work >= countWork(steps)) return steps.length
  let seen = 0
  for (let k = 0; k < steps.length; k++) {
    const type = steps[k]?.type
    if (type === 'compare' || type === 'swap') seen++
    if (seen === work) return k + 1
  }
  return steps.length
}

export function createRaceState(): RaceState {
  return { guess: null, correct: false, score: 0, status: 'guessing' }
}

/** Only the first guess counts. Pure: no React, no side effects. */
export function raceReducer(
  state: RaceState,
  guess: RaceGuess,
  winner: RaceGuess,
): RaceState {
  if (state.status !== 'guessing') return state
  const correct = guess === winner
  return {
    guess,
    correct,
    score: state.score + (correct ? pointsForCorrect(0) : 0),
    status: 'guessed',
  }
}

export function raceMessage(
  nameA: string,
  nameB: string,
  workA: number,
  workB: number,
  correct: boolean,
): string {
  const prefix = correct ? 'Correct! ' : 'Not quite. '
  const winner = raceWinner(workA, workB)
  if (winner === 'tie') {
    return `${prefix}It is a tie: both need ${workA} operations.`
  }
  const [name, won, lost] =
    winner === 'a' ? [nameA, workA, workB] : [nameB, workB, workA]
  return `${prefix}${name} wins with ${won} operations against ${lost}.`
}
