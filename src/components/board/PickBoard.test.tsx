import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PickBoard } from './PickBoard'

describe('PickBoard', () => {
  it('renders one button per value with its state', () => {
    render(
      <PickBoard
        values={[5, 3, 8]}
        states={['idle', 'selected', 'idle']}
        onPick={() => {}}
      />,
    )
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByLabelText('Box 2: 3, selected')).toBeInTheDocument()
  })

  it('reports the index of the clicked box', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<PickBoard values={[5, 3, 8]} onPick={onPick} />)
    await user.click(screen.getByLabelText('Box 3: 8, idle'))
    expect(onPick).toHaveBeenCalledWith(2)
  })

  it('cannot be clicked when disabled', async () => {
    const user = userEvent.setup()
    const onPick = vi.fn()
    render(<PickBoard values={[5, 3, 8]} disabled onPick={onPick} />)
    expect(screen.getByLabelText('Box 1: 5, idle')).toBeDisabled()
    await user.click(screen.getByLabelText('Box 1: 5, idle'))
    expect(onPick).not.toHaveBeenCalled()
  })
})
