import { getBubbleSortListing } from '../code/bubbleSort'
import { getInsertionSortListing } from '../code/insertionSort'
import type { CodeListing } from '../code/listing'
import { getSelectionSortListing } from '../code/selectionSort'
import { bubbleSort } from './sorting/bubbleSort'
import { insertionSort } from './sorting/insertionSort'
import { selectionSort } from './sorting/selectionSort'
import type { AlgorithmDef, CompareStyle, Order, SortStep } from './types'

export interface SortingAlgorithm extends AlgorithmDef<
  readonly number[],
  SortStep
> {
  category: 'sorting'
  compareStyle: CompareStyle
  listing: (order: Order) => CodeListing
}

export const bubbleSortAlgorithm: SortingAlgorithm = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'sorting',
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
  compareStyle: 'swap',
  run: bubbleSort,
  listing: getBubbleSortListing,
}

export const selectionSortAlgorithm: SortingAlgorithm = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'sorting',
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
  compareStyle: 'smallest',
  run: selectionSort,
  listing: getSelectionSortListing,
}

export const insertionSortAlgorithm: SortingAlgorithm = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'sorting',
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
  compareStyle: 'swap',
  run: insertionSort,
  listing: getInsertionSortListing,
}

export const sortingAlgorithms: readonly SortingAlgorithm[] = [
  bubbleSortAlgorithm,
  selectionSortAlgorithm,
  insertionSortAlgorithm,
]

export function getSortingAlgorithm(id: string): SortingAlgorithm | undefined {
  return sortingAlgorithms.find((a) => a.id === id)
}
