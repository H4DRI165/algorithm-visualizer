import { beforeEach, describe, expect, it } from 'vitest'
import { ProgressSchema } from '../schemas/progress'
import { LEVELS } from './levels'
import {
  STORAGE_KEY,
  emptyProgress,
  getStars,
  isUnlocked,
  loadProgress,
  parseProgress,
  recordStars,
  saveProgress,
  totalStars,
} from './progress'

describe('ProgressSchema', () => {
  it('accepts the empty progress', () => {
    expect(ProgressSchema.safeParse(emptyProgress()).success).toBe(true)
  })

  it('rejects stars outside 0 to 3 and non-integers', () => {
    const base = emptyProgress()
    for (const bad of [4, -1, 1.5]) {
      expect(
        ProgressSchema.safeParse({ ...base, stars: { a: bad } }).success,
      ).toBe(false)
    }
  })
})

describe('parseProgress', () => {
  it('returns empty progress when nothing is saved', () => {
    expect(parseProgress(null)).toEqual(emptyProgress())
  })

  it('reads valid saved data', () => {
    const saved = { stars: { 'bubble-1': 2 }, bestArcadeScore: 5, badges: [] }
    expect(parseProgress(JSON.stringify(saved))).toEqual(saved)
  })

  it('resets on invalid JSON', () => {
    expect(parseProgress('{not json')).toEqual(emptyProgress())
  })

  it('resets on data of the wrong shape', () => {
    expect(parseProgress('"hello"')).toEqual(emptyProgress())
    expect(parseProgress('null')).toEqual(emptyProgress())
    expect(parseProgress(JSON.stringify({ stars: { a: 9 } }))).toEqual(
      emptyProgress(),
    )
  })
})

describe('recordStars and getStars', () => {
  it('records new stars without mutating the old progress', () => {
    const before = emptyProgress()
    const after = recordStars(before, 'bubble-1', 2)
    expect(getStars(after, 'bubble-1')).toBe(2)
    expect(before.stars).toEqual({})
  })

  it('keeps the best result', () => {
    const two = recordStars(emptyProgress(), 'bubble-1', 2)
    expect(recordStars(two, 'bubble-1', 1)).toBe(two)
    expect(getStars(recordStars(two, 'bubble-1', 3), 'bubble-1')).toBe(3)
  })

  it('ignores zero, invalid and out-of-range values safely', () => {
    const empty = emptyProgress()
    expect(recordStars(empty, 'a', 0)).toBe(empty)
    expect(recordStars(empty, 'a', Number.NaN)).toBe(empty)
    expect(getStars(recordStars(empty, 'a', 99), 'a')).toBe(3)
  })

  it('returns 0 for unknown ids, including inherited property names', () => {
    expect(getStars(emptyProgress(), 'nope')).toBe(0)
    expect(getStars(emptyProgress(), 'constructor')).toBe(0)
  })

  it('totals only known levels', () => {
    let progress = recordStars(emptyProgress(), 'bubble-1', 3)
    progress = recordStars(progress, 'bubble-2', 2)
    progress = recordStars(progress, 'not-a-level', 3)
    expect(totalStars(progress, LEVELS)).toBe(5)
  })
})

describe('isUnlocked', () => {
  it('opens the first level only at the start', () => {
    const progress = emptyProgress()
    expect(isUnlocked(LEVELS, progress, 'bubble-1')).toBe(true)
    expect(isUnlocked(LEVELS, progress, 'bubble-2')).toBe(false)
  })

  it('opens the next level after one star', () => {
    const progress = recordStars(emptyProgress(), 'bubble-1', 1)
    expect(isUnlocked(LEVELS, progress, 'bubble-2')).toBe(true)
    expect(isUnlocked(LEVELS, progress, 'bubble-3')).toBe(false)
  })

  it('treats unknown levels as locked', () => {
    expect(isUnlocked(LEVELS, emptyProgress(), 'nope')).toBe(false)
  })
})

describe('saving and loading', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips through localStorage', () => {
    const progress = recordStars(emptyProgress(), 'bubble-1', 3)
    saveProgress(progress)
    expect(loadProgress()).toEqual(progress)
  })

  it('starts empty when storage is empty', () => {
    expect(loadProgress()).toEqual(emptyProgress())
  })

  it('resets safely when the saved data is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{"stars": 42')
    expect(loadProgress()).toEqual(emptyProgress())
  })
})
