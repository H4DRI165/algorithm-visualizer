import { useCallback, useMemo, useReducer } from 'react'
import type { SortingAlgorithm } from '../algorithms/registry'
import type { Order } from '../algorithms/types'
import {
  countWork,
  createRaceState,
  positionForWork,
  raceReducer,
  raceWinner,
  type RaceGuess,
  type RaceState,
} from '../game/race'
import { getWatchView } from '../game/watchView'
import { usePlayback } from './usePlayback'

type Action =
  { type: 'guess'; guess: RaceGuess; winner: RaceGuess } | { type: 'restart' }

function reducer(state: RaceState, action: Action): RaceState {
  switch (action.type) {
    case 'guess':
      return raceReducer(state, action.guess, action.winner)
    case 'restart':
      return createRaceState()
  }
}

export function useRaceGame(
  algorithm: SortingAlgorithm,
  rival: SortingAlgorithm,
  input: readonly number[],
  order: Order = 'asc',
) {
  const stepsA = useMemo(
    () => algorithm.run(input, { order }),
    [algorithm, input, order],
  )
  const stepsB = useMemo(
    () => rival.run(input, { order }),
    [rival, input, order],
  )
  const workA = useMemo(() => countWork(stepsA), [stepsA])
  const workB = useMemo(() => countWork(stepsB), [stepsB])
  const winner = raceWinner(workA, workB)

  const [state, dispatch] = useReducer(reducer, null, () => createRaceState())

  // One clock for both sides: the tick is "operations done so far".
  const playback = usePlayback(Math.max(workA, workB))
  const { position: tick, play, reset } = playback

  const viewA = useMemo(
    () => getWatchView(input, stepsA, positionForWork(stepsA, tick)),
    [input, stepsA, tick],
  )
  const viewB = useMemo(
    () => getWatchView(input, stepsB, positionForWork(stepsB, tick)),
    [input, stepsB, tick],
  )

  const guessed = state.guess !== null

  const guess = useCallback(
    (choice: RaceGuess) => {
      if (state.status !== 'guessing') return
      dispatch({ type: 'guess', guess: choice, winner })
      play()
    },
    [state.status, winner, play],
  )

  const restart = useCallback(() => {
    dispatch({ type: 'restart' })
    reset()
  }, [reset])

  return {
    state,
    workA,
    workB,
    winner,
    viewA,
    viewB,
    playback,
    guessed,
    doneA: guessed && tick >= workA,
    doneB: guessed && tick >= workB,
    finished: guessed && playback.isAtEnd,
    guess,
    restart,
  }
}
