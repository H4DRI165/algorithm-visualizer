import { useState } from 'react'
import { Board } from './components/board/Board'
import { Box } from './components/board/Box'
import { BoxEditor } from './components/board/BoxEditor'
import { BOX_STATE_LABELS } from './components/board/boxState'
import type { BoxState } from './components/board/boxState'
import { DEFAULT_VALUES } from './schemas/boxes'

const ALL_STATES = Object.keys(BOX_STATE_LABELS) as BoxState[]

export default function App() {
  const [values, setValues] = useState<number[]>([...DEFAULT_VALUES])

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 bg-slate-900 px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>

      <Board values={values} />
      <BoxEditor values={values} onChange={setValues} />

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-400">Box states</h2>
        <div role="list" className="flex flex-wrap justify-center gap-3">
          {ALL_STATES.map((state, i) => (
            <Box key={state} value={i + 1} position={i} state={state} />
          ))}
        </div>
      </section>
    </main>
  )
}
