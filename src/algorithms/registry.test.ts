import { describe, expect, it } from 'vitest'
import { sortingAlgorithms } from './registry'

describe.each(sortingAlgorithms)('explanation: $name', ({ explanation }) => {
  it('has a summary, an analogy and a when-to-use text', () => {
    for (const text of [
      explanation.summary,
      explanation.analogy,
      explanation.whenToUse,
    ]) {
      expect(text.trim().length).toBeGreaterThan(20)
    }
  })

  it('is general and never points at a position in a puzzle', () => {
    const all = Object.values(explanation).join(' ')
    expect(all).not.toMatch(/position \d|box \d/i)
  })
})
