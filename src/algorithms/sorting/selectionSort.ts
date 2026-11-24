import type { Order, SortStep } from '../types'
import { at, isOutOfOrder } from '../utils'

export function selectionSort(
  input: readonly number[],
  opts: { order: Order } = { order: 'asc' },
): SortStep[] {
  const { order } = opts
  const arr = [...input]
  const n = arr.length
  const steps: SortStep[] = []
  const extreme = order === 'asc' ? 'smallest' : 'largest'
  const comparative = order === 'asc' ? 'smaller' : 'larger'

  for (let i = 0; i < n - 1; i++) {
    let min = i
    steps.push({
      type: 'select',
      anchor: 'start',
      index: i,
      msg: `Start with ${at(arr, i)} as the ${extreme} so far`,
      ptr: { i, min },
      vars: { i, min },
    })

    for (let j = i + 1; j < n; j++) {
      const candidate = at(arr, j)
      const current = at(arr, min)
      steps.push({
        type: 'compare',
        anchor: 'compare',
        indices: [min, j],
        msg: `Compare ${candidate} with the ${extreme} so far (${current})`,
        keepMsg: `${candidate} is not ${comparative} than ${current}, so keep ${current} as the ${extreme}`,
        ptr: { min, j },
        vars: { i, j, min },
      })

      // The candidate wins when (current, candidate) is out of order.
      if (isOutOfOrder(current, candidate, order)) {
        min = j
        steps.push({
          type: 'select',
          anchor: 'select',
          index: j,
          msg: `${candidate} is ${comparative} than ${current}, so it is the new ${extreme}`,
          ptr: { min, j },
          vars: { i, j, min },
        })
      }
    }

    if (min !== i) {
      const a = at(arr, i)
      const b = at(arr, min)
      arr[i] = b
      arr[min] = a
      steps.push({
        type: 'swap',
        anchor: 'swap',
        indices: [i, min],
        msg: `Swap the ${extreme} (${b}) into position ${i + 1}`,
        ptr: { i, min },
        vars: { i, min },
      })
    }

    steps.push({
      type: 'sorted',
      anchor: 'sorted',
      index: i,
      msg: `${at(arr, i)} is now in its final place`,
      vars: { i },
    })
  }

  // The last box is in place once every other box is.
  if (n > 0) {
    steps.push({
      type: 'sorted',
      anchor: 'done',
      index: n - 1,
      msg: `${at(arr, n - 1)} is the last box, so it is in its final place`,
    })
  }

  return steps
}
