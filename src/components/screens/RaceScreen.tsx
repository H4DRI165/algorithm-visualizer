import { useEffect, type ReactNode } from 'react'
import {
  bubbleSortAlgorithm,
  selectionSortAlgorithm,
  type SortingAlgorithm,
} from '../../algorithms/registry'
import type { Order } from '../../algorithms/types'
import { RACE_STAR_RULES, raceMessage, type RaceGuess } from '../../game/race'
import { calculateStars, type StarRules, type Stars } from '../../game/scoring'
import { isTypingTarget } from '../../hooks/keyboard'
import { useRaceGame } from '../../hooks/useRaceGame'
import { Feedback } from '../game/Feedback'
import { RacePanel } from '../game/RacePanel'

interface RaceScreenProps {
  title: string
  input: readonly number[]
  order?: Order
  algorithm?: SortingAlgorithm
  rival?: SortingAlgorithm
  starRules?: StarRules
  onComplete?: (result: { stars: Stars }) => void
  endActions?: ReactNode
}

const buttonClass =
  'rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400'

const choiceClass =
  'flex items-center justify-center gap-2 rounded-lg border-2 border-sky-400 bg-sky-500/20 px-4 py-3 font-semibold hover:bg-sky-500/30 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400'

export function RaceScreen({
  title,
  input,
  order = 'asc',
  algorithm = bubbleSortAlgorithm,
  rival = selectionSortAlgorithm,
  starRules = RACE_STAR_RULES,
  onComplete,
  endActions,
}: RaceScreenProps) {
  const game = useRaceGame(algorithm, rival, input, order)
  const { state, playback, guessed, finished, guess } = game

  const stars = calculateStars(
    finished ? 'won' : 'playing',
    state.correct ? 0 : 1,
    starRules,
  )

  useEffect(() => {
    if (finished) onComplete?.({ stars })
  }, [finished, stars, onComplete])

  const choices: { id: RaceGuess; label: string }[] = [
    { id: 'a', label: `${algorithm.name} wins` },
    { id: 'b', label: `${rival.name} wins` },
    { id: 'tie', label: 'Tie' },
  ]

  useEffect(() => {
    if (guessed) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const choice = choices[Number(e.key) - 1]
      if (choice) guess(choice.id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // `choices` is rebuilt each render from the same values, so list the inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessed, guess, algorithm.name, rival.name])

  const predicted = choices.find((c) => c.id === state.guess)?.label

  let fallback = 'Pick the algorithm you think needs fewer operations.'
  if (guessed) fallback = 'Watching the race...'

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
          Score <strong>{state.score}</strong>
        </span>
        <span>
          Your guess <strong>{predicted ?? 'not yet'}</strong>
        </span>
        <span>{`Operation ${playback.position} of ${playback.total}`}</span>
      </section>

      <p className="text-center text-slate-300">
        Both algorithms sort the same boxes at the same speed. Which one needs
        fewer operations (comparisons + swaps)?
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <RacePanel
          name={algorithm.name}
          view={game.viewA}
          finished={game.doneA}
        />
        <RacePanel name={rival.name} view={game.viewB} finished={game.doneB} />
      </div>

      {!guessed && (
        <div className="grid gap-3 sm:grid-cols-3">
          {choices.map((choice, i) => (
            <button
              key={choice.id}
              type="button"
              aria-keyshortcuts={String(i + 1)}
              onClick={() => guess(choice.id)}
              className={choiceClass}
            >
              {choice.label}
              <kbd aria-hidden="true" className="text-xs opacity-70">
                {i + 1}
              </kbd>
            </button>
          ))}
        </div>
      )}

      {guessed && !finished && (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={playback.toggle}
          >
            {playback.isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className={buttonClass}
            onClick={() => playback.seek(playback.total)}
          >
            Skip to result
          </button>
        </div>
      )}

      {finished && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-lg font-semibold">Race finished!</p>
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
          </div>
        </div>
      )}

      <Feedback
        result={
          finished
            ? {
                correct: state.correct,
                msg: raceMessage(
                  algorithm.name,
                  rival.name,
                  game.workA,
                  game.workB,
                  state.correct,
                ),
              }
            : undefined
        }
        fallback={fallback}
      />
    </section>
  )
}
