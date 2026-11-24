import { describe, expect, it } from 'vitest'
import { getSortingAlgorithm } from '../algorithms/registry'
import {
  beTheAlgorithmReducer,
  createInitialState,
} from '../game/beTheAlgorithm'
import { perfectMoves } from '../game/perfectRun'
import { calculateStars } from '../game/scoring'
import { BoxValuesSchema } from '../schemas/boxes'
import { LEVELS } from './levels'

describe('level data', () => {
  it('has unique ids', () => {
    const ids = LEVELS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('unlocks levels as a single chain, in list order', () => {
    LEVELS.forEach((level, i) => {
      expect(level.unlocks).toBe(LEVELS[i + 1]?.id)
    })
  })

  it('only uses the playable mode for now', () => {
    for (const level of LEVELS) {
      expect(level.mode).toBe('be-the-algorithm')
    }
  })
})

describe.each(LEVELS)('level $id', (level) => {
  it('has a valid input (3 to 10 values, 1 to 99)', () => {
    expect(BoxValuesSchema.safeParse(level.input).success).toBe(true)
  })

  it('uses a known algorithm', () => {
    expect(getSortingAlgorithm(level.algorithmId)).toBeDefined()
  })

  it('has sensible lives and star rules', () => {
    expect(Number.isInteger(level.lives)).toBe(true)
    expect(level.lives).toBeGreaterThanOrEqual(1)
    expect(level.stars.three).toBeGreaterThanOrEqual(0)
    expect(level.stars.three).toBeLessThanOrEqual(level.stars.two)
  })

  it('is solvable: following the steps exactly gives 3 stars', () => {
    const algorithm = getSortingAlgorithm(level.algorithmId)
    if (!algorithm) throw new Error('unknown algorithm')

    const steps = algorithm.run(level.input, { order: level.order })
    const moves = perfectMoves(steps)
    expect(moves.length).toBeGreaterThanOrEqual(3)

    let state = createInitialState(steps, level.lives)
    for (const move of moves) {
      expect(state.status).toBe('playing')
      state = beTheAlgorithmReducer(state, move, steps)
    }

    expect(state.status).toBe('won')
    expect(state.mistakes).toBe(0)
    expect(calculateStars(state.status, state.mistakes, level.stars)).toBe(3)
  })
})
