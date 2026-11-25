import type { Order } from '../../algorithms/types'
import type { CodeListing } from '../listing'

export function getSelectionSortPythonListing(order: Order): CodeListing {
  const op = order === 'asc' ? '<' : '>'
  return {
    lines: [
      'def selection_sort(arr):',
      '    for i in range(len(arr) - 1):',
      '        min = i',
      '        for j in range(i + 1, len(arr)):',
      `            if arr[j] ${op} arr[min]:`,
      '                min = j',
      '        if min != i:',
      '            arr[i], arr[min] = arr[min], arr[i]',
      '        # arr[i] is now in its final place',
      '    return arr',
    ],
    anchors: { start: 3, compare: 5, select: 6, swap: 8, sorted: 9, done: 10 },
  }
}
