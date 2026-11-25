import { getSortingAlgorithm } from '../../algorithms/registry'
import type { ShareState } from '../../schemas/share'
import { BeatScreen } from './BeatScreen'
import { PlayScreen } from './PlayScreen'
import { PredictScreen } from './PredictScreen'

interface ChallengeScreenProps {
  share: ShareState
  onBack: () => void
}

export function ChallengeScreen({ share, onBack }: ChallengeScreenProps) {
  const algorithm = getSortingAlgorithm(share.algo)
  if (!algorithm) {
    return <p role="alert">Unknown algorithm: {share.algo}</p>
  }

  const props = {
    title: `Challenge: ${algorithm.name}`,
    algorithm,
    input: share.values,
    order: share.order,
  }

  let game
  if (share.mode === 'predict') game = <PredictScreen {...props} />
  else if (share.mode === 'beat-the-algorithm') game = <BeatScreen {...props} />
  else game = <PlayScreen {...props} />

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
