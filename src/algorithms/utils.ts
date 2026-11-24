import type { Order } from './types'

export function at(arr: readonly number[], i: number): number {
  const value = arr[i]
  if (value === undefined) {
    throw new RangeError(`Index ${i} is out of bounds (length ${arr.length})`)
  }
  return value
}

export function isOutOfOrder(a: number, b: number, order: Order): boolean {
  return order === 'asc' ? a > b : a < b
}
