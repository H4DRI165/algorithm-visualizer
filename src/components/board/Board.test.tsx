import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Board } from './Board'

describe('Board', () => {
  it('renders one box per value', () => {
    render(<Board values={[5, 3, 8]} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('defaults every box to idle', () => {
    render(<Board values={[5, 3, 8]} />)
    expect(screen.getByLabelText('Box 1: 5, idle')).toBeInTheDocument()
  })

  it('announces the state of each box', () => {
    render(
      <Board values={[5, 3, 8]} states={['idle', 'comparing', 'sorted']} />,
    )
    expect(screen.getByLabelText('Box 2: 3, comparing')).toBeInTheDocument()
    expect(screen.getByLabelText('Box 3: 8, sorted')).toBeInTheDocument()
  })
})
