import { z } from 'zod'

export const MAX_STARS = 3

export const ProgressSchema = z.object({
  stars: z.record(z.string(), z.number().int().min(0).max(MAX_STARS)),
  bestArcadeScore: z.number().int().min(0),
  badges: z.array(z.string()),
})

export type Progress = z.infer<typeof ProgressSchema>