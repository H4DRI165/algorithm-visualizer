import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /algorithm visualizer/i }),
    ).toBeInTheDocument()
  })

  it('starts with bubble sort controls', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /^swap/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^keep/i })).toBeInTheDocument()
  })

  it('switching to selection sort changes the question and the code', async () => {
    const user = userEvent.setup()
    render(<App />)
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
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(screen.getByLabelText('Order'), 'desc')
    expect(screen.getByText(/arr\[j\] < arr\[j \+ 1\]/)).toBeInTheDocument()
  })

  it('the box count follows the Boxes setting', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Boxes' }),
      '8',
    )
    const board = screen.getByRole('list', { name: 'Boxes' })
    expect(within(board).getAllByRole('listitem')).toHaveLength(8)
  })
})
