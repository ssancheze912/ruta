import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssociarContactoDialog } from './AssociarContactoDialog'
import * as useContactosModule from '@/modules/crm/contactos/application/useContactos'
import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'

vi.mock('@/modules/crm/contactos/application/useContactos')

vi.mock('siesa-ui-kit', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: string
    size?: string
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

const mockUnassigned: Contacto[] = [
  { id: 'c1', nombre: 'Pedro Ramírez', cargo: 'Dev', telefono: '300', email: 'pedro@test.com', clienteId: null, createdAt: '', updatedAt: '' },
  { id: 'c2', nombre: 'Laura Gómez', cargo: 'QA', telefono: '301', email: 'laura@test.com', clienteId: null, createdAt: '', updatedAt: '' },
]

const mockAssigned: Contacto[] = [
  { id: 'c3', nombre: 'Ya Asignado', cargo: '', telefono: '', email: 'a@b.com', clienteId: 'some-cliente', createdAt: '', updatedAt: '' },
]

function mockContactos(list: Contacto[]) {
  vi.mocked(useContactosModule.useContactos).mockReturnValue({
    data: list,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useContactosModule.useContactos>)
}

describe('AssociarContactoDialog', () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Asociar contacto button', () => {
    mockContactos([])
    render(<AssociarContactoDialog onSelect={onSelect} isLoading={false} />)
    expect(screen.getByText('Asociar contacto')).toBeInTheDocument()
  })

  it('opens selector on button click', () => {
    mockContactos(mockUnassigned)
    render(<AssociarContactoDialog onSelect={onSelect} isLoading={false} />)
    fireEvent.click(screen.getByText('Asociar contacto'))
    expect(screen.getByText('Seleccionar contacto a asociar')).toBeInTheDocument()
  })

  it('shows only unassigned contacts', () => {
    mockContactos([...mockUnassigned, ...mockAssigned])
    render(<AssociarContactoDialog onSelect={onSelect} isLoading={false} />)
    fireEvent.click(screen.getByText('Asociar contacto'))
    expect(screen.getByText('Pedro Ramírez')).toBeInTheDocument()
    expect(screen.getByText('Laura Gómez')).toBeInTheDocument()
    expect(screen.queryByText('Ya Asignado')).not.toBeInTheDocument()
  })

  it('shows empty state when no available contacts', () => {
    mockContactos(mockAssigned)
    render(<AssociarContactoDialog onSelect={onSelect} isLoading={false} />)
    fireEvent.click(screen.getByText('Asociar contacto'))
    expect(screen.getByText('No hay contactos disponibles para asociar.')).toBeInTheDocument()
  })

  it('calls onSelect with contact when item clicked', () => {
    mockContactos(mockUnassigned)
    render(<AssociarContactoDialog onSelect={onSelect} isLoading={false} />)
    fireEvent.click(screen.getByText('Asociar contacto'))
    fireEvent.click(screen.getByText('Pedro Ramírez'))
    expect(onSelect).toHaveBeenCalledWith(mockUnassigned[0])
  })

  it('closes dialog on Cancelar', () => {
    mockContactos(mockUnassigned)
    render(<AssociarContactoDialog onSelect={onSelect} isLoading={false} />)
    fireEvent.click(screen.getByText('Asociar contacto'))
    expect(screen.getByText('Seleccionar contacto a asociar')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancelar'))
    expect(screen.queryByText('Seleccionar contacto a asociar')).not.toBeInTheDocument()
  })
})
