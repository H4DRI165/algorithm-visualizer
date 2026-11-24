import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SplitLayout } from './SplitLayout'

describe('SplitLayout', () => {
  it('renders both sides, with the board first in the page', () => {
    render(<SplitLayout board={<p>board side</p>} code={<p>code side</p>} />)
    const board = screen.getByText('board side')
    const code = screen.getByText('code side')
    expect(
      board.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
