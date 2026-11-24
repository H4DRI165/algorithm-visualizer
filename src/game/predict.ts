import type { SortStep } from '../algorithms/types'
import { DEFAULT_LIVES, pointsForCorrect } from './scoring'
import type { GameState, Move } from './types'

export interface PredictOption {
  id: string
  label: string
}

export interface PredictPrompt {
  question: string
  options: PredictOption[]
}

export const OPTION_COUNT = 3

function pairOption(
  type: 'compare' | 'swap',
  a: number,
  b: number,
): PredictOption {
  const lo = Math.min(a, b) + 1
  const hi = Math.max(a, b) + 1
  const verb = type === 'compare' ? 'Compare' : 'Swap'
  return {
    id: `${type}:${lo},${hi}`,
    label: `${verb} positions ${lo} and ${hi}`,
  }
}

function selectOption(index: number): PredictOption {
  return { id: `select:${index + 1}`, label: `Select position ${index + 1}` }
}

function writeOption(index: number, value: number): PredictOption {
  return {
    id: `write:${index + 1}`,
    label: `Write ${value} at position ${index + 1}`,
  }
}

export function optionForStep(step: SortStep): PredictOption | null {
  switch (step.type) {
    case 'compare':
      return pairOption('compare', step.indices[0], step.indices[1])
    case 'swap':
      return pairOption('swap', step.indices[0], step.indices[1])
    case 'select':
      return selectOption(step.index)
    case 'write':
      return writeOption(step.index, step.value)
    case 'sorted':
      return null
  }
}

function skipToPredict(steps: readonly SortStep[], from: number): number {
  let i = from
  while (i < steps.length && steps[i]?.type === 'sorted') i++
  return i
}

function boardSize(steps: readonly SortStep[]): number {
  let max = -1
  for (const step of steps) {
    if (step.type === 'compare' || step.type === 'swap') {
      max = Math.max(max, step.indices[0], step.indices[1])
    } else {
      max = Math.max(max, step.index)
    }
  }
  return max + 1
}

function flipped(step: SortStep): PredictOption[] {
  if (step.type === 'compare') {
    return [pairOption('swap', step.indices[0], step.indices[1])]
  }
  if (step.type === 'swap') {
    return [pairOption('compare', step.indices[0], step.indices[1])]
  }
  return []
}

function shifted(step: SortStep, size: number): PredictOption[] {
  const out: PredictOption[] = []
  for (const d of [-1, 1]) {
    if (step.type === 'compare' || step.type === 'swap') {
      const lo = Math.min(step.indices[0], step.indices[1]) + d
      const hi = Math.max(step.indices[0], step.indices[1]) + d
      if (lo >= 0 && hi < size) out.push(pairOption(step.type, lo, hi))
    } else if (step.type === 'select') {
      const i = step.index + d
      if (i >= 0 && i < size) out.push(selectOption(i))
    }
  }
  return out
}

function candidates(
  steps: readonly SortStep[],
  cursor: number,
  size: number,
): PredictOption[] {
  const nearby = (k: number): PredictOption[] => {
    const step = steps[cursor + k]
    const option = step ? optionForStep(step) : null
    return option ? [option] : []
  }
  const current = steps[cursor]
  const pool: PredictOption[] = [
    ...nearby(1),
    ...(current ? flipped(current) : []),
    ...(current ? shifted(current, size) : []),
    ...nearby(-1),
    ...nearby(2),
  ]
  for (let i = 0; i < size - 1; i++) {
    pool.push(pairOption('compare', i, i + 1), pairOption('swap', i, i + 1))
  }
  for (let i = 0; i < size; i++) pool.push(selectOption(i))
  return pool
}

export function getPredictOptions(
  steps: readonly SortStep[],
  cursor: number,
): PredictOption[] {
  const current = steps[cursor]
  const correct = current ? optionForStep(current) : null
  if (!correct) return []

  const seen = new Set([correct.id])
  const distractors: PredictOption[] = []
  for (const option of candidates(steps, cursor, boardSize(steps))) {
    if (distractors.length >= OPTION_COUNT - 1) break
    if (seen.has(option.id)) continue
    seen.add(option.id)
    distractors.push(option)
  }

  const slot = Math.min(cursor % OPTION_COUNT, distractors.length)
  return [...distractors.slice(0, slot), correct, ...distractors.slice(slot)]
}

export function getPredictPrompt(
  steps: readonly SortStep[],
  cursor: number,
): PredictPrompt | null {
  const options = getPredictOptions(steps, cursor)
  if (options.length === 0) return null
  const first = cursor === skipToPredict(steps, 0)
  return {
    question: first
      ? 'What does the algorithm do first?'
      : 'What does the algorithm do next?',
    options,
  }
}

export function createPredictState(
  steps: readonly SortStep[],
  lives: number = DEFAULT_LIVES,
): GameState {
  const cursor = skipToPredict(steps, 0)
  return {
    cursor,
    lives,
    score: 0,
    streak: 0,
    mistakes: 0,
    status: cursor >= steps.length ? 'won' : 'playing',
  }
}

export function predictReducer(
  state: GameState,
  move: Move,
  steps: readonly SortStep[],
): GameState {
  if (state.status !== 'playing') return state
  if (move.type !== 'choose') return state

  const current = steps[state.cursor]
  const correct = current ? optionForStep(current) : null
  if (current === undefined || correct === null) return state

  if (move.optionId === correct.id) {
    const cursor = skipToPredict(steps, state.cursor + 1)
    return {
      ...state,
      cursor,
      score: state.score + pointsForCorrect(state.streak),
      streak: state.streak + 1,
      status: cursor >= steps.length ? 'won' : 'playing',
      lastResult: { correct: true, msg: `Correct! ${current.msg}` },
    }
  }

  const lives = state.lives - 1
  return {
    ...state,
    lives,
    mistakes: state.mistakes + 1,
    streak: 0,
    status: lives <= 0 ? 'lost' : 'playing',
    lastResult: {
      correct: false,
      msg: `Not quite. The next step is: ${correct.label}.`,
    },
  }
}

export function perfectPredictMoves(steps: readonly SortStep[]): Move[] {
  const moves: Move[] = []
  for (const step of steps) {
    const option = optionForStep(step)
    if (option) moves.push({ type: 'choose', optionId: option.id })
  }
  return moves
}
