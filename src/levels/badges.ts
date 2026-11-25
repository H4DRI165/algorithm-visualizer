import type { GameMode } from '../game/types'
import type { Progress } from '../schemas/progress'
import { MAX_STARS } from '../schemas/progress'
import { getStars } from './progress'
import type { LevelDef } from './types'

export interface BadgeDef {
  id: string
  name: string
  description: string
  isEarned: (progress: Progress, levels: readonly LevelDef[]) => boolean
}

function allDone(
  progress: Progress,
  levels: readonly LevelDef[],
  mode: GameMode,
): boolean {
  const group = levels.filter((l) => l.mode === mode)
  return group.length > 0 && group.every((l) => getStars(progress, l.id) >= 1)
}

export const BADGES: readonly BadgeDef[] = [
  {
    id: 'first-win',
    name: 'First Win',
    description: 'Finish any level.',
    isEarned: (p, levels) => levels.some((l) => getStars(p, l.id) >= 1),
  },
  {
    id: 'perfect-run',
    name: 'Perfect Run',
    description: 'Earn 3 stars on any level.',
    isEarned: (p, levels) =>
      levels.some((l) => getStars(p, l.id) === MAX_STARS),
  },
  {
    id: 'all-sorts',
    name: 'All Sorts Complete',
    description: 'Finish every Be the algorithm level.',
    isEarned: (p, levels) => allDone(p, levels, 'be-the-algorithm'),
  },
  {
    id: 'mind-reader',
    name: 'Mind Reader',
    description: 'Finish every Predict level.',
    isEarned: (p, levels) => allDone(p, levels, 'predict'),
  },
  {
    id: 'race-winner',
    name: 'Race Winner',
    description: 'Call a race correctly.',
    isEarned: (p, levels) =>
      levels.some((l) => l.mode === 'race' && getStars(p, l.id) === MAX_STARS),
  },
  {
    id: 'arcade-hero',
    name: 'Arcade Hero',
    description: 'Score 100 points in Arcade.',
    isEarned: (p) => p.bestArcadeScore >= 100,
  },
  {
    id: 'full-marks',
    name: 'Full Marks',
    description: 'Earn 3 stars on every level.',
    isEarned: (p, levels) =>
      levels.length > 0 && levels.every((l) => getStars(p, l.id) === MAX_STARS),
  },
]

export function earnedBadgeIds(
  progress: Progress,
  levels: readonly LevelDef[],
): string[] {
  return BADGES.filter((b) => b.isEarned(progress, levels)).map((b) => b.id)
}
