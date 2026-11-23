interface HudProps {
  lives: number
  maxLives: number
  score: number
  streak: number
  mistakes: number
}

export function Hud({ lives, maxLives, score, streak, mistakes }: HudProps) {
  return (
    <section
      aria-label="Game stats"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm"
    >
      <span
        role="img"
        aria-label={`Lives: ${lives} of ${maxLives}`}
        className="text-lg text-rose-400"
      >
        {'♥'.repeat(lives)}
        {'♡'.repeat(Math.max(0, maxLives - lives))}
      </span>
      <span>
        Score <strong>{score}</strong>
      </span>
      <span>
        Streak <strong>{streak}</strong>
      </span>
      <span>
        Mistakes <strong>{mistakes}</strong>
      </span>
    </section>
  )
}
