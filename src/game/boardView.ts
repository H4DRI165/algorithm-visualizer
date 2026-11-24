import type { SortStep } from '../algorithms/types'
import type { BoxState } from '../components/board/boxState'

export interface BoardView {
  values: number[]
  states: BoxState[]
}

export function getBoardView(
  input: readonly number[],
  steps: readonly SortStep[],
  cursor: number,
): BoardView {
  const values = [...input]
  const states = input.map((): BoxState => 'idle')
  const end = Math.min(cursor, steps.length)
  let min: number | undefined

  for (let k = 0; k < end; k++) {
    const step = steps[k]
    if (!step) continue
    if (step.type === 'swap') {
      const [x, y] = step.indices
      const a = values[x]
      const b = values[y]
      if (a === undefined || b === undefined) continue
      values[x] = b
      values[y] = a
    } else if (step.type === 'select') {
      min = step.index
    } else if (step.type === 'sorted') {
      states[step.index] = 'sorted'
      min = undefined
    }
  }

  if (min !== undefined && states[min] === 'idle') states[min] = 'selected'

  const current = steps[cursor]
  if (current?.type === 'compare') {
    for (const i of current.indices) states[i] = 'comparing'
    if (min !== undefined && current.indices.includes(min)) {
      states[min] = 'selected'
    }
  } else if (current?.type === 'swap') {
    for (const i of current.indices) states[i] = 'swapping'
  }

  return { values, states }
}
