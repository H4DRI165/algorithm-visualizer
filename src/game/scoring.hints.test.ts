import { describe, expect, it } from 'vitest'
import { createInitialState } from './beTheAlgorithm'
import { HINT_COST, chargeHint } from './scoring'
import type { GameState } from './types'

const base: GameState = createInitialState([])

describe('chargeHint', () => {
  it('takes the hint cost from the score', () => {
    const state: GameState = { ...base, status: 'playing', score: 20 }
    expect(chargeHint(state).score).toBe(20 - HINT_COST)
  })

  it('never takes the score below zero', () => {
    const state: GameState = { ...base, status: 'playing', score: 3 }
    expect(chargeHint(state).score).toBe(0)
  })

  it('does not touch lives, streak or mistakes', () => {
    const state: GameState = {
      ...base,
      status: 'playing',
      score: 20,
      streak: 4,
      mistakes: 1,
    }
    const next = chargeHint(state)
    expect(next.lives).toBe(state.lives)
    expect(next.streak).toBe(4)
    expect(next.mistakes).toBe(1)
  })

  it('is free once the game is over', () => {
    const won: GameState = { ...base, status: 'won', score: 20 }
    expect(chargeHint(won)).toBe(won)
  })
})
