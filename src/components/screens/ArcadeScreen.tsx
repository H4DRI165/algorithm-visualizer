import { useEffect, useState } from 'react'
import { roundBonus, type ArcadeRound } from '../../game/arcade'
import type { Rng } from '../../game/presets'
import { DEFAULT_LIVES } from '../../game/scoring'
import { isTypingTarget } from '../../hooks/keyboard'
import { useArcadeGame } from '../../hooks/useArcadeGame'
import { Board } from '../board/Board'
import { CodeView } from '../code/CodeView'
import { Feedback } from '../game/Feedback'
import { PlayControls } from '../game/PlayControls'
import { SplitLayout } from '../layout/SplitLayout'
import { useGameSounds } from '../../hooks/useGameSounds'
import { useListing } from '../../hooks/useListing'

interface ArcadeScreenProps {
  /** Best score saved so far. */
  bestScore: number
  /** Called once when the run ends. The parent saves the best score. */
  onGameOver: (score: number) => void
  onBack: () => void
  rng?: Rng
  /** Lets tests start from a known round. */
  firstRound?: ArcadeRound
}

const buttonClass =
  'rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400'

const primaryClass =
  'rounded-lg border-2 border-sky-400 bg-sky-500/20 px-6 py-2 font-semibold hover:bg-sky-500/30 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400'

export function ArcadeScreen({
  bestScore,
  onGameOver,
  onBack,
  rng = Math.random,
  firstRound,
}: ArcadeScreenProps) {
  const game = useArcadeGame(rng, firstRound)
  const { state, round, algorithm, status, prompt, play } = game
  const run = state.game
  useGameSounds(run.lastResult, run.status)
  //const playing = status === 'playing'
  const options = prompt?.options
  const listing = useListing(algorithm, round.order) // ArcadeScreen only

  // The saved best changes the moment the run ends, so remember the old one.
  const [baseline, setBaseline] = useState(bestScore)

  const { score } = run
  useEffect(() => {
    if (status === 'over') onGameOver(score)
  }, [status, score, onGameOver])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const key = e.key.toLowerCase()
      const option = options?.find((o) => o.shortcut.toLowerCase() === key)
      if (option) play(option.move)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [options, play])

  function playAgain() {
    setBaseline(bestScore)
    game.restart()
  }

  const isNewBest = score > baseline
  const direction = round.order === 'asc' ? 'Ascending' : 'Descending'

  return (
    <div className="flex w-full max-w-5xl flex-col items-start gap-4">
      <button type="button" onClick={onBack} className={buttonClass}>
        Back to map
      </button>

      <section aria-label="Arcade" className="flex w-full flex-col gap-6">
        <h2 className="text-xl font-semibold">Arcade</h2>

        <section
          aria-label="Game stats"
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm"
        >
          <span>
            Round <strong>{round.number}</strong>
          </span>
          <span
            role="img"
            aria-label={`Lives: ${run.lives} of ${DEFAULT_LIVES}`}
            className="text-lg text-rose-400"
          >
            {'♥'.repeat(run.lives)}
            {'♡'.repeat(Math.max(0, DEFAULT_LIVES - run.lives))}
          </span>
          <span>
            Score <strong>{run.score}</strong>
          </span>
          <span>
            Streak <strong>{run.streak}</strong>
          </span>
          <span>
            Best <strong>{Math.max(bestScore, score)}</strong>
          </span>
        </section>

        <p className="text-center text-sm text-slate-300">
          {algorithm.name} · {direction} · {round.input.length} boxes
        </p>

        <SplitLayout
          board={
            <>
              <Board values={game.values} states={game.states} />

              {status === 'playing' && prompt && (
                <>
                  <p className="text-center text-slate-300">
                    {prompt.question}
                  </p>
                  <PlayControls options={prompt.options} onChoose={play} />
                </>
              )}

              {status === 'cleared' && (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <p className="text-lg font-semibold">
                    {`Round ${round.number} cleared!`}
                  </p>
                  <p className="text-sm text-slate-300">
                    {`Bonus +${roundBonus(round.number)}`}
                  </p>
                  <button
                    type="button"
                    onClick={game.next}
                    className={primaryClass}
                  >
                    Next round
                  </button>
                </div>
              )}

              {status === 'over' && (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <p className="text-lg font-semibold">Game over</p>
                  <p className="text-sm text-slate-300">
                    Score {score} · Rounds cleared {game.cleared} · Best streak{' '}
                    {state.bestStreak}
                  </p>
                  <p className="text-sm text-amber-300">
                    {isNewBest ? 'New best score!' : `Your best is ${baseline}`}
                  </p>
                  <button
                    type="button"
                    onClick={playAgain}
                    className={primaryClass}
                  >
                    Play again
                  </button>
                </div>
              )}

              <Feedback result={run.lastResult} fallback={game.hint} />
            </>
          }
          code={
            <CodeView listing={listing} anchor={game.anchor} vars={game.vars} />
          }
        />
      </section>
    </div>
  )
}
