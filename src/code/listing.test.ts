import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from '../algorithms/registry'
import { sortCases } from '../algorithms/sorting/sortContract'
import type { Order } from '../algorithms/types'
import { LANGS, lineForAnchor, type Lang } from './listing'

const asc = (order: Order, a: string, b: string) => (order === 'asc' ? a : b)

type Expectations = Record<string, (order: Order) => Record<string, string>>

const expectations: Record<Lang, Expectations> = {
  ts: {
    'bubble-sort': (order) => ({
      compare: `arr[j] ${asc(order, '>', '<')} arr[j + 1]`,
      swap: '[arr[j], arr[j + 1]] =',
      sorted: 'final place',
    }),
    'selection-sort': (order) => ({
      start: 'let min = i',
      compare: `arr[j] ${asc(order, '<', '>')} arr[min]`,
      select: 'min = j',
      swap: '[arr[i], arr[min]] =',
      sorted: 'final place',
      done: 'return arr',
    }),
    'insertion-sort': (order) => ({
      start: 'for (let i = 1',
      compare: `arr[j - 1] ${asc(order, '>', '<')} arr[j]`,
      swap: '[arr[j - 1], arr[j]] =',
      sorted: 'is now sorted',
    }),
  },
  python: {
    'bubble-sort': (order) => ({
      compare: `if arr[j] ${asc(order, '>', '<')} arr[j + 1]:`,
      swap: 'arr[j], arr[j + 1] =',
      sorted: 'final place',
    }),
    'selection-sort': (order) => ({
      start: 'min = i',
      compare: `if arr[j] ${asc(order, '<', '>')} arr[min]:`,
      select: 'min = j',
      swap: 'arr[i], arr[min] =',
      sorted: 'final place',
      done: 'return arr',
    }),
    'insertion-sort': (order) => ({
      start: 'for i in range(1',
      compare: `arr[j - 1] ${asc(order, '>', '<')} arr[j]:`,
      swap: 'arr[j - 1], arr[j] =',
      sorted: 'is now sorted',
    }),
  },
  java: {
    'bubble-sort': (order) => ({
      compare: `if (arr[j] ${asc(order, '>', '<')} arr[j + 1])`,
      swap: 'int temp = arr[j];',
      sorted: 'final place',
    }),
    'selection-sort': (order) => ({
      start: 'int min = i;',
      compare: `if (arr[j] ${asc(order, '<', '>')} arr[min])`,
      select: 'min = j;',
      swap: 'int temp = arr[i];',
      sorted: 'final place',
      done: 'last box',
    }),
    'insertion-sort': (order) => ({
      start: 'for (int i = 1',
      compare: `arr[j - 1] ${asc(order, '>', '<')} arr[j]`,
      swap: 'int temp = arr[j];',
      sorted: 'is now sorted',
    }),
  },
}

const firstLine: Record<Lang, string> = {
  ts: 'function ',
  python: 'def ',
  java: 'static void ',
}

describe.each(sortingAlgorithms)('$name listing', (algorithm) => {
  it('defaults to TypeScript', () => {
    expect(algorithm.listing('asc')).toEqual(algorithm.listing('asc', 'ts'))
  })

  describe.each(LANGS.map((l) => l.id))('%s', (lang) => {
    describe.each(['asc', 'desc'] as Order[])('%s', (order) => {
      const listing = algorithm.listing(order, lang)

      it('is written in the right language', () => {
        expect(listing.lines[0]).toContain(firstLine[lang])
      })

      it('maps every anchor to a line inside the listing', () => {
        for (const line of Object.values(listing.anchors)) {
          expect(Number.isInteger(line)).toBe(true)
          expect(line).toBeGreaterThanOrEqual(1)
          expect(line).toBeLessThanOrEqual(listing.lines.length)
        }
      })

      it.each(Object.entries(sortCases))(
        'has an anchor for every step (%s)',
        (_name, input) => {
          for (const step of algorithm.run(input, { order })) {
            expect(lineForAnchor(listing, step.anchor)).toBeDefined()
          }
        },
      )

      it('points each anchor at the right code', () => {
        const expected = expectations[lang][algorithm.id]?.(order)
        expect(expected).toBeDefined()
        for (const [anchor, text] of Object.entries(expected ?? {})) {
          const n = lineForAnchor(listing, anchor)
          expect(n).toBeDefined()
          expect(listing.lines[(n ?? 1) - 1]).toContain(text)
        }
      })
    })
  })
})
