import { useEffect, useState } from 'react'
import type { SortStep } from '../algorithms/types'
import { FLASH_MS, swapAnchorBetween } from '../game/flash'

interface Flash {
  anchor: string
  id: number
}

/** Returns an anchor for a short time after the cursor passes a swap step. */
export function useFlashAnchor(
  steps: readonly SortStep[],
  cursor: number,
  ms: number = FLASH_MS,
): string | undefined {
  const [seen, setSeen] = useState(cursor)
  const [flash, setFlash] = useState<Flash | null>(null)

  // Adjust state while rendering when the cursor moves (no effect needed).
  if (cursor !== seen) {
    setSeen(cursor)
    const anchor =
      cursor > seen ? swapAnchorBetween(steps, seen, cursor) : undefined
    setFlash(anchor === undefined ? null : { anchor, id: cursor })
  }

  const id = flash?.id
  useEffect(() => {
    if (id === undefined) return
    const timer = setTimeout(() => setFlash(null), ms)
    return () => clearTimeout(timer)
  }, [id, ms])

  return flash?.anchor
}
