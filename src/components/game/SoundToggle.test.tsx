import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { SOUND_KEY, isSoundEnabled, setSoundEnabled } from '../../audio/sound'
import { SoundToggle } from './SoundToggle'

afterEach(() => setSoundEnabled(false))

describe('SoundToggle', () => {
  it('starts off and switches on and off', async () => {
    const user = userEvent.setup()
    render(<SoundToggle />)
    const button = screen.getByRole('button', { name: 'Sound effects' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).toHaveTextContent('Sound: off')

    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveTextContent('Sound: on')
    expect(isSoundEnabled()).toBe(true)
    expect(localStorage.getItem(SOUND_KEY)).toBe('on')

    await user.click(button)
    expect(isSoundEnabled()).toBe(false)
  })
})
