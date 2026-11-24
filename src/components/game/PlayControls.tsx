interface PlayControlsProps {
  disabled: boolean
  onSwap: () => void
  onKeep: () => void
  onHint?: () => void
}

const buttonClass =
  'flex items-center gap-2 rounded-lg border-2 px-6 py-2 text-lg font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-40'

export function PlayControls({
  disabled,
  onSwap,
  onKeep,
  onHint,
}: PlayControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <button
        type="button"
        aria-keyshortcuts="S"
        disabled={disabled}
        onClick={onSwap}
        className={`${buttonClass} border-rose-400 bg-rose-500/20 hover:bg-rose-500/30`}
      >
        Swap
        <kbd aria-hidden="true" className="text-xs opacity-70">
          S
        </kbd>
      </button>
      <button
        type="button"
        aria-keyshortcuts="K"
        disabled={disabled}
        onClick={onKeep}
        className={`${buttonClass} border-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30`}
      >
        Keep
        <kbd aria-hidden="true" className="text-xs opacity-70">
          K
        </kbd>
      </button>
      {onHint && (
        <button
          type="button"
          aria-keyshortcuts="H"
          disabled={disabled}
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
