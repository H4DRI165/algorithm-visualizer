import type { Order } from '../../algorithms/types'
import type { CodeListing } from '../listing'

export function getInsertionSortPythonListing(order: Order): CodeListing {
  const op = order === 'asc' ? '>' : '<'
  return {
    lines: [
      'def insertion_sort(arr):',
      '    for i in range(1, len(arr)):',
      '        j = i',
      `        while j > 0 and arr[j - 1] ${op} arr[j]:`,
      '            arr[j - 1], arr[j] = arr[j], arr[j - 1]',
      '            j -= 1',
      '        # arr[0..i] is now sorted',
      '    return arr',
    ],
    anchors: { start: 2, compare: 4, swap: 5, sorted: 7 },
  }
}
