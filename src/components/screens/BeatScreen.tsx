import { useEffect, useState, type ReactNode } from 'react'
import {
  bubbleSortAlgorithm,
  type SortingAlgorithm,
} from '../../algorithms/registry'
import type { Order } from '../../algorithms/types'
import { resultMessage } from '../../game/beatTheAlgorithm'
import {
  DEFAULT_STAR_RULES,
  type StarRules,
  type Stars,
} from '../../game/scoring'
import { useBeatGame } from '../../hooks/useBeatGame'
import { PickBoard } from '../board/PickBoard'
import { Feedback } from '../game/Feedback'
import { WatchScreen } from './WatchScreen'
import { useListing } from '../../hooks/useListing'

interface BeatScreenProps {
  title: string
  input: readonly number[]
  order?: Order
  algorithm?: SortingAlgorithm
  starRules?: StarRules
  onComplete?: (result: { stars: Stars }) => void
  endActions?: ReactNode
}

export function BeatScreen({
  title,
  input,
  order = 'asc',
  algorithm = bubbleSortAlgorithm,
  starRules = DEFAULT_STAR_RULES,
  onComplete,
  endActions,
}: BeatScreenProps) {
  const game = useBeatGame(algorithm, input, order, starRules)
  const { state, stars } = game
  const playing = state.status === 'playing'
  const listing = useListing(algorithm, order)

  const { status } = state
  useEffect(() => {
    if (status === 'won') onComplete?.({ stars })
  }, [status, stars, onComplete])

  const [watching, setWatching] = useState(false)

  if (watching) {
    return (
      <WatchScreen
        title={`Watch: ${title}`}
        input={input}
        steps={game.steps}
        listing={listing}
        onClose={() => setWatching(false)}
        closeLabel="Back to game"
      />
    )
  }

  const direction =
    order === 'asc' ? 'smallest to largest' : 'largest to smallest'

  return (
    <section
      aria-label={title}
      className="flex w-full max-w-5xl flex-col gap-6"
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      <section
        aria-label="Game stats"
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm"
      >
        <span>
          Your swaps <strong>{state.swaps}</strong>
        </span>
        <span>
          {algorithm.name} swaps <strong>{game.algorithmSwaps}</strong>
        </span>
        <span>
          Extra swaps <strong>{game.extra}</strong>
        </span>
      </section>

      <p className="text-center text-slate-300">
        Sort the boxes from {direction}. Click one box, then another, to swap
        them. Use as few swaps as you can.
      </p>

      <PickBoard
        values={state.values}
        states={game.states}
        disabled={!playing}
        onPick={game.pick}
      />

      {playing ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={game.restart}
            className="rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400"
          >
            Start over
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-lg font-semibold">Level complete!</p>
          <span
            role="img"
            aria-label={`${stars} of 3 stars`}
            className="text-2xl text-amber-300"
          >
            {'★'.repeat(stars)}
            {'☆'.repeat(3 - stars)}
          </span>
          <div className="flex flex-wrap justify-center gap-3">
            {endActions}
            <button
              type="button"
              onClick={game.restart}
              className="rounded-lg border-2 border-sky-400 bg-sky-500/20 px-6 py-2 font-semibold hover:bg-sky-500/30 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400"
            >
              Play again
            </button>
            <button
              type="button"
              onClick={() => setWatching(true)}
              className="rounded-lg border-2 border-slate-500 px-6 py-2 font-semibold hover:bg-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400"
            >
              Watch the algorithm
            </button>
          </div>
        </div>
      )}

      <Feedback
        result={
          playing
            ? undefined
            : {
                correct: true,
                msg: resultMessage(state.swaps, game.algorithmSwaps),
              }
        }
        fallback={state.message}
      />
    </section>
  )
}
