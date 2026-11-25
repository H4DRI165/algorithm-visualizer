import { describe, expect, it } from 'vitest'
import { getSortingAlgorithm } from '../algorithms/registry'
import {
  beatReducer,
  countSwaps,
  createBeatState,
  extraSwaps,
  perfectBeatClicks,
} from '../game/beatTheAlgorithm'
import {
  beTheAlgorithmReducer,
  createInitialState,
} from '../game/beTheAlgorithm'
import { perfectMoves } from '../game/perfectRun'
import {
  createPredictState,
  perfectPredictMoves,
  predictReducer,
} from '../game/predict'
import {
  countWork,
  createRaceState,
  raceReducer,
  raceWinner,
} from '../game/race'
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

  it('only uses playable modes', () => {
    for (const level of LEVELS) {
      expect([
        'be-the-algorithm',
        'predict',
        'beat-the-algorithm',
        'race',
      ]).toContain(level.mode)
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

  it('race levels have a different, known rival (and only race levels)', () => {
    if (level.mode === 'race') {
      expect(level.rivalId).toBeDefined()
      expect(level.rivalId).not.toBe(level.algorithmId)
      expect(getSortingAlgorithm(level.rivalId ?? '')).toBeDefined()
    } else {
      expect(level.rivalId).toBeUndefined()
    }
  })

  it('has sensible lives and star rules', () => {
    expect(Number.isInteger(level.lives)).toBe(true)
    expect(level.lives).toBeGreaterThanOrEqual(1)
    expect(level.stars.three).toBeGreaterThanOrEqual(0)
    expect(level.stars.three).toBeLessThanOrEqual(level.stars.two)
  })

  it('is solvable: playing it perfectly gives 3 stars', () => {
    const algorithm = getSortingAlgorithm(level.algorithmId)
    if (!algorithm) throw new Error('unknown algorithm')

    const steps = algorithm.run(level.input, { order: level.order })

    if (level.mode === 'race') {
      const rival = getSortingAlgorithm(level.rivalId ?? '')
      if (!rival) throw new Error('unknown rival')
      const rivalSteps = rival.run(level.input, { order: level.order })

      // A race level always has a clear winner, never a tie.
      const winner = raceWinner(countWork(steps), countWork(rivalSteps))
      expect(winner).not.toBe('tie')

      const state = raceReducer(createRaceState(), winner, winner)
      expect(state.correct).toBe(true)
      expect(calculateStars('won', state.correct ? 0 : 1, level.stars)).toBe(3)
      return
    }

    if (level.mode === 'beat-the-algorithm') {
      const pairs = perfectBeatClicks(steps)
      expect(pairs.length).toBeGreaterThanOrEqual(3)

      let beat = createBeatState(level.input, level.order)
      for (const [a, b] of pairs) {
        expect(beat.status).toBe('playing')
        for (const index of [a, b]) {
          beat = beatReducer(beat, { type: 'pick', index }, level.order)
        }
      }

      expect(beat.status).toBe('won')
      const extra = extraSwaps(beat.swaps, countSwaps(steps))
      expect(calculateStars(beat.status, extra, level.stars)).toBe(3)
      return
    }

    const predict = level.mode === 'predict'
    const moves = predict ? perfectPredictMoves(steps) : perfectMoves(steps)
    expect(moves.length).toBeGreaterThanOrEqual(3)

    let state = predict
      ? createPredictState(steps, level.lives)
      : createInitialState(steps, level.lives)
    for (const move of moves) {
      expect(state.status).toBe('playing')
      state = predict
        ? predictReducer(state, move, steps)
        : beTheAlgorithmReducer(state, move, steps)
    }

    expect(state.status).toBe('won')
    expect(state.mistakes).toBe(0)
    expect(calculateStars(state.status, state.mistakes, level.stars)).toBe(3)
  })
})
