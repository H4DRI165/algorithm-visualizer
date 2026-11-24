import type { Order } from '../algorithms/types'
import type { CodeListing } from './listing'

export function getInsertionSortListing(order: Order): CodeListing {
  const op = order === 'asc' ? '>' : '<'
  return {
    lines: [
      'function insertionSort(arr: number[]): number[] {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let j = i;',
      `    while (j > 0 && arr[j - 1] ${op} arr[j]) {`,
      '      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];',
      '      j--;',
      '    }',
      '    // arr[0..i] is now sorted',
      '  }',
      '  return arr;',
      '}',
    ],
    anchors: { start: 2, compare: 4, swap: 5, sorted: 8 },
  }
}
