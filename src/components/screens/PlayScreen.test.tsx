import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PlayScreen } from './PlayScreen'

// For [2, 1, 3] the perfect run is: swap, keep, keep.
const input = [2, 1, 3]

function setup(lives?: number) {
  const user = userEvent.setup()
  render(<PlayScreen title="Test level" input={input} lives={lives} />)
  const swap = () => user.click(screen.getByRole('button', { name: /swap/i }))
  const keep = () => user.click(screen.getByRole('button', { name: /keep/i }))
  return { user, swap, keep }
}

describe('PlayScreen', () => {
  it('highlights the first pair', () => {
    setup()
    expect(screen.getByLabelText('Box 1: 2, comparing')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 2: 1, comparing')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 3: 3, idle')).toBeInTheDocument()
  })

  it('a correct swap updates the board, score and feedback', async () => {
    const { swap } = setup()
    await swap()
    expect(screen.getByLabelText('Box 1: 1, idle')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 2: 2, comparing')).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    expect(screen.getByText(/correct!/i)).toBeInTheDocument()
  })

  it('a wrong move costs a life and explains why', async () => {
    const { keep } = setup()
    await keep()
    expect(screen.getByLabelText('Lives: 2 of 3')).toBeInTheDocument()
    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 2, comparing')).toBeInTheDocument()
  })

  it('a perfect run wins with 3 stars', async () => {
    const { swap, keep } = setup()
    await swap()
    await keep()
    await keep()
    expect(screen.getByText('Level complete!')).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
  })

  it('losing the last life ends the level', async () => {
    const { keep } = setup(1)
    await keep()
    expect(screen.getByText('Out of lives')).toBeInTheDocument()
    expect(screen.getByLabelText('0 of 3 stars')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /swap/i })).toBeNull()
  })

  it('Play again restores the level', async () => {
    const { user, keep } = setup(1)
    await keep()
    await user.click(screen.getByRole('button', { name: /play again/i }))
    expect(screen.getByLabelText('Lives: 1 of 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 2, comparing')).toBeInTheDocument()
  })

  it('supports keyboard shortcuts', async () => {
    const { user } = setup()
    await user.keyboard('s')
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    await user.keyboard('k')
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Streak 2')
  })
})
