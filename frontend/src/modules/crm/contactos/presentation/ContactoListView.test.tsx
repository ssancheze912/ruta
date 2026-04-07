import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContactoListView } from './ContactoListView'
import * as useContactosModule from '../application/useContactos'
import type { Contacto } from '../domain/Contacto'

vi.mock('./ContactoFormDialog', () => ({
  ContactoFormDialog: ({
    open,
    onOpenChange,
  }: {
    open: boolean
    onOpenChange: (open: boolean) => void
  }) =>
    open ? (
      <div data-testid="contacto-form-dialog">
        <button onClick={() => onOpenChange(false)}>Cancelar</button>
      </div>
    ) : null,
}))

vi.mock('../application/useContactos')

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('react-loading-skeleton', () => ({
  default: ({ height }: { height: number }) => (
    <div data-testid="skeleton" style={{ height }} />
  ),
}))

vi.mock('siesa-ui-kit', () => ({
  Badge: ({ label }: { label: string }) => <span>{label}</span>,
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  Input: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
  }) => <input value={value} onChange={onChange} placeholder={placeholder} />,
  Table: ({
    data,
    columns,
    onRowClick,
  }: {
    data: Contacto[]
    columns: {
      accessor: string
      render?: (value: unknown, row: Contacto) => React.ReactNode
    }[]
    onRowClick?: (row: Contacto) => void
  }) => (
    <ul>
      {data.map((row) => (
        <li key={row.id} onClick={() => onRowClick?.(row)}>
          {columns.map((col) => (
            <span key={col.accessor}>
              {col.render
                ? col.render((row as Record<string, unknown>)[col.accessor], row)
                : String((row as Record<string, unknown>)[col.accessor] ?? '')}
            </span>
          ))}
        </li>
      ))}
    </ul>
  ),
}))

const mockContactos: Contacto[] = [
  {
    id: '1',
    nombre: 'Ana García',
    cargo: 'Gerente',
    telefono: '3001234567',
    email: 'ana@empresa.com',
    clienteId: '100',
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: '2',
    nombre: 'Carlos López',
    cargo: 'Comercial',
    telefono: '3009876543',
    email: 'carlos@libre.com',
    clienteId: null,
    createdAt: '2026-03-13T11:00:00Z',
    updatedAt: '2026-03-13T11:00:00Z',
  },
]

