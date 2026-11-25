import { z } from 'zod'
import { BoxValuesSchema } from './boxes'

/** Race is not shareable: it needs two algorithms. */
export const ShareStateSchema = z.object({
  algo: z.string().min(1).max(40),
  values: BoxValuesSchema,
  order: z.enum(['asc', 'desc']),
  mode: z.enum(['be-the-algorithm', 'predict', 'beat-the-algorithm']),
})

export type ShareState = z.infer<typeof ShareStateSchema>
export type ShareMode = ShareState['mode']

const MAX_HASH_LENGTH = 200

export function encodeShare(state: ShareState): string {
  const params = new URLSearchParams({
    algo: state.algo,
    order: state.order,
    mode: state.mode,
    values: state.values.join(','),
  })
  return `#${params.toString().replace(/%2C/g, ',')}`
}

/** Anything unexpected gives null. The caller falls back to the map. */
export function parseShareHash(hash: string): ShareState | null {
  if (hash.length > MAX_HASH_LENGTH) return null
  const params = new URLSearchParams(
    hash.startsWith('#') ? hash.slice(1) : hash,
  )
  const values = (params.get('values') ?? '')
    .split(',')
    .map((v) => (v.trim() === '' ? Number.NaN : Number(v)))

  const result = ShareStateSchema.safeParse({
    algo: params.get('algo'),
    order: params.get('order'),
    mode: params.get('mode'),
    values,
  })
  return result.success ? result.data : null
}
