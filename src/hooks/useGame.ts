import { useCallback, useMemo, useReducer } from 'react'
import { bubbleSort } from '../algorithms/sorting/bubbleSort'
import type { Order, SortStep } from '../algorithms/types'
import {
  beTheAlgorithmReducer,
  createInitialState,
} from '../game/beTheAlgorithm'
import { getBoardView } from '../game/boardView'
import { DEFAULT_LIVES, calculateStars } from '../game/scoring'
import type { GameState, Move } from '../game/types'

type Action =
  | { type: 'move'; move: Move; steps: readonly SortStep[] }
  | { type: 'restart'; steps: readonly SortStep[]; lives: number }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'move':
      return beTheAlgorithmReducer(state, action.move, action.steps)
    case 'restart':
      return createInitialState(action.steps, action.lives)
  }
}

export function useGame(
  input: readonly number[],
  order: Order = 'asc',
  lives: number = DEFAULT_LIVES,
) {
  const steps = useMemo(() => bubbleSort(input, { order }), [input, order])

  const [state, dispatch] = useReducer(reducer, steps, (s) =>
    createInitialState(s, lives),
  )

  const view = useMemo(
    () => getBoardView(input, steps, state.cursor),
    [input, steps, state.cursor],
  )

  const current = steps[state.cursor]
  const pair = current?.type === 'compare' ? current.indices : null

  const swap = useCallback(() => {
    if (!pair) return
    dispatch({ type: 'move', move: { type: 'swap', indices: pair }, steps })
  }, [pair, steps])

  const keep = useCallback(() => {
    dispatch({ type: 'move', move: { type: 'keep' }, steps })
  }, [steps])

  const restart = useCallback(() => {
    dispatch({ type: 'restart', steps, lives })
  }, [steps, lives])

  return {
    state,
    maxLives: lives,
    values: view.values,
    states: view.states,
    caption: current?.msg ?? '',
    stars: calculateStars(state.status, state.mistakes),
    swap,
    keep,
    restart,
  }
}
