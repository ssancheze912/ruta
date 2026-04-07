import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ClienteListView } from './ClienteListView'
import * as useClientesModule from '../application/useClientes'
import type { Cliente } from '../domain/Cliente'

vi.mock('../application/useClientes')
vi.mock('./ClienteFormDialog', () => ({
  ClienteFormDialog: () => null,
}))

const mockClientes: Cliente[] = [
  {
    id: '1',
    nombre: 'Empresa ABC',
    nit: '900123456-1',
    telefono: '6014567890',
    ciudad: 'Bogotá',
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: '2',
    nombre: 'Constructora XYZ',
    nit: '800987654-2',
    telefono: null,
    ciudad: 'Medellín',
    createdAt: '2026-03-13T11:00:00Z',
    updatedAt: '2026-03-13T11:00:00Z',
  },
]

function mockUseClientes(overrides = {}) {
  vi.mocked(useClientesModule.useClientes).mockReturnValue({
    clientes: mockClientes,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useClientesModule.useClientes>)
}

describe('ClienteListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders cliente list with nombre and nit', () => {
    mockUseClientes()

    render(<ClienteListView />)

    expect(screen.getByText('Empresa ABC')).toBeInTheDocument()
    expect(screen.getByText('900123456-1')).toBeInTheDocument()
    expect(screen.getByText('Constructora XYZ')).toBeInTheDocument()
    expect(screen.getByText('800987654-2')).toBeInTheDocument()
  })

  it('shows EmptyState when no clientes from API', () => {
    mockUseClientes({ clientes: [] })

    render(<ClienteListView />)

    expect(
      screen.getByText('No hay clientes aún. Crea el primer cliente.'),
    ).toBeInTheDocument()
  })

  it('shows search EmptyState when search yields no results', () => {
    mockUseClientes()

    render(<ClienteListView />)

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o NIT/RUC')
    fireEvent.change(searchInput, { target: { value: 'xyznonexistente' } })

    expect(screen.getByText('Sin resultados para tu búsqueda.')).toBeInTheDocument()
    expect(
      screen.queryByText('No hay clientes aún. Crea el primer cliente.'),
    ).not.toBeInTheDocument()
  })

  it('shows ErrorPanel when fetch fails', () => {
    mockUseClientes({ clientes: [], isError: true })

    render(<ClienteListView />)

    expect(
      screen.getByText('No se pudo cargar la información.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('calls refetch when Reintentar is clicked', () => {
    const refetch = vi.fn()
    mockUseClientes({ clientes: [], isError: true, refetch })

    render(<ClienteListView />)
    fireEvent.click(screen.getByText('Reintentar'))

    expect(refetch).toHaveBeenCalledOnce()
  })

  it('filters clientes by nombre on search', () => {
    mockUseClientes()

    render(<ClienteListView />)

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o NIT/RUC')
    fireEvent.change(searchInput, { target: { value: 'empresa' } })

    expect(screen.getByText('Empresa ABC')).toBeInTheDocument()
    expect(screen.queryByText('Constructora XYZ')).not.toBeInTheDocument()
  })

  it('filters clientes by nit on search', () => {
    mockUseClientes()

    render(<ClienteListView />)

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o NIT/RUC')
    fireEvent.change(searchInput, { target: { value: '800987654' } })

    expect(screen.getByText('Constructora XYZ')).toBeInTheDocument()
    expect(screen.queryByText('Empresa ABC')).not.toBeInTheDocument()
  })
})
