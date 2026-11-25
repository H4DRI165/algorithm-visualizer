import { useMemo } from 'react'
import type { SortingAlgorithm } from '../algorithms/registry'
import type { Order } from '../algorithms/types'
import type { CodeListing } from '../code/listing'
import { useLanguage } from './useLanguage'

/** The listing of this algorithm in the language the player picked. */
export function useListing(
  algorithm: SortingAlgorithm,
  order: Order,
): CodeListing {
  const [lang] = useLanguage()
  return useMemo(() => algorithm.listing(order, lang), [algorithm, order, lang])
}
