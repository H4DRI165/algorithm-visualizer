import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { bubbleSort } from '../../algorithms/sorting/bubbleSort'
import { WatchScreen } from './WatchScreen'

// 7 steps for [2, 1, 3]: see watchView.test.ts
const input = [2, 1, 3]
const steps = bubbleSort(input)

function setup(startAt?: number, onClose?: () => void) {
  const user = userEvent.setup()
  render(
    <WatchScreen
      title="Watch test"
      input={input}
      steps={steps}
      startAt={startAt}
      onClose={onClose}
    />,
  )
  return user
}

describe('WatchScreen', () => {
  it('starts before the first step', () => {
    setup()
    expect(screen.getByText('Step 0 of 7')).toBeInTheDocument()
    expect(screen.getByText('Press Play or Next to start')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('Next shows the compare, then the swap', async () => {
    const user = setup()
    const next = screen.getByRole('button', { name: 'Next' })

    await user.click(next)
    expect(screen.getByText('Compare 2 and 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 2, comparing')).toBeInTheDocument()

    await user.click(next)
    expect(screen.getByText('2 > 1, so swap them')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 1, swapping')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 2: 2, swapping')).toBeInTheDocument()
  })

  it('counts comparisons and swaps', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText(/comparisons/i).textContent).toContain('1')
    expect(screen.getByText(/swaps/i).textContent).toContain('1')
  })

  it('Back and Reset move backwards', async () => {
    const user = setup(3)
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByText('Step 2 of 7')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('Step 0 of 7')).toBeInTheDocument()
  })

  it('opens at the requested step', () => {
    setup(3)
    expect(screen.getByText('Step 3 of 7')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 2: 2, comparing')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 3: 3, comparing')).toBeInTheDocument()
  })

  it('the timeline slider jumps to a step', () => {
    setup()
    fireEvent.change(screen.getByLabelText('Timeline'), {
      target: { value: '7' },
    })
    expect(screen.getByText('Step 7 of 7')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 1, sorted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('arrow keys step through the timeline', async () => {
    const user = setup()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('Step 2 of 7')).toBeInTheDocument()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument()
  })

  it('Play switches to Pause, and back', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('offers a close button when onClose is given', async () => {
    const onClose = vi.fn()
    const user = setup(0, onClose)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
