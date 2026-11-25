import { useEffect, useRef } from 'react'
import type { SortStep } from '../../algorithms/types'

interface StepLogProps {
  steps: readonly SortStep[]
  position: number
  onSeek: (position: number) => void
}

export function StepLog({ steps, position, onSeek }: StepLogProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const currentRef = useRef<HTMLLIElement>(null)

  // Only steps already shown. Future steps are never listed, so no spoilers.
  const shown = steps.slice(0, Math.max(0, position))

  // Scroll the list itself (not the page) to keep the current row visible.
  useEffect(() => {
    const list = listRef.current
    const row = currentRef.current
    if (!list || !row) return
    const top = row.offsetTop
    const bottom = top + row.offsetHeight
    if (top < list.scrollTop) {
      list.scrollTop = top
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight
    }
  }, [position])

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900">
      <h3 className="border-b border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300">
        Step log
      </h3>

      {shown.length === 0 ? (
        <p className="px-3 py-3 text-sm text-slate-400">
          Steps appear here as you go.
        </p>
      ) : (
        <ol
          ref={listRef}
          aria-label="Step log"
          className="relative max-h-64 overflow-y-auto py-1"
        >
          {shown.map((step, k) => {
            const current = k === shown.length - 1
            return (
              <li
                key={k}
                ref={current ? currentRef : undefined}
                aria-current={current ? 'step' : undefined}
              >
                <button
                  type="button"
                  onClick={() => onSeek(k + 1)}
                  className={`w-full border-l-4 px-3 py-1 text-left text-sm hover:bg-slate-800 focus:outline-2 focus:outline-sky-400 ${
                    current
                      ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                      : 'border-transparent text-slate-300'
                  }`}
                >
                  {`${k + 1}. ${step.msg}`}
                </button>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
