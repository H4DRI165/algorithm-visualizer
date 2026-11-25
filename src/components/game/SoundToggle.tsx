import { useSyncExternalStore } from 'react'
import {
  isSoundEnabled,
  setSoundEnabled,
  subscribeSound,
} from '../../audio/sound'

export function SoundToggle() {
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled)

  return (
    <button
      type="button"
      aria-label="Sound effects"
      aria-pressed={enabled}
      onClick={() => setSoundEnabled(!enabled)}
      className="rounded-md border border-slate-600 px-4 py-1 text-sm hover:bg-slate-700 focus:outline-2 focus:outline-sky-400 aria-pressed:border-sky-400 aria-pressed:bg-sky-500/20"
    >
      {`Sound: ${enabled ? 'on' : 'off'}`}
    </button>
  )
}
