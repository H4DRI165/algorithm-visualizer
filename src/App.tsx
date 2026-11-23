import { PlayScreen } from './components/screens/PlayScreen'

// Temporary: one hardcoded level until the level map arrives in Phase 8.
const LEVEL_INPUT = [5, 2, 4, 1, 3]

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-900 px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
      <PlayScreen title="Level 1: Bubble Sort" input={LEVEL_INPUT} />
    </main>
  )
}
