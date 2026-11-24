import type { Order, SortStep } from '../algorithms/types'
import { at, isOutOfOrder } from '../algorithms/utils'
import type { BoxState } from '../components/board/boxState'

export interface BeatState {
  values: number[]
  selected: number | null
  swaps: number
  status: 'playing' | 'won'
  message: string
}

export type BeatAction = { type: 'pick'; index: number }

export const START_MESSAGE = 'Click a box, then another box, to swap them.'

export function isSorted(values: readonly number[], order: Order): boolean {
  for (let i = 1; i < values.length; i++) {
    if (isOutOfOrder(at(values, i - 1), at(values, i), order)) return false
  }
  return true
}

export function createBeatState(
  input: readonly number[],
  order: Order,
): BeatState {
  const values = [...input]
  return {
    values,
    selected: null,
    swaps: 0,
    status: isSorted(values, order) ? 'won' : 'playing',
    message: START_MESSAGE,
  }
}

export function beatReducer(
  state: BeatState,
  action: BeatAction,
  order: Order,
): BeatState {
  if (state.status !== 'playing') return state

  const { index } = action
  if (!Number.isInteger(index) || index < 0 || index >= state.values.length) {
    return state
  }

  if (state.selected === null) {
    return {
      ...state,
      selected: index,
      message: `Box ${index + 1} picked. Now pick the box to swap it with.`,
    }
  }

  if (state.selected === index) {
    return { ...state, selected: null, message: START_MESSAGE }
  }

  const values = [...state.values]
  const a = at(values, state.selected)
  const b = at(values, index)
  values[state.selected] = b
  values[index] = a

  const sorted = isSorted(values, order)
  return {
    values,
    selected: null,
    swaps: state.swaps + 1,
    status: sorted ? 'won' : 'playing',
    message: sorted
      ? `Swapped ${a} and ${b}. Everything is in order!`
      : `Swapped ${a} and ${b}.`,
  }
}

/** The algorithm's swap count is the number to beat. */
export function countSwaps(steps: readonly SortStep[]): number {
  return steps.filter((s) => s.type === 'swap').length
}

/** Swaps beyond the algorithm's. Used like "mistakes" for the star rules. */
export function extraSwaps(swaps: number, algorithmSwaps: number): number {
  return Math.max(0, swaps - algorithmSwaps)
}

function plural(n: number): string {
  return `${n} swap${n === 1 ? '' : 's'}`
}

export function resultMessage(swaps: number, algorithmSwaps: number): string {
  const you = plural(swaps)
  const algo = plural(algorithmSwaps)
  if (swaps < algorithmSwaps) {
    return `You used ${you} and the algorithm needed ${algo}. You beat it!`
  }
  if (swaps === algorithmSwaps) {
    return `You used ${you}, the same as the algorithm. You matched it!`
  }
  return `You used ${you} and the algorithm needed ${algo}. Try again with fewer swaps.`
}

export function getBeatBoxStates(state: BeatState): BoxState[] {
  return state.values.map((_v, i): BoxState => {
    if (state.status === 'won') return 'sorted'
    return i === state.selected ? 'selected' : 'idle'
  })
}

export function perfectBeatClicks(
  steps: readonly SortStep[],
): [number, number][] {
  const pairs: [number, number][] = []
  for (const step of steps) {
    if (step.type === 'swap') pairs.push([step.indices[0], step.indices[1]])
  }
  return pairs
}
