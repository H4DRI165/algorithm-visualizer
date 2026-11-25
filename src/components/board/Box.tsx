import type { BoxState } from './boxState'
import { BOX_STATE_CLASSES, BOX_STATE_LABELS } from './boxState'

interface BoxProps {
  value: number
  position: number
  state?: BoxState
}

export function Box({ value, position, state = 'idle' }: BoxProps) {
  const label = BOX_STATE_LABELS[state]

  return (
    <div
      role="listitem"
      aria-label={`Box ${position + 1}: ${value}, ${label}`}
      data-state={state}
      className="flex flex-col items-center gap-1"
    >
      <div
        className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 transition-colors animate-pop motion-reduce:animate-none ${BOX_STATE_CLASSES[state]}`}
      >
        <span className="text-xl font-bold">{value}</span>
        <span className="h-3 text-[10px] leading-3 opacity-80">
          {state === 'idle' ? '' : label}
        </span>
      </div>
      <span className="text-xs text-slate-400">{position + 1}</span>
    </div>
  )
}
