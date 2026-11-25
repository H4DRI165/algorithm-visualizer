import type { SortStep } from '../algorithms/types'

export const FLASH_MS = 700

/** Anchor of the swap step the player just completed, if there was one. */
export function swapAnchorBetween(
  steps: readonly SortStep[],
  from: number,
  to: number,
): string | undefined {
  const end = Math.min(to, steps.length)
  for (let k = Math.max(from, 0); k < end; k++) {
    const step = steps[k]
    if (step?.type === 'swap') return step.anchor
  }
  return undefined
}
