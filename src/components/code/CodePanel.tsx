import { useId, useState } from 'react'

interface CodePanelProps {
  lines: readonly string[]
  activeLine?: number
}

export function CodePanel({ lines, activeLine }: CodePanelProps) {
  const [open, setOpen] = useState(true)
  const listId = useId()

  return (
    <section
      aria-label="Code"
      className="rounded-lg border border-slate-700 bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-300">TypeScript</h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-600 px-3 py-1 text-xs hover:bg-slate-700 focus:outline-2 focus:outline-sky-400"
        >
          {open ? 'Hide code' : 'Show code'}
        </button>
      </div>

      {open && (
        <ol
          id={listId}
          aria-label="Code listing"
          className="overflow-x-auto py-2 font-mono text-sm"
        >
          {lines.map((line, i) => {
            const n = i + 1
            const active = n === activeLine
            return (
              <li
                key={n}
                aria-current={active ? 'step' : undefined}
                className={`flex gap-2 border-l-4 px-2 ${
                  active
                    ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                    : 'border-transparent text-slate-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="w-5 shrink-0 select-none text-right text-slate-500"
                >
                  {n}
                </span>
                <span
                  aria-hidden="true"
                  className="w-3 shrink-0 select-none text-sky-300"
                >
                  {active ? '▶' : ''}
                </span>
                <code className="whitespace-pre">{line}</code>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
