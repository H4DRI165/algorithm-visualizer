import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BASE_INTERVAL_MS, usePlayback } from './usePlayback'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('usePlayback', () => {
  it('starts at the given position, clamped to the range', () => {
    expect(renderHook(() => usePlayback(5)).result.current.position).toBe(0)
    expect(renderHook(() => usePlayback(5, 3)).result.current.position).toBe(3)
    expect(renderHook(() => usePlayback(5, 99)).result.current.position).toBe(5)
  })

  it('next and prev stop at the first and last step', () => {
    const { result } = renderHook(() => usePlayback(2))
    act(() => result.current.prev())
    expect(result.current.position).toBe(0)
    expect(result.current.isAtStart).toBe(true)

    act(() => result.current.next())
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.position).toBe(2)
    expect(result.current.isAtEnd).toBe(true)
  })

  it('seek clamps and ignores invalid numbers', () => {
    const { result } = renderHook(() => usePlayback(5))
    act(() => result.current.seek(3))
    expect(result.current.position).toBe(3)
    act(() => result.current.seek(100))
    expect(result.current.position).toBe(5)
    act(() => result.current.seek(-4))
    expect(result.current.position).toBe(0)
    act(() => result.current.seek(2))
    act(() => result.current.seek(Number.NaN))
    expect(result.current.position).toBe(2)
  })

  it('reset goes back to the start', () => {
    const { result } = renderHook(() => usePlayback(5, 4))
    act(() => result.current.reset())
    expect(result.current.position).toBe(0)
  })

  it('plays one step per interval and stops at the end', () => {
    const { result } = renderHook(() => usePlayback(2))
    act(() => result.current.play())
    expect(result.current.isPlaying).toBe(true)

    tick(BASE_INTERVAL_MS)
    expect(result.current.position).toBe(1)
    tick(BASE_INTERVAL_MS)
    expect(result.current.position).toBe(2)
    expect(result.current.isPlaying).toBe(false)

    tick(BASE_INTERVAL_MS * 5)
    expect(result.current.position).toBe(2)
  })

  it('pause stops advancing', () => {
    const { result } = renderHook(() => usePlayback(5))
    act(() => result.current.play())
    tick(BASE_INTERVAL_MS)
    act(() => result.current.pause())
    tick(BASE_INTERVAL_MS * 3)
    expect(result.current.position).toBe(1)
    expect(result.current.isPlaying).toBe(false)
  })

  it('speed changes the interval', () => {
    const { result } = renderHook(() => usePlayback(5))
    act(() => result.current.setSpeed(4))
    act(() => result.current.play())

    tick(BASE_INTERVAL_MS / 4 - 1)
    expect(result.current.position).toBe(0)
    tick(1)
    expect(result.current.position).toBe(1)
  })

  it('stepping by hand pauses playback', () => {
    const { result } = renderHook(() => usePlayback(5))
    act(() => result.current.play())
    act(() => result.current.next())
    expect(result.current.isPlaying).toBe(false)
    tick(BASE_INTERVAL_MS * 3)
    expect(result.current.position).toBe(1)
  })

  it('play at the end starts again from the beginning', () => {
    const { result } = renderHook(() => usePlayback(3, 3))
    act(() => result.current.play())
    expect(result.current.position).toBe(0)
    expect(result.current.isPlaying).toBe(true)
  })

  it('does nothing when there are no steps', () => {
    const { result } = renderHook(() => usePlayback(0))
    act(() => result.current.play())
    expect(result.current.isPlaying).toBe(false)
  })
})
