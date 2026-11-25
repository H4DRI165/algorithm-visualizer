import type { Order } from '../../algorithms/types'
import type { CodeListing } from '../listing'

export function getInsertionSortJavaListing(order: Order): CodeListing {
  const op = order === 'asc' ? '>' : '<'
  return {
    lines: [
      'static void insertionSort(int[] arr) {',
      '    for (int i = 1; i < arr.length; i++) {',
      '        int j = i;',
      `        while (j > 0 && arr[j - 1] ${op} arr[j]) {`,
      '            int temp = arr[j];',
      '            arr[j] = arr[j - 1];',
      '            arr[j - 1] = temp;',
      '            j--;',
      '        }',
      '        // arr[0..i] is now sorted',
      '    }',
      '}',
    ],
    anchors: { start: 2, compare: 4, swap: 5, sorted: 10 },
  }
}
