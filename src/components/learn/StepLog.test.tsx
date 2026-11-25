import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { bubbleSort } from '../../algorithms/sorting/bubbleSort'
import { StepLog } from './StepLog'

// bubbleSort([2, 1, 3]):
// 0 Compare 2 and 1   1 2 > 1, so swap them   2 Compare 2 and 3
// 3 3 is now in its final place   4 compare   5 sorted   6 sorted
const steps = bubbleSort([2, 1, 3])

function setup(position: number) {
  const onSeek = vi.fn()
  const { container } = render(
    <StepLog steps={steps} position={position} onSeek={onSeek} />,
  )
  return { onSeek, container }
}

const rows = () =>
  within(screen.getByRole('list', { name: 'Step log' })).getAllByRole(
    'listitem',
  )

describe('StepLog', () => {
  it('shows a hint instead of a list at the start', () => {
    setup(0)
    expect(screen.queryByRole('list', { name: 'Step log' })).toBeNull()
    expect(screen.getByText('Steps appear here as you go.')).toBeInTheDocument()
  })

  it('shows exactly one row per step shown so far', () => {
    setup(3)
    expect(rows()).toHaveLength(3)
    expect(rows()[0]).toHaveTextContent('1. Compare 2 and 1')
  })

  it('never shows a future step', () => {
    setup(1)
    expect(rows()).toHaveLength(1)
    expect(
      screen.getByRole('list', { name: 'Step log' }),
    ).not.toHaveTextContent('so swap them')
  })

  it('marks only the latest row as current', () => {
    setup(3)
    const current = document.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('3. Compare 2 and 3')
  })

  it('clicking a row seeks to the position after that step', async () => {
    const user = userEvent.setup()
    const { onSeek } = setup(3)
    await user.click(
      screen.getByRole('button', { name: '2. 2 > 1, so swap them' }),
    )
    expect(onSeek).toHaveBeenCalledWith(2)
  })

  it('is not a live region', () => {
    const { container } = setup(3)
    expect(container.querySelector('[aria-live]')).toBeNull()
  })
})
