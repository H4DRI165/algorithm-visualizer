import { useCallback, useMemo, useReducer } from 'react'
import {
  bubbleSortAlgorithm,
  getSortingAlgorithm,
  type SortingAlgorithm,
} from '../algorithms/registry'
import type { SortStep } from '../algorithms/types'
import {
  advanceRound,
  arcadeMove,
  arcadeStatus,
  makeRound,
  roundsCleared,
  startArcade,
  type ArcadeRound,
  type ArcadeState,
} from '../game/arcade'
import { getBoardView } from '../game/boardView'
import type { Rng } from '../game/presets'
import { getFallbackHint, getPrompt } from '../game/prompt'
import type { Move } from '../game/types'

type Action =
  | { type: 'move'; move: Move; steps: readonly SortStep[] }
  | { type: 'next'; round: ArcadeRound; steps: readonly SortStep[] }
  | { type: 'restart'; round: ArcadeRound; steps: readonly SortStep[] }

function reducer(state: ArcadeState, action: Action): ArcadeState {
  switch (action.type) {
    case 'move':
      return arcadeMove(state, action.move, action.steps)
    case 'next':
      return advanceRound(state, action.round, action.steps)
    case 'restart':
      return startArcade(action.round, action.steps)
  }
}

function algorithmFor(round: ArcadeRound): SortingAlgorithm {
  return getSortingAlgorithm(round.algorithmId) ?? bubbleSortAlgorithm
}

function stepsFor(round: ArcadeRound): SortStep[] {
  return algorithmFor(round).run(round.input, { order: round.order })
}

export function useArcadeGame(
  rng: Rng = Math.random,
  firstRound?: ArcadeRound,
) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const round = firstRound ?? makeRound(1, rng)
    return startArcade(round, stepsFor(round))
  })

  const { round, game } = state
  const algorithm = algorithmFor(round)
  const steps = useMemo(() => stepsFor(round), [round])

  const view = useMemo(
    () => getBoardView(round.input, steps, game.cursor),
    [round.input, steps, game.cursor],
  )

  const playing = game.status === 'playing'

  const prompt = useMemo(
    () =>
      playing
        ? getPrompt(steps, game.cursor, algorithm.compareStyle, round.order)
        : null,
    [playing, steps, game.cursor, algorithm.compareStyle, round.order],
  )

  const current = playing ? steps[game.cursor] : undefined

  const play = useCallback(
    (move: Move) => dispatch({ type: 'move', move, steps }),
    [steps],
  )

  const next = useCallback(() => {
    const nextRound = makeRound(round.number + 1, rng)
    dispatch({ type: 'next', round: nextRound, steps: stepsFor(nextRound) })
  }, [round.number, rng])

  const restart = useCallback(() => {
    const first = makeRound(1, rng)
    dispatch({ type: 'restart', round: first, steps: stepsFor(first) })
  }, [rng])

  return {
    state,
    round,
    algorithm,
    status: arcadeStatus(state),
    cleared: roundsCleared(state),
    values: view.values,
    states: view.states,
    anchor: current?.anchor,
    vars: current?.vars,
    prompt,
    hint: getFallbackHint(algorithm.compareStyle, round.order),
    play,
    next,
    restart,
  }
}
