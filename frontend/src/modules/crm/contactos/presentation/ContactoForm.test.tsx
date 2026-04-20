import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { createElement } from 'react'
import { ContactoForm } from './ContactoForm'
import * as useCreateContactoModule from '../application/useCreateContacto'
import * as useUpdateContactoModule from '../application/useUpdateContacto'

vi.mock('../application/useCreateContacto')
vi.mock('../application/useUpdateContacto')
vi.mock('../application/useAssignContactoCliente', () => ({
  useAssignContactoCliente: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))
vi.mock('@/shared/lib/lookupFetcher', () => ({
  lookupFetcher: vi.fn().mockResolvedValue({ data: [] }),
  contactoOrphanFetcher: vi.fn().mockResolvedValue({ data: [] }),
}))
vi.mock('siesa-ui-kit', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ({ label, error, errorMessage, ...props }: any) => (
    <div>
      <label htmlFor={props.name}>{label}</label>
      <input id={props.name} {...props} type="text" />
      {error && errorMessage && <span>{errorMessage}</span>}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, disabled, htmlType }: any) => (
    <button type={htmlType ?? 'button'} onClick={onClick} disabled={disabled}>{children}</button>
  ),
  LookupField: () => null,
}))

function renderForm(props?: {
  onSuccess?: () => void
  onCancel?: () => void
  contactoId?: string
  defaultValues?: { nombre: string; cargo: string; telefono: string; email: string }
}) {
  const onSuccess = props?.onSuccess ?? vi.fn()
  const onCancel = props?.onCancel ?? vi.fn()
  const queryClient = new QueryClient()

  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ContactoForm, { onSuccess, onCancel, contactoId: props?.contactoId, defaultValues: props?.defaultValues }),
    ),
  )

  return { onSuccess, onCancel }
}

function mockCreateMutation(overrides = {}) {
  vi.mocked(useCreateContactoModule.useCreateContacto).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useCreateContactoModule.useCreateContacto>)
}

function mockUpdateMutation(overrides = {}) {
  vi.mocked(useUpdateContactoModule.useUpdateContacto).mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUpdateContactoModule.useUpdateContacto>)
}

describe('ContactoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all 4 form fields', () => {
    mockCreateMutation()
    mockUpdateMutation()
    renderForm()

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cargo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    mockCreateMutation()
    mockUpdateMutation()
    renderForm()

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
      expect(screen.getByText('El cargo es requerido')).toBeInTheDocument()
      expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument()
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })
  })

  it('does not call mutation when form is invalid', async () => {
    const mutateAsync = vi.fn()
    mockCreateMutation({ mutateAsync })
    mockUpdateMutation()
    renderForm()

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
    })
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('calls onCancel when Cancelar is clicked', () => {
    mockCreateMutation()
    mockUpdateMutation()
    const { onCancel } = renderForm()

    fireEvent.click(screen.getByText('Cancelar'))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls mutateAsync with form data on valid submit (create mode)', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({})
    mockCreateMutation({ mutateAsync })
    mockUpdateMutation()
    const { onSuccess } = renderForm()

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/cargo/i), { target: { value: 'Analista' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '3001234567' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@test.com' } })

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        nombre: 'Ana García',
        cargo: 'Analista',
        telefono: '3001234567',
        email: 'ana@test.com',
      })
    })
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('shows backend error message on mutation failure', async () => {
    const error = Object.assign(new Error('Backend error'), {
      isAxiosError: true,
      response: { data: { detail: 'Error de servidor externo.' } },
    })
    const mutateAsync = vi.fn().mockRejectedValue(error)
    mockCreateMutation({ mutateAsync })
    mockUpdateMutation()
    renderForm()

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/cargo/i), { target: { value: 'Analista' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '3001234567' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@test.com' } })

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByText('Error de servidor externo.')).toBeInTheDocument()
    })
  })

  it('pre-fills fields with defaultValues in edit mode', () => {
    mockCreateMutation()
    mockUpdateMutation()
    renderForm({
      contactoId: 'contact-123',
      defaultValues: {
        nombre: 'Ana García',
        cargo: 'Gerente',
        telefono: '3001234567',
        email: 'ana@empresa.com',
      },
    })

    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Ana García')
    expect(screen.getByLabelText(/cargo/i)).toHaveValue('Gerente')
    expect(screen.getByLabelText(/teléfono/i)).toHaveValue('3001234567')
    expect(screen.getByLabelText(/email/i)).toHaveValue('ana@empresa.com')
  })

  it('calls update mutation not create when contactoId is provided, and calls onSuccess', async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({})
    const updateMutateAsync = vi.fn().mockResolvedValue({})
    mockCreateMutation({ mutateAsync: createMutateAsync })
    mockUpdateMutation({ mutateAsync: updateMutateAsync })

    const { onSuccess } = renderForm({
      contactoId: 'contact-123',
      defaultValues: {
        nombre: 'Ana García',
        cargo: 'Gerente',
        telefono: '3001234567',
        email: 'ana@empresa.com',
      },
    })

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalled()
    })
    expect(createMutateAsync).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('shows email format error for invalid email', async () => {
    mockCreateMutation()
    mockUpdateMutation()
    renderForm()

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/cargo/i), { target: { value: 'Analista' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '3001234567' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } })

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByText('Formato de email inválido')).toBeInTheDocument()
    })
  })

  it('shows backend error from 422 in edit mode', async () => {
    mockCreateMutation()
    const error = Object.assign(new Error('Validation error'), {
      isAxiosError: true,
      response: { data: { detail: 'Email ya existe.' } },
    })
    mockUpdateMutation({ mutateAsync: vi.fn().mockRejectedValue(error) })

    renderForm({
      contactoId: 'contact-123',
      defaultValues: {
        nombre: 'Ana García',
        cargo: 'Gerente',
        telefono: '3001234567',
        email: 'ana@empresa.com',
      },
    })

    fireEvent.click(screen.getByText('Guardar'))

    await waitFor(() => {
      expect(screen.getByText('Email ya existe.')).toBeInTheDocument()
    })
  })
})
