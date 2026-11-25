import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './levels/progress'

async function perfectLevelOne(user: ReturnType<typeof userEvent.setup>) {
  // [3, 1, 2] with bubble sort: swap, swap, keep.
  await user.click(screen.getByRole('button', { name: /^swap/i }))
  await user.click(screen.getByRole('button', { name: /^swap/i }))
  await user.click(screen.getByRole('button', { name: /^keep/i }))
}

describe('App', () => {
  it('shows the title and the level map', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /algorithm visualizer/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Choose a level' }),
    ).toBeInTheDocument()
  })

  it('only level 1 is open at the start', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /^Level 1:/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /^Level 2:/ })).toBeDisabled()
  })

  it('plays level 1, saves 3 stars and opens the next level', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Level 1:/ }))
    expect(
      screen.getByRole('heading', { name: 'Level 1: First Steps' }),
    ).toBeInTheDocument()

    await perfectLevelOne(user)
    expect(screen.getByText('Level complete!')).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    expect(saved).toMatchObject({ stars: { 'bubble-1': 3 } })

    await user.click(screen.getByRole('button', { name: 'Next level' }))
    expect(
      screen.getByRole('heading', { name: 'Level 2: Five Boxes' }),
    ).toBeInTheDocument()
  })

  it('the map remembers the stars and unlocks level 2', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Level 1:/ }))
    await perfectLevelOne(user)
    await user.click(screen.getByRole('button', { name: 'Back to map' }))

    expect(
      screen.getByRole('button', {
        name: 'Level 1: First Steps, 3 of 3 stars',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Level 2:/ })).toBeEnabled()
  })

  it('a lost level saves nothing and offers no next level', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Level 1:/ }))

    // The first answer is "swap", so "keep" three times loses all 3 lives.
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: /^keep/i }))
    }
    expect(screen.getByText('Out of lives')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next level' })).toBeNull()

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    expect(saved).toMatchObject({ stars: {} })
  })

  it('opens free practice and comes back', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Free practice' }))
    expect(screen.getByLabelText('Practice setup')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to map' }))
    expect(
      screen.getByRole('heading', { name: 'Choose a level' }),
    ).toBeInTheDocument()
  })

  it('opens Arcade, saves the best score and comes back', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Arcade/ }))
    expect(screen.getByRole('heading', { name: 'Arcade' })).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Round 1')

    await user.click(screen.getByRole('button', { name: 'Back to map' }))
    expect(
      screen.getByRole('heading', { name: 'Choose a level' }),
    ).toBeInTheDocument()
  })

  it('resetting progress locks the levels again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Level 1:/ }))
    await perfectLevelOne(user)
    await user.click(screen.getByRole('button', { name: 'Back to map' }))

    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(screen.getByRole('button', { name: 'Yes, reset' }))
    expect(screen.getByRole('button', { name: /^Level 2:/ })).toBeDisabled()
  })
})
