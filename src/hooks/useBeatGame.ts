import { useCallback, useMemo, useReducer } from 'react'
import type { SortingAlgorithm } from '../algorithms/registry'
import type { Order } from '../algorithms/types'
import {
  beatReducer,
  countSwaps,
  createBeatState,
  extraSwaps,
  getBeatBoxStates,
  type BeatState,
} from '../game/beatTheAlgorithm'
import {
  DEFAULT_STAR_RULES,
  calculateStars,
  type StarRules,
} from '../game/scoring'

type Action =
  | { type: 'pick'; index: number; order: Order }
  | { type: 'restart'; input: readonly number[]; order: Order }

function reducer(state: BeatState, action: Action): BeatState {
  switch (action.type) {
    case 'pick':
      return beatReducer(
        state,
        { type: 'pick', index: action.index },
        action.order,
      )
    case 'restart':
      return createBeatState(action.input, action.order)
  }
}

export function useBeatGame(
  algorithm: SortingAlgorithm,
  input: readonly number[],
  order: Order = 'asc',
  starRules: StarRules = DEFAULT_STAR_RULES,
) {
  const steps = useMemo(
    () => algorithm.run(input, { order }),
    [algorithm, input, order],
  )
  const algorithmSwaps = useMemo(() => countSwaps(steps), [steps])

  const [state, dispatch] = useReducer(reducer, input, (i) =>
    createBeatState(i, order),
  )

  const states = useMemo(() => getBeatBoxStates(state), [state])
  const extra = extraSwaps(state.swaps, algorithmSwaps)

  const pick = useCallback(
    (index: number) => dispatch({ type: 'pick', index, order }),
    [order],
  )

  const restart = useCallback(
    () => dispatch({ type: 'restart', input, order }),
    [input, order],
  )

  return {
    state,
    steps,
    algorithmSwaps,
    extra,
    states,
    stars: calculateStars(state.status, extra, starRules),
    pick,
    restart,
  }
}
