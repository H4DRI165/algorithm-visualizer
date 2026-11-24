import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { STORAGE_KEY } from '../levels/progress'
import { useProgress } from './useProgress'

function stored(): unknown {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
}

describe('useProgress', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.stars).toEqual({})
  })

  it('loads saved progress', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stars: { 'bubble-1': 3 },
        bestArcadeScore: 0,
        badges: [],
      }),
    )
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.stars).toEqual({ 'bubble-1': 3 })
  })

  it('records stars and saves them', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.record('bubble-1', 2))
    expect(result.current.progress.stars).toEqual({ 'bubble-1': 2 })
    expect(stored()).toMatchObject({ stars: { 'bubble-1': 2 } })
  })

  it('reset clears the stars and the saved data', () => {
    const { result } = renderHook(() => useProgress())
    act(() => result.current.record('bubble-1', 2))
    act(() => result.current.reset())
    expect(result.current.progress.stars).toEqual({})
    expect(stored()).toMatchObject({ stars: {} })
  })

  it('starts empty when the saved data is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, 'not json at all')
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.stars).toEqual({})
  })
})
