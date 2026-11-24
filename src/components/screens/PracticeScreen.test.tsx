import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PracticeScreen } from './PracticeScreen'

function setup() {
  const user = userEvent.setup()
  const onBack = vi.fn()
  render(<PracticeScreen onBack={onBack} />)
  return { user, onBack }
}

describe('PracticeScreen', () => {
  it('starts with bubble sort controls', () => {
    setup()
    expect(screen.getByRole('button', { name: /^swap/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^keep/i })).toBeInTheDocument()
  })

  it('switching to selection sort changes the question and the code', async () => {
    const { user } = setup()
    await user.selectOptions(
      screen.getByLabelText('Algorithm'),
      'selection-sort',
    )
    expect(
      screen.getByRole('button', { name: /new smallest/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/function selectionSort/)).toBeInTheDocument()
  })

  it('switching to descending flips the comparison in the code', async () => {
    const { user } = setup()
    await user.selectOptions(screen.getByLabelText('Order'), 'desc')
    expect(screen.getByText(/arr\[j\] < arr\[j \+ 1\]/)).toBeInTheDocument()
  })

  it('the box count follows the Boxes setting', async () => {
    const { user } = setup()
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Boxes' }),
      '8',
    )
    const board = screen.getByRole('list', { name: 'Boxes' })
    expect(within(board).getAllByRole('listitem')).toHaveLength(8)
  })

  it('the back button leaves practice', async () => {
    const { user, onBack } = setup()
    await user.click(screen.getByRole('button', { name: 'Back to map' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
