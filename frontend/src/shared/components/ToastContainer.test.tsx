import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastContainer } from './ToastContainer'
import { toast } from '../lib/toast'

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastContainer', () => {
  it('renders a toast when toast.success is called', () => {
    render(<ToastContainer />)

    act(() => {
      toast.success('Operación exitosa')
    })

    expect(screen.getByText('Operación exitosa')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    render(<ToastContainer />)

    act(() => {
      toast.success('Primer toast')
      toast.error('Segundo toast')
    })

    expect(screen.getByText('Primer toast')).toBeInTheDocument()
    expect(screen.getByText('Segundo toast')).toBeInTheDocument()
  })

  it('removes toast automatically after duration', () => {
    vi.useFakeTimers()
    render(<ToastContainer />)

    act(() => {
      toast.success('Auto dismiss')
    })

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5001)
    })

    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
  })

  it('removes toast on manual close and clears pending timer', () => {
    vi.useFakeTimers()
    render(<ToastContainer />)

    act(() => {
      toast.success('Manual close toast')
    })

    expect(screen.getByText('Manual close toast')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button'))
    })

    expect(screen.queryByText('Manual close toast')).not.toBeInTheDocument()

    // Verify no stale timer fires after manual close
    act(() => {
      vi.advanceTimersByTime(6000)
    })
    expect(screen.queryByText('Manual close toast')).not.toBeInTheDocument()
  })
})
