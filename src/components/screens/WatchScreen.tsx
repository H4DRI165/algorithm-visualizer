import { useEffect, useMemo } from 'react'
import type { SortStep } from '../../algorithms/types'
import { getWatchView } from '../../game/watchView'
import { isTypingTarget } from '../../hooks/keyboard'
import { SPEEDS, usePlayback } from '../../hooks/usePlayback'
import { Board } from '../board/Board'

interface WatchScreenProps {
  title: string
  input: readonly number[]
  steps: readonly SortStep[]
  startAt?: number
  onClose?: () => void
  closeLabel?: string
}

const buttonClass =
  'rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

export function WatchScreen({
  title,
  input,
  steps,
  startAt = 0,
  onClose,
  closeLabel = 'Close',
}: WatchScreenProps) {
  const playback = usePlayback(steps.length, startAt)
  const { position, total, isPlaying, toggle, next, prev } = playback

  const view = useMemo(
    () => getWatchView(input, steps, position),
    [input, steps, position],
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      if (e.key === ' ') {
        // A focused button already toggles itself on Space.
        if (e.target instanceof HTMLButtonElement) return
        e.preventDefault()
        toggle()
      } else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle, next, prev])

  return (
    <section
      aria-label={title}
      className="flex w-full max-w-2xl flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {onClose && (
          <button type="button" className={buttonClass} onClick={onClose}>
            {closeLabel}
          </button>
        )}
      </div>

      <Board values={view.values} states={view.states} />

      {/* Stay quiet for screen readers while auto-playing. */}
      <p
        aria-live={isPlaying ? 'off' : 'polite'}
        className="min-h-12 text-center text-slate-200"
      >
        {view.caption}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm">
        <span>{`Step ${position} of ${total}`}</span>
        <span>
          Comparisons <strong>{view.comparisons}</strong>
        </span>
        <span>
          Swaps <strong>{view.swaps}</strong>
        </span>
      </div>

      <input
        type="range"
        aria-label="Timeline"
        aria-valuetext={`Step ${position} of ${total}`}
        min={0}
        max={total}
        value={position}
        onChange={(e) => playback.seek(Number(e.target.value))}
        className="w-full accent-sky-400"
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className={buttonClass}
          onClick={playback.reset}
          disabled={playback.isAtStart}
        >
          Reset
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={prev}
          disabled={playback.isAtStart}
        >
          Back
        </button>
        <button
          type="button"
          className={`${buttonClass} border-sky-400 bg-sky-500/20`}
          onClick={toggle}
          disabled={total === 0}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={next}
          disabled={playback.isAtEnd}
        >
          Next
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          Speed
          <select
            value={String(playback.speed)}
            onChange={(e) => {
              const chosen = SPEEDS.find((s) => String(s) === e.target.value)
              if (chosen) playback.setSpeed(chosen)
            }}
            className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1 focus:outline-2 focus:outline-sky-400"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={String(s)}>
                {s}x
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-center text-xs text-slate-400">
        Keyboard: Space plays or pauses, arrow keys step.
      </p>
    </section>
  )
}
