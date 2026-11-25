import type { Order } from '../../algorithms/types'
import type { CodeListing } from '../listing'

export function getBubbleSortJavaListing(order: Order): CodeListing {
  const op = order === 'asc' ? '>' : '<'
  return {
    lines: [
      'static void bubbleSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n; i++) {',
      '        for (int j = 0; j < n - i - 1; j++) {',
      `            if (arr[j] ${op} arr[j + 1]) {`,
      '                int temp = arr[j];',
      '                arr[j] = arr[j + 1];',
      '                arr[j + 1] = temp;',
      '            }',
      '        }',
      '        // arr[n - i - 1] is now in its final place',
      '    }',
      '}',
    ],
    anchors: { compare: 5, swap: 6, sorted: 11 },
  }
}
