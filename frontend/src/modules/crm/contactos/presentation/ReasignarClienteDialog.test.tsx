import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReasignarClienteDialog } from './ReasignarClienteDialog'
import * as useClientesModule from '@/modules/crm/clientes/application/useClientes'
import * as useReassignModule from '../application/useReassignContactoCliente'

vi.mock('@/modules/crm/clientes/application/useClientes')
vi.mock('../application/useReassignContactoCliente')

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode; onOpenChange?: () => void }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

vi.mock('siesa-ui-kit', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  Select: ({
    options,
    value,
    onChange,
    disabled,
    placeholder,
  }: {
    options: { value: string; label: string }[]
    value?: string
    onChange?: (val: string) => void
    disabled?: boolean
    placeholder?: string
  }) => (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      aria-label="Seleccionar cliente destino"
    >
      <option value="">{placeholder ?? 'Seleccionar...'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  ),
}))

const mockClientes = [
  { id: 'cliente-1', nombre: 'Empresa A', nit: '111', telefono: '111', ciudad: 'Bogotá', createdAt: '', updatedAt: '' },
  { id: 'cliente-2', nombre: 'Empresa B', nit: '222', telefono: '222', ciudad: 'Medellín', createdAt: '', updatedAt: '' },
  { id: 'cliente-3', nombre: 'Empresa C', nit: '333', telefono: '333', ciudad: 'Cali', createdAt: '', updatedAt: '' },
]

const mockMutate = vi.fn()

function setupMocks(overrides: { clientes?: typeof mockClientes; isLoading?: boolean; isPending?: boolean } = {}) {
  vi.mocked(useClientesModule.useClientes).mockReturnValue({
    clientes: overrides.clientes ?? mockClientes,
    isLoading: overrides.isLoading ?? false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useClientesModule.useClientes>)

  vi.mocked(useReassignModule.useReassignContactoCliente).mockReturnValue({
    mutate: mockMutate,
    isPending: overrides.isPending ?? false,
  } as unknown as ReturnType<typeof useReassignModule.useReassignContactoCliente>)
}

const defaultProps = {
  contactoId: 'contacto-1',
  currentClienteId: 'cliente-1',
  open: true,
  onOpenChange: vi.fn(),
}

describe('ReasignarClienteDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Select with all clients except the current one', () => {
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} />)
    // Empresa A is currentClienteId=cliente-1 → excluded
    expect(screen.queryByText('Empresa A')).not.toBeInTheDocument()
    expect(screen.getByText('Empresa B')).toBeInTheDocument()
    expect(screen.getByText('Empresa C')).toBeInTheDocument()
  })

  it('Guardar button is disabled when no client is selected', () => {
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} />)
    expect(screen.getByText('Guardar').closest('button')).toBeDisabled()
  })

  it('Guardar button is enabled after selecting a client', () => {
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cliente-2' } })
    expect(screen.getByText('Guardar').closest('button')).not.toBeDisabled()
  })

  it('calls mutation with correct params on confirm', () => {
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cliente-2' } })
    fireEvent.click(screen.getByText('Guardar'))
    expect(mockMutate).toHaveBeenCalledWith(
      {
        contactoId: 'contacto-1',
        newClienteId: 'cliente-2',
        oldClienteId: 'cliente-1',
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    )
  })

  it('calls onOpenChange(false) when Cancelar is clicked', () => {
    const onOpenChange = vi.fn()
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('Select is disabled while clients are loading', () => {
    setupMocks({ isLoading: true })
    render(<ReasignarClienteDialog {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('Select and buttons are disabled while mutation is pending', () => {
    setupMocks({ isPending: true })
    render(<ReasignarClienteDialog {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(screen.getByText('Cancelar').closest('button')).toBeDisabled()
  })

  it('closes dialog on successful mutation', () => {
    const onOpenChange = vi.fn()
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} onOpenChange={onOpenChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cliente-2' } })
    fireEvent.click(screen.getByText('Guardar'))

    // Extract the onSuccess callback passed to mutate and invoke it
    const [, mutateOptions] = mockMutate.mock.calls[0]
    mutateOptions.onSuccess()

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('resets selection when dialog closes', () => {
    const onOpenChange = vi.fn()
    setupMocks()
    render(<ReasignarClienteDialog {...defaultProps} onOpenChange={onOpenChange} />)

    // Select a client
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cliente-2' } })
    expect(screen.getByRole('combobox')).toHaveValue('cliente-2')

    // Cancel (which calls handleClose → resets state + onOpenChange(false))
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onOpenChange).toHaveBeenCalledWith(false)

    // Reopen — rerender with open=true to simulate fresh open
    onOpenChange.mockClear()
    render(<ReasignarClienteDialog {...defaultProps} open={true} onOpenChange={onOpenChange} />)
    expect(screen.getAllByRole('combobox')[0]).toHaveValue('')
  })
})
