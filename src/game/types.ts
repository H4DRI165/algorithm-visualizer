export type GameMode =
  'be-the-algorithm' | 'predict' | 'beat-the-algorithm' | 'race'

export type Move =
  | { type: 'swap'; indices: [number, number] }
  | { type: 'keep' }
  | { type: 'choose'; optionId: string }

export interface GameState {
  /** Index into the Step[] of the compare step the player must answer now. */
  cursor: number
  lives: number
  score: number
  streak: number
  mistakes: number
  status: 'playing' | 'won' | 'lost'
  lastResult?: { correct: boolean; msg: string }
}
