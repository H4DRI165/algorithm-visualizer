import { useCallback } from 'react'
import { getSortingAlgorithm } from '../../algorithms/registry'
import type { LevelDef } from '../../levels/types'
import { BeatScreen } from './BeatScreen'
import { PlayScreen } from './PlayScreen'
import { PredictScreen } from './PredictScreen'

interface LevelScreenProps {
  level: LevelDef
  number: number
  nextLevel?: LevelDef
  onComplete: (levelId: string, stars: number) => void
  onSelectLevel: (levelId: string) => void
  onBack: () => void
}

export function LevelScreen({
  level,
  number,
  nextLevel,
  onComplete,
  onSelectLevel,
  onBack,
}: LevelScreenProps) {
  // Every game mode reports at least its stars.
  const handleComplete = useCallback(
    (result: { stars: number }) => onComplete(level.id, result.stars),
    [level.id, onComplete],
  )

  const algorithm = getSortingAlgorithm(level.algorithmId)
  if (!algorithm) {
    return <p role="alert">Unknown algorithm: {level.algorithmId}</p>
  }

  const gameProps = {
    title: `Level ${number}: ${level.title}`,
    algorithm,
    input: level.input,
    order: level.order,
    lives: level.lives,
    starRules: level.stars,
    onComplete: handleComplete,
    endActions: nextLevel && (
      <button
        type="button"
        onClick={() => onSelectLevel(nextLevel.id)}
        className="rounded-lg border-2 border-emerald-400 bg-emerald-500/20 px-6 py-2 font-semibold hover:bg-emerald-500/30 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400"
      >
        Next level
      </button>
    ),
  }

  let game
  if (level.mode === 'predict') {
    game = <PredictScreen {...gameProps} />
  } else if (level.mode === 'beat-the-algorithm') {
    game = <BeatScreen {...gameProps} />
  } else {
    game = <PlayScreen {...gameProps} />
  }

  return (
    <div className="flex w-full max-w-5xl flex-col items-start gap-4">
      <button
        type="button"
        onClick={onBack}
        className="rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400"
      >
        Back to map
      </button>
      {game}
    </div>
  )
}
