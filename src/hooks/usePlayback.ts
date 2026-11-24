import { useCallback, useEffect, useState } from 'react'

export const SPEEDS = [0.5, 1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

export const BASE_INTERVAL_MS = 800

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

export function usePlayback(total: number, startAt = 0) {
  const [raw, setRaw] = useState(startAt)
  const [wantsPlay, setWantsPlay] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)

  const position = clamp(raw, 0, total)
  const isPlaying = wantsPlay && position < total

  useEffect(() => {
    if (!isPlaying) return
    const id = setTimeout(() => setRaw(position + 1), BASE_INTERVAL_MS / speed)
    return () => clearTimeout(id)
  }, [isPlaying, position, speed])

  const pause = useCallback(() => setWantsPlay(false), [])

  const play = useCallback(() => {
    if (total === 0) return
    if (position >= total) setRaw(0) // replay from the start
    setWantsPlay(true)
  }, [position, total])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, pause, play])

  // Stepping by hand always pauses.
  const seek = useCallback(
    (n: number) => {
      setWantsPlay(false)
      if (Number.isFinite(n)) setRaw(clamp(Math.round(n), 0, total))
    },
    [total],
  )
  const next = useCallback(() => seek(position + 1), [seek, position])
  const prev = useCallback(() => seek(position - 1), [seek, position])
  const reset = useCallback(() => seek(0), [seek])

  return {
    position,
    total,
    isPlaying,
    speed,
    isAtStart: position === 0,
    isAtEnd: position >= total,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    seek,
    setSpeed,
  }
}
