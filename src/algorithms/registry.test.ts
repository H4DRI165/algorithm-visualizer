import { describe, expect, it } from 'vitest'
import { getSortingAlgorithm, sortingAlgorithms } from './registry'
import { replay } from './sorting/sortContract'

describe('sorting registry', () => {
  it('has unique ids', () => {
    const ids = sortingAlgorithms.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('finds an algorithm by id, and returns undefined for unknown ids', () => {
    expect(getSortingAlgorithm('selection-sort')?.name).toBe('Selection Sort')
    expect(getSortingAlgorithm('nope')).toBeUndefined()
  })

  it.each(sortingAlgorithms)('$name sorts through run()', (algorithm) => {
    const input = [42, 17, 68, 5, 91, 30]
    const steps = algorithm.run(input, { order: 'desc' })
    expect(replay(input, steps)).toEqual([91, 68, 42, 30, 17, 5])
  })
})
