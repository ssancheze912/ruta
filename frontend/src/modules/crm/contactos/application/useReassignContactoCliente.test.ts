import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useReassignContactoCliente } from './useReassignContactoCliente'
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
const OLD_CLIENTE_ID = 'cliente-uuid-old'
const NEW_CLIENTE_ID = 'cliente-uuid-new'

const mockContacto = {
  id: CONTACTO_ID,
  nombre: 'Juan Pérez',
  cargo: 'Dev',
  telefono: '3001234567',
  email: 'juan@test.com',
  clienteId: NEW_CLIENTE_ID,
  createdAt: '2026-03-17T00:00:00Z',
  updatedAt: '2026-03-17T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

describe('useReassignContactoCliente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls PUT /contactos/:id/cliente with newClienteId', async () => {
    let capturedBody: unknown = null
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(mockContacto)
      }),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useReassignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({
        contactoId: CONTACTO_ID,
        newClienteId: NEW_CLIENTE_ID,
        oldClienteId: OLD_CLIENTE_ID,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedBody).toEqual({ clienteId: NEW_CLIENTE_ID })
  })

  it('invalidates global contactos, old clienteId, and new clienteId on success', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json(mockContacto),
      ),
    )

    const { wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useReassignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({
        contactoId: CONTACTO_ID,
        newClienteId: NEW_CLIENTE_ID,
        oldClienteId: OLD_CLIENTE_ID,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['contactos'] })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['contactos', { clienteId: OLD_CLIENTE_ID }],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['contactos', { clienteId: NEW_CLIENTE_ID }],
    })
  })

  it('shows success toast on reassign', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json(mockContacto),
      ),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useReassignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({
        contactoId: CONTACTO_ID,
        newClienteId: NEW_CLIENTE_ID,
        oldClienteId: OLD_CLIENTE_ID,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Contacto reasignado correctamente')
  })

  it('shows error toast on failure', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}/cliente`, () =>
        HttpResponse.json({ title: 'Server Error' }, { status: 500 }),
      ),
    )

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useReassignContactoCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({
        contactoId: CONTACTO_ID,
        newClienteId: NEW_CLIENTE_ID,
        oldClienteId: OLD_CLIENTE_ID,
      })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('No se pudo completar la operación. Intenta de nuevo.')
  })
})
