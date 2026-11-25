import { useId, useState } from 'react'
import type { SortingAlgorithm } from '../../algorithms/registry'

interface AboutPanelProps {
  algorithm: Pick<SortingAlgorithm, 'name' | 'complexity' | 'explanation'>
  defaultOpen?: boolean
}

const ROWS: { label: string; key: keyof SortingAlgorithm['complexity'] }[] = [
  { label: 'Best case', key: 'best' },
  { label: 'Average case', key: 'average' },
  { label: 'Worst case', key: 'worst' },
  { label: 'Extra space', key: 'space' },
]

export function AboutPanel({
  algorithm,
  defaultOpen = false,
}: AboutPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  const { explanation, complexity, name } = algorithm

  return (
    <section
      aria-label={`About ${name}`}
      className="rounded-lg border border-slate-700 bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-300">{`About ${name}`}</h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-600 px-3 py-1 text-xs hover:bg-slate-700 focus:outline-2 focus:outline-sky-400"
        >
          {open ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {open && (
        <div
          id={bodyId}
          className="flex flex-col gap-3 px-3 py-3 text-sm text-slate-200"
        >
          <div>
            <h4 className="font-semibold text-slate-100">What it does</h4>
            <p>{explanation.summary}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-100">
              Think of it like this
            </h4>
            <p>{explanation.analogy}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-100">When to use it</h4>
            <p>{explanation.whenToUse}</p>
          </div>
          <table className="w-full text-left">
            <caption className="sr-only">Time and space cost</caption>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} className="border-t border-slate-700">
                  <th
                    scope="row"
                    className="py-1 pr-4 font-normal text-slate-300"
                  >
                    {row.label}
                  </th>
                  <td className="py-1 font-mono">{complexity[row.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
