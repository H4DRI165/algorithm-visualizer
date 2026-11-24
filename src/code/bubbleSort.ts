import type { Order } from '../algorithms/types'
import type { CodeListing } from './listing'

export function getBubbleSortListing(order: Order): CodeListing {
  const op = order === 'asc' ? '>' : '<'
  return {
    lines: [
      'function bubbleSort(arr: number[]): number[] {',
      '  const n = arr.length;',
      '  for (let i = 0; i < n; i++) {',
      '    for (let j = 0; j < n - i - 1; j++) {',
      `      if (arr[j] ${op} arr[j + 1]) {`,
      '        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
      '      }',
      '    }',
      '    // arr[n - i - 1] is now in its final place',
      '  }',
      '  return arr;',
      '}',
    ],
    anchors: { compare: 5, swap: 6, sorted: 9 },
  }
}
