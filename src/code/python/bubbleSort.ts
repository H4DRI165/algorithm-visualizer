import type { Order } from '../../algorithms/types'
import type { CodeListing } from '../listing'

export function getBubbleSortPythonListing(order: Order): CodeListing {
  const op = order === 'asc' ? '>' : '<'
  return {
    lines: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n):',
      '        for j in range(n - i - 1):',
      `            if arr[j] ${op} arr[j + 1]:`,
      '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
      '        # arr[n - i - 1] is now in its final place',
      '    return arr',
    ],
    anchors: { compare: 5, swap: 6, sorted: 7 },
  }
}
