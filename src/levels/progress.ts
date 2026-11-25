import { MAX_STARS, ProgressSchema, type Progress } from '../schemas/progress'
import type { LevelDef } from './types'

export const STORAGE_KEY = 'algorithm-visualizer:progress:v1'

export function emptyProgress(): Progress {
  return { stars: {}, bestArcadeScore: 0, badges: [] }
}

/** Corrupted or unexpected data resets safely instead of crashing the app. */
export function parseProgress(raw: string | null): Progress {
  if (raw === null) return emptyProgress()
  try {
    const result = ProgressSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : emptyProgress()
  } catch {
    return emptyProgress()
  }
}

/** localStorage can throw (private mode, blocked storage), so guard it. */
export function loadProgress(): Progress {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY))
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage unavailable: the game still works, it just won't be remembered.
  }
}

export function getStars(progress: Progress, levelId: string): number {
  return Object.hasOwn(progress.stars, levelId)
    ? (progress.stars[levelId] ?? 0)
    : 0
}

/** Keeps the best result. Returns the same object when nothing improves. */
export function recordStars(
  progress: Progress,
  levelId: string,
  stars: number,
): Progress {
  if (!Number.isFinite(stars)) return progress
  const clamped = Math.min(MAX_STARS, Math.max(0, Math.floor(stars)))
  if (clamped <= getStars(progress, levelId)) return progress
  return { ...progress, stars: { ...progress.stars, [levelId]: clamped } }
}

export function totalStars(
  progress: Progress,
  levels: readonly LevelDef[],
): number {
  return levels.reduce((sum, level) => sum + getStars(progress, level.id), 0)
}

/** The first level is always open. Others open when the level before is done. */
export function isUnlocked(
  levels: readonly LevelDef[],
  progress: Progress,
  levelId: string,
): boolean {
  const index = levels.findIndex((l) => l.id === levelId)
  if (index === -1) return false
  if (index === 0) return true
  return levels.some(
    (l) => l.unlocks === levelId && getStars(progress, l.id) >= 1,
  )
}

/** Keeps the best Arcade score. Returns the same object when nothing improves. */
export function recordArcadeScore(progress: Progress, score: number): Progress {
  if (!Number.isFinite(score)) return progress
  const value = Math.floor(score)
  if (value <= progress.bestArcadeScore) return progress
  return { ...progress, bestArcadeScore: value }
}
