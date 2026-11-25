import { useState } from 'react'
import { getSortingAlgorithm } from '../../algorithms/registry'
import { getStars, isUnlocked, totalStars } from '../../levels/progress'
import type { LevelDef } from '../../levels/types'
import type { Progress } from '../../schemas/progress'

interface LevelMapProps {
  levels: readonly LevelDef[]
  progress: Progress
  onSelect: (levelId: string) => void
  onPractice: () => void
  onResetProgress: () => void
}

const smallButton =
  'rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400'

export function LevelMap({
  levels,
  progress,
  onSelect,
  onPractice,
  onResetProgress,
}: LevelMapProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <section
      aria-label="Level map"
      className="flex w-full max-w-3xl flex-col gap-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Choose a level</h2>
        <p className="text-sm text-slate-300">
          Stars: <strong>{totalStars(progress, levels)}</strong> of{' '}
          {levels.length * 3}
        </p>
      </div>

      <p className="text-sm text-slate-400">
        Finish a level to unlock the next one. Fewer mistakes earn more stars.
      </p>

      <ol aria-label="Levels" className="grid gap-3 sm:grid-cols-2">
        {levels.map((level, i) => {
          const unlocked = isUnlocked(levels, progress, level.id)
          const stars = getStars(progress, level.id)
          const algorithmName =
            getSortingAlgorithm(level.algorithmId)?.name ?? level.algorithmId
          const rivalName = level.rivalId
            ? (getSortingAlgorithm(level.rivalId)?.name ?? level.rivalId)
            : undefined
          const matchup = rivalName
            ? `${algorithmName} vs ${rivalName}`
            : algorithmName
          return (
            <li key={level.id}>
              <button
                type="button"
                disabled={!unlocked}
                aria-label={`Level ${i + 1}: ${level.title}, ${
                  unlocked ? `${stars} of 3 stars` : 'locked'
                }`}
                onClick={() => onSelect(level.id)}
                className="flex w-full flex-col items-start gap-1 rounded-lg border-2 border-slate-600 bg-slate-800 p-4 text-left hover:bg-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-800"
              >
                <span aria-hidden="true" className="text-xs text-slate-400">
                  Level {i + 1}
                </span>
                <span aria-hidden="true" className="font-semibold">
                  {level.title}
                </span>
                <span aria-hidden="true" className="text-sm text-slate-300">
                  {matchup} ·{' '}
                  {level.order === 'asc' ? 'Ascending' : 'Descending'} ·{' '}
                  {level.input.length} boxes
                </span>
                <span aria-hidden="true" className="text-lg text-amber-300">
                  {unlocked ? (
                    <>
                      {'★'.repeat(stars)}
                      {'☆'.repeat(3 - stars)}
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">Locked</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={smallButton} onClick={onPractice}>
          Free practice
        </button>

        {confirming ? (
          <>
            <span className="text-sm text-slate-300">
              Erase all saved stars?
            </span>
            <button
              type="button"
              className={smallButton}
              onClick={() => {
                onResetProgress()
                setConfirming(false)
              }}
            >
              Yes, reset
            </button>
            <button
              type="button"
              className={smallButton}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className={smallButton}
            onClick={() => setConfirming(true)}
          >
            Reset progress
          </button>
        )}
      </div>
    </section>
  )
}
