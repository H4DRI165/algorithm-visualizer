import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { bubbleSortAlgorithm } from '../../algorithms/registry'
import { bubbleSort } from '../../algorithms/sorting/bubbleSort'
import { getBubbleSortListing } from '../../code/bubbleSort'
import { WatchScreen } from './WatchScreen'

const input = [2, 1, 3]
const steps = bubbleSort(input)

function setup(options: { startAt?: number; withAlgorithm?: boolean } = {}) {
  const user = userEvent.setup()
  render(
    <WatchScreen
      title="Watch test"
      input={input}
      steps={steps}
      listing={getBubbleSortListing('asc')}
      algorithm={
        options.withAlgorithm === false ? undefined : bubbleSortAlgorithm
      }
      startAt={options.startAt}
    />,
  )
  return user
}

const rows = () =>
  within(screen.getByRole('list', { name: 'Step log' })).getAllByRole(
    'listitem',
  )

describe('WatchScreen learning extras', () => {
  it('shows the About panel open, with the complexity', () => {
    setup()
    expect(screen.getByText('About Bubble Sort')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /best case/i })).toHaveTextContent(
      'O(n²)',
    )
  })

  it('has no About panel when no algorithm is given', () => {
    setup({ withAlgorithm: false })
    expect(screen.queryByText('About Bubble Sort')).toBeNull()
  })

  it('the About panel can be collapsed', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Hide details' }))
    expect(screen.queryByText('What it does')).toBeNull()
  })

  it('the step log starts empty and grows with each step', async () => {
    const user = setup()
    expect(screen.queryByRole('list', { name: 'Step log' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(rows()).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(rows()).toHaveLength(2)
  })

  it('opening at a step only lists the steps before it', () => {
    setup({ startAt: 3 })
    expect(rows()).toHaveLength(3)
  })

  it('clicking a log row jumps to that step', async () => {
    const user = setup({ startAt: 3 })
    await user.click(screen.getByRole('button', { name: '1. Compare 2 and 1' }))
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument()
    expect(rows()).toHaveLength(1)
  })
})
