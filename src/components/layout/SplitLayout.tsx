import type { ReactNode } from 'react'

interface SplitLayoutProps {
  board: ReactNode
  code: ReactNode
}

export function SplitLayout({ board, code }: SplitLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div className="flex min-w-0 flex-col gap-6">{board}</div>
      <aside aria-label="Code and variables" className="min-w-0 lg:order-first">
        {code}
      </aside>
    </div>
  )
}
