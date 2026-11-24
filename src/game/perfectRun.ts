import type { SortStep } from '../algorithms/types'
import type { Move } from './types'

function samePair(a: [number, number], b: [number, number]): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0])
}

export function perfectMoves(steps: readonly SortStep[]): Move[] {
  const moves: Move[] = []
  let k = 0
  while (k < steps.length) {
    const step = steps[k]
    const next = steps[k + 1]
    if (step?.type === 'swap') {
      moves.push({ type: 'swap', indices: step.indices })
      k += 1
    } else if (step?.type === 'compare') {
      if (next?.type === 'swap' && samePair(next.indices, step.indices)) {
        moves.push({ type: 'swap', indices: step.indices })
        k += 2
      } else if (next?.type === 'select') {
        moves.push({ type: 'select', index: next.index })
        k += 2
      } else {
        moves.push({ type: 'keep' })
        k += 1
      }
    } else {
      k += 1
    }
  }
  return moves
}
