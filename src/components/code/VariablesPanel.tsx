interface VariablesPanelProps {
  vars?: Record<string, number>
}

export function VariablesPanel({ vars }: VariablesPanelProps) {
  const entries = Object.entries(vars ?? {})

  return (
    <section
      aria-label="Variables"
      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
    >
      <h3 className="mb-1 text-sm font-semibold text-slate-300">Variables</h3>
      {entries.length === 0 ? (
        <p className="font-mono text-sm text-slate-400">none yet</p>
      ) : (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-slate-100">
          {entries.map(([name, value]) => (
            <li key={name}>{`${name} = ${value}`}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
