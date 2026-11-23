import type { Order, SortStep } from '../types'
import { at } from '../utils'

function isOutOfOrder(a: number, b: number, order: Order): boolean {
  return order === 'asc' ? a > b : a < b
}

export function bubbleSort(
  input: readonly number[],
  opts: { order: Order } = { order: 'asc' },
): SortStep[] {
  const arr = [...input]
  const n = arr.length
  const steps: SortStep[] = []

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const a = at(arr, j)
      const b = at(arr, j + 1)

      steps.push({
        type: 'compare',
        anchor: 'compare',
        indices: [j, j + 1],
        msg: `Compare ${a} and ${b}`,
        ptr: { j, 'j+1': j + 1 },
        vars: { i, j },
      })

      if (isOutOfOrder(a, b, opts.order)) {
        arr[j] = b
        arr[j + 1] = a
        steps.push({
          type: 'swap',
          anchor: 'swap',
          indices: [j, j + 1],
          msg: `${a} ${opts.order === 'asc' ? '>' : '<'} ${b}, so swap them`,
          ptr: { j, 'j+1': j + 1 },
          vars: { i, j },
        })
      }
    }

    // After pass i, the element at n - i - 1 is in its final place.
    const index = n - i - 1
    steps.push({
      type: 'sorted',
      anchor: 'sorted',
      index,
      msg: `${at(arr, index)} is now in its final place`,
      vars: { i },
    })
  }

  return steps
}
