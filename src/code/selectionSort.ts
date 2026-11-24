import type { Order } from '../algorithms/types'
import type { CodeListing } from './listing'

export function getSelectionSortListing(order: Order): CodeListing {
  const op = order === 'asc' ? '<' : '>'
  return {
    lines: [
      'function selectionSort(arr: number[]): number[] {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    let min = i;',
      '    for (let j = i + 1; j < arr.length; j++) {',
      `      if (arr[j] ${op} arr[min]) {`,
      '        min = j;',
      '      }',
      '    }',
      '    if (min !== i) {',
      '      [arr[i], arr[min]] = [arr[min], arr[i]];',
      '    }',
      '    // arr[i] is now in its final place',
      '  }',
      '  return arr;',
      '}',
    ],
    anchors: {
      start: 3,
      compare: 5,
      select: 6,
      swap: 10,
      sorted: 12,
      done: 14,
    },
  }
}
