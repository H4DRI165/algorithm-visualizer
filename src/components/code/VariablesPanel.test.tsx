import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VariablesPanel } from './VariablesPanel'

describe('VariablesPanel', () => {
  it('shows each variable with its value', () => {
    render(<VariablesPanel vars={{ i: 0, j: 1 }} />)
    expect(screen.getByText('i = 0')).toBeInTheDocument()
    expect(screen.getByText('j = 1')).toBeInTheDocument()
  })

  it('shows a placeholder when there are none', () => {
    render(<VariablesPanel />)
    expect(screen.getByText('none yet')).toBeInTheDocument()
  })
})
