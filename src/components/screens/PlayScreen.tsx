import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  bubbleSortAlgorithm,
  type SortingAlgorithm,
} from '../../algorithms/registry'
import type { Order } from '../../algorithms/types'
import {
  DEFAULT_LIVES,
  DEFAULT_STAR_RULES,
  type StarRules,
  type Stars,
} from '../../game/scoring'
import { isTypingTarget } from '../../hooks/keyboard'
import { useGame } from '../../hooks/useGame'
import { Board } from '../board/Board'
import { CodeView } from '../code/CodeView'
import { Feedback } from '../game/Feedback'
import { Hud } from '../game/Hud'
import { PlayControls } from '../game/PlayControls'
import { SplitLayout } from '../layout/SplitLayout'
import { WatchScreen } from './WatchScreen'
import { useFlashAnchor } from '../../hooks/useFlashAnchor'
import { useGameSounds } from '../../hooks/useGameSounds'

export interface GameResult {
  stars: Stars
  score: number
}

interface PlayScreenProps {
  title: string
  input: readonly number[]
  order?: Order
  lives?: number
  algorithm?: SortingAlgorithm
  starRules?: StarRules
  onComplete?: (result: GameResult) => void
  endActions?: ReactNode
}

export function PlayScreen({
  title,
  input,
  order = 'asc',
  lives = DEFAULT_LIVES,
  algorithm = bubbleSortAlgorithm,
  starRules = DEFAULT_STAR_RULES,
  onComplete,
  endActions,
}: PlayScreenProps) {
  const game = useGame(algorithm, input, order, lives, starRules)
  const { state, prompt, play, spendHint } = game
  const flashAnchor = useFlashAnchor(game.steps, state.cursor)
  useGameSounds(state.lastResult, state.status)
  const playing = state.status === 'playing'
  const options = prompt?.options
  const listing = useMemo(() => algorithm.listing(order), [algorithm, order])

  const { status, score } = state
  const { stars } = game
  useEffect(() => {
    if (status === 'won') onComplete?.({ stars, score })
  }, [status, stars, score, onComplete])

  const [watchFrom, setWatchFrom] = useState<number | null>(null)
  const watching = watchFrom !== null

  const { cursor } = state
  const openHint = useCallback(() => {
    spendHint()
    setWatchFrom(cursor + 1)
  }, [spendHint, cursor])

  useEffect(() => {
    if (watching) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const key = e.key.toLowerCase()
      const option = options?.find((o) => o.shortcut.toLowerCase() === key)
      if (option) play(option.move)
      else if (key === 'h' && playing) openHint()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [watching, playing, options, play, openHint])

  if (watchFrom !== null) {
    return (
      <WatchScreen
        title={`Watch: ${title}`}
        input={input}
        steps={game.steps}
        listing={listing}
        startAt={watchFrom}
        onClose={() => setWatchFrom(null)}
        closeLabel="Back to game"
      />
    )
  }

  return (
    <section
      aria-label={title}
      className="flex w-full max-w-5xl flex-col gap-6"
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      <Hud
        lives={state.lives}
        maxLives={game.maxLives}
        score={state.score}
        streak={state.streak}
        mistakes={state.mistakes}
      />

      <SplitLayout
        board={
          <>
            <Board values={game.values} states={game.states} />

            {playing ? (
              prompt && (
                <>
                  <p className="text-center text-slate-300">
                    {prompt.question}
                  </p>
                  <PlayControls
                    options={prompt.options}
                    onChoose={play}
                    onHint={openHint}
                  />
                </>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-4">
                <p className="text-lg font-semibold">
                  {state.status === 'won' ? 'Level complete!' : 'Out of lives'}
                </p>
                <span
                  role="img"
                  aria-label={`${game.stars} of 3 stars`}
                  className="text-2xl text-amber-300"
                >
                  {'★'.repeat(game.stars)}
                  {'☆'.repeat(3 - game.stars)}
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
                    onClick={() => setWatchFrom(0)}
                    className="rounded-lg border-2 border-slate-500 px-6 py-2 font-semibold hover:bg-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-sky-400"
                  >
                    Watch replay
                  </button>
                </div>
              </div>
            )}

            <Feedback result={state.lastResult} fallback={game.hint} />
          </>
        }
        code={
          <CodeView
            listing={listing}
            anchor={game.anchor}
            flashAnchor={flashAnchor}
            vars={game.vars}
          />
        }
      />
    </section>
  )
}
