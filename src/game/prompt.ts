import type { CompareStyle, Order, SortStep } from '../algorithms/types'
import type { Move } from './types'

export interface PromptOption {
  id: 'swap' | 'keep' | 'select'
  label: string
  shortcut: string
  move: Move
}

export interface Prompt {
  question: string
  options: PromptOption[]
}

const KEEP: PromptOption = {
  id: 'keep',
  label: 'Keep',
  shortcut: 'K',
  move: { type: 'keep' },
}

export function getPrompt(
  steps: readonly SortStep[],
  cursor: number,
  style: CompareStyle,
  order: Order,
): Prompt | null {
  const current = steps[cursor]
  if (current === undefined) return null

  if (current.type === 'swap') {
    return {
      question: `${current.msg}.`,
      options: [
        {
          id: 'swap',
          label: 'Swap',
          shortcut: 'S',
          move: { type: 'swap', indices: current.indices },
        },
      ],
    }
  }

  if (current.type !== 'compare') return null

  if (style === 'swap') {
    return {
      question: `${current.msg}. Should these two swap?`,
      options: [
        {
          id: 'swap',
          label: 'Swap',
          shortcut: 'S',
          move: { type: 'swap', indices: current.indices },
        },
        KEEP,
      ],
    }
  }

  const word = order === 'asc' ? 'smallest' : 'largest'
  return {
    question: `${current.msg}. Is the right box the new ${word}?`,
    options: [
      {
        id: 'select',
        label: `New ${word}`,
        shortcut: 'N',
        move: { type: 'select', index: current.indices[1] },
      },
      KEEP,
    ],
  }
}

export function getFallbackHint(style: CompareStyle, order: Order): string {
  if (style === 'swap') {
    const side = order === 'asc' ? 'bigger' : 'smaller'
    return `Swap if the left box is ${side}, keep if the pair is already in order.`
  }
  const side = order === 'asc' ? 'smaller' : 'larger'
  return `Pick the new box if the right box is ${side} than the selected one, otherwise keep.`
}
