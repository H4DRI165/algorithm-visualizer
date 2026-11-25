import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { LANGS, type Lang } from '../../code/listing'

interface CodePanelProps {
  lines: readonly string[]
  activeLine?: number
  /** A line that lights up briefly, such as the swap after a correct swap. */
  flashLine?: number
  lang?: Lang
  /** When given, the header shows language tabs. */
  onLangChange?: (lang: Lang) => void
}

function lineClass(active: boolean, flash: boolean): string {
  if (active) return 'border-sky-400 bg-sky-500/20 text-sky-100'
  if (flash) return 'border-amber-400 bg-amber-500/30 text-amber-100'
  return 'border-transparent text-slate-300'
}

export function CodePanel({
  lines,
  activeLine,
  flashLine,
  lang = 'ts',
  onLangChange,
}: CodePanelProps) {
  const [open, setOpen] = useState(true)
  const baseId = useId()
  const panelId = `${baseId}-panel`
  const tabId = (id: Lang) => `${baseId}-tab-${id}`
  const tabRefs = useRef<Partial<Record<Lang, HTMLButtonElement | null>>>({})

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!onLangChange) return
    const count = LANGS.length
    const index = LANGS.findIndex((l) => l.id === lang)
    let next: number
    if (e.key === 'ArrowRight') next = (index + 1) % count
    else if (e.key === 'ArrowLeft') next = (index - 1 + count) % count
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    else return
    e.preventDefault()
    // Keep Watch's own arrow-key shortcuts from also stepping the timeline.
    e.stopPropagation()
    const target = LANGS[next]
    if (!target) return
    onLangChange(target.id)
    tabRefs.current[target.id]?.focus()
  }

  const label = LANGS.find((l) => l.id === lang)?.label ?? 'TypeScript'

  return (
    <section
      aria-label="Code"
      className="rounded-lg border border-slate-700 bg-slate-900"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-700 px-3 py-2">
        {onLangChange ? (
          <div
            role="tablist"
            aria-label="Language"
            onKeyDown={onTabKeyDown}
            className="flex gap-1"
          >
            {LANGS.map((l) => {
              const selected = l.id === lang
              return (
                <button
                  key={l.id}
                  ref={(el) => {
                    tabRefs.current[l.id] = el
                  }}
                  type="button"
                  role="tab"
                  id={tabId(l.id)}
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onLangChange(l.id)}
                  className={`rounded-md border px-3 py-1 text-xs focus:outline-2 focus:outline-sky-400 ${
                    selected
                      ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {l.label}
                </button>
              )
            })}
          </div>
        ) : (
          <h3 className="text-sm font-semibold text-slate-300">{label}</h3>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-600 px-3 py-1 text-xs hover:bg-slate-700 focus:outline-2 focus:outline-sky-400"
        >
          {open ? 'Hide code' : 'Show code'}
        </button>
      </div>

      <div
        id={panelId}
        role={onLangChange ? 'tabpanel' : undefined}
        aria-labelledby={onLangChange ? tabId(lang) : undefined}
      >
        {open && (
          <ol
            aria-label="Code listing"
            className="overflow-x-auto py-2 font-mono text-sm"
          >
            {lines.map((line, i) => {
              const n = i + 1
              const active = n === activeLine
              const flash = n === flashLine && !active
              return (
                <li
                  key={n}
                  aria-current={active ? 'step' : undefined}
                  data-flash={flash ? 'true' : undefined}
                  className={`flex gap-2 border-l-4 px-2 transition-colors ${lineClass(active, flash)}`}
                >
                  <span
                    aria-hidden="true"
                    className="w-5 shrink-0 select-none text-right text-slate-400"
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
      </div>
    </section>
  )
}
