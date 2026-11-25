import type { Order } from '../algorithms/types'

export type Lang = 'ts' | 'python' | 'java'

export const DEFAULT_LANG: Lang = 'ts'

export const LANGS: readonly { id: Lang; label: string }[] = [
  { id: 'ts', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
]

export function isLang(value: unknown): value is Lang {
  return LANGS.some((l) => l.id === value)
}

export interface CodeListing {
  lines: string[]
  anchors: Record<string, number>
}

export type ListingBuilder = (order: Order) => CodeListing

/** Builds `listing(order, lang)` from one builder per language. */
export function listingByLang(builders: Record<Lang, ListingBuilder>) {
  return (order: Order, lang: Lang = DEFAULT_LANG): CodeListing =>
    builders[lang](order)
}

export function lineForAnchor(
  listing: CodeListing,
  anchor: string | undefined,
): number | undefined {
  return anchor === undefined ? undefined : listing.anchors[anchor]
}
