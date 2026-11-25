import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ArcadeRound } from '../../game/arcade'
import { ArcadeScreen } from './ArcadeScreen'

function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST: ArcadeRound = {
  number: 1,
  algorithmId: 'bubble-sort',
  order: 'asc',
  input: [2, 1, 3],
}

function setup(
  options: {
    bestScore?: number
    onGameOver?: (score: number) => void
    onBack?: () => void
  } = {},
) {
  const user = userEvent.setup()
  const onGameOver = options.onGameOver ?? vi.fn()
  render(
    <ArcadeScreen
      bestScore={options.bestScore ?? 0}
      onGameOver={onGameOver}
      onBack={options.onBack ?? vi.fn()}
      rng={seeded(5)}
      firstRound={FIRST}
    />,
  )
  const click = (name: RegExp | string) =>
    user.click(screen.getByRole('button', { name }))
  const swap = () => click(/^swap/i)
  const keep = () => click(/^keep/i)
  const stats = () => screen.getByLabelText('Game stats')
  return { user, click, swap, keep, stats }
}

describe('ArcadeScreen', () => {
  it('starts round 1 with full lives, the algorithm name and no hint', () => {
    const { stats } = setup()
    expect(stats()).toHaveTextContent('Round 1')
    expect(screen.getByLabelText('Lives: 3 of 3')).toBeInTheDocument()
    expect(screen.getByText(/Bubble Sort · Ascending · 3 boxes/)).toBeVisible()
    expect(screen.getByRole('button', { name: /^swap/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /hint/i })).toBeNull()
  })

  it('a perfect round adds the bonus and offers the next round', async () => {
    const { swap, keep, stats } = setup()
    await swap()
    await keep()
    await keep()
    expect(screen.getByText('Round 1 cleared!')).toBeInTheDocument()
    expect(screen.getByText('Bonus +10')).toBeInTheDocument()
    expect(stats()).toHaveTextContent('Score 46')
    expect(screen.getByRole('button', { name: 'Next round' })).toBeEnabled()
  })

  it('the next round keeps the score and the lives', async () => {
    const { swap, keep, click, stats } = setup()
    await keep() // wrong: costs a life
    await swap()
    await keep()
    await keep()
    await click('Next round')

    expect(stats()).toHaveTextContent('Round 2')
    expect(stats()).toHaveTextContent('Score 46')
    expect(screen.getByLabelText('Lives: 2 of 3')).toBeInTheDocument()
    expect(screen.queryByText('Round 1 cleared!')).toBeNull()
  })

  it('a wrong answer costs a life and resets the streak', async () => {
    const { swap, keep, stats } = setup()
    await swap()
    expect(stats()).toHaveTextContent('Streak 1')
    await swap() // wrong: keep was expected
    expect(screen.getByLabelText('Lives: 2 of 3')).toBeInTheDocument()
    expect(stats()).toHaveTextContent('Streak 0')
    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
    await keep()
    expect(stats()).toHaveTextContent('Streak 1')
  })

  it('losing every life ends the run and reports the score once', async () => {
    const onGameOver = vi.fn()
    const { swap } = setup({ onGameOver })
    await swap() // +10
    await swap()
    await swap()
    expect(onGameOver).not.toHaveBeenCalled()
    await swap()

    expect(screen.getByText('Game over')).toBeInTheDocument()
    expect(screen.getByText('New best score!')).toBeInTheDocument()
    expect(onGameOver).toHaveBeenCalledTimes(1)
    expect(onGameOver).toHaveBeenCalledWith(10)
    expect(screen.queryByRole('button', { name: /^swap/i })).toBeNull()
  })

  it('does not claim a new best when the old best is higher', async () => {
    const { swap } = setup({ bestScore: 50 })
    await swap()
    await swap()
    await swap()
    await swap()
    expect(screen.getByText('Game over')).toBeInTheDocument()
    expect(screen.getByText('Your best is 50')).toBeInTheDocument()
    expect(screen.queryByText('New best score!')).toBeNull()
  })

  it('Play again starts a new run with full lives', async () => {
    const { swap, click, stats } = setup()
    await swap()
    await swap()
    await swap()
    await swap()
    await click('Play again')
    expect(screen.queryByText('Game over')).toBeNull()
    expect(stats()).toHaveTextContent('Round 1')
    expect(stats()).toHaveTextContent('Score 0')
    expect(screen.getByLabelText('Lives: 3 of 3')).toBeInTheDocument()
  })

  it('the S and K keys answer the question', async () => {
    const { user, stats } = setup()
    await user.keyboard('s')
    expect(stats()).toHaveTextContent('Score 10')
    await user.keyboard('k')
    expect(stats()).toHaveTextContent('Streak 2')
  })

  it('the back button leaves Arcade', async () => {
    const onBack = vi.fn()
    const { click } = setup({ onBack })
    await click('Back to map')
    expect(onBack).toHaveBeenCalledOnce()
  })
})
