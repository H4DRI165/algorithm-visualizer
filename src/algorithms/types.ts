export type Order = 'asc' | 'desc'

export interface BaseStep {
  anchor: string
  msg: string
  ptr?: Record<string, number>
  vars?: Record<string, number>
}

export type SortStep = BaseStep &
  (
    | { type: 'compare'; indices: [number, number] }
    | { type: 'swap'; indices: [number, number] }
    | { type: 'write'; index: number; value: number }
    | { type: 'sorted'; index: number }
  )

export interface AlgorithmDef<TInput, TStep> {
  id: string
  name: string
  category: 'sorting' | 'searching' | 'pathfinding'
  complexity: { best: string; average: string; worst: string; space: string }
  run: (input: TInput, opts?: { order: Order }) => TStep[]
}
