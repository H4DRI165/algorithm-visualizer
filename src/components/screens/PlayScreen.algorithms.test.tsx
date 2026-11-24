import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { selectionSortAlgorithm } from '../../algorithms/registry'
import { PlayScreen } from './PlayScreen'

// Perfect run for [3, 1, 2]: new smallest, keep, swap, new smallest, swap.
function setup() {
  const user = userEvent.setup()
  render(
    <PlayScreen
      title="Selection test"
      algorithm={selectionSortAlgorithm}
      input={[3, 1, 2]}
    />,
  )
  const click = (name: RegExp) =>
    user.click(screen.getByRole('button', { name }))
  return { user, click }
}

describe('PlayScreen with selection sort', () => {
  it('asks "new smallest or keep" and marks the selected box', () => {
    setup()
    expect(
      screen.getByRole('button', { name: /new smallest/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^keep/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^swap/i })).toBeNull()
    expect(screen.getByLabelText('Box 1: 3, selected')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 2: 1, comparing')).toBeInTheDocument()
  })

  it('a correct answer scores and moves the selection', async () => {
    const { click } = setup()
    await click(/new smallest/i)
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    expect(screen.getByLabelText('Box 2: 1, selected')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 3: 2, comparing')).toBeInTheDocument()
  })

  it('a wrong answer costs a life', async () => {
    const { click } = setup()
    await click(/^keep/i)
    expect(screen.getByLabelText('Lives: 2 of 3')).toBeInTheDocument()
    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
  })

  it('a perfect run wins, including the lone swap prompts', async () => {
    const { click } = setup()
    await click(/new smallest/i)
    await click(/^keep/i)

    // Now only the swap is offered.
    expect(screen.queryByRole('button', { name: /^keep/i })).toBeNull()
    expect(screen.getByText(/swap the smallest/i)).toBeInTheDocument()
    await click(/^swap/i)

    await click(/new smallest/i)
    await click(/^swap/i)

    expect(screen.getByText('Level complete!')).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
  })

  it('the N and K keys answer the question', async () => {
    const { user } = setup()
    await user.keyboard('n')
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    await user.keyboard('k')
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Streak 2')
  })
})
