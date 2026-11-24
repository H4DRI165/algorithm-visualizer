import { useCallback, useEffect, useState } from 'react'
import type { Order } from '../../algorithms/types'
import { DEFAULT_LIVES } from '../../game/scoring'
import { isTypingTarget } from '../../hooks/keyboard'
import { useGame } from '../../hooks/useGame'
import { Board } from '../board/Board'
import { Feedback } from '../game/Feedback'
import { Hud } from '../game/Hud'
import { PlayControls } from '../game/PlayControls'
import { WatchScreen } from './WatchScreen'

interface PlayScreenProps {
  title: string
  input: readonly number[]
  order?: Order
  lives?: number
}

export function PlayScreen({
  title,
  input,
  order = 'asc',
  lives = DEFAULT_LIVES,
}: PlayScreenProps) {
  const game = useGame(input, order, lives)
  const { state, swap, keep } = game
  const playing = state.status === 'playing'
  const [watchFrom, setWatchFrom] = useState<number | null>(null)
  const watching = watchFrom !== null
  const { cursor } = state
  const openHint = useCallback(() => setWatchFrom(cursor + 1), [cursor])

  useEffect(() => {
    if (watching) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const key = e.key.toLowerCase()
      if (key === 's') swap()
      else if (key === 'k') keep()
      else if (key === 'h' && playing) openHint()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [watching, playing, swap, keep, openHint])

  if (watchFrom !== null) {
    return (
      <WatchScreen
        title={`Watch: ${title}`}
        input={input}
        steps={game.steps}
        startAt={watchFrom}
        onClose={() => setWatchFrom(null)}
        closeLabel="Back to game"
      />
    )
  }

  return (
    <section
      aria-label={title}
      className="flex w-full max-w-2xl flex-col gap-6"
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      <Hud
        lives={state.lives}
        maxLives={game.maxLives}
        score={state.score}
        streak={state.streak}
        mistakes={state.mistakes}
      />

      <Board values={game.values} states={game.states} />

      {playing ? (
        <>
          <p className="text-center text-slate-300">
            {game.caption}. Should these two swap?
          </p>
          <PlayControls
            disabled={!playing}
            onSwap={swap}
            onKeep={keep}
            onHint={openHint}
          />
        </>
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

      <Feedback
        result={state.lastResult}
        fallback="Swap if the left box is bigger, keep if the pair is already in order."
      />
    </section>
  )
}
