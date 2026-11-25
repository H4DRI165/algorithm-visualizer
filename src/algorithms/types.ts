export type Order = 'asc' | 'desc'

export interface BaseStep {
  anchor: string
  msg: string
  ptr?: Record<string, number>
  vars?: Record<string, number>
}

export type SortStep = BaseStep &
  (
    | {
        type: 'compare'
        indices: [number, number]
        keepMsg?: string
      }
    | { type: 'swap'; indices: [number, number] }
    | { type: 'select'; index: number }
    | { type: 'write'; index: number; value: number }
    | { type: 'sorted'; index: number }
  )

export type CompareStyle = 'swap' | 'smallest'

export interface Explanation {
  summary: string
  analogy: string
  whenToUse: string
}

export interface AlgorithmDef<TInput, TStep> {
  id: string
  name: string
  category: 'sorting' | 'searching' | 'pathfinding'
  complexity: { best: string; average: string; worst: string; space: string }
  explanation: Explanation
  run: (input: TInput, opts?: { order: Order }) => TStep[]
}
