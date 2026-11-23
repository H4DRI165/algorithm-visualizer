interface FeedbackProps {
  result?: { correct: boolean; msg: string }
  fallback: string
}

export function Feedback({ result, fallback }: FeedbackProps) {
  const tone =
    result === undefined
      ? 'text-slate-300'
      : result.correct
        ? 'text-emerald-300'
        : 'text-rose-300'

  return (
    <p aria-live="polite" className={`min-h-12 text-center ${tone}`}>
      {result ? result.msg : fallback}
    </p>
  )
}
