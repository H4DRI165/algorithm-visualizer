import { useCallback, useMemo, useReducer } from 'react'
import type { SortingAlgorithm } from '../algorithms/registry'
import type { Order, SortStep } from '../algorithms/types'
import {
  createPredictState,
  getPredictPrompt,
  predictReducer,
} from '../game/predict'
import {
  DEFAULT_LIVES,
  DEFAULT_STAR_RULES,
  calculateStars,
  chargeHint,
  type StarRules,
} from '../game/scoring'
import type { GameState, Move } from '../game/types'
import { getWatchView } from '../game/watchView'

type Action =
  | { type: 'move'; move: Move; steps: readonly SortStep[] }
  | { type: 'hint' }
  | { type: 'restart'; steps: readonly SortStep[]; lives: number }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'move':
      return predictReducer(state, action.move, action.steps)
    case 'hint':
      return chargeHint(state)
    case 'restart':
      return createPredictState(action.steps, action.lives)
  }
}

export function usePredictGame(
  algorithm: SortingAlgorithm,
  input: readonly number[],
  order: Order = 'asc',
  lives: number = DEFAULT_LIVES,
  starRules: StarRules = DEFAULT_STAR_RULES,
) {
  const steps = useMemo(
    () => algorithm.run(input, { order }),
    [algorithm, input, order],
  )

  const [state, dispatch] = useReducer(reducer, steps, (s) =>
    createPredictState(s, lives),
  )

  // Show the board AFTER the steps before the cursor, so the next step
  // (the answer) is never highlighted.
  const view = useMemo(
    () => getWatchView(input, steps, state.cursor),
    [input, steps, state.cursor],
  )

  const playing = state.status === 'playing'

  const prompt = useMemo(
    () => (playing ? getPredictPrompt(steps, state.cursor) : null),
    [playing, steps, state.cursor],
  )

  // Highlight the step that just happened, never the one being asked.
  const shown =
    playing && state.cursor > 0 ? steps[state.cursor - 1] : undefined

  const play = useCallback(
    (optionId: string) =>
      dispatch({ type: 'move', move: { type: 'choose', optionId }, steps }),
    [steps],
  )

  const spendHint = useCallback(() => dispatch({ type: 'hint' }), [])

  const restart = useCallback(() => {
    dispatch({ type: 'restart', steps, lives })
  }, [steps, lives])

  return {
    state,
    steps,
    maxLives: lives,
    values: view.values,
    states: view.states,
    anchor: shown?.anchor,
    vars: shown?.vars,
    prompt,
    stars: calculateStars(state.status, state.mistakes, starRules),
    play,
    spendHint,
    restart,
  }
}
