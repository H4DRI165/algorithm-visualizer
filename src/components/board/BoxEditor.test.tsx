import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BoxEditor } from './BoxEditor'

describe('BoxEditor', () => {
  it('commits a valid typed value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoxEditor values={[1, 2, 3]} onChange={onChange} />)

    const input = screen.getByLabelText('Value of box 2')
    await user.clear(input)
    await user.type(input, '50')

    expect(onChange).toHaveBeenLastCalledWith([1, 50, 3])
  })

  it('shows an error and does not commit an out-of-range value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoxEditor values={[1, 2, 3]} onChange={onChange} />)

    const input = screen.getByLabelText('Value of box 2')
    await user.clear(input)
    await user.type(input, '100')

    expect(screen.getByText('Use 1 to 99')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalledWith([1, 100, 3])
  })

  it('rejects letters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoxEditor values={[1, 2, 3]} onChange={onChange} />)

    const input = screen.getByLabelText('Value of box 1')
    await user.clear(input)
    await user.type(input, 'abc')

    expect(screen.getByText('Whole numbers only')).toBeInTheDocument()
  })

  it('adds a box up to the maximum of 10', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <BoxEditor values={[1, 2, 3]} onChange={onChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Add box' }))
    const added = onChange.mock.calls[0]?.[0] as number[]
    expect(added).toHaveLength(4)

    rerender(
      <BoxEditor
        values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        onChange={onChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add box' })).toBeDisabled()
  })

  it('removes a box down to the minimum of 3', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <BoxEditor values={[1, 2, 3, 4]} onChange={onChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove box' }))
    expect(onChange).toHaveBeenCalledWith([1, 2, 3])

    rerender(<BoxEditor values={[1, 2, 3]} onChange={onChange} />)
    expect(screen.getByRole('button', { name: 'Remove box' })).toBeDisabled()
  })

  it('reset restores the default values', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BoxEditor values={[1, 2, 3]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onChange).toHaveBeenCalledWith([42, 17, 68, 5, 91, 30])
  })
})
