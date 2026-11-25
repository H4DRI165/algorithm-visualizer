import { describe, expect, it } from 'vitest'
import { encodeShare, parseShareHash, type ShareState } from './share'

const state: ShareState = {
  algo: 'selection-sort',
  values: [42, 17, 68, 5],
  order: 'desc',
  mode: 'predict',
}

describe('share links', () => {
  it('encodes to a readable hash and round-trips', () => {
    const hash = encodeShare(state)
    expect(hash).toBe(
      '#algo=selection-sort&order=desc&mode=predict&values=42,17,68,5',
    )
    expect(parseShareHash(hash)).toEqual(state)
  })

  it('accepts a hash without the leading #', () => {
    expect(parseShareHash(encodeShare(state).slice(1))).toEqual(state)
  })

  it('accepts all three shareable modes', () => {
    for (const mode of [
      'be-the-algorithm',
      'predict',
      'beat-the-algorithm',
    ] as const) {
      expect(parseShareHash(encodeShare({ ...state, mode }))?.mode).toBe(mode)
    }
  })

  it.each([
    ['too few boxes', 'values=1,2'],
    ['too many boxes', 'values=1,2,3,4,5,6,7,8,9,10,11'],
    ['value too big', 'values=1,2,100'],
    ['value too small', 'values=0,2,3'],
    ['decimals', 'values=1.5,2,3'],
    ['letters', 'values=a,b,c'],
    ['empty entries', 'values=1,,3'],
    ['no values', ''],
  ])('rejects %s', (_name, values) => {
    const hash = `#algo=bubble-sort&order=asc&mode=predict&${values}`
    expect(parseShareHash(hash)).toBeNull()
  })

  it('rejects a bad order, a bad mode and missing parts', () => {
    const ok = 'values=3,1,2'
    expect(
      parseShareHash(`#algo=bubble-sort&order=up&mode=predict&${ok}`),
    ).toBeNull()
    expect(
      parseShareHash(`#algo=bubble-sort&order=asc&mode=race&${ok}`),
    ).toBeNull()
    expect(parseShareHash(`#order=asc&mode=predict&${ok}`)).toBeNull()
  })

  it('rejects empty, garbage and overlong hashes', () => {
    expect(parseShareHash('')).toBeNull()
    expect(parseShareHash('#')).toBeNull()
    expect(parseShareHash('#%%%')).toBeNull()
    expect(parseShareHash(`#${'a'.repeat(300)}`)).toBeNull()
  })
})
