import { describe, expect, it } from 'vitest'
import type { Progress } from '../schemas/progress'
import { BADGES, earnedBadgeIds } from './badges'
import { LEVELS } from './levels'
import { emptyProgress, recordArcadeScore, recordStars } from './progress'

function withStars(
  predicate: (id: string, mode: string) => boolean,
  stars: number,
): Progress {
  return LEVELS.reduce(
    (p, l) => (predicate(l.id, l.mode) ? recordStars(p, l.id, stars) : p),
    emptyProgress(),
  )
}

describe('badges', () => {
  it('has unique ids', () => {
    const ids = BADGES.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('a new player has none', () => {
    expect(earnedBadgeIds(emptyProgress(), LEVELS)).toEqual([])
  })

  it('one star earns First Win only', () => {
    const p = recordStars(emptyProgress(), 'bubble-1', 1)
    expect(earnedBadgeIds(p, LEVELS)).toEqual(['first-win'])
  })

  it('three stars on a level earns Perfect Run', () => {
    const p = recordStars(emptyProgress(), 'bubble-1', 3)
    expect(earnedBadgeIds(p, LEVELS)).toEqual(['first-win', 'perfect-run'])
  })

  it('finishing every Be the algorithm level earns All Sorts Complete', () => {
    const almost = withStars(
      (id, mode) => mode === 'be-the-algorithm' && id !== 'bubble-1',
      1,
    )
    expect(earnedBadgeIds(almost, LEVELS)).not.toContain('all-sorts')
    const all = withStars((_id, mode) => mode === 'be-the-algorithm', 1)
    expect(earnedBadgeIds(all, LEVELS)).toContain('all-sorts')
  })

  it('finishing every Predict level earns Mind Reader', () => {
    const all = withStars((_id, mode) => mode === 'predict', 1)
    expect(earnedBadgeIds(all, LEVELS)).toContain('mind-reader')
  })

  it('a correct race earns Race Winner, a wrong one does not', () => {
    const right = recordStars(emptyProgress(), 'race-1', 3)
    expect(earnedBadgeIds(right, LEVELS)).toContain('race-winner')
    const wrong = recordStars(emptyProgress(), 'race-1', 1)
    expect(earnedBadgeIds(wrong, LEVELS)).not.toContain('race-winner')
  })

  it('100 arcade points earns Arcade Hero', () => {
    expect(
      earnedBadgeIds(recordArcadeScore(emptyProgress(), 99), LEVELS),
    ).not.toContain('arcade-hero')
    expect(
      earnedBadgeIds(recordArcadeScore(emptyProgress(), 100), LEVELS),
    ).toContain('arcade-hero')
  })

  it('3 stars everywhere earns every level badge', () => {
    const p = recordArcadeScore(
      withStars(() => true, 3),
      500,
    )
    expect(earnedBadgeIds(p, LEVELS)).toEqual(BADGES.map((b) => b.id))
  })

  it('earns nothing when there are no levels', () => {
    expect(earnedBadgeIds(emptyProgress(), [])).toEqual([])
  })
})
