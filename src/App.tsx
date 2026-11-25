import { useState } from 'react'
import { getSortingAlgorithm } from './algorithms/registry'
import { SoundToggle } from './components/game/SoundToggle'
import { ArcadeScreen } from './components/screens/ArcadeScreen'
import { ChallengeScreen } from './components/screens/ChallengeScreen'
import { LevelMap } from './components/screens/LevelMap'
import { LevelScreen } from './components/screens/LevelScreen'
import { PracticeScreen } from './components/screens/PracticeScreen'
import { useProgress } from './hooks/useProgress'
import { LEVELS } from './levels/levels'
import { isUnlocked } from './levels/progress'
import { parseShareHash, type ShareState } from './schemas/share'

type Screen =
  | { name: 'map' }
  | { name: 'practice' }
  | { name: 'arcade' }
  | { name: 'challenge'; share: ShareState }
  | { name: 'level'; levelId: string }

/** A valid shared link opens its challenge. Anything else opens the map. */
function initialScreen(): Screen {
  const share = parseShareHash(window.location.hash)
  return share && getSortingAlgorithm(share.algo)
    ? { name: 'challenge', share }
    : { name: 'map' }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const { progress, record, recordArcade, reset } = useProgress()

  const goToMap = () => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      )
    }
    setScreen({ name: 'map' })
  }

  const level =
    screen.name === 'level'
      ? LEVELS.find((l) => l.id === screen.levelId)
      : undefined

  let content
  if (screen.name === 'challenge') {
    content = <ChallengeScreen share={screen.share} onBack={goToMap} />
  } else if (screen.name === 'practice') {
    content = <PracticeScreen onBack={goToMap} />
  } else if (screen.name === 'arcade') {
    content = (
      <ArcadeScreen
        bestScore={progress.bestArcadeScore}
        onGameOver={recordArcade}
        onBack={goToMap}
      />
    )
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
        onArcade={() => setScreen({ name: 'arcade' })}
        onResetProgress={reset}
      />
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-slate-900 px-4 py-10 text-slate-100">
      <a
        href="#content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('content')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:rounded-md focus:border focus:border-sky-400 focus:px-3 focus:py-1"
      >
        Skip to content
      </a>

      <div className="flex w-full max-w-5xl items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
        <SoundToggle />
      </div>

      <div
        id="content"
        tabIndex={-1}
        className="flex w-full flex-col items-center gap-8 outline-none"
      >
        {content}
      </div>
    </main>
  )
}
