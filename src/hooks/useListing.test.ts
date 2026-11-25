import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { bubbleSortAlgorithm } from '../algorithms/registry'
import { setLang } from '../code/language'
import { useListing } from './useListing'

afterEach(() => setLang('ts'))

describe('useListing', () => {
  it('follows the chosen language', () => {
    const { result } = renderHook(() => useListing(bubbleSortAlgorithm, 'asc'))
    expect(result.current.lines[0]).toContain('function bubbleSort')

    act(() => setLang('python'))
    expect(result.current.lines[0]).toContain('def bubble_sort')

    act(() => setLang('java'))
    expect(result.current.lines[0]).toContain('static void bubbleSort')
  })

  it('follows the order', () => {
    const { result } = renderHook(() => useListing(bubbleSortAlgorithm, 'desc'))
    expect(result.current.lines.join('\n')).toContain('arr[j] < arr[j + 1]')
  })
})
