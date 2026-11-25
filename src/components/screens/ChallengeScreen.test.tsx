import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ShareState } from '../../schemas/share'
import { ChallengeScreen } from './ChallengeScreen'

const base: ShareState = {
  algo: 'bubble-sort',
  values: [2, 1, 3],
  order: 'asc',
  mode: 'be-the-algorithm',
}

describe('ChallengeScreen', () => {
  it('plays Be the algorithm on the shared puzzle', () => {
    render(<ChallengeScreen share={base} onBack={() => {}} />)
    expect(
      screen.getByRole('heading', { name: 'Challenge: Bubble Sort' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^swap/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Box 1: 2, comparing')).toBeInTheDocument()
  })

  it('plays Predict mode', () => {
    render(
      <ChallengeScreen
        share={{ ...base, mode: 'predict' }}
        onBack={() => {}}
      />,
    )
    expect(
      screen.getByText('What does the algorithm do first?'),
    ).toBeInTheDocument()
  })

  it('plays Beat the algorithm', () => {
    render(
      <ChallengeScreen
        share={{ ...base, mode: 'beat-the-algorithm' }}
        onBack={() => {}}
      />,
    )
    expect(screen.getByLabelText('Game stats')).toHaveTextContent(
      'Your swaps 0',
    )
  })

  it('shows an alert for an unknown algorithm', () => {
    render(
      <ChallengeScreen share={{ ...base, algo: 'nope' }} onBack={() => {}} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Unknown algorithm')
  })

  it('the back button leaves the challenge', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<ChallengeScreen share={base} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: 'Back to map' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
