import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  bubbleSortAlgorithm,
  insertionSortAlgorithm,
  selectionSortAlgorithm,
  type SortingAlgorithm,
} from '../../algorithms/registry'
import { RaceScreen } from './RaceScreen'

function setup(
  options: {
    input?: number[]
    algorithm?: SortingAlgorithm
    rival?: SortingAlgorithm
    onComplete?: () => void
  } = {},
) {
  const user = userEvent.setup()
  render(
    <RaceScreen
      title="Race test"
      input={options.input ?? [1, 2, 4, 3, 5]}
      algorithm={options.algorithm ?? bubbleSortAlgorithm}
      rival={options.rival ?? insertionSortAlgorithm}
      onComplete={options.onComplete}
    />,
  )
  const click = (name: string) =>
    user.click(screen.getByRole('button', { name }))
  const panel = (name: string) => within(screen.getByRole('region', { name }))
  return { user, click, panel }
}

describe('RaceScreen', () => {
  it('shows both algorithms and the three choices', () => {
    const { panel } = setup()
    expect(panel('Bubble Sort').getAllByRole('listitem')).toHaveLength(5)
    expect(panel('Insertion Sort').getAllByRole('listitem')).toHaveLength(5)
    expect(
      screen.getByRole('button', { name: 'Bubble Sort wins' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Insertion Sort wins' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tie' })).toBeInTheDocument()
    expect(panel('Bubble Sort').getByText(/Operations/)).toHaveTextContent(
      'Operations 0',
    )
  })

  it('a guess starts the race and hides the result until it ends', async () => {
    const onComplete = vi.fn()
    const { click } = setup({ onComplete })
    await click('Insertion Sort wins')

    expect(screen.queryByRole('button', { name: 'Tie' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByText('Race finished!')).toBeNull()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Your guess Insertion Sort wins',
    )
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('Pause and Play toggle the race', async () => {
    const { click } = setup()
    await click('Tie')
    await click('Pause')
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('a correct guess wins 3 stars and reports once', async () => {
    const onComplete = vi.fn()
    const { click, panel } = setup({ onComplete })
    await click('Insertion Sort wins')
    await click('Skip to result')

    expect(screen.getByText('Race finished!')).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Correct! Insertion Sort wins with 6 operations against 11.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 10')
    expect(panel('Bubble Sort').getByText(/Operations/)).toHaveTextContent(
      'Operations 11',
    )
    expect(panel('Insertion Sort').getByText(/Operations/)).toHaveTextContent(
      'Operations 6',
    )
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith({ stars: 3 })
  })

  it('a wrong guess still finishes, with 1 star and no points', async () => {
    const onComplete = vi.fn()
    const { click } = setup({ onComplete })
    await click('Bubble Sort wins')
    await click('Skip to result')

    expect(screen.getByLabelText('1 of 3 stars')).toBeInTheDocument()
    expect(screen.getByText(/not quite/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 0')
    expect(onComplete).toHaveBeenCalledWith({ stars: 1 })
  })

  it('a tie is a valid answer when the counts match', async () => {
    const { click } = setup({
      input: [3, 1, 2],
      algorithm: bubbleSortAlgorithm,
      rival: selectionSortAlgorithm,
    })
    await click('Tie')
    await click('Skip to result')
    expect(
      screen.getByText('Correct! It is a tie: both need 5 operations.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
  })

  it('number keys choose an option', async () => {
    const { user, click } = setup()
    await user.keyboard('2') // Insertion Sort wins
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Your guess Insertion Sort wins',
    )
    await click('Skip to result')
    expect(screen.getByLabelText('3 of 3 stars')).toBeInTheDocument()
  })

  it('shows the finished badge on both sides at the end', async () => {
    const { click, panel } = setup()
    await click('Tie')
    await click('Skip to result')
    expect(panel('Bubble Sort').getByText('Finished')).toBeInTheDocument()
    expect(panel('Insertion Sort').getByText('Finished')).toBeInTheDocument()
  })

  it('Play again restores the guess buttons', async () => {
    const { click } = setup()
    await click('Tie')
    await click('Skip to result')
    await click('Play again')
    expect(screen.queryByText('Race finished!')).toBeNull()
    expect(screen.getByRole('button', { name: 'Tie' })).toBeInTheDocument()
    expect(screen.getByLabelText('Game stats')).toHaveTextContent('Score 0')
  })

  it('shows extra end actions only when the race is over', async () => {
    const user = userEvent.setup()
    render(
      <RaceScreen
        title="T"
        input={[1, 2, 4, 3, 5]}
        algorithm={bubbleSortAlgorithm}
        rival={insertionSortAlgorithm}
        endActions={<button type="button">Next level</button>}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Next level' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Tie' }))
    await user.click(screen.getByRole('button', { name: 'Skip to result' }))
    expect(
      screen.getByRole('button', { name: 'Next level' }),
    ).toBeInTheDocument()
  })
})
