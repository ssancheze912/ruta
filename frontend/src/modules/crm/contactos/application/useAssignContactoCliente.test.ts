import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useAssignContactoCliente } from './useAssignContactoCliente'
import { toast } from '@/shared/lib/toast'

vi.mock('@/shared/lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    show: vi.fn(),
  },
}))

const BASE = 'http://localhost:5000/api/v1'
const CONTACTO_ID = 'contacto-uuid-1'
const CLIENTE_ID = 'cliente-uuid-1'

const mockContacto = {
  id: CONTACTO_ID,
  nombre: 'Juan Pérez',
  cargo: 'Dev',
  telefono: '3001234567',
  email: 'juan@test.com',
  clienteId: CLIENTE_ID,
  createdAt: '2026-03-16T00:00:00Z',
  updatedAt: '2026-03-16T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

describe('useAssignContactoCliente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls PUT /contactos/:id/cliente with clienteId on associate', async () => {
    let capturedBody: unknown = null
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ ...mockContacto, clienteId: CLIENTE_ID })
      }),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAssignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ contactoId: CONTACTO_ID, clienteId: CLIENTE_ID, currentClienteId: CLIENTE_ID })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedBody).toEqual({ clienteId: CLIENTE_ID })
  })

  it('calls PUT /contactos/:id/cliente with null on disassociate', async () => {
    let capturedBody: unknown = null
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ ...mockContacto, clienteId: null })
      }),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAssignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ contactoId: CONTACTO_ID, clienteId: null, currentClienteId: CLIENTE_ID })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedBody).toEqual({ clienteId: null })
  })

  it('invalidates both queryKeys on success', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json({ ...mockContacto, clienteId: CLIENTE_ID }),
      ),
    )

    const { wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useAssignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ contactoId: CONTACTO_ID, clienteId: CLIENTE_ID, currentClienteId: CLIENTE_ID })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['contactos'] })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['contactos', { clienteId: CLIENTE_ID }],
    })
  })

  it('shows success toast on associate', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json({ ...mockContacto, clienteId: CLIENTE_ID }),
      ),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAssignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ contactoId: CONTACTO_ID, clienteId: CLIENTE_ID, currentClienteId: CLIENTE_ID })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Contacto asociado correctamente')
  })

  it('shows success toast on disassociate', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json({ ...mockContacto, clienteId: null }),
      ),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAssignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ contactoId: CONTACTO_ID, clienteId: null, currentClienteId: CLIENTE_ID })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Contacto desasociado correctamente')
  })

  it('shows error toast on failure', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useAssignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ contactoId: CONTACTO_ID, clienteId: CLIENTE_ID, currentClienteId: CLIENTE_ID })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('No se pudo completar la operación. Intenta de nuevo.')
  })
})
