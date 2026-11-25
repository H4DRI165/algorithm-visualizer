import { Box } from './Box'
import type { BoxState } from './boxState'

interface BoardProps {
  values: readonly number[]
  states?: readonly BoxState[]
}

export function Board({ values, states = [] }: BoardProps) {
  return (
    <div
      role="list"
      aria-label="Boxes"
      className="flex flex-wrap justify-center gap-3"
    >
      {values.map((value, i) => (
        <Box
          key={`${i}-${value}`}
          value={value}
          position={i}
          state={states[i] ?? 'idle'}
        />
      ))}
    </div>
  )
}
