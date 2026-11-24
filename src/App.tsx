import { useState } from 'react'
import { LevelMap } from './components/screens/LevelMap'
import { LevelScreen } from './components/screens/LevelScreen'
import { PracticeScreen } from './components/screens/PracticeScreen'
import { useProgress } from './hooks/useProgress'
import { LEVELS } from './levels/levels'
import { isUnlocked } from './levels/progress'

type Screen =
  { name: 'map' } | { name: 'practice' } | { name: 'level'; levelId: string }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'map' })
  const { progress, record, reset } = useProgress()

  const goToMap = () => setScreen({ name: 'map' })

  const level =
    screen.name === 'level'
      ? LEVELS.find((l) => l.id === screen.levelId)
      : undefined

  let content
  if (screen.name === 'practice') {
    content = <PracticeScreen onBack={goToMap} />
  } else if (level && isUnlocked(LEVELS, progress, level.id)) {
    const next = LEVELS.find((l) => l.id === level.unlocks)
    content = (
      <LevelScreen
        key={level.id}
        level={level}
        number={LEVELS.indexOf(level) + 1}
        nextLevel={
          next && isUnlocked(LEVELS, progress, next.id) ? next : undefined
        }
        onComplete={record}
        onSelectLevel={(levelId) => setScreen({ name: 'level', levelId })}
        onBack={goToMap}
      />
    )
  } else {
    content = (
      <LevelMap
        levels={LEVELS}
        progress={progress}
        onSelect={(levelId) => setScreen({ name: 'level', levelId })}
        onPractice={() => setScreen({ name: 'practice' })}
        onResetProgress={reset}
      />
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-900 px-4 py-10 text-slate-100">
      <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
      {content}
    </main>
  )
}
