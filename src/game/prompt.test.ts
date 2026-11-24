import { describe, expect, it } from 'vitest'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import { selectionSort } from '../algorithms/sorting/selectionSort'
import { getFallbackHint, getPrompt } from './prompt'

// selectionSort([3, 1, 2]) steps:
// 0 select  1 compare[0,1]  2 select  3 compare[1,2]  4 swap[0,1]  5 sorted ...
const selection = selectionSort([3, 1, 2])
const bubble = bubbleSort([2, 1, 3])

describe('getPrompt', () => {
  it('asks "swap or keep" for swap-style compares', () => {
    const prompt = getPrompt(bubble, 0, 'swap', 'asc')
    expect(prompt?.question).toBe('Compare 2 and 1. Should these two swap?')
    expect(prompt?.options.map((o) => o.id)).toEqual(['swap', 'keep'])
    expect(prompt?.options[0]?.move).toEqual({
      type: 'swap',
      indices: [0, 1],
    })
  })

  it('asks "new smallest or keep" for selection compares', () => {
    const prompt = getPrompt(selection, 1, 'smallest', 'asc')
    expect(prompt?.question).toContain('new smallest')
    expect(prompt?.options.map((o) => o.id)).toEqual(['select', 'keep'])
    expect(prompt?.options[0]?.move).toEqual({ type: 'select', index: 1 })
  })

  it('says "largest" in descending order', () => {
    const steps = selectionSort([1, 3, 2], { order: 'desc' })
    const prompt = getPrompt(steps, 1, 'smallest', 'desc')
    expect(prompt?.question).toContain('new largest')
    expect(prompt?.options[0]?.label).toBe('New largest')
  })

  it('offers the same choices whatever the right answer is', () => {
    const first = getPrompt(selection, 1, 'smallest', 'asc')
    const second = getPrompt(selection, 3, 'smallest', 'asc')
    expect(first?.options.map((o) => o.id)).toEqual(
      second?.options.map((o) => o.id),
    )
  })

  it('a lone swap offers only the swap', () => {
    const prompt = getPrompt(selection, 4, 'smallest', 'asc')
    expect(prompt?.question).toBe('Swap the smallest (1) into position 1.')
    expect(prompt?.options.map((o) => o.id)).toEqual(['swap'])
    expect(prompt?.options[0]?.move).toEqual({
      type: 'swap',
      indices: [0, 1],
    })
  })

  it('returns null for steps that need no answer, or outside the list', () => {
    expect(getPrompt(selection, 0, 'smallest', 'asc')).toBeNull() // select
    expect(getPrompt(selection, 5, 'smallest', 'asc')).toBeNull() // sorted
    expect(getPrompt(selection, 99, 'smallest', 'asc')).toBeNull()
  })
})

describe('getFallbackHint', () => {
  it('follows the algorithm style and the order', () => {
    expect(getFallbackHint('swap', 'asc')).toContain('bigger')
    expect(getFallbackHint('swap', 'desc')).toContain('smaller')
    expect(getFallbackHint('smallest', 'asc')).toContain('smaller')
    expect(getFallbackHint('smallest', 'desc')).toContain('larger')
  })
})
