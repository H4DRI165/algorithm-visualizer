import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { insertionSortAlgorithm } from '../../algorithms/registry'
import { AboutPanel } from './AboutPanel'

describe('AboutPanel', () => {
  it('is collapsed by default and opens on request', async () => {
    const user = userEvent.setup()
    render(<AboutPanel algorithm={insertionSortAlgorithm} />)
    const toggle = screen.getByRole('button', { name: 'Show details' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('What it does')).toBeNull()

    await user.click(toggle)
    expect(screen.getByText('What it does')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Hide details' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('can start open, and collapses again', async () => {
    const user = userEvent.setup()
    render(<AboutPanel algorithm={insertionSortAlgorithm} defaultOpen />)
    expect(
      screen.getByText(insertionSortAlgorithm.explanation.summary),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hide details' }))
    expect(screen.queryByText('What it does')).toBeNull()
  })

  it('shows the complexity table', () => {
    render(<AboutPanel algorithm={insertionSortAlgorithm} defaultOpen />)
    expect(screen.getByRole('row', { name: /best case/i })).toHaveTextContent(
      'O(n)',
    )
    expect(screen.getByRole('row', { name: /worst case/i })).toHaveTextContent(
      'O(n²)',
    )
    expect(screen.getByRole('row', { name: /extra space/i })).toHaveTextContent(
      'O(1)',
    )
  })
})
