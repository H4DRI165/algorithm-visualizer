import { z } from 'zod'

export const MIN_BOXES = 3
export const MAX_BOXES = 10
export const MIN_VALUE = 1
export const MAX_VALUE = 99

export const DEFAULT_VALUES: readonly number[] = [42, 17, 68, 5, 91, 30]

export const BoxValueSchema = z.number().int().min(MIN_VALUE).max(MAX_VALUE)

export const BoxValuesSchema = z
  .array(BoxValueSchema)
  .min(MIN_BOXES)
  .max(MAX_BOXES)

/** Validate unknown data (URL hash, localStorage later). Falls back to defaults. */
export function parseBoxValues(input: unknown): number[] {
  const result = BoxValuesSchema.safeParse(input)
  return result.success ? result.data : [...DEFAULT_VALUES]
}

export type ParseResult =
  { ok: true; value: number } | { ok: false; error: string }

/** Validate what the player types into one box. */
export function parseBoxText(text: string): ParseResult {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Whole numbers only' }
  }
  const result = BoxValueSchema.safeParse(Number(trimmed))
  if (!result.success) {
    return { ok: false, error: `Use ${MIN_VALUE} to ${MAX_VALUE}` }
  }
  return { ok: true, value: result.data }
}

export function randomBoxValue(): number {
  return Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
}
