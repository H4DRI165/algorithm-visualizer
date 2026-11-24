import { useCallback, useEffect, useState } from 'react'
import {
  emptyProgress,
  loadProgress,
  recordStars,
  saveProgress,
} from '../levels/progress'
import type { Progress } from '../schemas/progress'

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress)

  // Saving is a side effect, so it lives in an effect, not in the updater.
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const record = useCallback((levelId: string, stars: number) => {
    setProgress((p) => recordStars(p, levelId, stars))
  }, [])

  const reset = useCallback(() => setProgress(emptyProgress()), [])

  return { progress, record, reset }
}
