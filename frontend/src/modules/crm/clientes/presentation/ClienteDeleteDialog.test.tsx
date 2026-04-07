import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClienteDeleteDialog } from './ClienteDeleteDialog'

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  clienteNombre: 'Empresa Test S.A.',
  onConfirm: vi.fn(),
  isPending: false,
}

describe('ClienteDeleteDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders dialog title and client name', () => {
    render(<ClienteDeleteDialog {...defaultProps} />)
    expect(screen.getByText(/eliminar este cliente/i)).toBeInTheDocument()
    expect(screen.getByText(/Empresa Test S\.A\./)).toBeInTheDocument()
  })

  it('calls onConfirm when Confirmar is clicked', async () => {
    render(<ClienteDeleteDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onOpenChange(false) when Cancelar is clicked', async () => {
    render(<ClienteDeleteDialog {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables buttons and shows Eliminando when isPending is true', () => {
    render(<ClienteDeleteDialog {...defaultProps} isPending={true} />)
    expect(screen.getByRole('button', { name: /eliminando/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
  })
})
