import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClienteDetailView } from './ClienteDetailView'
import * as useClienteModule from '../application/useCliente'
import * as useDeleteClienteModule from '../application/useDeleteCliente'
import type { Cliente } from '../domain/Cliente'

vi.mock('../application/useCliente')
vi.mock('../application/useDeleteCliente')

vi.mock('./ClienteFormDialog', () => ({
  ClienteFormDialog: () => null,
}))

vi.mock('./AssociatedContactsSection', () => ({
  AssociatedContactsSection: () => null,
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockCliente: Cliente = {
  id: '550e8400-e29b-41d4-a716-446655440099',
  nombre: 'Empresa Detalle S.A.',
  nit: '900000099-9',
  telefono: '+57 1 000 0000',
  ciudad: 'Cali',
  createdAt: '2026-03-13T10:00:00Z',
  updatedAt: '2026-03-13T10:00:00Z',
}

function mockUseCliente(overrides = {}) {
  vi.mocked(useClienteModule.useCliente).mockReturnValue({
    data: mockCliente,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useClienteModule.useCliente>)
}

function mockUseDeleteCliente(overrides = {}) {
  vi.mocked(useDeleteClienteModule.useDeleteCliente).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useDeleteClienteModule.useDeleteCliente>)
}

describe('ClienteDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeleteCliente()
  })

  it('renders all client fields on success', () => {
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    // nombre appears in both h1 heading and DescriptionList — use getAllByText
    expect(screen.getAllByText('Empresa Detalle S.A.')).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Empresa Detalle S.A.' })).toBeInTheDocument()
    expect(screen.getByText('900000099-9')).toBeInTheDocument()
    expect(screen.getByText('+57 1 000 0000')).toBeInTheDocument()
    expect(screen.getByText('Cali')).toBeInTheDocument()
  })

  it('renders dash for null telefono and ciudad', () => {
    mockUseCliente({
      data: { ...mockCliente, telefono: null, ciudad: null },
    })

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  it('shows loading skeleton while fetching', () => {
    mockUseCliente({ data: undefined, isLoading: true })

    const { container } = render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Empresa Detalle S.A.')).not.toBeInTheDocument()
  })

  it('shows "Cliente no encontrado." on 404 error', () => {
    mockUseCliente({
      data: undefined,
      isError: true,
      error: { isAxiosError: true, response: { status: 404 } },
    })

    render(<ClienteDetailView clienteId="nonexistent-id" />)

    expect(screen.getByText('Cliente no encontrado.')).toBeInTheDocument()
    expect(screen.getByText('Volver a clientes')).toBeInTheDocument()
  })

  it('shows ErrorPanel on non-404 error', () => {
    mockUseCliente({
      data: undefined,
      isError: true,
      error: { isAxiosError: true, response: { status: 500 } },
    })

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(screen.getByText('No se pudo cargar el cliente.')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('calls refetch when Reintentar is clicked', () => {
    const refetch = vi.fn()
    mockUseCliente({
      data: undefined,
      isError: true,
      error: { response: { status: 500 } },
      refetch,
    })

    render(<ClienteDetailView clienteId={mockCliente.id} />)
    fireEvent.click(screen.getByText('Reintentar'))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('Volver button navigates to /clientes', () => {
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)
    fireEvent.click(screen.getByText('Volver'))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/clientes' })
  })

  it('renders Editar button in detail view when client data is loaded', () => {
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('renders Eliminar button in detail view when client data is loaded', () => {
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  it('does not render Eliminar button during loading', () => {
    mockUseCliente({ data: undefined, isLoading: true })

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument()
  })

  it('does not render Eliminar button on error', () => {
    mockUseCliente({
      data: undefined,
      isError: true,
      error: { isAxiosError: true, response: { status: 500 } },
    })

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument()
  })

  it('opens delete dialog when Eliminar is clicked', async () => {
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))

    expect(screen.getByText('¿Eliminar este cliente?')).toBeInTheDocument()
  })

  it('closes delete dialog when Cancelar is clicked', async () => {
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(screen.getByText('¿Eliminar este cliente?')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('¿Eliminar este cliente?')).not.toBeInTheDocument()
  })

  it('calls delete mutation and navigates when Confirmar is clicked', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    mockUseDeleteCliente({ mutateAsync })
    mockUseCliente()

    render(<ClienteDetailView clienteId={mockCliente.id} />)

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /eliminar/i }))

    expect(mutateAsync).toHaveBeenCalledWith(mockCliente.id)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/clientes' })
  })
})
