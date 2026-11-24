import type { Order } from '../algorithms/types'
import type { StarRules } from '../game/scoring'
import type { GameMode } from '../game/types'

export interface LevelDef {
  id: string
  title: string
  mode: GameMode
  algorithmId: string
  input: readonly number[]
  order: Order
  lives: number
  /** Max mistakes allowed for 2 and 3 stars. */
  stars: StarRules
  /** Id of the level this one opens. */
  unlocks?: string
}
