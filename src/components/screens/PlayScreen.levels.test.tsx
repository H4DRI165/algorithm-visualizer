import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlayScreen } from './PlayScreen'

// For [2, 1, 3] the perfect run is: swap, keep, keep (score 10 + 12 + 14).
const input = [2, 1, 3]

const swap = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /^swap/i }))
const keep = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /^keep/i }))

describe('PlayScreen as a level', () => {
  it('reports the result once when the level is won', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PlayScreen title="T" input={input} onComplete={onComplete} />)
    await swap(user)
    await keep(user)
    expect(onComplete).not.toHaveBeenCalled()
    await keep(user)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({ stars: 3, score: 36 })
  })

  it('does not report a lost level', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <PlayScreen title="T" input={input} lives={1} onComplete={onComplete} />,
    )
    await keep(user)
    expect(screen.getByText('Out of lives')).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('uses the level star rules', async () => {
    const user = userEvent.setup()
    // One mistake still earns 3 stars with these rules (the default gives 2).
    render(
      <PlayScreen title="T" input={input} starRules={{ two: 5, three: 1 }} />,
    )
    await keep(user) // wrong
    await swap(user)
    await keep(user)
    await keep(user)
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
  })

  it('shows extra end actions only when the level is over', async () => {
    const user = userEvent.setup()
    render(
      <PlayScreen
        title="T"
        input={input}
        endActions={<button type="button">Next level</button>}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Next level' })).toBeNull()
    await swap(user)
    await keep(user)
    await keep(user)
    expect(
      screen.getByRole('button', { name: 'Next level' }),
    ).toBeInTheDocument()
  })

  it('a hint costs points but not lives', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    await swap(user) // +10
    await user.click(screen.getByRole('button', { name: /hint/i }))
    await user.click(screen.getByRole('button', { name: 'Back to game' }))

    const stats = screen.getByLabelText('Game stats')
    expect(stats).toHaveTextContent('Score 5')
    expect(screen.getByLabelText('Lives: 3 of 3')).toBeInTheDocument()
  })

  it('a hint never takes the score below zero', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    await user.click(screen.getByRole('button', { name: /hint/i }))
    await user.click(screen.getByRole('button', { name: 'Back to game' }))
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 0')
  })
})
