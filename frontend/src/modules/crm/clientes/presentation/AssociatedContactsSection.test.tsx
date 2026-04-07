import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AssociatedContactsSection } from './AssociatedContactsSection'
import * as useContactosByClienteModule from '@/modules/crm/contactos/application/useContactosByCliente'
import * as useAssignModule from '@/modules/crm/contactos/application/useAssignContactoCliente'
import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'
import type { TableColumn } from 'siesa-ui-kit'

vi.mock('@/modules/crm/contactos/application/useContactosByCliente')
vi.mock('@/modules/crm/contactos/application/useAssignContactoCliente')
vi.mock('@/shared/components/ErrorPanel', () => ({
  ErrorPanel: ({ message }: { message: string }) => <p>{message}</p>,
}))

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
  Table: ({
    data,
    columns,
    onRowClick,
  }: {
    data: Contacto[]
    columns: TableColumn<Contacto>[]
    onRowClick?: (row: Contacto) => void
  }) => (
    <ul>
      {data.map((row, index) => (
        <li key={row.id}>
          <span onClick={() => onRowClick?.(row)}>{row.nombre}</span>
          {columns.map((col, ci) =>
            typeof col.render === 'function' ? (
              <span key={ci}>{col.render(undefined, row, index)}</span>
            ) : null,
          )}
        </li>
      ))}
    </ul>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: (e: React.MouseEvent) => void
    disabled?: boolean
    type?: string
    size?: string
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('./AssociarContactoDialog', () => ({
  AssociarContactoDialog: ({
    onSelect,
  }: {
    onSelect: (c: Contacto) => void
    isLoading: boolean
  }) => (
    <button
      data-testid="asociar-btn"
      onClick={() =>
        onSelect({
          id: 'new-id',
          nombre: 'Nuevo Contacto',
          cargo: '',
          telefono: '',
          email: '',
          clienteId: null,
          createdAt: '',
          updatedAt: '',
        })
      }
    >
      Asociar contacto
    </button>
  ),
}))

const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440000'

const mockContactos: Contacto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Ana García',
    cargo: 'Gerente',
    telefono: '3001234567',
    email: 'ana@empresa.com',
    clienteId: CLIENT_ID,
    createdAt: '2026-03-16T10:00:00Z',
    updatedAt: '2026-03-16T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Carlos López',
    cargo: 'Comercial',
    telefono: '3009876543',
    email: 'carlos@empresa.com',
    clienteId: CLIENT_ID,
    createdAt: '2026-03-16T11:00:00Z',
    updatedAt: '2026-03-16T11:00:00Z',
  },
]

const mockMutateAsync = vi.fn().mockResolvedValue({})

function mockHook(overrides = {}) {
  vi.mocked(useContactosByClienteModule.useContactosByCliente).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useContactosByClienteModule.useContactosByCliente>)
}

function mockAssignHook(overrides = {}) {
  vi.mocked(useAssignModule.useAssignContactoCliente).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAssignModule.useAssignContactoCliente>)
}

describe('AssociatedContactsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReset()
    mockMutateAsync.mockResolvedValue({})
    mockAssignHook()
  })

  it('renders loading skeletons while fetching', () => {
    mockHook({ isLoading: true })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('renders contact rows when contacts loaded', () => {
    mockHook({ data: mockContactos })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    expect(screen.getByText('Ana García')).toBeInTheDocument()
    expect(screen.getByText('Carlos López')).toBeInTheDocument()
  })

  it('renders empty state when no contacts', () => {
    mockHook({ data: [] })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    expect(screen.getByText('Sin contactos asociados aún.')).toBeInTheDocument()
  })

  it('renders error panel on fetch failure', () => {
    mockHook({ isError: true })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    expect(screen.getByText(/no se pudieron cargar los contactos/i)).toBeInTheDocument()
  })

  it('navigates to contact on row click', () => {
    mockHook({ data: mockContactos })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    fireEvent.click(screen.getByText('Ana García'))
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/contactos/$contactoId',
      params: { contactoId: '550e8400-e29b-41d4-a716-446655440001' },
    })
  })

  it('renders Asociar contacto button', () => {
    mockHook({ data: [] })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    expect(screen.getByTestId('asociar-btn')).toBeInTheDocument()
  })

  it('renders Desasociar button per contact row', () => {
    mockHook({ data: mockContactos })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    expect(screen.getAllByText('Desasociar')).toHaveLength(2)
  })

  it('calls disassociate mutation on Desasociar click', async () => {
    mockHook({ data: mockContactos })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    const desasociarButtons = screen.getAllByText('Desasociar')
    fireEvent.click(desasociarButtons[0])
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        contactoId: '550e8400-e29b-41d4-a716-446655440001',
        clienteId: null,
        currentClienteId: CLIENT_ID,
      }),
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('disables Desasociar buttons while mutation is pending', () => {
    mockHook({ data: mockContactos })
    mockAssignHook({ isPending: true })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    screen.getAllByText('Desasociar').forEach((btn) => expect(btn).toBeDisabled())
  })

  it('calls associate mutation when contact selected from dialog', async () => {
    mockHook({ data: [] })
    render(<AssociatedContactsSection clienteId={CLIENT_ID} />)
    fireEvent.click(screen.getByTestId('asociar-btn'))
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        contactoId: 'new-id',
        clienteId: CLIENT_ID,
        currentClienteId: CLIENT_ID,
      }),
    )
  })
})
