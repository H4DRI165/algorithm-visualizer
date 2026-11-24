import type { PromptOption } from '../../game/prompt'
import type { Move } from '../../game/types'

interface PlayControlsProps {
  options: readonly PromptOption[]
  onChoose: (move: Move) => void
  onHint?: () => void
}

const buttonClass =
  'flex items-center gap-2 rounded-lg border-2 px-6 py-2 text-lg font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-40'

const TONES: Record<PromptOption['id'], string> = {
  swap: 'border-rose-400 bg-rose-500/20 hover:bg-rose-500/30',
  keep: 'border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30',
  select: 'border-sky-400 bg-sky-500/20 hover:bg-sky-500/30',
}

export function PlayControls({ options, onChoose, onHint }: PlayControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-keyshortcuts={option.shortcut}
          onClick={() => onChoose(option.move)}
          className={`${buttonClass} ${TONES[option.id]}`}
        >
          {option.label}
          <kbd aria-hidden="true" className="text-xs opacity-70">
            {option.shortcut}
          </kbd>
        </button>
      ))}
      {onHint && (
        <button
          type="button"
          aria-keyshortcuts="H"
          onClick={onHint}
          className={`${buttonClass} border-slate-500 hover:bg-slate-700`}
        >
          Hint
          <kbd aria-hidden="true" className="text-xs opacity-70">
            H
          </kbd>
        </button>
      )}
    </div>
  )
}
