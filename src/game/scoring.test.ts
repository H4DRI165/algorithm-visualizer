import { describe, expect, it } from 'vitest'
import { calculateStars, pointsForCorrect } from './scoring'

describe('pointsForCorrect', () => {
  it('adds a streak bonus of 2 per step', () => {
    expect(pointsForCorrect(0)).toBe(10)
    expect(pointsForCorrect(1)).toBe(12)
    expect(pointsForCorrect(2)).toBe(14)
  })

  it('caps the bonus at 10', () => {
    expect(pointsForCorrect(5)).toBe(20)
    expect(pointsForCorrect(6)).toBe(20)
    expect(pointsForCorrect(100)).toBe(20)
  })
})

describe('calculateStars', () => {
  it('gives 3 stars for no mistakes', () => {
    expect(calculateStars('won', 0)).toBe(3)
  })

  it('gives 2 stars for up to 2 mistakes', () => {
    expect(calculateStars('won', 1)).toBe(2)
    expect(calculateStars('won', 2)).toBe(2)
  })

  it('gives 1 star for finishing with more mistakes', () => {
    expect(calculateStars('won', 3)).toBe(1)
  })

  it('gives 0 stars when lost or unfinished', () => {
    expect(calculateStars('lost', 0)).toBe(0)
    expect(calculateStars('playing', 0)).toBe(0)
  })

  it('follows custom star rules', () => {
    const rules = { two: 5, three: 1 }
    expect(calculateStars('won', 1, rules)).toBe(3)
    expect(calculateStars('won', 5, rules)).toBe(2)
    expect(calculateStars('won', 6, rules)).toBe(1)
  })
})
