import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClienteFormDialog } from './ClienteFormDialog'
import * as useCreateClienteModule from '../application/useCreateCliente'
import * as useUpdateClienteModule from '../application/useUpdateCliente'

vi.mock('../application/useCreateCliente')
vi.mock('../application/useUpdateCliente')
vi.mock('@/modules/crm/contactos/application/useAssignContactoCliente', () => ({
  useAssignContactoCliente: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

const mockMutateAsync = vi.fn()

function mockUseCreateCliente(overrides = {}) {
  vi.mocked(useCreateClienteModule.useCreateCliente).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useCreateClienteModule.useCreateCliente>)
}

function mockUseUpdateCliente(overrides = {}) {
  vi.mocked(useUpdateClienteModule.useUpdateCliente).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUpdateClienteModule.useUpdateCliente>)
}

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onSuccess: vi.fn(),
}

describe('ClienteFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockReset()
    mockUseCreateCliente()
    mockUseUpdateCliente()
  })

  it('renders all 4 form fields', () => {
    render(<ClienteFormDialog {...defaultProps} />)

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nit\/ruc/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form — does not call mutate', async () => {
    render(<ClienteFormDialog {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText('Nombre es requerido')).toBeInTheDocument()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('shows validation error for whitespace-only nombre — does not call mutate', async () => {
    render(<ClienteFormDialog {...defaultProps} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText('Nombre es requerido')).toBeInTheDocument()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('submits valid form and calls onSuccess', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'new-client-id' })

    render(<ClienteFormDialog {...defaultProps} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Empresa Test')
    await userEvent.type(screen.getByLabelText(/nit\/ruc/i), '900-test')
    await userEvent.type(screen.getByLabelText(/teléfono/i), '3001234567')
    await userEvent.type(screen.getByLabelText(/ciudad/i), 'Bogotá')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        nombre: 'Empresa Test',
        nit: '900-test',
        telefono: '3001234567',
        ciudad: 'Bogotá',
      })
    })

    // After create, dialog moves to step 2 (associate contact) — skip it
    await userEvent.click(await screen.findByRole('button', { name: /saltar/i }))
    await waitFor(() => expect(defaultProps.onSuccess).toHaveBeenCalled())
  })

  it('shows "El NIT/RUC ya está registrado" on 409 error', async () => {
    mockMutateAsync.mockRejectedValue({ response: { status: 409 } })

    render(<ClienteFormDialog {...defaultProps} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Empresa Dup')
    await userEvent.type(screen.getByLabelText(/nit\/ruc/i), 'dup-nit')
    await userEvent.type(screen.getByLabelText(/teléfono/i), '3000000000')
    await userEvent.type(screen.getByLabelText(/ciudad/i), 'Cali')
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText('El NIT/RUC ya está registrado')).toBeInTheDocument()
    expect(defaultProps.onSuccess).not.toHaveBeenCalled()
  })

  it('closes dialog on cancel without calling mutation', async () => {
    render(<ClienteFormDialog {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('shows edit dialog title when clienteId provided', () => {
    render(
      <ClienteFormDialog
        {...defaultProps}
        clienteId="some-id"
        defaultValues={{ nombre: 'X', nit: 'Y', telefono: 'Z', ciudad: 'W' }}
      />,
    )
    expect(screen.getByText(/editar cliente/i)).toBeInTheDocument()
  })

  it('renders pre-filled values in edit mode', async () => {
    render(
      <ClienteFormDialog
        {...defaultProps}
        clienteId="existing-id"
        defaultValues={{ nombre: 'Empresa X', nit: '900-1', telefono: '3001', ciudad: 'Cali' }}
      />,
    )
    expect(screen.getByText(/editar cliente/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre/i)).toHaveValue('Empresa X')
      expect(screen.getByLabelText(/nit\/ruc/i)).toHaveValue('900-1')
      expect(screen.getByLabelText(/teléfono/i)).toHaveValue('3001')
      expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Cali')
    })
  })
})
