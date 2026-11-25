import { describe, expect, it } from 'vitest'
import { getSortingAlgorithm } from '../algorithms/registry'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { BoxValuesSchema } from '../schemas/boxes'
import {
  ARCADE_ALGORITHM_IDS,
  MAX_ARCADE_SIZE,
  advanceRound,
  arcadeMove,
  arcadeSize,
  arcadeStatus,
  makeRound,
  presetsForRound,
  roundBonus,
  roundsCleared,
  startArcade,
  type ArcadeRound,
} from './arcade'
import { perfectMoves } from './perfectRun'
import type { Move } from './types'

function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const swap01: Move = { type: 'swap', indices: [0, 1] }
const keep: Move = { type: 'keep' }

// bubbleSort([2, 1, 3]): the perfect run is swap, keep, keep (10 + 12 + 14).
const round1: ArcadeRound = {
  number: 1,
  algorithmId: 'bubble-sort',
  order: 'asc',
  input: [2, 1, 3],
}
const steps1 = bubbleSort(round1.input)

describe('arcadeSize', () => {
  it('grows every two rounds and stops at 8', () => {
    expect([1, 2, 3, 4, 5, 6].map(arcadeSize)).toEqual([3, 3, 4, 4, 5, 5])
    expect(arcadeSize(11)).toBe(MAX_ARCADE_SIZE)
    expect(arcadeSize(99)).toBe(MAX_ARCADE_SIZE)
  })

  it('never goes below 3, even for a bad round number', () => {
    expect(arcadeSize(0)).toBe(3)
    expect(arcadeSize(-4)).toBe(3)
  })
})

describe('roundBonus and presetsForRound', () => {
  it('bonus is 10 times the round number', () => {
    expect(roundBonus(1)).toBe(10)
    expect(roundBonus(5)).toBe(50)
  })

  it('harder presets appear later', () => {
    expect(presetsForRound(1)).toEqual(['random'])
    expect(presetsForRound(3)).toContain('nearly-sorted')
    expect(presetsForRound(3)).not.toContain('reversed')
    expect(presetsForRound(5)).toContain('reversed')
  })
})

describe('makeRound', () => {
  it('always gives a valid, known, correctly sized round', () => {
    const rng = seeded(3)
    for (let n = 1; n <= 40; n++) {
      const round = makeRound(n, rng)
      expect(round.number).toBe(n)
      expect(ARCADE_ALGORITHM_IDS).toContain(round.algorithmId)
      expect(getSortingAlgorithm(round.algorithmId)).toBeDefined()
      expect(BoxValuesSchema.safeParse(round.input).success).toBe(true)
      expect(round.input).toHaveLength(arcadeSize(n))
    }
  })

  it('stays ascending in the first two rounds', () => {
    const rng = seeded(8)
    for (let k = 0; k < 20; k++) {
      expect(makeRound(1, rng).order).toBe('asc')
      expect(makeRound(2, rng).order).toBe('asc')
    }
  })

  it('is deterministic for the same seed', () => {
    expect(makeRound(6, seeded(42))).toEqual(makeRound(6, seeded(42)))
  })

  it('every generated round is solvable with a perfect run', () => {
    const rng = seeded(11)
    for (let n = 1; n <= 40; n++) {
      const round = makeRound(n, rng)
      const algorithm = getSortingAlgorithm(round.algorithmId)
      if (!algorithm) throw new Error('unknown algorithm')
      const steps = algorithm.run(round.input, { order: round.order })

      let state = startArcade(round, steps)
      for (const move of perfectMoves(steps)) {
        expect(arcadeStatus(state)).toBe('playing')
        state = arcadeMove(state, move, steps)
      }

      expect(arcadeStatus(state)).toBe('cleared')
      expect(state.game.mistakes).toBe(0)
      expect(state.game.lives).toBe(3)
    }
  })
})

describe('arcadeMove', () => {
  it('starts playing with full lives', () => {
    const state = startArcade(round1, steps1)
    expect(arcadeStatus(state)).toBe('playing')
    expect(state.game.lives).toBe(3)
    expect(state.bestStreak).toBe(0)
  })

  it('clearing the round adds the round bonus and a message', () => {
    let state = startArcade(round1, steps1)
    for (const move of [swap01, keep, keep]) {
      state = arcadeMove(state, move, steps1)
    }
    expect(arcadeStatus(state)).toBe('cleared')
    expect(state.game.score).toBe(10 + 12 + 14 + roundBonus(1))
    expect(state.game.lastResult?.msg).toContain('Round cleared! Bonus +10.')
    expect(roundsCleared(state)).toBe(1)
  })

  it('does not add the bonus before the last move', () => {
    const state = arcadeMove(startArcade(round1, steps1), swap01, steps1)
    expect(state.game.score).toBe(10)
  })

  it('a wrong move costs a life and keeps the best streak', () => {
    let state = startArcade(round1, steps1)
    state = arcadeMove(state, swap01, steps1)
    state = arcadeMove(state, swap01, steps1) // wrong: keep was expected
    expect(state.game.lives).toBe(2)
    expect(state.game.streak).toBe(0)
    expect(state.bestStreak).toBe(1)
  })

  it('ends the run when the last life is gone, then ignores moves', () => {
    let state = startArcade(round1, steps1)
    for (let i = 0; i < 3; i++) state = arcadeMove(state, keep, steps1)
    expect(arcadeStatus(state)).toBe('over')
    expect(roundsCleared(state)).toBe(0)
    expect(arcadeMove(state, swap01, steps1)).toBe(state)
  })

  it('never mutates the previous state', () => {
    const state = Object.freeze(startArcade(round1, steps1))
    expect(() => arcadeMove(state, keep, steps1)).not.toThrow()
    expect(state.game.lives).toBe(3)
  })
})

describe('advanceRound', () => {
  // bubbleSort([3, 1, 2]): swap, swap, keep.
  const round2: ArcadeRound = {
    number: 2,
    algorithmId: 'bubble-sort',
    order: 'asc',
    input: [3, 1, 2],
  }
  const steps2 = bubbleSort(round2.input)

  function clearedWithOneMistake() {
    let state = startArcade(round1, steps1)
    for (const move of [keep, swap01, keep, keep]) {
      state = arcadeMove(state, move, steps1)
    }
    return state
  }

  it('carries lives, score and streak into the next round', () => {
    const cleared = clearedWithOneMistake()
    expect(arcadeStatus(cleared)).toBe('cleared')

    const next = advanceRound(cleared, round2, steps2)
    expect(next.round).toBe(round2)
    expect(arcadeStatus(next)).toBe('playing')
    expect(next.game.lives).toBe(2)
    expect(next.game.score).toBe(10 + 12 + 14 + roundBonus(1))
    expect(next.game.streak).toBe(3)
    expect(next.game.mistakes).toBe(0)
    expect(next.game.cursor).toBe(0)
    expect(next.bestStreak).toBe(3)
  })

  it('does nothing unless the round was cleared', () => {
    const state = startArcade(round1, steps1)
    expect(advanceRound(state, round2, steps2)).toBe(state)
  })

  it('a lost run cannot continue', () => {
    let state = startArcade(round1, steps1)
    for (let i = 0; i < 3; i++) state = arcadeMove(state, keep, steps1)
    expect(advanceRound(state, round2, steps2)).toBe(state)
  })
})
