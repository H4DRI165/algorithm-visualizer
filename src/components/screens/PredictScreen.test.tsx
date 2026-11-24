import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PredictScreen } from './PredictScreen'

// For [2, 1, 3] with bubble sort the perfect run is:
// "Compare positions 1 and 2", "Swap positions 1 and 2",
// "Compare positions 2 and 3", "Compare positions 1 and 2".
const input = [2, 1, 3]

function setup(lives?: number, onComplete?: () => void) {
  const user = userEvent.setup()
  render(
    <PredictScreen
      title="Predict test"
      input={input}
      lives={lives}
      onComplete={onComplete}
    />,
  )
  const pick = (name: string) =>
    user.click(screen.getByRole('button', { name }))
  return { user, pick }
}

describe('PredictScreen', () => {
  it('offers 3 options and does not highlight the upcoming pair', () => {
    setup()
    expect(
      screen.getByText('What does the algorithm do first?'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Compare positions 1 and 2' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 2, idle')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 2: 1, idle')).toBeInTheDocument()
  })

  it('a correct answer scores and shows what just happened', async () => {
    const { pick } = setup()
    await pick('Compare positions 1 and 2')
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    expect(screen.getByText(/correct!/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 2, comparing')).toBeInTheDocument()
  })

  it('a wrong answer costs a life and names the right step', async () => {
    const { pick } = setup()
    await pick('Swap positions 1 and 2')
    expect(screen.getByLabelText('Lives: 2 of 3')).toBeInTheDocument()
    expect(screen.getByText(/not quite/i)).toHaveTextContent(
      'Compare positions 1 and 2',
    )
  })

  it('a perfect run wins with 3 stars and reports once', async () => {
    const onComplete = vi.fn()
    const { pick } = setup(undefined, onComplete)
    await pick('Compare positions 1 and 2')
    await pick('Swap positions 1 and 2')
    await pick('Compare positions 2 and 3')
    expect(onComplete).not.toHaveBeenCalled()
    await pick('Compare positions 1 and 2')

    expect(screen.getByText('Level complete!')).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({ stars: 3, score: 52 })
  })

  it('losing the last life ends the level', async () => {
    const { pick } = setup(1)
    await pick('Swap positions 1 and 2')
    expect(screen.getByText('Out of lives')).toBeInTheDocument()
    expect(screen.getByLabelText('0 of 3 stars')).toBeInTheDocument()
  })

  it('number keys choose an option (the answer is in slot cursor % 3)', async () => {
    const { user } = setup()
    await user.keyboard('1') // cursor 0, correct answer is option 1
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    await user.keyboard('2') // cursor 1, correct answer is option 2
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Streak 2')
  })

  it('highlights the line of the previous step, never the next one', async () => {
    const { pick } = setup()
    expect(document.querySelector('[aria-current]')).toBeNull()
    await pick('Compare positions 1 and 2')
    expect(document.querySelector('[aria-current="step"]')).toHaveTextContent(
      'if (arr[j] > arr[j + 1])',
    )
  })

  it('Hint costs points, opens Watch before the question and keeps the game', async () => {
    const { user, pick } = setup()
    await pick('Compare positions 1 and 2') // +10
    await user.click(screen.getByRole('button', { name: /hint/i }))
    expect(screen.getByText('Step 1 of 7')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to game' }))
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 5')
    expect(screen.getByLabelText('Lives: 3 of 3')).toBeInTheDocument()
  })

  it('Play again restores the level', async () => {
    const { user, pick } = setup(1)
    await pick('Swap positions 1 and 2')
    await user.click(screen.getByRole('button', { name: /play again/i }))
    expect(screen.getByLabelText('Lives: 1 of 1')).toBeInTheDocument()
  })
})
