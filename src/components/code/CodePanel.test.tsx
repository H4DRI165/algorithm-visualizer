import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CodePanel } from './CodePanel'

const lines = ['first line', 'second line', 'third line']

describe('CodePanel', () => {
  it('shows every line', () => {
    render(<CodePanel lines={lines} />)
    for (const line of lines) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
  })

  it('marks no line as current by default', () => {
    render(<CodePanel lines={lines} />)
    expect(document.querySelector('[aria-current]')).toBeNull()
  })

  it('marks only the active line as current', () => {
    render(<CodePanel lines={lines} activeLine={2} />)
    const current = document.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveTextContent('second line')
  })

  it('ignores an active line outside the listing', () => {
    render(<CodePanel lines={lines} activeLine={99} />)
    expect(document.querySelector('[aria-current]')).toBeNull()
  })

  it('can be collapsed and expanded', async () => {
    const user = userEvent.setup()
    render(<CodePanel lines={lines} />)

    await user.click(screen.getByRole('button', { name: 'Hide code' }))
    expect(screen.queryByText('first line')).toBeNull()
    expect(screen.getByRole('button', { name: 'Show code' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    await user.click(screen.getByRole('button', { name: 'Show code' }))
    expect(screen.getByText('first line')).toBeInTheDocument()
  })
})
