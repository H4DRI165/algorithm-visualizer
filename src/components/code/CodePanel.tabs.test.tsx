import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CodePanel } from './CodePanel'

const lines = ['first line', 'second line']

describe('CodePanel language tabs', () => {
  it('shows a plain heading when there is no tab handler', () => {
    render(<CodePanel lines={lines} />)
    expect(screen.queryByRole('tablist')).toBeNull()
    expect(screen.getByRole('heading', { name: 'TypeScript' })).toBeVisible()
  })

  it('shows three tabs with the current one selected', () => {
    render(<CodePanel lines={lines} lang="python" onLangChange={() => {}} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Java' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('clicking a tab reports the language', async () => {
    const user = userEvent.setup()
    const onLangChange = vi.fn()
    render(<CodePanel lines={lines} lang="ts" onLangChange={onLangChange} />)
    await user.click(screen.getByRole('tab', { name: 'Java' }))
    expect(onLangChange).toHaveBeenCalledWith('java')
  })

  it('arrow keys, Home and End switch tabs', async () => {
    const user = userEvent.setup()
    const onLangChange = vi.fn()
    render(<CodePanel lines={lines} lang="ts" onLangChange={onLangChange} />)
    await user.tab() // only the selected tab is reachable
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(onLangChange).toHaveBeenLastCalledWith('python')
    await user.keyboard('{ArrowLeft}')
    expect(onLangChange).toHaveBeenLastCalledWith('java') // wraps around
    await user.keyboard('{End}')
    expect(onLangChange).toHaveBeenLastCalledWith('java')
    await user.keyboard('{Home}')
    expect(onLangChange).toHaveBeenLastCalledWith('ts')
  })

  it('the code can still be hidden', async () => {
    const user = userEvent.setup()
    render(<CodePanel lines={lines} lang="ts" onLangChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Hide code' }))
    expect(screen.queryByText('first line')).toBeNull()
    expect(screen.getByRole('tab', { name: 'Java' })).toBeInTheDocument()
  })
})
