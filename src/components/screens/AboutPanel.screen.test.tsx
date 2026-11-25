import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PlayScreen } from './PlayScreen'
import { PredictScreen } from './PredictScreen'

const input = [2, 1, 3]

describe('About panel inside the games', () => {
  it('Play: collapsed by default and opens on request', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    expect(screen.queryByText('Think of it like this')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Show details' }))
    expect(screen.getByText('Think of it like this')).toBeInTheDocument()
  })

  it('Predict: collapsed by default and opens on request', async () => {
    const user = userEvent.setup()
    render(<PredictScreen title="T" input={input} />)
    expect(screen.queryByText('Think of it like this')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Show details' }))
    expect(screen.getByText('Think of it like this')).toBeInTheDocument()
  })

  it('a hint opens Watch with the panel open and a log of past steps only', async () => {
    const user = userEvent.setup()
    render(<PlayScreen title="T" input={input} />)
    await user.click(screen.getByRole('button', { name: /hint/i }))
    expect(
      screen.getByRole('button', { name: 'Hide details' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: 'Step log' }),
    ).not.toHaveTextContent('so swap them')
  })
})
