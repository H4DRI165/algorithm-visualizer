import { BOX_STATE_CLASSES, BOX_STATE_LABELS, type BoxState } from './boxState'

interface PickBoardProps {
  values: readonly number[]
  states?: readonly BoxState[]
  disabled?: boolean
  onPick: (index: number) => void
}

export function PickBoard({
  values,
  states = [],
  disabled = false,
  onPick,
}: PickBoardProps) {
  return (
    <ul aria-label="Boxes" className="flex flex-wrap justify-center gap-3">
      {values.map((value, i) => {
        const state = states[i] ?? 'idle'
        const label = BOX_STATE_LABELS[state]
        return (
          <li key={i} className="flex flex-col items-center gap-1">
            <button
              type="button"
              disabled={disabled}
              aria-label={`Box ${i + 1}: ${value}, ${label}`}
              onClick={() => onPick(i)}
              className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 enabled:hover:brightness-125 disabled:cursor-default ${BOX_STATE_CLASSES[state]}`}
            >
              <span className="text-xl font-bold">{value}</span>
              <span className="h-3 text-[10px] leading-3 opacity-80">
                {state === 'idle' ? '' : label}
              </span>
            </button>
            <span className="text-xs text-slate-400">{i + 1}</span>
          </li>
        )
      })}
    </ul>
  )
}
