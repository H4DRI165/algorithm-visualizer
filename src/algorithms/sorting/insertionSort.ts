import type { Order, SortStep } from '../types'
import { at, isOutOfOrder } from '../utils'

export function insertionSort(
  input: readonly number[],
  opts: { order: Order } = { order: 'asc' },
): SortStep[] {
  const { order } = opts
  const arr = [...input]
  const n = arr.length
  const steps: SortStep[] = []
  const op = order === 'asc' ? '>' : '<'

  if (n > 0) {
    steps.push({
      type: 'sorted',
      anchor: 'start',
      index: 0,
      msg: `${at(arr, 0)} on its own is already a sorted list`,
      vars: { i: 0 },
    })
  }

  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0) {
      const a = at(arr, j - 1)
      const b = at(arr, j)
      steps.push({
        type: 'compare',
        anchor: 'compare',
        indices: [j - 1, j],
        msg: `Compare ${a} and ${b}`,
        keepMsg: `${b} is already in the right place, so keep it`,
        ptr: { 'j-1': j - 1, j },
        vars: { i, j },
      })

      if (!isOutOfOrder(a, b, order)) break

      arr[j - 1] = b
      arr[j] = a
      steps.push({
        type: 'swap',
        anchor: 'swap',
        indices: [j - 1, j],
        msg: `${a} ${op} ${b}, so swap them`,
        ptr: { 'j-1': j - 1, j },
        vars: { i, j },
      })
      j--
    }

    steps.push({
      type: 'sorted',
      anchor: 'sorted',
      index: i,
      msg: `The first ${i + 1} boxes are now in order`,
      vars: { i },
    })
  }

  return steps
}
