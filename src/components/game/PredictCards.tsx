import type { PredictOption } from '../../game/predict'
import { HINT_COST } from '../../game/scoring'

interface PredictCardsProps {
  options: readonly PredictOption[]
  onChoose: (optionId: string) => void
  onHint?: () => void
}

const cardClass =
  'flex items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-sky-400'

export function PredictCards({ options, onChoose, onHint }: PredictCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option, i) => (
        <button
          key={option.id}
          type="button"
          aria-keyshortcuts={String(i + 1)}
          onClick={() => onChoose(option.id)}
          className={`${cardClass} border-sky-400 bg-sky-500/20 hover:bg-sky-500/30`}
        >
          {option.label}
          <kbd aria-hidden="true" className="text-xs opacity-70">
            {i + 1}
          </kbd>
        </button>
      ))}
      {onHint && (
        <button
          type="button"
          aria-keyshortcuts="H"
          onClick={onHint}
          className={`${cardClass} justify-center border-slate-500 hover:bg-slate-700`}
        >
          Hint
          <span className="text-xs font-normal opacity-70">
            (-{HINT_COST} pts)
          </span>
          <kbd aria-hidden="true" className="text-xs opacity-70">
            H
          </kbd>
        </button>
      )}
    </div>
  )
}
