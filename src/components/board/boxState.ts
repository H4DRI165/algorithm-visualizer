export type BoxState = 'idle' | 'comparing' | 'swapping' | 'sorted' | 'selected'

export const BOX_STATE_LABELS: Record<BoxState, string> = {
  idle: 'idle',
  comparing: 'comparing',
  swapping: 'swapping',
  sorted: 'sorted',
  selected: 'selected',
}

export const BOX_STATE_CLASSES: Record<BoxState, string> = {
  idle: 'border-slate-600 bg-slate-800 text-slate-100',
  comparing: 'border-amber-400 bg-amber-500/20 text-amber-100',
  swapping: 'border-rose-400 bg-rose-500/20 text-rose-100',
  sorted: 'border-emerald-400 bg-emerald-500/20 text-emerald-100',
  selected: 'border-sky-400 bg-sky-500/20 text-sky-100',
}
