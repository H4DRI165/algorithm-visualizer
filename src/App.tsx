import { useState } from 'react'
import {
  bubbleSortAlgorithm,
  getSortingAlgorithm,
  sortingAlgorithms,
} from './algorithms/registry'
import type { Order } from './algorithms/types'
import { PlayScreen } from './components/screens/PlayScreen'
import { PRESETS, makePreset } from './game/presets'
import type { PresetId } from './game/presets'
import { MAX_BOXES, MIN_BOXES } from './schemas/boxes'

interface Setup {
  algorithmId: string
  order: Order
  preset: PresetId
  size: number
}

interface Puzzle {
  setup: Setup
  input: number[]
  round: number
}

const SIZES = Array.from(
  { length: MAX_BOXES - MIN_BOXES + 1 },
  (_, i) => MIN_BOXES + i,
)

const INITIAL_SETUP: Setup = {
  algorithmId: bubbleSortAlgorithm.id,
  order: 'asc',
  preset: 'random',
  size: 5,
}

function createPuzzle(setup: Setup, round: number): Puzzle {
  return {
    setup,
    input: makePreset(setup.preset, setup.size, setup.order),
    round,
  }
}

const labelClass = 'flex flex-col gap-1 text-sm text-slate-300'
const selectClass =
  'rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-slate-100 focus:outline-2 focus:outline-sky-400'

export default function App() {
  const [puzzle, setPuzzle] = useState(() => createPuzzle(INITIAL_SETUP, 0))
  const { setup } = puzzle
  const algorithm =
    getSortingAlgorithm(setup.algorithmId) ?? bubbleSortAlgorithm

  function update(patch: Partial<Setup>) {
    setPuzzle(createPuzzle({ ...setup, ...patch }, puzzle.round + 1))
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-900 px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>

      <section
        aria-label="Practice setup"
        className="flex flex-wrap items-end justify-center gap-4"
      >
        <label className={labelClass}>
          Algorithm
          <select
            value={setup.algorithmId}
            onChange={(e) => update({ algorithmId: e.target.value })}
            className={selectClass}
          >
            {sortingAlgorithms.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Order
          <select
            value={setup.order}
            onChange={(e) =>
              update({ order: e.target.value === 'desc' ? 'desc' : 'asc' })
            }
            className={selectClass}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <label className={labelClass}>
          Preset
          <select
            value={setup.preset}
            onChange={(e) => {
              const found = PRESETS.find((p) => p.id === e.target.value)
              if (found) update({ preset: found.id })
            }}
            className={selectClass}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Boxes
          <select
            value={String(setup.size)}
            onChange={(e) => update({ size: Number(e.target.value) })}
            className={selectClass}
          >
            {SIZES.map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => update({})}
          className="rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400"
        >
          New puzzle
        </button>
      </section>

      <PlayScreen
        key={puzzle.round}
        title={`Practice: ${algorithm.name}`}
        algorithm={algorithm}
        input={puzzle.input}
        order={setup.order}
      />
    </main>
  )
}
