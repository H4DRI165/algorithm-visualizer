import type { WatchView } from '../../game/watchView'
import { Board } from '../board/Board'

interface RacePanelProps {
  name: string
  view: WatchView
  finished: boolean
}

export function RacePanel({ name, view, finished }: RacePanelProps) {
  const operations = view.comparisons + view.swaps

  return (
    <section
      aria-label={name}
      className="flex min-w-0 flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{name}</h3>
        {finished && (
          <span className="rounded-md border border-emerald-400 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
            Finished
          </span>
        )}
      </div>
      <Board values={view.values} states={view.states} />
      <p className="text-center text-sm text-slate-300">
        Operations <strong>{operations}</strong> ({view.comparisons} comparisons
        + {view.swaps} swaps)
      </p>
    </section>
  )
}