function mockUseContactos(overrides = {}) {
  vi.mocked(useContactosModule.useContactos).mockReturnValue({
    data: mockContactos,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useContactosModule.useContactos>)
}

describe('ContactoListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
  })

  it('renders contact list with nombre, cargo and email', () => {
    mockUseContactos()
    render(<ContactoListView />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Gerente')).toBeInTheDocument()
    expect(screen.getByText('ana@empresa.com')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
  })

  it('shows "Sin cliente" badge for contacts without client', () => {
    mockUseContactos()
    render(<ContactoListView />)
    const sinClienteElements = screen.getAllByText('Sin cliente')
    expect(sinClienteElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty message when no contacts', () => {
    mockUseContactos({ data: [] })
    render(<ContactoListView />)
    expect(
      screen.getByText('No hay contactos aún. Crea el primer contacto.'),
    ).toBeInTheDocument()
  })

  it('shows error panel when fetch fails', () => {
    mockUseContactos({ data: undefined, isError: true })
    render(<ContactoListView />)
    expect(screen.getByText('No se pudo cargar la información.')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('calls refetch when retry button is clicked', () => {
    const refetch = vi.fn()
    mockUseContactos({ data: undefined, isError: true, refetch })
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Reintentar'))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('shows "Nuevo contacto" button at all times', () => {
    mockUseContactos()
    render(<ContactoListView />)
    expect(screen.getByText('Nuevo contacto')).toBeInTheDocument()
  })

  it('shows "Nuevo contacto" button even during error state', () => {
    mockUseContactos({ data: undefined, isError: true })
    render(<ContactoListView />)
    expect(screen.getByText('Nuevo contacto')).toBeInTheDocument()
  })

  it('shows "Nuevo contacto" button even when list is empty', () => {
    mockUseContactos({ data: [] })
    render(<ContactoListView />)
    expect(screen.getByText('Nuevo contacto')).toBeInTheDocument()
  })

  it('opens dialog when "Nuevo contacto" button is clicked', async () => {
    mockUseContactos()
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Nuevo contacto'))
    expect(await screen.findByTestId('contacto-form-dialog')).toBeInTheDocument()
  })

  it('closes dialog when Cancelar is clicked', async () => {
    mockUseContactos()
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Nuevo contacto'))
    await screen.findByTestId('contacto-form-dialog')
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByTestId('contacto-form-dialog')).not.toBeInTheDocument()
  })

  it('filters contacts by nombre on search', () => {
    mockUseContactos()
    render(<ContactoListView />)
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o email')
    fireEvent.change(searchInput, { target: { value: 'ana' } })
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.queryByText('Carlos López')).not.toBeInTheDocument()
  })

  it('filters contacts by email on search', () => {
    mockUseContactos()
    render(<ContactoListView />)
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o email')
    fireEvent.change(searchInput, { target: { value: 'carlos@' } })
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
  })

  it('shows orphan count in toggle button', () => {
    mockUseContactos()
    render(<ContactoListView />)
    expect(screen.getByText('Sin cliente (1)')).toBeInTheDocument()
  })

  it('activates orphan filter on button click — shows only orphan contacts', () => {
    mockUseContactos()
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Sin cliente (1)'))
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
  })

  it('deactivates orphan filter on second click — restores full list', () => {
    mockUseContactos()
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Sin cliente (1)'))
    fireEvent.click(screen.getByText('Sin cliente (1)'))
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
  })

  it('shows "Todos los contactos tienen cliente asignado" when filter active and no orphans', () => {
    const mockSinHuerfanos = [
      { ...mockContactos[0] },
      { ...mockContactos[1], clienteId: '200' },
    ]
    mockUseContactos({ data: mockSinHuerfanos })
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Sin cliente (0)'))
    expect(screen.getByText('Todos los contactos tienen cliente asignado')).toBeInTheDocument()
  })

  it('orphan filter composes with search term', () => {
    const extraOrphan = {
      id: '3',
      nombre: 'Pedro Ruiz',
      cargo: 'Ventas',
      telefono: '3007654321',
      email: 'pedro@libre.com',
      clienteId: null,
      createdAt: '2026-03-13T12:00:00Z',
      updatedAt: '2026-03-13T12:00:00Z',
    }
    mockUseContactos({ data: [...mockContactos, extraOrphan] })
    render(<ContactoListView />)
    fireEvent.click(screen.getByText('Sin cliente (2)'))
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o email')
    fireEvent.change(searchInput, { target: { value: 'carlos' } })
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
    expect(screen.queryByText('Pedro Ruiz')).not.toBeInTheDocument()
    expect(screen.queryByText('Ana García')).not.toBeInTheDocument()
  })

  it('shows "Sin cliente (0)" and allows activation when no orphans exist', () => {
    const mockSinHuerfanos = [
      { ...mockContactos[0] },
      { ...mockContactos[1], clienteId: '200' },
    ]
    mockUseContactos({ data: mockSinHuerfanos })
    render(<ContactoListView />)
    const toggleBtn = screen.getByText('Sin cliente (0)').closest('button')!
    expect(toggleBtn).not.toBeDisabled()
    fireEvent.click(toggleBtn)
    expect(screen.getByText('Todos los contactos tienen cliente asignado')).toBeInTheDocument()
  })

  it('deactivating orphan filter with active search shows only search-matching contacts', () => {
    mockUseContactos()
    render(<ContactoListView />)
    // activate orphan filter → only Carlos López (orphan)
    fireEvent.click(screen.getByText('Sin cliente (1)'))
    // type search matching Ana García but NOT Carlos López
    const searchInput = screen.getByPlaceholderText('Buscar por nombre o email')
    fireEvent.change(searchInput, { target: { value: 'ana' } })
    // deactivate orphan filter → search-only: only Ana García visible
    fireEvent.click(screen.getByText('Sin cliente (1)'))
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.queryByText('Carlos López')).not.toBeInTheDocument()
  })
})
