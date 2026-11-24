import { useCallback, useMemo, useReducer } from 'react'
import type { SortingAlgorithm } from '../algorithms/registry'
import type { Order, SortStep } from '../algorithms/types'
import {
  beTheAlgorithmReducer,
  createInitialState,
} from '../game/beTheAlgorithm'
import { getBoardView } from '../game/boardView'
import { getFallbackHint, getPrompt } from '../game/prompt'
import {
  DEFAULT_LIVES,
  DEFAULT_STAR_RULES,
  calculateStars,
  chargeHint,
  type StarRules,
} from '../game/scoring'
import type { GameState, Move } from '../game/types'

type Action =
  | { type: 'move'; move: Move; steps: readonly SortStep[] }
  | { type: 'hint' }
  | { type: 'restart'; steps: readonly SortStep[]; lives: number }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'move':
      return beTheAlgorithmReducer(state, action.move, action.steps)
    case 'hint':
      return chargeHint(state)
    case 'restart':
      return createInitialState(action.steps, action.lives)
  }
}

export function useGame(
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
    createInitialState(s, lives),
  )

  const view = useMemo(
    () => getBoardView(input, steps, state.cursor),
    [input, steps, state.cursor],
  )

  const playing = state.status === 'playing'

  const prompt = useMemo(
    () =>
      playing
        ? getPrompt(steps, state.cursor, algorithm.compareStyle, order)
        : null,
    [playing, steps, state.cursor, algorithm.compareStyle, order],
  )

  const current = playing ? steps[state.cursor] : undefined

  const play = useCallback(
    (move: Move) => dispatch({ type: 'move', move, steps }),
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
    anchor: current?.anchor,
    vars: current?.vars,
    prompt,
    hint: getFallbackHint(algorithm.compareStyle, order),
    stars: calculateStars(state.status, state.mistakes, starRules),
    play,
    spendHint,
    restart,
  }
}
