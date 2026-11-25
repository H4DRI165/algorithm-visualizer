import { useEffect } from 'react'
import { playSound } from '../audio/tone'

interface Result {
  correct: boolean
  msg: string
}

/** Plays a sound for each answer, and a jingle when the game ends. */
export function useGameSounds(
  result: Result | undefined,
  status: 'playing' | 'won' | 'lost',
): void {
  useEffect(() => {
    if (result && status === 'playing') {
      playSound(result.correct ? 'correct' : 'wrong')
    }
  }, [result, status])

  useEffect(() => {
    if (status === 'won') playSound('win')
    else if (status === 'lost') playSound('lose')
  }, [status])
}
