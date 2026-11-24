import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BeatScreen } from './BeatScreen'

function setup(input: number[], onComplete?: () => void) {
  const user = userEvent.setup()
  render(<BeatScreen title="Beat test" input={input} onComplete={onComplete} />)
  const box = (n: number, value: number, state = 'idle') =>
    screen.getByLabelText(`Box ${n}: ${value}, ${state}`)
  // Swap the box at position n1 (holding v1) with the one at n2 (holding v2).
  const swap = async (n1: number, v1: number, n2: number, v2: number) => {
    await user.click(box(n1, v1))
    await user.click(box(n2, v2))
  }
  return { user, box, swap }
}

describe('BeatScreen', () => {
  it('shows the swap counts and the instructions', () => {
    setup([4, 3, 2, 1])
    const stats = screen.getByLabelText('Game stats')
    expect(stats).toHaveTextContent('Your swaps 0')
    // Bubble sort needs 6 swaps for a reversed list of 4.
    expect(stats).toHaveTextContent('Bubble Sort swaps 6')
    expect(screen.getByText(/smallest to largest/i)).toBeInTheDocument()
  })

  it('the first click selects a box and clicking it again deselects', async () => {
    const { user, box } = setup([4, 3, 2, 1])
    await user.click(box(1, 4))
    expect(box(1, 4, 'selected')).toBeInTheDocument()
    await user.click(box(1, 4, 'selected'))
    expect(box(1, 4)).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Your swaps 0',
    )
  })

  it('two clicks swap the boxes and count one swap', async () => {
    const { swap, box } = setup([4, 3, 2, 1])
    await swap(1, 4, 4, 1)
    expect(box(1, 1)).toBeInTheDocument()
    expect(box(4, 4)).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Your swaps 1',
    )
  })

  it('beating the algorithm wins with 3 stars and reports once', async () => {
    const onComplete = vi.fn()
    const { swap, box } = setup([4, 3, 2, 1], onComplete)
    await swap(1, 4, 4, 1)
    expect(onComplete).not.toHaveBeenCalled()
    await swap(2, 3, 3, 2)

    expect(screen.getByText('Level complete!')).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
    expect(screen.getByText(/you beat it/i)).toBeInTheDocument()
    expect(box(1, 1, 'sorted')).toBeDisabled()
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({ stars: 3 })
  })

  it('extra swaps cost stars, but finishing still earns some', async () => {
    const { swap } = setup([2, 1, 3])
    await swap(1, 2, 3, 3) // [3, 1, 2]
    await swap(1, 3, 2, 1) // [1, 3, 2]
    await swap(2, 3, 3, 2) // [1, 2, 3]

    expect(screen.getByLabelText('2 of 3 stars')).toBeInTheDocument()
    expect(screen.getByText(/try again/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Extra swaps 2',
    )
  })

  it('Start over restores the board and the counters', async () => {
    const { user, swap, box } = setup([4, 3, 2, 1])
    await swap(1, 4, 4, 1)
    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(box(1, 4)).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Your swaps 0',
    )
  })

  it('Play again restores the level after a win', async () => {
    const { user, swap, box } = setup([4, 3, 2, 1])
    await swap(1, 4, 4, 1)
    await swap(2, 3, 3, 2)
    await user.click(screen.getByRole('button', { name: 'Play again' }))
    expect(box(1, 4)).toBeInTheDocument()
    expect(screen.queryByText('Level complete!')).toBeNull()
  })

  it('shows extra end actions only when the level is over', async () => {
    const user = userEvent.setup()
    render(
      <BeatScreen
        title="T"
        input={[2, 1, 3]}
        endActions={<button type="button">Next level</button>}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Next level' })).toBeNull()
    await user.click(screen.getByLabelText('Box 1: 2, idle'))
    await user.click(screen.getByLabelText('Box 2: 1, idle'))
    expect(
      screen.getByRole('button', { name: 'Next level' }),
    ).toBeInTheDocument()
  })

  it('Watch the algorithm opens the replay and comes back', async () => {
    const { user, swap } = setup([4, 3, 2, 1])
    await swap(1, 4, 4, 1)
    await swap(2, 3, 3, 2)
    await user.click(
      screen.getByRole('button', { name: 'Watch the algorithm' }),
    )
    expect(screen.getByText(/Step 0 of \d+/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to game' }))
    expect(screen.getByText('Level complete!')).toBeInTheDocument()
  })
})
