import { useState } from 'react'
import {
  DEFAULT_VALUES,
  MAX_BOXES,
  MIN_BOXES,
  parseBoxText,
  randomBoxValue,
} from '../../schemas/boxes'

interface BoxInputProps {
  index: number
  value: number
  onCommit: (value: number) => void
}

function BoxInput({ index, value, onCommit }: BoxInputProps) {
  // `draft` is null when the player is not editing; then we show the real value.
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const errorId = `box-error-${index}`

  function handleChange(text: string) {
    setDraft(text)
    const result = parseBoxText(text)
    if (result.ok) {
      setError(null)
      onCommit(result.value)
    } else {
      setError(result.error)
    }
  }

  function handleBlur() {
    setDraft(null)
    setError(null)
  }

  return (
    <div className="flex w-20 flex-col items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        aria-label={`Value of box ${index + 1}`}
        aria-invalid={error !== null}
        aria-describedby={error ? errorId : undefined}
        value={draft ?? String(value)}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className="w-16 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-center text-slate-100 focus:outline-2 focus:outline-sky-400 aria-invalid:border-rose-400"
      />
      <p id={errorId} className="h-4 text-xs text-rose-300">
        {error}
      </p>
    </div>
  )
}

interface BoxEditorProps {
  values: readonly number[]
  onChange: (values: number[]) => void
}

const buttonClass =
  'rounded-md border border-slate-600 px-3 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

export function BoxEditor({ values, onChange }: BoxEditorProps) {
  function setAt(index: number, value: number) {
    onChange(values.map((v, i) => (i === index ? value : v)))
  }

  function addBox() {
    if (values.length >= MAX_BOXES) return
    onChange([...values, randomBoxValue()])
  }

  function removeBox() {
    if (values.length <= MIN_BOXES) return
    onChange(values.slice(0, -1))
  }

  function randomize() {
    onChange(values.map(() => randomBoxValue()))
  }

  function reset() {
    onChange([...DEFAULT_VALUES])
  }

  return (
    <section
      aria-label="Edit boxes"
      className="flex flex-col items-center gap-3"
    >
      <div className="flex flex-wrap justify-center gap-2">
        {values.map((value, i) => (
          <BoxInput
            key={i}
            index={i}
            value={value}
            onCommit={(v) => setAt(i, v)}
          />
        ))}
      </div>

      <p className="text-sm text-slate-400">
        {values.length} boxes ({MIN_BOXES} to {MAX_BOXES})
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className={buttonClass}
          onClick={addBox}
          disabled={values.length >= MAX_BOXES}
        >
          Add box
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={removeBox}
          disabled={values.length <= MIN_BOXES}
        >
          Remove box
        </button>
        <button type="button" className={buttonClass} onClick={randomize}>
          Randomize
        </button>
        <button type="button" className={buttonClass} onClick={reset}>
          Reset
        </button>
      </div>
    </section>
  )
}
