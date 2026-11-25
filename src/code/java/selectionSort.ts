import type { Order } from '../../algorithms/types'
import type { CodeListing } from '../listing'

export function getSelectionSortJavaListing(order: Order): CodeListing {
  const op = order === 'asc' ? '<' : '>'
  return {
    lines: [
      'static void selectionSort(int[] arr) {',
      '    for (int i = 0; i < arr.length - 1; i++) {',
      '        int min = i;',
      '        for (int j = i + 1; j < arr.length; j++) {',
      `            if (arr[j] ${op} arr[min]) {`,
      '                min = j;',
      '            }',
      '        }',
      '        if (min != i) {',
      '            int temp = arr[i];',
      '            arr[i] = arr[min];',
      '            arr[min] = temp;',
      '        }',
      '        // arr[i] is now in its final place',
      '    }',
      '    // the last box is now in its final place',
      '}',
    ],
    anchors: {
      start: 3,
      compare: 5,
      select: 6,
      swap: 10,
      sorted: 14,
      done: 16,
    },
  }
}
