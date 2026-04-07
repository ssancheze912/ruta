import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useUpdateContacto } from './useUpdateContacto'
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

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const validData = {
  nombre: 'Ana Actualizada',
  cargo: 'Senior Analista',
  telefono: '3009999999',
  email: 'ana.nueva@test.com',
}

const CONTACTO_ID = 'test-contacto-id'

describe('useUpdateContacto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns updated contacto on 200', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}`, () =>
        HttpResponse.json({
          id: CONTACTO_ID,
          nombre: validData.nombre,
          cargo: validData.cargo,
          telefono: validData.telefono,
          email: validData.email,
          clienteId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
    )

    const { result } = renderHook(() => useUpdateContacto(CONTACTO_ID), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validData)
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith('Contacto actualizado correctamente')
  })

  it('sets isError true on 422', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}`, () =>
        HttpResponse.json({ title: 'Validation failed' }, { status: 422 }),
      ),
    )

    const { result } = renderHook(() => useUpdateContacto(CONTACTO_ID), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validData)
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('sets isError true on 404', async () => {
    server.use(
      http.put(`${BASE}/contactos/${CONTACTO_ID}`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )

    const { result } = renderHook(() => useUpdateContacto(CONTACTO_ID), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(validData)
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
