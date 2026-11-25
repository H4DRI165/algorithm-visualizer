import { getBubbleSortListing } from '../code/bubbleSort'
import { getInsertionSortListing } from '../code/insertionSort'
import { getSelectionSortListing } from '../code/selectionSort'
import { listingByLang, type CodeListing, type Lang } from '../code/listing'
import { getBubbleSortJavaListing } from '../code/java/bubbleSort'
import { getInsertionSortJavaListing } from '../code/java/insertionSort'
import { getSelectionSortJavaListing } from '../code/java/selectionSort'
import { getBubbleSortPythonListing } from '../code/python/bubbleSort'
import { getInsertionSortPythonListing } from '../code/python/insertionSort'
import { getSelectionSortPythonListing } from '../code/python/selectionSort'

export interface SortingAlgorithm extends AlgorithmDef<
  readonly number[],
  SortStep
> {
  category: 'sorting'
  compareStyle: CompareStyle
  listing: (order: Order, lang?: Lang) => CodeListing
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
  listing: listingByLang({
    ts: getBubbleSortListing,
    python: getBubbleSortPythonListing,
    java: getBubbleSortJavaListing,
  }),
  explanation: {
    summary:
      'Bubble sort walks along the row again and again. Each time it looks at two neighbours and, if they are in the wrong order, makes them trade places. After every pass, the biggest box that is not yet sorted has bubbled up to its final place.',
    analogy:
      'Like bubbles rising in a fizzy drink: the biggest bubble reaches the top first, then the next one, and so on.',
    whenToUse:
      'Mostly for teaching. It is simple to follow, but slow on long lists.',
  },
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
  listing: listingByLang({
    ts: getSelectionSortListing,
    python: getSelectionSortPythonListing,
    java: getSelectionSortJavaListing,
  }),
  explanation: {
    summary:
      'Selection sort scans the part of the row that is not sorted yet and finds the smallest box. It moves that box into the first open place with one swap, then repeats for the next place.',
    analogy:
      'Like picking players for a team: you look at the whole group, choose the best one, put them first in line, then look at the rest again.',
    whenToUse:
      'Useful when moving items is expensive, because it makes at most one swap per pass. It always scans the whole unsorted part, so it stays slow on long lists, even nearly sorted ones.',
  },
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
  listing: listingByLang({
    ts: getInsertionSortListing,
    python: getInsertionSortPythonListing,
    java: getInsertionSortJavaListing,
  }),
  explanation: {
    summary:
      'Insertion sort grows a sorted group on the left. It takes the next box and slides it left, past every box that is out of order, until it fits.',
    analogy:
      'Like sorting playing cards in your hand: you pick up one card and slide it into the right spot among the cards you already hold.',
    whenToUse:
      'A good choice for short lists and for lists that are already nearly sorted, because then each box only moves a little.',
  },
}

export const sortingAlgorithms: readonly SortingAlgorithm[] = [
  bubbleSortAlgorithm,
  selectionSortAlgorithm,
  insertionSortAlgorithm,
]

export function getSortingAlgorithm(id: string): SortingAlgorithm | undefined {
  return sortingAlgorithms.find((a) => a.id === id)
}
