import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VALUES,
  MAX_VALUE,
  MIN_VALUE,
  parseBoxText,
  parseBoxValues,
  randomBoxValue,
} from './boxes'

describe('parseBoxValues', () => {
  it('accepts valid arrays at the size limits', () => {
    expect(parseBoxValues([1, 2, 3])).toEqual([1, 2, 3])
    const ten = [1, 2, 3, 4, 5, 6, 7, 8, 9, 99]
    expect(parseBoxValues(ten)).toEqual(ten)
  })

  it('falls back to defaults for bad input', () => {
    const fallback = [...DEFAULT_VALUES]
    expect(parseBoxValues([1, 2])).toEqual(fallback) // too few
    expect(parseBoxValues(Array(11).fill(5))).toEqual(fallback) // too many
    expect(parseBoxValues([1, 2, 100])).toEqual(fallback) // too big
    expect(parseBoxValues([0, 2, 3])).toEqual(fallback) // too small
    expect(parseBoxValues([1, 2.5, 3])).toEqual(fallback) // not an integer
    expect(parseBoxValues('hello')).toEqual(fallback) // not an array
    expect(parseBoxValues(null)).toEqual(fallback)
  })
})

describe('parseBoxText', () => {
  it('accepts whole numbers from 1 to 99', () => {
    expect(parseBoxText('1')).toEqual({ ok: true, value: 1 })
    expect(parseBoxText(' 42 ')).toEqual({ ok: true, value: 42 })
    expect(parseBoxText('99')).toEqual({ ok: true, value: 99 })
  })

  it('rejects out-of-range numbers', () => {
    expect(parseBoxText('0').ok).toBe(false)
    expect(parseBoxText('100').ok).toBe(false)
  })

  it('rejects text, decimals, negatives and empty input', () => {
    for (const text of ['', 'abc', '1.5', '-3', '4e1']) {
      expect(parseBoxText(text).ok).toBe(false)
    }
  })
})

describe('randomBoxValue', () => {
  it('always returns an integer in range', () => {
    for (let i = 0; i < 500; i++) {
      const v = randomBoxValue()
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(MIN_VALUE)
      expect(v).toBeLessThanOrEqual(MAX_VALUE)
    }
  })
})
