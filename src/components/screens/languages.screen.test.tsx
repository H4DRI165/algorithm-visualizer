import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { bubbleSortAlgorithm } from '../../algorithms/registry'
import { bubbleSort } from '../../algorithms/sorting/bubbleSort'
import { LANG_KEY, setLang } from '../../code/language'
import { getBubbleSortListing } from '../../code/bubbleSort'
import { PlayScreen } from './PlayScreen'
import { WatchScreen } from './WatchScreen'

afterEach(() => setLang('ts'))

const input = [2, 1, 3]

describe('code languages in the screens', () => {
  it('Play: switching to Python changes the code and the highlight', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    expect(
      screen.getByText('function bubbleSort(arr: number[]): number[] {'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Python' }))
    expect(screen.getByText('def bubble_sort(arr):')).toBeInTheDocument()
    expect(document.querySelector('[aria-current="step"]')).toHaveTextContent(
      'if arr[j] > arr[j + 1]:',
    )
    expect(localStorage.getItem(LANG_KEY)).toBe('python')
  })

  it('Play: Java works too, and the game keeps going', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    await user.click(screen.getByRole('tab', { name: 'Java' }))
    await user.click(screen.getByRole('button', { name: /^swap/i }))
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    expect(
      screen.getByText('static void bubbleSort(int[] arr) {'),
    ).toBeInTheDocument()
  })

  it('a hint opens Watch in the same language', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    await user.click(screen.getByRole('tab', { name: 'Python' }))
    await user.click(screen.getByRole('button', { name: /hint/i }))
    expect(screen.getByText('def bubble_sort(arr):')).toBeInTheDocument()
  })

  it('arrow keys on a tab do not step the Watch timeline', async () => {
    const user = userEvent.setup()
    render(
      <WatchScreen
        title="W"
        input={input}
        steps={bubbleSort(input)}
        listing={getBubbleSortListing('asc')}
        algorithm={bubbleSortAlgorithm}
      />,
    )
    screen.getByRole('tab', { name: 'TypeScript' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Step 0 of 7')).toBeInTheDocument()
  })
})
