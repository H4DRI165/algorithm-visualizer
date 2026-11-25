import type { Order, SortStep } from '../algorithms/types'
import { beTheAlgorithmReducer, createInitialState } from './beTheAlgorithm'
import { makePreset, type PresetId, type Rng } from './presets'
import { DEFAULT_LIVES } from './scoring'
import type { GameState, Move } from './types'

/** Algorithms that Arcade can pick from. Merge/quick/heap come later. */
export const ARCADE_ALGORITHM_IDS: readonly string[] = [
  'bubble-sort',
  'selection-sort',
  'insertion-sort',
]

export const MIN_ARCADE_SIZE = 3
export const MAX_ARCADE_SIZE = 8
export const ROUND_BONUS = 10

export interface ArcadeRound {
  /** 1-based round number. */
  number: number
  algorithmId: string
  order: Order
  input: number[]
}

export type ArcadeStatus = 'playing' | 'cleared' | 'over'

export interface ArcadeState {
  round: ArcadeRound
  /** Lives, score and streak here are for the whole run, not just the round. */
  game: GameState
  bestStreak: number
}

/** 3, 3, 4, 4, 5, 5, ... capped at 8 boxes. */
export function arcadeSize(round: number): number {
  const size = MIN_ARCADE_SIZE + Math.floor((Math.max(round, 1) - 1) / 2)
  return Math.min(size, MAX_ARCADE_SIZE)
}

export function presetsForRound(round: number): readonly PresetId[] {
  if (round <= 2) return ['random']
  if (round <= 4) return ['random', 'nearly-sorted', 'duplicates']
  return ['random', 'nearly-sorted', 'reversed', 'duplicates']
}

export function roundBonus(round: number): number {
  return ROUND_BONUS * Math.max(round, 1)
}

function pick<T>(items: readonly T[], rng: Rng): T {
  const index = Math.min(Math.floor(rng() * items.length), items.length - 1)
  const item = items[index]
  if (item === undefined) throw new RangeError('Cannot pick from an empty list')
  return item
}

export function makeRound(number: number, rng: Rng = Math.random): ArcadeRound {
  const algorithmId = pick(ARCADE_ALGORITHM_IDS, rng)
  const order: Order = number >= 3 ? pick(['asc', 'desc'] as const, rng) : 'asc'
  const preset = pick(presetsForRound(number), rng)
  const input = makePreset(preset, arcadeSize(number), order, rng)
  return { number, algorithmId, order, input }
}

export function startArcade(
  round: ArcadeRound,
  steps: readonly SortStep[],
  lives: number = DEFAULT_LIVES,
): ArcadeState {
  return { round, game: createInitialState(steps, lives), bestStreak: 0 }
}

export function arcadeStatus(state: ArcadeState): ArcadeStatus {
  if (state.game.status === 'won') return 'cleared'
  if (state.game.status === 'lost') return 'over'
  return 'playing'
}

export function roundsCleared(state: ArcadeState): number {
  return state.round.number - 1 + (state.game.status === 'won' ? 1 : 0)
}

/** Plays one move. Clearing the round adds the round bonus right away. */
export function arcadeMove(
  state: ArcadeState,
  move: Move,
  steps: readonly SortStep[],
): ArcadeState {
  const before = state.game
  let game = beTheAlgorithmReducer(before, move, steps)
  if (game === before) return state

  if (before.status === 'playing' && game.status === 'won') {
    const bonus = roundBonus(state.round.number)
    game = {
      ...game,
      score: game.score + bonus,
      lastResult: {
        correct: true,
        msg: `${game.lastResult?.msg ?? 'Correct!'} Round cleared! Bonus +${bonus}.`,
      },
    }
  }

  return {
    ...state,
    game,
    bestStreak: Math.max(state.bestStreak, game.streak),
  }
}

/** Starts the next round, keeping lives, score and streak. Only after a win. */
export function advanceRound(
  state: ArcadeState,
  round: ArcadeRound,
  steps: readonly SortStep[],
): ArcadeState {
  if (state.game.status !== 'won') return state
  return {
    ...state,
    round,
    game: {
      ...createInitialState(steps, state.game.lives),
      score: state.game.score,
      streak: state.game.streak,
    },
  }
}
