import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LEVELS } from '../../levels/levels'
import { emptyProgress, recordStars } from '../../levels/progress'
import { LevelMap } from './LevelMap'

function setup(progress = emptyProgress()) {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  const onPractice = vi.fn()
  const onResetProgress = vi.fn()
  render(
    <LevelMap
      levels={LEVELS}
      progress={progress}
      onSelect={onSelect}
      onPractice={onPractice}
      onResetProgress={onResetProgress}
    />,
  )
  return { user, onSelect, onPractice, onResetProgress }
}

describe('LevelMap', () => {
  it('shows every level', () => {
    setup()
    expect(within_list().length).toBe(LEVELS.length)
  })

  it('only the first level is open at the start', () => {
    setup()
    expect(screen.getByRole('button', { name: /^Level 1:/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /^Level 2:/ })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Level 2: Five Boxes, locked' }),
    ).toBeInTheDocument()
  })

  it('shows earned stars and opens the next level', () => {
    let progress = recordStars(emptyProgress(), 'bubble-1', 3)
    progress = recordStars(progress, 'bubble-2', 1)
    setup(progress)
    expect(
      screen.getByRole('button', {
        name: 'Level 1: First Steps, 3 of 3 stars',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Level 2: Five Boxes, 1 of 3 stars' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Level 3:/ })).toBeEnabled()
    expect(screen.getByText(/of 45/)).toHaveTextContent('Stars: 4 of 45')
  })

  it('selecting a level reports its id', async () => {
    const { user, onSelect } = setup()
    await user.click(screen.getByRole('button', { name: /^Level 1:/ }))
    expect(onSelect).toHaveBeenCalledWith('bubble-1')
  })

  it('a locked level cannot be selected', async () => {
    const { user, onSelect } = setup()
    await user.click(screen.getByRole('button', { name: /^Level 2:/ }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('opens free practice', async () => {
    const { user, onPractice } = setup()
    await user.click(screen.getByRole('button', { name: 'Free practice' }))
    expect(onPractice).toHaveBeenCalledOnce()
  })

  it('asks before resetting progress', async () => {
    const { user, onResetProgress } = setup()
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    expect(onResetProgress).not.toHaveBeenCalled()
    expect(screen.getByText('Erase all saved stars?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yes, reset' }))
    expect(onResetProgress).toHaveBeenCalledOnce()
    expect(
      screen.getByRole('button', { name: 'Reset progress' }),
    ).toBeInTheDocument()
  })

  it('cancel keeps the progress', async () => {
    const { user, onResetProgress } = setup()
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onResetProgress).not.toHaveBeenCalled()
  })
})

function within_list() {
  return screen
    .getByRole('list', { name: 'Levels' })
    .querySelectorAll(':scope > li')
}
