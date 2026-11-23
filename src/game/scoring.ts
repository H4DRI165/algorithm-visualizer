import type { GameState } from './types'

export const DEFAULT_LIVES = 3
export const POINTS_PER_CORRECT = 10
export const STREAK_BONUS_STEP = 2
export const STREAK_BONUS_CAP = 10

/** Max mistakes allowed for each star rating. */
export interface StarRules {
  two: number
  three: number
}

export const DEFAULT_STAR_RULES: StarRules = { two: 2, three: 0 }

export type Stars = 0 | 1 | 2 | 3

/**
 * Points for a correct move. `streakBefore` is the streak before this move,
 * so the first correct answer has no bonus: 10, 12, 14, ... capped at 20.
 */
export function pointsForCorrect(streakBefore: number): number {
  const bonus = Math.min(streakBefore * STREAK_BONUS_STEP, STREAK_BONUS_CAP)
  return POINTS_PER_CORRECT + bonus
}

/** 0 stars if the level was lost or is unfinished, otherwise 1 to 3. */
export function calculateStars(
  status: GameState['status'],
  mistakes: number,
  rules: StarRules = DEFAULT_STAR_RULES,
): Stars {
  if (status !== 'won') return 0
  if (mistakes <= rules.three) return 3
  if (mistakes <= rules.two) return 2
  return 1
}
