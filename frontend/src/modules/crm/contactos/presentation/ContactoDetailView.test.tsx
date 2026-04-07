import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContactoDetailView } from './ContactoDetailView'
import * as useContactoModule from '../application/useContacto'
import * as useDeleteContactoModule from '../application/useDeleteContacto'
import * as useClienteModule from '../../clientes/application/useCliente'

const mockNavigate = vi.fn()
const mockHistoryBack = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useRouter: () => ({ history: { back: mockHistoryBack } }),
  }
})

vi.mock('../application/useContacto')
vi.mock('../application/useDeleteContacto')
vi.mock('../../clientes/application/useCliente')

vi.mock('./ReasignarClienteDialog', () => ({
  ReasignarClienteDialog: ({
    open,
    onOpenChange,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
  }) =>
    open ? (
      <div data-testid="reasignar-dialog">
        <button onClick={() => onOpenChange(false)}>Cerrar reasignar</button>
      </div>
    ) : null,
}))

vi.mock('./ContactoForm', () => ({
  ContactoForm: ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => (
    <div>
      <span>ContactoForm mock</span>
      <button onClick={onSuccess}>Guardar mock</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}))

const mockUseContacto = vi.mocked(useContactoModule.useContacto)
const mockUseDeleteContacto = vi.mocked(useDeleteContactoModule.useDeleteContacto)
const mockUseCliente = vi.mocked(useClienteModule.useCliente)

function mockDeleteMutation(overrides = {}) {
  mockUseDeleteContacto.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    ...overrides,
  } as unknown as ReturnType<typeof useDeleteContactoModule.useDeleteContacto>)
}

const contactoFake = {
  id: 'abc-123',
  nombre: 'Ana García',
  cargo: 'Gerente',
  telefono: '3001234567',
  email: 'ana@empresa.com',
  clienteId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const contactoConCliente = {
  ...contactoFake,
  clienteId: 'cliente-abc',
}

const clienteFake = {
  id: 'cliente-abc',
  nombre: 'Empresa XYZ',
  nit: '900123456-1',
  telefono: '6011234567',
  ciudad: 'Bogotá',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDeleteMutation()
  mockUseCliente.mockReturnValue({
    data: undefined,
    isLoading: false,
  } as unknown as ReturnType<typeof useClienteModule.useCliente>)
})

describe('ContactoDetailView', () => {
  it('renders all contact fields', () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getAllByText('Ana García').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Gerente')).toBeInTheDocument()
    expect(screen.getByText('3001234567')).toBeInTheDocument()
    expect(screen.getByText('ana@empresa.com')).toBeInTheDocument()
  })

  it('shows loading skeleton while fetching', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    const { container } = render(<ContactoDetailView contactoId="abc-123" />)

    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows not-found message on 404', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 404 } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Contacto no encontrado.')).toBeTruthy()
  })

  it('shows error panel on generic error', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 500 } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('No se pudo cargar el contacto.')).toBeTruthy()
  })

  it('volver a contactos button in 404 state navigates to /contactos', async () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 404 } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Volver a contactos'))

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/contactos' })
  })

  it('Volver button calls router.history.back()', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Volver'))

    expect(mockHistoryBack).toHaveBeenCalledOnce()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('renders Editar button when contact is loaded', () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  it('opens edit dialog when Editar is clicked', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Editar'))

    expect(screen.getByText('Editar contacto')).toBeInTheDocument()
    expect(screen.getByText('ContactoForm mock')).toBeInTheDocument()
  })

  it('closes dialog when Cancelar is clicked', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Editar'))
    expect(screen.getByText('Editar contacto')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Editar contacto')).not.toBeInTheDocument()
  })

  it('closes dialog when form onSuccess is called (AC4)', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Editar'))
    expect(screen.getByText('Editar contacto')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Guardar mock'))
    expect(screen.queryByText('Editar contacto')).not.toBeInTheDocument()
  })

  it('does not render Editar button during loading', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('does not render Editar button on error', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 500 } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('renders Eliminar button when contact is loaded', () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('opens delete dialog when Eliminar is clicked', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Eliminar'))

    expect(screen.getByText('¿Eliminar este contacto?')).toBeInTheDocument()
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
  })

  it('closes delete dialog when Cancelar is clicked in delete dialog', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Eliminar'))
    expect(screen.getByText('¿Eliminar este contacto?')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('¿Eliminar este contacto?')).not.toBeInTheDocument()
  })

  it('calls delete mutation and navigates when Confirmar is clicked', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    mockDeleteMutation({ mutateAsync })
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Eliminar'))
    await userEvent.click(screen.getAllByText('Eliminar')[1])

    expect(mutateAsync).toHaveBeenCalledOnce()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/contactos' })
  })

  it('does not navigate when delete mutation fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network error'))
    mockDeleteMutation({ mutateAsync })
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Eliminar'))
    await userEvent.click(screen.getAllByText('Eliminar')[1])

    expect(mutateAsync).toHaveBeenCalledOnce()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not render Eliminar button during loading', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument()
  })

  it('does not render Eliminar button on error', () => {
    mockUseContacto.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { response: { status: 500 } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument()
  })

  it('shows associated client name when contact has clienteId', () => {
    mockUseContacto.mockReturnValue({
      data: contactoConCliente,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)
    mockUseCliente.mockReturnValue({
      data: clienteFake,
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteModule.useCliente>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Empresa XYZ')).toBeInTheDocument()
  })

  it('navigates to client detail on client name click', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoConCliente,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)
    mockUseCliente.mockReturnValue({
      data: clienteFake,
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteModule.useCliente>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Empresa XYZ'))

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/clientes/$clienteId',
      params: { clienteId: 'cliente-abc' },
    })
  })

  it('shows "Sin cliente asignado" when contact has no clienteId', () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Sin cliente asignado')).toBeInTheDocument()
  })

  it('shows "Error al cargar cliente" when client fetch fails', () => {
    mockUseContacto.mockReturnValue({
      data: contactoConCliente,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)
    mockUseCliente.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useClienteModule.useCliente>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Error al cargar cliente')).toBeInTheDocument()
  })

  it('shows "Reasignar cliente" button when contact has clienteId', () => {
    mockUseContacto.mockReturnValue({
      data: contactoConCliente,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Reasignar cliente')).toBeInTheDocument()
  })

  it('does not show "Reasignar cliente" button when contact has no clienteId', () => {
    mockUseContacto.mockReturnValue({
      data: contactoFake,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.queryByText('Reasignar cliente')).not.toBeInTheDocument()
  })

  it('opens ReasignarClienteDialog when "Reasignar cliente" is clicked', async () => {
    mockUseContacto.mockReturnValue({
      data: contactoConCliente,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)
    mockUseCliente.mockReturnValue({
      data: clienteFake,
      isLoading: false,
    } as unknown as ReturnType<typeof useClienteModule.useCliente>)

    render(<ContactoDetailView contactoId="abc-123" />)

    await userEvent.click(screen.getByText('Reasignar cliente'))

    expect(screen.getByTestId('reasignar-dialog')).toBeInTheDocument()
  })

  it('shows "Cargando..." while client data is loading', () => {
    mockUseContacto.mockReturnValue({
      data: contactoConCliente,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useContactoModule.useContacto>)
    mockUseCliente.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useClienteModule.useCliente>)

    render(<ContactoDetailView contactoId="abc-123" />)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })
})
