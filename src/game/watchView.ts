import type { SortStep } from '../algorithms/types'
import type { BoxState } from '../components/board/boxState'
import type { BoardView } from './boardView'

export interface WatchView extends BoardView {
  caption: string
  comparisons: number
  swaps: number
}

export const START_CAPTION = 'Press Play or Next to start'

export function getWatchView(
  input: readonly number[],
  steps: readonly SortStep[],
  position: number,
): WatchView {
  const values = [...input]
  const states = input.map((): BoxState => 'idle')
  const end = Math.min(Math.max(position, 0), steps.length)
  let comparisons = 0
  let swaps = 0

  for (let k = 0; k < end; k++) {
    const step = steps[k]
    if (!step) continue
    switch (step.type) {
      case 'compare':
        comparisons++
        break
      case 'swap': {
        swaps++
        const [x, y] = step.indices
        const a = values[x]
        const b = values[y]
        if (a === undefined || b === undefined) break
        values[x] = b
        values[y] = a
        break
      }
      case 'write':
        values[step.index] = step.value
        break
      case 'sorted':
        states[step.index] = 'sorted'
        break
    }
  }

  const last = end > 0 ? steps[end - 1] : undefined
  if (last?.type === 'compare') {
    for (const i of last.indices) states[i] = 'comparing'
  } else if (last?.type === 'swap') {
    for (const i of last.indices) states[i] = 'swapping'
  }

  return {
    values,
    states,
    caption: last?.msg ?? START_CAPTION,
    comparisons,
    swaps,
  }
}
